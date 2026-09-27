const logger = require('../src/logger');
const PDFDocument = require('pdfkit');
const path = require('path');
const { sequelize, PhieuMuon, ChiTietPhieuMuon, PhieuTra, Sach, DocGia } = require('../models');

const getAllBorrowRequests = async (req, res) => {
  try {
    logger.info('Fetching all borrow requests');
    const requests = await PhieuMuon.findAll({
      include: [
        { model: DocGia, as: 'DocGia' },
        {
          model: ChiTietPhieuMuon,
          as: 'ChiTietPhieuMuons',
          include: [
            { model: Sach, as: 'Sach' },
            { model: PhieuTra, as: 'PhieuTra' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    logger.info('Borrow requests fetched successfully', { count: requests.length });
    res.json(requests);
  } catch (error) {
    logger.error('Error fetching borrow requests', { message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const getReaderBorrowHistory = async (req, res) => {
  try {
    logger.info('Fetching borrow history for reader', { maDocGia: req.user.maDocGia });
    const history = await PhieuMuon.findAll({
      where: { maDocGia: req.user.maDocGia },
      include: [
        {
          model: ChiTietPhieuMuon,
          as: 'ChiTietPhieuMuons',
          include: [
            { model: Sach, as: 'Sach' },
            { model: PhieuTra, as: 'PhieuTra' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    logger.info('Borrow history fetched successfully', { maDocGia: req.user.maDocGia, count: history.length });
    res.json(history);
  } catch (error) {
    logger.error('Error fetching borrow history', { maDocGia: req.user.maDocGia, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const createBorrowRequest = async (req, res) => {
  try {
    const { chiTiet } = req.body;
    logger.info('Creating borrow request', { maDocGia: req.user.maDocGia, chiTiet });
    if (!chiTiet || !Array.isArray(chiTiet) || chiTiet.length === 0) {
      logger.warn('Invalid borrow request data', { chiTiet });
      return res.status(400).json({ message: 'Danh sách sách mượn không hợp lệ' });
    }

    const ngayMuon = new Date();
    const ngayTra = new Date(ngayMuon);
    ngayTra.setDate(ngayMuon.getDate() + 14);
    logger.debug('Calculated borrow dates', { ngayMuon, ngayTra });

    const phieuMuon = await PhieuMuon.create({
      maDocGia: req.user.maDocGia,
      ngayMuon,
      ngayTra,
      trangThai: 'Chờ duyệt',
    });
    logger.info('Borrow request created', { maPhieuMuon: phieuMuon.maPhieuMuon });

    for (let item of chiTiet) {
      const book = await Sach.findByPk(item.maSach);
      if (!book) {
        logger.warn('Book not found', { maSach: item.maSach });
        await phieuMuon.destroy();
        return res.status(404).json({ message: `Sách ${item.maSach} không tồn tại` });
      }
      if (book.soLuongHienCo < item.soLuongSachMuon) {
        logger.warn('Insufficient book quantity', { maSach: item.maSach, soLuongHienCo: book.soLuongHienCo, soLuongSachMuon: item.soLuongSachMuon });
        await phieuMuon.destroy();
        return res.status(400).json({ message: `Sách ${book.tenSach} không đủ số lượng` });
      }
      await ChiTietPhieuMuon.create({
        maPhieuMuon: phieuMuon.maPhieuMuon,
        maSach: item.maSach,
        soLuongSachMuon: item.soLuongSachMuon || 1,
      });
      logger.debug('Created borrow request detail', { maSach: item.maSach, soLuongSachMuon: item.soLuongSachMuon });
    }

    logger.info('Borrow request completed successfully', { maPhieuMuon: phieuMuon.maPhieuMuon });
    res.status(201).json(phieuMuon);
  } catch (error) {
    logger.error('Error creating borrow request', { message: error.message, stack: error.stack, body: req.body });
    res.status(400).json({ message: error.message });
  }
};

const updateBorrowRequest = async (req, res) => {
  try {
    const { trangThai } = req.body;
    const { maPhieuMuon } = req.params;
    logger.info('Updating borrow request', { maPhieuMuon, trangThai });

    if (!['Chờ duyệt', 'Đã duyệt', 'Đã trả', 'Từ chối'].includes(trangThai)) {
      logger.warn('Invalid status provided', { trangThai });
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const request = await PhieuMuon.findByPk(maPhieuMuon, {
      include: [{ model: ChiTietPhieuMuon, as: 'ChiTietPhieuMuons' }],
    });

    if (!request) {
      logger.warn('Borrow request not found', { maPhieuMuon });
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }

    request.trangThai = trangThai;
    if (trangThai === 'Đã duyệt') {
      for (let ct of request.ChiTietPhieuMuons) {
        const book = await Sach.findByPk(ct.maSach);
        if (!book) {
          logger.warn('Book not found during approval', { maSach: ct.maSach });
          return res.status(404).json({ message: `Sách ${ct.maSach} không tồn tại` });
        }
        if (book.soLuongHienCo < ct.soLuongSachMuon) {
          logger.warn('Insufficient book quantity for approval', { maSach: ct.maSach, soLuongHienCo: book.soLuongHienCo });
          return res.status(400).json({ message: `Sách ${book.tenSach} không đủ số lượng` });
        }
        book.soLuongHienCo -= ct.soLuongSachMuon;
        await book.save();
        logger.debug('Updated book quantity', { maSach: ct.maSach, soLuongHienCo: book.soLuongHienCo });
      }
    } else if (trangThai === 'Đã trả') {
      for (let ct of request.ChiTietPhieuMuons) {
        const existingPhieuTra = await PhieuTra.findOne({ where: { maChiTietPM: ct.maChiTietPM } });
        if (existingPhieuTra) {
          logger.warn('PhieuTra already exists for ChiTietPhieuMuon', { maChiTietPM: ct.maChiTietPM });
          continue;
        }

        const ngayTraSach = new Date();
        const ngayTraDuKien = new Date(request.ngayTra);
        const daysLate = Math.max(0, Math.ceil((ngayTraSach - ngayTraDuKien) / (1000 * 60 * 60 * 24)));
        const tienPhat = daysLate * 1000 * ct.soLuongSachMuon;

        await PhieuTra.create({
          maChiTietPM: ct.maChiTietPM,
          ngayTraSach,
          tienPhat,
        });
        const book = await Sach.findByPk(ct.maSach);
        if (!book) {
          logger.warn('Book not found during return', { maSach: ct.maSach });
          return res.status(404).json({ message: `Sách ${ct.maSach} không tồn tại` });
        }
        book.soLuongHienCo += ct.soLuongSachMuon;
        await book.save();
        logger.debug('Created return record', { maSach: ct.maSach, soLuongHienCo: book.soLuongHienCo, tienPhat });
      }
    }else if(trangThai === 'Từ chối'){
      for (let ct of request.ChiTietPhieuMuons) {
        const book = await Sach.findByPk(ct.maSach);
        if (!book) {
          logger.warn('Book not found during rejection', { maSach: ct.maSach });
          return res.status(404).json({ message: `Sách ${ct.maSach} không tồn tại` });
        }
        book.soLuongHienCo += ct.soLuongSachMuon;
        await book.save();
        logger.debug('Restored book quantity on rejection', { maSach: ct.maSach, soLuongHienCo: book.soLuongHienCo });
      }

    }

    await request.save();
    logger.info('Borrow request updated successfully', { maPhieuMuon, trangThai });
    res.json(request);
  } catch (error) {
    logger.error('Error updating borrow request', { maPhieuMuon: req.params.maPhieuMuon, message: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

const exportBorrowSlip = async (req, res) => {
  try {
    const { maPhieuMuon } = req.params;
    logger.info('Exporting borrow slip', { maPhieuMuon });

    const phieuMuon = await PhieuMuon.findByPk(maPhieuMuon, {
      include: [
        { model: DocGia, as: 'DocGia' },
        { model: ChiTietPhieuMuon, as: 'ChiTietPhieuMuons', include: [{ model: Sach, as: 'Sach' }] },
      ],
    });
    if (!phieuMuon) {
      logger.warn('Borrow request not found for export', { maPhieuMuon });
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="phieu_muon_${maPhieuMuon}.pdf"`);
    doc.pipe(res);

    // Register and set Roboto font for Vietnamese support
    try {
      doc.font(path.join(__dirname, '../fonts/Roboto-Regular.ttf'));
    } catch (error) {
      logger.error('Font loading failed', { error: error.message });
      return res.status(500).json({ message: 'Không thể tải font chữ' });
    }

    doc.fontSize(18).text('Phiếu Mượn Sách', 100, 50);
    doc.fontSize(12).text(`Mã Phiếu: ${phieuMuon.maPhieuMuon}`, 100, 80);
    doc.text(`Tên Độc Giả: ${phieuMuon.DocGia?.hoLot || 'N/A'} ${phieuMuon.DocGia?.ten || ''}`, 100, 100);
    doc.text(`Ngày Mượn: ${phieuMuon.ngayMuon.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Ngày Trả Dự Kiến: ${phieuMuon.ngayTra.toLocaleDateString('vi-VN')}`, 100, 140);

    doc.text('Chi Tiết Sách:', 100, 160);
    phieuMuon.ChiTietPhieuMuons.forEach((ct, index) => {
      doc.text(`${index + 1}. Sách: ${ct.Sach?.tenSach || 'N/A'}, Số Lượng: ${ct.soLuongSachMuon}`, 100, 180 + index * 20);
      logger.debug('Added book to PDF', { maSach: ct.maSach, tenSach: ct.Sach?.tenSach });
    });

    doc.end();
    logger.info('Borrow slip exported successfully', { maPhieuMuon });
  } catch (error) {
    logger.error('Error exporting borrow slip', { maPhieuMuon: req.params.maPhieuMuon, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const exportReturnSlip = async (req, res) => {
  try {
    const { maPhieuTra } = req.params;
    logger.info('Exporting return slip', { maPhieuTra });

    const phieuTra = await PhieuTra.findByPk(maPhieuTra, {
      include: [
        {
          model: ChiTietPhieuMuon,
          as: 'ChiTietPhieuMuon',
          include: [
            { model: Sach, as: 'Sach' },
            { model: PhieuMuon, as: 'PhieuMuon', include: [{ model: DocGia, as: 'DocGia' }] }
          ]
        },
      ],
    });
    if (!phieuTra) {
      logger.warn('Return slip not found', { maPhieuTra });
      return res.status(404).json({ message: 'Không tìm thấy phiếu trả' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="phieu_tra_${maPhieuTra}.pdf"`);
    doc.pipe(res);

    // Register and set Roboto font for Vietnamese support
    try {
      doc.font(path.join(__dirname, '../fonts/Roboto-Regular.ttf'));
    } catch (error) {
      logger.error('Font loading failed', { error: error.message });
      return res.status(500).json({ message: 'Không thể tải font chữ' });
    }

    doc.fontSize(18).text('Phiếu Trả Sách', 100, 50);
    doc.fontSize(12).text(`Mã Phiếu Trả: ${phieuTra.maPhieuTra}`, 100, 80);
    doc.text(`Tên Độc Giả: ${phieuTra.ChiTietPhieuMuon.PhieuMuon.DocGia?.hoLot || 'N/A'} ${phieuTra.ChiTietPhieuMuon.PhieuMuon.DocGia?.ten || ''}`, 100, 100);
    doc.text(`Ngày Trả Thực Tế: ${phieuTra.ngayTraSach.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Tiền Phạt: ${phieuTra.tienPhat || 0} VND`, 100, 140);

    doc.text('Chi Tiết Sách:', 100, 160);
    doc.text(`Sách: ${phieuTra.ChiTietPhieuMuon.Sach?.tenSach || 'N/A'}, Số Lượng: ${phieuTra.ChiTietPhieuMuon.soLuongSachMuon}`, 100, 180);
    logger.debug('Added book to return slip PDF', { maSach: phieuTra.ChiTietPhieuMuon.maSach });

    doc.end();
    logger.info('Return slip exported successfully', { maPhieuTra });
  } catch (error) {
    logger.error('Error exporting return slip', { maPhieuTra: req.params.maPhieuTra, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const exportPenaltyForm = async (req, res) => {
  try {
    const { maPhieuTra } = req.params;
    logger.info('Exporting penalty form', { maPhieuTra });

    const phieuTra = await PhieuTra.findByPk(maPhieuTra, {
      include: [
        {
          model: ChiTietPhieuMuon,
          as: 'ChiTietPhieuMuon',
          include: [
            { model: Sach, as: 'Sach' },
            { model: PhieuMuon, as: 'PhieuMuon', include: [{ model: DocGia, as: 'DocGia' }] }
          ]
        },
      ],
    });
    if (!phieuTra) {
      logger.warn('Penalty form not found', { maPhieuTra });
      return res.status(404).json({ message: 'Không tìm thấy phiếu trả' });
    }
    if (phieuTra.tienPhat === 0) {
      logger.info('No penalty for return slip', { maPhieuTra });
      return res.status(400).json({ message: 'Không có phạt' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="form_phat_${maPhieuTra}.pdf"`);
    doc.pipe(res);

    // Register and set Roboto font for Vietnamese support
    try {
      doc.font(path.join(__dirname, '../fonts/Roboto-Regular.ttf'));
    } catch (error) {
      logger.error('Font loading failed', { error: error.message });
      return res.status(500).json({ message: 'Không thể tải font chữ' });
    }

    doc.fontSize(18).text('Form Phạt Trễ Hẹn', 100, 50);
    doc.fontSize(12).text(`Mã Phiếu Trả: ${phieuTra.maPhieuTra}`, 100, 80);
    doc.text(`Tên Độc Giả: ${phieuTra.ChiTietPhieuMuon.PhieuMuon.DocGia?.hoLot || 'N/A'} ${phieuTra.ChiTietPhieuMuon.PhieuMuon.DocGia?.ten || ''}`, 100, 100);
    doc.text(`Ngày Trả Dự Kiến: ${phieuTra.ChiTietPhieuMuon.PhieuMuon.ngayTra.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Ngày Trả Thực Tế: ${phieuTra.ngayTraSach.toLocaleDateString('vi-VN')}`, 100, 140);
    doc.text(`Tiền Phạt: ${phieuTra.tienPhat} VND`, 100, 160);

    doc.text('Chi Tiết Sách:', 100, 180);
    doc.text(`Sách: ${phieuTra.ChiTietPhieuMuon.Sach?.tenSach || 'N/A'}`, 100, 200);
    logger.debug('Added book to penalty form PDF', { maSach: phieuTra.ChiTietPhieuMuon.maSach });

    doc.end();
    logger.info('Penalty form exported successfully', { maPhieuTra });
  } catch (error) {
    logger.error('Error exporting penalty form', { maPhieuTra: req.params.maPhieuTra, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest,
  exportBorrowSlip,
  exportReturnSlip,
  exportPenaltyForm
};

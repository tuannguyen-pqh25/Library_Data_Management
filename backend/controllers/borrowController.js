const logger = require('../src/logger');
const PDFDocument = require('pdfkit');
const path = require('path');
const { sequelize, PhieuMuon, ChiTietPhieuMuon, PhieuTra, Sach, DocGia } = require('../models');
const {
  MAX_BORROW_COPIES,
  OUTSTANDING_BORROW_STATUSES,
  sumCopyQuantity,
  exceedsBorrowLimit,
  getDueDate,
  getLoanDisplayStatus,
} = require('../utils/borrowRules');

const lockReader = (maDocGia, transaction) => DocGia.findByPk(maDocGia, {
  transaction,
  lock: transaction.LOCK.UPDATE,
});

const getOutstandingCopies = async (maDocGia, transaction) => {
  const rows = await sequelize.query(`
    SELECT COALESCE(SUM(ChiTietPhieuMuon.soLuongSachMuon), 0) AS total
    FROM ChiTietPhieuMuon
    INNER JOIN PhieuMuon
      ON PhieuMuon.maPhieuMuon = ChiTietPhieuMuon.maPhieuMuon
    WHERE PhieuMuon.maDocGia = :maDocGia
      AND PhieuMuon.trangThai IN (:statuses)
  `, {
    replacements: { maDocGia, statuses: OUTSTANDING_BORROW_STATUSES },
    type: sequelize.QueryTypes.SELECT,
    transaction,
  });
  return Number(rows[0]?.total || 0);
};

const getDetails = async (loan, transaction) => {
  const details = await ChiTietPhieuMuon.findAll({
    where: { maPhieuMuon: loan.maPhieuMuon },
    order: [['maSach', 'ASC']], transaction,
  });
  for (const detail of details) {
    detail.setDataValue('Sach', await Sach.findOne({ where: {
      maSach: detail.maSach,
    }, transaction }));
    detail.setDataValue('PhieuTra', await PhieuTra.findAll({ where: {
      maChiTietPM: detail.maChiTietPM,
    }, transaction }));
  }
  return details;
};

const enrichLoans = async (loans) => Promise.all(loans.map(async (loan) => {
  loan.setDataValue('DocGia', await DocGia.findByPk(loan.maDocGia));
  loan.setDataValue('ChiTietPhieuMuons', await getDetails(loan));
  loan.setDataValue('trangThaiHienThi', getLoanDisplayStatus(loan));
  return loan;
}));

const loadLoan = async (maPhieuMuon, maDocGia) => {
  const loan = await PhieuMuon.findOne({ where: { maPhieuMuon, maDocGia } });
  if (!loan) return null;
  loan.setDataValue('DocGia', await DocGia.findByPk(maDocGia));
  loan.setDataValue('ChiTietPhieuMuons', await getDetails(loan));
  return loan;
};

const loadReturn = async (maPhieuTra, maChiTietPM) => {
  const record = await PhieuTra.findOne({ where: { maPhieuTra, maChiTietPM } });
  if (!record) return null;
  const detail = await ChiTietPhieuMuon.findOne({ where: {
    maChiTietPM: record.maChiTietPM,
  } });
  if (!detail) return null;
  detail.setDataValue('Sach', await Sach.findOne({ where: {
    maSach: detail.maSach,
  } }));
  const loan = await PhieuMuon.findOne({ where: { maPhieuMuon: detail.maPhieuMuon } });
  if (loan) {
    loan.setDataValue('DocGia', await DocGia.findByPk(loan.maDocGia));
    loan.setDataValue('ChiTietPhieuMuons', await getDetails(loan));
  }
  detail.setDataValue('PhieuMuon', loan);
  record.setDataValue('ChiTietPhieuMuon', detail);
  return record;
};

const canAccessReaderRecord = (req, maDocGia) => (
  req.userType === 'staff'
  || (req.userType === 'reader' && Number(req.user.maDocGia) === Number(maDocGia))
);

const getAllBorrowRequests = async (req, res) => {
  try {
    logger.info('Fetching all borrow requests');
    const requests = await PhieuMuon.findAll({
      order: [['createdAt', 'DESC']],
    });
    await enrichLoans(requests);
    logger.info('Borrow requests fetched successfully', { count: requests.length });
    res.json(requests);
  } catch (error) {
    logger.error('Error fetching borrow requests', { message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const getReaderBorrowHistory = async (req, res) => {
  try {
    if (!req.user?.maDocGia) {
      return res.json([]);
    }
    logger.info('Fetching borrow history for reader', { maDocGia: req.user.maDocGia });
    const history = await PhieuMuon.findAll({
      where: { maDocGia: req.user.maDocGia },
      order: [['createdAt', 'DESC']],
    });
    await enrichLoans(history);
    logger.info('Borrow history fetched successfully', { maDocGia: req.user.maDocGia, count: history.length });
    res.json(history);
  } catch (error) {
    logger.error('Error fetching borrow history', { maDocGia: req.user?.maDocGia, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const createBorrowRequest = async (req, res) => {
  let transaction;
  try {
    if (req.userType !== 'reader') {
      return res.status(403).json({ message: 'Chỉ độc giả mới có thể yêu cầu mượn sách' });
    }
    const { chiTiet } = req.body;
    logger.info('Creating borrow request', { maDocGia: req.user.maDocGia, chiTiet });
    if (!chiTiet || !Array.isArray(chiTiet) || chiTiet.length === 0) {
      logger.warn('Invalid borrow request data', { chiTiet });
      return res.status(400).json({ message: 'Danh sách sách mượn không hợp lệ' });
    }

    const normalizedDetails = [];
    const seenBooks = new Set();
    for (const item of chiTiet) {
      const key = { maSach: Number(item.maSach), maTacGia: Number(item.maTacGia), maTheLoai: Number(item.maTheLoai) };
      const quantity = item.soLuongSachMuon === undefined ? 1 : Number(item.soLuongSachMuon);
      if (Object.values(key).some((value) => !Number.isInteger(value) || value <= 0) || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Khóa sách hoặc số lượng không hợp lệ' });
      }
      const inventoryKey = `${key.maSach}:${key.maTacGia}:${key.maTheLoai}`;
      if (seenBooks.has(inventoryKey)) return res.status(400).json({ message: 'Không được yêu cầu trùng sách trong cùng phiếu' });
      seenBooks.add(inventoryKey);
      normalizedDetails.push({ ...key, soLuongSachMuon: quantity });
    }

    normalizedDetails.sort((a, b) => a.maSach - b.maSach || a.maTacGia - b.maTacGia || a.maTheLoai - b.maTheLoai);
    const ngayMuon = new Date();
    const ngayTra = getDueDate(ngayMuon);
    logger.debug('Calculated borrow dates', { ngayMuon, ngayTra });

    transaction = await sequelize.transaction();
    const reader = await lockReader(req.user.maDocGia, transaction);
    if (!reader) throw Object.assign(new Error('Không tìm thấy độc giả'), { statusCode: 404 });

    const outstandingCopies = await getOutstandingCopies(req.user.maDocGia, transaction);
    const requestedCopies = sumCopyQuantity(normalizedDetails);
    if (exceedsBorrowLimit(outstandingCopies, requestedCopies)) {
      throw Object.assign(
        new Error(`Mỗi độc giả được mượn tối đa ${MAX_BORROW_COPIES} quyển, bao gồm yêu cầu đang chờ duyệt`),
        { statusCode: 409 }
      );
    }

    const phieuMuon = await PhieuMuon.create({
      maDocGia: req.user.maDocGia,
      ngayMuon,
      ngayTra,
      trangThai: 'Chờ duyệt',
    }, { transaction });
    for (const detail of normalizedDetails) {
      await ChiTietPhieuMuon.create({
        maPhieuMuon: phieuMuon.maPhieuMuon,
        maSach: detail.maSach,
        soLuongSachMuon: detail.soLuongSachMuon,
      }, { transaction });
    }
    await transaction.commit();

    logger.info('Borrow request completed successfully', { maPhieuMuon: phieuMuon.maPhieuMuon });
    res.status(201).json(phieuMuon);
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    logger.error('Error creating borrow request', { message: error.message, stack: error.stack, body: req.body });
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const requestBorrowReturn = async (req, res) => {
  let transaction;
  try {
    if (req.userType !== 'reader') {
      return res.status(403).json({ message: 'Chỉ độc giả mới có thể yêu cầu trả sách' });
    }

    const maPhieuMuon = Number(req.params.maPhieuMuon);
    const maDocGia = Number(req.user.maDocGia);
    if (!Number.isInteger(maPhieuMuon) || maPhieuMuon <= 0) {
      return res.status(400).json({ message: 'Mã phiếu mượn không hợp lệ' });
    }

    transaction = await sequelize.transaction();
    const reader = await lockReader(maDocGia, transaction);
    if (!reader) throw Object.assign(new Error('Không tìm thấy độc giả'), { statusCode: 404 });

    const request = await PhieuMuon.findOne({
      where: { maPhieuMuon, maDocGia },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!request) throw Object.assign(new Error('Không tìm thấy phiếu mượn'), { statusCode: 404 });
    if (request.trangThai !== 'Đang mượn') {
      throw Object.assign(new Error('Chỉ có thể yêu cầu trả sách đang mượn'), { statusCode: 409 });
    }
    if (request.yeuCauTraAt) {
      throw Object.assign(new Error('Phiếu mượn này đã gửi yêu cầu trả'), { statusCode: 409 });
    }

    request.yeuCauTraAt = new Date();
    await request.save({ transaction });
    await transaction.commit();
    res.json(request);
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    logger.error('Error requesting loan return', {
      maPhieuMuon: req.params.maPhieuMuon,
      maDocGia: req.user?.maDocGia,
      message: error.message,
      stack: error.stack,
    });
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const updateBorrowRequest = async (req, res) => {
  let transaction;
  try {
    const { trangThai } = req.body;
    const maPhieuMuon = Number(req.params.maPhieuMuon);
    const maDocGia = Number(req.params.maDocGia);
    logger.info('Updating borrow request', { maPhieuMuon, maDocGia, trangThai });

    if (!['Chờ duyệt', 'Đang mượn', 'Đã trả', 'Từ chối'].includes(trangThai)) {
      logger.warn('Invalid status provided', { trangThai });
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    if (!Number.isInteger(maPhieuMuon) || !Number.isInteger(maDocGia)) {
      return res.status(400).json({ message: 'Khóa phiếu mượn không hợp lệ' });
    }
    transaction = await sequelize.transaction();
    const reader = await lockReader(maDocGia, transaction);
    if (!reader) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy độc giả' });
    }
    const request = await PhieuMuon.findOne({
      where: { maPhieuMuon, maDocGia },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!request) {
      logger.warn('Borrow request not found', { maPhieuMuon });
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }
    const allowed = request.trangThai === 'Chờ duyệt'
      ? ['Đang mượn', 'Từ chối']
      : request.trangThai === 'Đang mượn' ? ['Đã trả'] : [];
    if (!allowed.includes(trangThai)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Chuyển trạng thái không hợp lệ' });
    }
    if (trangThai === 'Đã trả' && !request.yeuCauTraAt) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Độc giả chưa gửi yêu cầu trả sách' });
    }
    const details = await getDetails(request, transaction);
    if (trangThai === 'Đang mượn' || trangThai === 'Đã trả') {
      if (trangThai === 'Đang mượn') {
        const outstandingCopies = await getOutstandingCopies(maDocGia, transaction);
        if (exceedsBorrowLimit(outstandingCopies)) {
          throw Object.assign(
            new Error(`Không thể duyệt: độc giả đang có hơn hạn mức ${MAX_BORROW_COPIES} quyển`),
            { statusCode: 409 }
          );
        }
      }
      const booksByKey = new Map();
      for (const ct of details) {
        const inventoryKey = `${ct.maSach}`;
        if (!booksByKey.has(inventoryKey)) {
          const book = await Sach.findOne({ where: { maSach: ct.maSach }, transaction, lock: transaction.LOCK.UPDATE });
          if (!book) throw Object.assign(new Error(`Sách ${ct.maSach} không tồn tại`), { statusCode: 404 });
          booksByKey.set(inventoryKey, { book, quantity: 0 });
        }
        const entry = booksByKey.get(inventoryKey);
        entry.quantity += ct.soLuongSachMuon;
        if (trangThai === 'Đang mượn' && entry.book.soLuongHienCo < entry.quantity) {
          throw Object.assign(new Error(`Sách ${entry.book.tenSach} không đủ số lượng`), { statusCode: 400 });
        }
      }

      if (trangThai === 'Đang mượn') {
        for (const { book, quantity } of booksByKey.values()) {
          book.soLuongHienCo -= quantity;
          await book.save({ transaction });
        }
      } else {
        for (const ct of details) {
          const returnKey = { maChiTietPM: ct.maChiTietPM };
          const existingPhieuTra = await PhieuTra.findOne({ where: returnKey, transaction });
          if (existingPhieuTra) throw Object.assign(new Error('Chi tiết phiếu mượn đã được trả'), { statusCode: 400 });
          await PhieuTra.create({ ...returnKey, ngayTraSach: new Date() }, { transaction });
        }
        for (const { book, quantity } of booksByKey.values()) {
          book.soLuongHienCo += quantity;
          await book.save({ transaction });
        }
      }
    }
    if (trangThai === 'Đang mượn') {
      const borrowedAt = new Date();
      request.ngayMuon = borrowedAt;
      request.ngayTra = getDueDate(borrowedAt);
    }
    request.trangThai = trangThai;
    await request.save({ transaction });
    await transaction.commit();
    logger.info('Borrow request updated successfully', { maPhieuMuon, trangThai });
    res.json(request);
  } catch (error) {
    logger.error('Error updating borrow request', { maPhieuMuon: req.params.maPhieuMuon, message: error.message, stack: error.stack });
    if (transaction && !transaction.finished) await transaction.rollback();
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const exportBorrowSlip = async (req, res) => {
  try {
    const maPhieuMuon = Number(req.params.maPhieuMuon);
    const maDocGia = Number(req.params.maDocGia);
    if (!Number.isInteger(maPhieuMuon) || maPhieuMuon <= 0
      || !Number.isInteger(maDocGia) || maDocGia <= 0) {
      return res.status(400).json({ message: 'Mã phiếu mượn không hợp lệ' });
    }
    if (!canAccessReaderRecord(req, maDocGia)) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu mượn' });
    }
    logger.info('Exporting borrow slip', { maPhieuMuon });
    const phieuMuon = await loadLoan(maPhieuMuon, maDocGia);
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
    doc.text(`Tên Độc Giả: ${phieuMuon.getDataValue('DocGia')?.fullName || 'N/A'}`, 100, 100);
    doc.text(`Ngày Mượn: ${phieuMuon.ngayMuon.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Ngày Trả Dự Kiến: ${phieuMuon.ngayTra.toLocaleDateString('vi-VN')}`, 100, 140);

    doc.text('Chi Tiết Sách:', 100, 160);
    phieuMuon.getDataValue('ChiTietPhieuMuons').forEach((ct, index) => {
      const book = ct.getDataValue('Sach');
      doc.text(`${index + 1}. Sách: ${book?.tenSach || 'N/A'}, Số Lượng: ${ct.soLuongSachMuon}`, 100, 180 + index * 20);
      logger.debug('Added book to PDF', { maSach: ct.maSach, tenSach: book?.tenSach });
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
    const maPhieuTra = Number(req.params.maPhieuTra);
    const maChiTietPM = Number(req.params.maChiTietPM);
    if (!Number.isInteger(maPhieuTra) || maPhieuTra <= 0
      || !Number.isInteger(maChiTietPM) || maChiTietPM <= 0) {
      return res.status(400).json({ message: 'Mã phiếu trả không hợp lệ' });
    }
    logger.info('Exporting return slip', { maPhieuTra });
    const phieuTra = await loadReturn(maPhieuTra, maChiTietPM);
    if (!phieuTra) {
      logger.warn('Return slip not found', { maPhieuTra });
      return res.status(404).json({ message: 'Không tìm thấy phiếu trả' });
    }
    const returnDetail = phieuTra.getDataValue('ChiTietPhieuMuon');
    const returnLoan = returnDetail?.getDataValue('PhieuMuon');
    if (!returnLoan || !canAccessReaderRecord(req, returnLoan.maDocGia)) {
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
    const detail = phieuTra.getDataValue('ChiTietPhieuMuon');
    const loan = detail.getDataValue('PhieuMuon');
    doc.text(`Tên Độc Giả: ${loan.getDataValue('DocGia')?.fullName || 'N/A'}`, 100, 100);
    doc.text(`Ngày Trả Thực Tế: ${phieuTra.ngayTraSach.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Tiền Phạt: ${phieuTra.tienPhat || 0} VND`, 100, 140);

    doc.text('Chi Tiết Sách:', 100, 160);
    doc.text(`Sách: ${detail.getDataValue('Sach')?.tenSach || 'N/A'}, Số Lượng: ${detail.soLuongSachMuon}`, 100, 180);
    logger.debug('Added book to return slip PDF', { maSach: detail.maSach });

    doc.end();
    logger.info('Return slip exported successfully', { maPhieuTra });
  } catch (error) {
    logger.error('Error exporting return slip', { maPhieuTra: req.params.maPhieuTra, message: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const exportPenaltyForm = async (req, res) => {
  try {
    const maPhieuTra = Number(req.params.maPhieuTra);
    const maChiTietPM = Number(req.params.maChiTietPM);
    if (!Number.isInteger(maPhieuTra) || maPhieuTra <= 0
      || !Number.isInteger(maChiTietPM) || maChiTietPM <= 0) {
      return res.status(400).json({ message: 'Mã phiếu trả không hợp lệ' });
    }
    logger.info('Exporting penalty form', { maPhieuTra });
    const phieuTra = await loadReturn(maPhieuTra, maChiTietPM);
    if (!phieuTra) {
      logger.warn('Penalty form not found', { maPhieuTra });
      return res.status(404).json({ message: 'Không tìm thấy phiếu trả' });
    }
    const returnDetail = phieuTra.getDataValue('ChiTietPhieuMuon');
    const returnLoan = returnDetail?.getDataValue('PhieuMuon');
    if (!returnLoan || !canAccessReaderRecord(req, returnLoan.maDocGia)) {
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
    const detail = phieuTra.getDataValue('ChiTietPhieuMuon');
    const loan = detail.getDataValue('PhieuMuon');
    doc.text(`Tên Độc Giả: ${loan.getDataValue('DocGia')?.fullName || 'N/A'}`, 100, 100);
    doc.text(`Ngày Trả Dự Kiến: ${loan.ngayTra.toLocaleDateString('vi-VN')}`, 100, 120);
    doc.text(`Ngày Trả Thực Tế: ${phieuTra.ngayTraSach.toLocaleDateString('vi-VN')}`, 100, 140);
    doc.text(`Tiền Phạt: ${phieuTra.tienPhat} VND`, 100, 160);

    doc.text('Chi Tiết Sách:', 100, 180);
    doc.text(`Sách: ${detail.getDataValue('Sach')?.tenSach || 'N/A'}`, 100, 200);
    logger.debug('Added book to penalty form PDF', { maSach: detail.maSach });

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
  requestBorrowReturn,
  updateBorrowRequest,
  exportBorrowSlip,
  exportReturnSlip,
  exportPenaltyForm
};

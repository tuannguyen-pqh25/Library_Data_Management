// backend/controllers/bookController.js
const logger = require('../src/logger');
const { sequelize, Sach, ChiTietPhieuMuon, TacGia, NhaXuatBan, TheLoai } = require('../models');
const fs = require('fs');
const path = require('path');

const getAllBooks = async (req, res) => {
  try {
    logger.info('Fetching all books');
    const books = await Sach.findAll({
      include: [
        { model: TacGia, as: 'TacGia' },
        { model: NhaXuatBan, as: 'NhaXuatBan' },
        { model: TheLoai, as: 'TheLoai' },
      ],
    });
    logger.info('Books fetched', { count: books.length });
    res.json(books);
  } catch (error) {
    logger.error('Error in getAllBooks', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { tenSach, maNXB, maTacGia, maTheLoai, donGia, soQuyen, namXuatBan, nguonGoc } = req.body;
    logger.info('Creating book', { data: req.body });

    // Call the stored procedure to validate foreign keys
    const [results] = await sequelize.query(
      'CALL sp_validate_book_foreign_keys(:maTacGia, :maNXB, :maTheLoai, @isValid)',
      {
        replacements: {
          maTacGia: parseInt(maTacGia),
          maNXB: parseInt(maNXB),
          maTheLoai: parseInt(maTheLoai),
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Extract isValid from the result set
    const isValid = results[0]?.isValid;

    if (!isValid) {
      logger.warn('Invalid foreign keys', { maTacGia, maNXB, maTheLoai });
      return res.status(400).json({ message: 'Invalid author, publisher, or category ID' });
    }

    // Proceed with book creation
    const book = await Sach.create({
      tenSach,
      maNXB: parseInt(maNXB),
      maTacGia: parseInt(maTacGia),
      maTheLoai: parseInt(maTheLoai),
      donGia: parseFloat(donGia),
      soLuongHienCo: parseInt(soQuyen),
      namXuatBan: parseInt(namXuatBan),
      nguonGoc,
      imagePath: req.file ? req.file.path : null,
    });

    logger.info('Book created', { book: book.toJSON() });
    res.status(201).json(book);
  } catch (error) {
    logger.error('Create book error', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  let transaction;
  try {
    const maSach = Number(req.params.maSach);
    const maTacGia = Number(req.params.maTacGia);
    const maTheLoai = Number(req.params.maTheLoai);
    const bookKey = { maSach, maTacGia, maTheLoai };

    if (![maSach, maTacGia, maTheLoai].every((id) => Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: 'Khóa sách không hợp lệ' });
    }

    transaction = await sequelize.transaction();
    const book = await Sach.findOne({
      where: bookKey,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!book) {
      await transaction.rollback();
      logger.warn('Book not found for update', bookKey);
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    const body = req.body || {};
    const bookData = {};
    const fields = ['tenSach', 'maNXB', 'maTacGia', 'maTheLoai', 'donGia', 'namXuatBan', 'nguonGoc'];
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        bookData[field] = body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'soLuongHienCo') ||
        Object.prototype.hasOwnProperty.call(body, 'soQuyen')) {
      bookData.soLuongHienCo = Object.prototype.hasOwnProperty.call(body, 'soLuongHienCo')
        ? body.soLuongHienCo
        : body.soQuyen;
    }
    if (req.file) {
      bookData.imagePath = `uploads/${req.file.filename}`;
    } else if (Object.prototype.hasOwnProperty.call(body, 'imagePath')) {
      bookData.imagePath = body.imagePath;
    }

    if (Object.keys(bookData).length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Không có thông tin nào được gửi để cập nhật' });
    }

    const mergedData = { ...book.toJSON(), ...bookData };
    const numericFields = ['maNXB', 'maTacGia', 'maTheLoai', 'soLuongHienCo', 'namXuatBan'];
    for (const field of numericFields) {
      if (Object.prototype.hasOwnProperty.call(bookData, field)) {
        const value = Number(bookData[field]);
        const isInvalidYear = field === 'namXuatBan' &&
          (value < 1900 || value > new Date().getFullYear());
        if (
          bookData[field] === '' ||
          bookData[field] === null ||
          !Number.isInteger(value) ||
          (field === 'soLuongHienCo' ? value < 0 : value <= 0) ||
          isInvalidYear
        ) {
          await transaction.rollback();
          return res.status(400).json({ message: `Giá trị ${field} không hợp lệ` });
        }
        bookData[field] = value;
        mergedData[field] = value;
      }
    }
    if (Object.prototype.hasOwnProperty.call(bookData, 'donGia')) {
      const donGia = Number(bookData.donGia);
      if (bookData.donGia === '' || bookData.donGia === null || !Number.isFinite(donGia) || donGia < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Đơn giá không hợp lệ' });
      }
      bookData.donGia = donGia;
    }
    for (const field of ['tenSach', 'nguonGoc']) {
      if (Object.prototype.hasOwnProperty.call(bookData, field) &&
          (typeof bookData[field] !== 'string' || !bookData[field].trim())) {
        await transaction.rollback();
        return res.status(400).json({ message: `${field} không được để trống` });
      }
      if (Object.prototype.hasOwnProperty.call(bookData, field)) {
        bookData[field] = bookData[field].trim();
      }
    }

    if (['maTacGia', 'maNXB', 'maTheLoai'].some((field) => Object.prototype.hasOwnProperty.call(bookData, field))) {
      const [results] = await sequelize.query(
        'CALL sp_validate_book_foreign_keys(:maTacGia, :maNXB, :maTheLoai, @isValid)',
        {
          replacements: {
            maTacGia: mergedData.maTacGia,
            maNXB: mergedData.maNXB,
            maTheLoai: mergedData.maTheLoai,
          },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );
      if (Number(results[0]?.isValid) !== 1) {
        await transaction.rollback();
        logger.warn('Invalid book foreign keys during update', {
          maTacGia: mergedData.maTacGia,
          maNXB: mergedData.maNXB,
          maTheLoai: mergedData.maTheLoai,
        });
        return res.status(400).json({ message: 'Một hoặc nhiều khóa ngoại không hợp lệ' });
      }
    }

    await book.update(bookData, { transaction });
    await transaction.commit();

    const updatedBook = await Sach.findOne({
      where: {
        maSach,
        maTacGia: book.maTacGia,
        maTheLoai: book.maTheLoai,
      },
      include: [
        { model: TacGia, as: 'TacGia' },
        { model: NhaXuatBan, as: 'NhaXuatBan' },
        { model: TheLoai, as: 'TheLoai' },
      ],
    });

    logger.info('Book updated', { book: updatedBook?.toJSON() });
    return res.json(updatedBook);
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error('Update book error', {
      error: error.message,
      stack: error.stack,
      params: req.params,
    });
    const databaseError = error.parent || error.original;
    if (databaseError?.code === 'ER_ROW_IS_REFERENCED_2' ||
        databaseError?.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(409).json({
        message: 'Không thể cập nhật khóa sách vì dữ liệu mượn/trả đang tham chiếu đến sách',
      });
    }
    return res.status(500).json({ message: 'Không thể cập nhật thông tin sách' });
  }
};

const deleteBook = async (req, res) => {
  let transaction;
  try {
    const maSach = Number(req.params.maSach);
    const maTacGia = Number(req.params.maTacGia);
    const maTheLoai = Number(req.params.maTheLoai);
    const bookKey = { maSach, maTacGia, maTheLoai };

    if (![maSach, maTacGia, maTheLoai].every((id) => Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ message: 'Khóa sách không hợp lệ' });
    }

    logger.info('Checking whether book can be deleted', bookKey);
    transaction = await sequelize.transaction();
    const book = await Sach.findOne({
      where: bookKey,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!book) {
      await transaction.rollback();
      logger.warn('Book not found', bookKey);
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    if (book.soLuongHienCo > 0) {
      await transaction.rollback();
      logger.warn('Cannot delete book due to existing stock', {
        ...bookKey,
        soLuongHienCo: book.soLuongHienCo,
      });
      return res.status(409).json({ message: 'Không thể xóa sách vì sách vẫn còn trong kho' });
    }

    // Check by maSach too: some existing databases have a legacy FK on this column alone.
    const loanDetailCount = await ChiTietPhieuMuon.count({
      where: { maSach },
      transaction,
    });
    if (loanDetailCount > 0) {
      await transaction.rollback();
      logger.warn('Cannot delete book because it has borrowing history', {
        ...bookKey,
        loanDetailCount,
      });
      return res.status(409).json({
        message: 'Không thể xóa sách vì sách đã xuất hiện trong lịch sử mượn/trả',
      });
    }

    const imageName = book.imagePath ? path.basename(book.imagePath) : null;
    await book.destroy({ transaction });
    await transaction.commit();

    if (imageName && imageName !== 'default-book.jpg') {
      const imagePath = path.join(__dirname, '..', 'uploads', imageName);
      try {
        await fs.promises.unlink(imagePath);
        logger.info('Book image deleted', { imagePath });
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.error('Failed to delete book image', { imagePath, error: error.message });
        }
      }
    }

    logger.info('Book deleted successfully', bookKey);
    return res.json({ message: 'Xóa sách thành công' });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    logger.error('Delete book error', {
      error: error.message,
      stack: error.stack,
      bookKey: req.params,
    });
    const databaseError = error.parent || error.original;
    if (databaseError?.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        message: 'Không thể xóa sách vì vẫn còn dữ liệu mượn/trả đang tham chiếu',
      });
    }
    return res.status(500).json({ message: 'Không thể xóa sách' });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Fetching book by ID', { id });
    const book = await Sach.findByPk(id, {
      include: [
        { model: TacGia, as: 'TacGia' },
        { model: NhaXuatBan, as: 'NhaXuatBan' },
        { model: TheLoai, as: 'TheLoai' },
      ],
    });
    if (!book) {
      logger.warn('Book not found', { id });
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    logger.info('Book fetched', { book: book.toJSON() });
    res.json(book);
  } catch (error) {
    logger.error('Get book by ID error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookById,
};
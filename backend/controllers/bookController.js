// backend/controllers/bookController.js
const logger = require('../src/logger');
const { sequelize, Sach, TacGia, NhaXuatBan, TheLoai } = require('../models');
const fs = require('fs');
const path = require('path');

const bookKey = (params) => ({
  maSach: Number(params.maSach),
  maTacGia: Number(params.maTacGia),
  maTheLoai: Number(params.maTheLoai),
});

const validBookKey = ({ maSach, maTacGia, maTheLoai }) =>
  [maSach, maTacGia, maTheLoai].every((value) => Number.isInteger(value) && value > 0);

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
  try {
    const key = bookKey(req.params);
    if (!validBookKey(key)) return res.status(400).json({ message: 'Khóa sách không hợp lệ' });
    const { maTacGia, maNXB, maTheLoai, ...rest } = req.body;
    logger.info('Updating book', { ...key, data: req.body });
    const [results] = await sequelize.query(
      'CALL sp_validate_book_foreign_keys(:maTacGia, :maNXB, :maTheLoai, @isValid)',
      {
        replacements: { maTacGia: parseInt(maTacGia), maNXB: parseInt(maNXB), maTheLoai: parseInt(maTheLoai) },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const isValid = results[0]?.isValid || 0;
    if (isValid === 0) {
      logger.warn('Invalid foreign keys', { maTacGia, maNXB, maTheLoai });
      return res.status(400).json({ message: 'Một hoặc nhiều khóa ngoại không hợp lệ' });
    }

    const bookData = {
      tenSach: rest.tenSach,
      maNXB: parseInt(maNXB),
      maTacGia: parseInt(maTacGia),
      maTheLoai: parseInt(maTheLoai),
      donGia: parseFloat(rest.donGia),
      soLuongHienCo: parseInt(rest.soQuyen) || 0,
      namXuatBan: parseInt(rest.namXuatBan),
      nguonGoc: rest.nguonGoc,
      imagePath: req.file ? `uploads/${req.file.filename}` : rest.imagePath,
    };
    const newKey = { maSach: key.maSach, maTacGia: Number(maTacGia), maTheLoai: Number(maTheLoai) };
    const [updated] = await Sach.update(bookData, { where: key });
    if (updated === 0) {
      logger.warn('Book not found', key);
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    const book = await Sach.findOne({ where: newKey,
      include: [
        { model: TacGia, as: 'TacGia' },
        { model: NhaXuatBan, as: 'NhaXuatBan' },
        { model: TheLoai, as: 'TheLoai' },
      ],
    });
    logger.info('Book updated', { book: book.toJSON() });
    res.json(book);
  } catch (error) {
    logger.error('Update book error', { error: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const key = bookKey(req.params);
    if (!validBookKey(key)) return res.status(400).json({ message: 'Khóa sách không hợp lệ' });
    logger.info('Checking book quantity', key);
    const results = await sequelize.query(
      'SELECT fn_kiem_tra_so_luong_sach(:maSach, :maTacGia, :maTheLoai) as soLuongHienCo',
      {
        replacements: key,
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const soLuongHienCo = results[0]?.soLuongHienCo || 0;
    if (soLuongHienCo > 0) {
      logger.warn('Cannot delete book due to existing stock', { ...key, soLuongHienCo });
      return res.status(400).json({ message: 'Không thể xóa sách vì còn sách trong kho' });
    }
    const book = await Sach.findOne({ where: key });
    if (!book) {
      logger.warn('Book not found', key);
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    if (book.imagePath) {
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(book.imagePath));
      fs.unlink(imagePath, (err) => {
        if (err) {
          logger.error('Failed to delete image', { error: err.message });
        } else {
          logger.info('Image deleted', { imagePath });
        }
      });
    }
    await Sach.destroy({ where: key });
    logger.info('Book deleted successfully', key);
    res.json({ message: 'Xóa sách thành công' });
  } catch (error) {
    logger.error('Delete book error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const key = bookKey(req.params);
    if (!validBookKey(key)) return res.status(400).json({ message: 'Khóa sách không hợp lệ' });
    logger.info('Fetching book by composite key', key);
    const book = await Sach.findOne({ where: key,
      include: [
        { model: TacGia, as: 'TacGia' },
        { model: NhaXuatBan, as: 'NhaXuatBan' },
        { model: TheLoai, as: 'TheLoai' },
      ],
    });
    if (!book) {
      logger.warn('Book not found', key);
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }
    const inventoryRows = await sequelize.query(
      'SELECT fn_kiem_tra_so_luong_sach(:maSach, :maTacGia, :maTheLoai) AS soLuongHienCo',
      { replacements: key, type: sequelize.QueryTypes.SELECT }
    );
    const response = { ...book.toJSON(), soLuongHienCo: inventoryRows[0]?.soLuongHienCo ?? book.soLuongHienCo };
    logger.info('Book fetched', { book: response });
    res.json(response);
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

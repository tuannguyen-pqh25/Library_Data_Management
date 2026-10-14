// backend/controllers/authorController.js
const logger = require('../src/logger');
const { TacGia, Sach } = require('../models');

const validateAuthorData = (body = {}) => {
  const authorData = {
    tenTacGia: typeof body.tenTacGia === 'string' ? body.tenTacGia.trim() : '',
    diaChi: typeof body.diaChi === 'string' ? body.diaChi.trim() : '',
    soDienThoai: typeof body.soDienThoai === 'string' ? body.soDienThoai.trim() : '',
  };
  const errors = {};

  if (!authorData.tenTacGia) {
    errors.tenTacGia = 'Tên tác giả là bắt buộc';
  }
  if (authorData.soDienThoai && !/^\d{10}$/.test(authorData.soDienThoai)) {
    errors.soDienThoai = 'Số điện thoại phải là 10 chữ số';
  }
  if (authorData.diaChi && authorData.diaChi.length < 5) {
    errors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
  }

  return { authorData, errors };
};

const getAllAuthors = async (req, res) => {
  try {
    logger.info('Fetching all authors');
    const authors = await TacGia.findAll();
    logger.info('Authors fetched', { count: authors.length });
    res.json(authors);
  } catch (error) {
    logger.error('Error in getAllAuthors', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

const createAuthor = async (req, res) => {
  try {
    logger.info('Creating author', { data: req.body });
    const { authorData, errors } = validateAuthorData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Thông tin tác giả không hợp lệ',
        errors,
      });
    }
    const author = await TacGia.create(authorData);
    logger.info('Author created', { author: author.toJSON() });
    res.status(201).json(author);
  } catch (error) {
    logger.error('Create author error', { error: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

const updateAuthor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      logger.warn('Invalid author ID in update request', { id: req.params.id });
      return res.status(400).json({ message: 'Mã tác giả là bắt buộc' });
    }
    logger.info('Updating author', { id, data: req.body });
    const { authorData, errors } = validateAuthorData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Thông tin tác giả không hợp lệ',
        errors,
      });
    }

    const [updated] = await TacGia.update(authorData, {
      where: { maTacGia: id }, // Map 'id' to 'maTacGia' in the where clause
      returning: true,
    });
    if (updated === 0) {
      logger.warn('Author not found', { id });
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }
    const author = await TacGia.findByPk(id);
    logger.info('Author updated', { author: author.toJSON() });
    res.json(author);
  } catch (error) {
    logger.error('Update author error', { error: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      logger.warn('Invalid author ID in delete request', { id: req.params.id });
      return res.status(400).json({ message: 'Mã tác giả là bắt buộc' });
    }

    logger.info('Checking author books', { id });
    const books = await Sach.findAll({
      where: { maTacGia: id },
      attributes: ['maSach', 'tenSach'],
    });
    if (books.length > 0) {
      const linkedBooks = books.map((book) => ({
        maSach: book.maSach,
        tenSach: book.tenSach,
      }));
      logger.warn('Cannot delete author due to associated books', {
        id,
        bookCount: linkedBooks.length,
      });
      return res.status(409).json({
        message: 'Không thể xóa tác giả vì vẫn còn sách liên kết. Hãy chuyển sách sang tác giả khác trước.',
        books: linkedBooks,
      });
    }

    logger.info('Deleting author', { id });
    const deleted = await TacGia.destroy({ where: { maTacGia: id } });
    if (deleted === 0) {
      logger.warn('Author not found for deletion', { id });
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }
    logger.info('Author deleted successfully', { id });
    res.json({ message: 'Xóa tác giả thành công' });
  } catch (error) {
    const databaseError = error.parent || error.original;
    if (databaseError?.code === 'ER_ROW_IS_REFERENCED_2') {
      logger.warn('Cannot delete author due to foreign key constraint', { error: error.message });
      return res.status(409).json({
        message: 'Không thể xóa tác giả vì vẫn còn dữ liệu sách đang tham chiếu',
      });
    }
    logger.error('Delete author error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Lỗi server khi xóa tác giả' });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params; // Use 'id' instead of 'maTacGia'
    if (!id) {
      logger.warn('Missing author ID in request');
      return res.status(400).json({ message: 'Mã tác giả là bắt buộc' });
    }
    logger.info('Fetching author by ID', { id });
    const author = await TacGia.findByPk(id);
    if (!author) {
      logger.warn('Author not found', { id });
      return res.status(404).json({ message: 'Không tìm thấy tác giả' });
    }
    logger.info('Author fetched', { author: author.toJSON() });
    res.json(author);
  } catch (error) {
    logger.error('Get author by ID error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorById,
};
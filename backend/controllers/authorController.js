// backend/controllers/authorController.js
const logger = require('../src/logger');
const { sequelize, TacGia, Sach } = require('../models'); // Import from models/index.js

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
    const { maTacGia, ...authorData } = req.body;
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
    const { id } = req.params; // Use 'id' as defined in the route
    if (!id) {
      logger.warn('Missing author ID in request');
      return res.status(400).json({ message: 'Mã tác giả là bắt buộc' });
    }
    logger.info('Updating author', { id, data: req.body });
    const [updated] = await TacGia.update(req.body, {
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
    const { id } = req.params;
    if (!id) {
      logger.warn('Missing author ID in request');
      return res.status(400).json({ message: 'Mã tác giả là bắt buộc' });
    }
    logger.info('Checking author books', { id });
    const [results] = await sequelize.query(
      'SELECT fn_check_author_books(:maTacGia) as bookCount',
      {
        replacements: { maTacGia: parseInt(id) },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const bookCount = results[0]?.bookCount || 0;
    if (bookCount > 0) {
      logger.warn('Cannot delete author due to associated books', { id, bookCount });
      return res.status(400).json({ message: 'Không thể xóa tác giả vì có sách liên kết' });
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
    if (error.message.includes('foreign key constraint fails')) {
      logger.warn('Cannot delete author due to foreign key constraint', { error: error.message });
      return res.status(409).json({ message: 'Không thể xóa tác giả vì có sách liên kết' });
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
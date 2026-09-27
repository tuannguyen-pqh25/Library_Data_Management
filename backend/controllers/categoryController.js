// backend/controllers/categoryController.js

// Import model TheLoai và Sequelize instance
const logger = require('../src/logger');
const { sequelize, TheLoai, Sach } = require('../models');


// Lấy danh sách tất cả thể loại
const getAllCategories = async (req, res) => {
  try {
    logger.info('Fetching all categories');
    const categories = await TheLoai.findAll({
      include: [{ model: Sach, as: 'Sachs', attributes: [] }], // Chỉ đếm số lượng, không lấy chi tiết sách
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Sachs.maSach')), 'soLuongSach'],
        ],
      },
      group: ['TheLoai.maTheLoai'],
    });
    logger.info('Categories fetched', { count: categories.length });
    res.json(categories);
  } catch (error) {
    logger.error('Error in getAllCategories', {
      error: error.message,
      stack: error.stack,
      details: error
    });
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một thể loại theo ID
const getCategoryById = async (req, res) => {
  try {
    const { maTheLoai } = req.params;
    logger.info('Fetching category by ID', { maTheLoai });
    const category = await TheLoai.findByPk(maTheLoai, {
      include: [{ model: Sach, as: 'Sachs' }],
    });
    if (!category) {
      logger.warn('Category not found', { maTheLoai });
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    logger.info('Category fetched', { category: category.toJSON() });
    res.json(category);
  } catch (error) {
    logger.error('Error in getCategoryById', {
      error: error.message,
      stack: error.stack,
      maTheLoai: req.params.maTheLoai
    });
    res.status(500).json({ message: error.message });
  }
};

// Tạo thể loại mới
const createCategory = async (req, res) => {
  try {
    const { tenTheLoai } = req.body;
    logger.info('Creating category', { data: req.body });
    const category = await TheLoai.create({ tenTheLoai });
    logger.info('Category created', { category: category.toJSON() });
    res.status(201).json(category);
  } catch (error) {
    logger.error('Create category error', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin thể loại
const updateCategory = async (req, res) => {
  try {
    const { maTheLoai } = req.params;
    const { tenTheLoai } = req.body;
    logger.info('Updating category', { maTheLoai, data: req.body });
    const [updated] = await TheLoai.update({ tenTheLoai }, {
      where: { maTheLoai },
    });
    if (updated === 0) {
      logger.warn('Category not found for update', { maTheLoai });
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    const category = await TheLoai.findByPk(maTheLoai);
    logger.info('Category updated', { category: category.toJSON() });
    res.json(category);
  } catch (error) {
    logger.error('Update category error', {
      error: error.message,
      stack: error.stack,
      maTheLoai: req.params.maTheLoai,
      body: req.body
    });
    res.status(400).json({ message: error.message });
  }
};

// Xóa thể loại
const deleteCategory = async (req, res) => {
  try {
    const { maTheLoai } = req.params;
    logger.info('Checking category books', { maTheLoai });
    const [results] = await sequelize.query(
      'SELECT COUNT(*) as bookCount FROM Sach WHERE maTheLoai = :maTheLoai',
      {
        replacements: { maTheLoai: parseInt(maTheLoai) },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const bookCount = results[0]?.bookCount || 0;
    if (bookCount > 0) {
      logger.warn('Cannot delete category due to associated books', { maTheLoai, bookCount });
      return res.status(400).json({ message: 'Không thể xóa thể loại vì có sách liên kết' });
    }
    logger.info('Deleting category', { maTheLoai });
    const deleted = await TheLoai.destroy({ where: { maTheLoai } });
    if (deleted === 0) {
      logger.warn('Category not found for deletion', { maTheLoai });
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }
    logger.info('Category deleted successfully', { maTheLoai });
    res.json({ message: 'Xóa thể loại thành công' });
  } catch (error) {
    if (error.message.includes('foreign key constraint fails')) {
      logger.warn('Cannot delete author due to foreign key constraint', { error: error.message });
      return res.status(409).json({ message: 'Không thể xóa thể loại vì có sách liên kết' });
    }
    logger.error('Delete category error', {
      error: error.message,
      stack: error.stack,
      maTheLoai: req.params.maTheLoai
    });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
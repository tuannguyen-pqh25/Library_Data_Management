// backend/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Routes cho admin (yêu cầu quyền admin)
router.get('/', auth, getAllCategories);
router.get('/:maTheLoai', auth, getCategoryById);
router.post('/', auth, adminAuth, createCategory);
router.put('/:maTheLoai', auth, adminAuth, updateCategory);
router.delete('/:maTheLoai', auth, adminAuth, deleteCategory);

module.exports = router;
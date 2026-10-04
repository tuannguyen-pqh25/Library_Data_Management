// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const upload = require('../config/multer.js'); // Import multer configuration
const {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookById
} = require('../controllers/bookController.js');

// Routes công khai
router.get('/', getAllBooks);
router.get('/:maSach/:maTacGia/:maTheLoai', getBookById);

// Routes yêu cầu quyền admin
router.post('/', auth, adminAuth,upload.single('image'), createBook);
router.put('/:maSach/:maTacGia/:maTheLoai', auth, adminAuth, upload.single('image'), updateBook);
router.delete('/:maSach/:maTacGia/:maTheLoai', auth, adminAuth, deleteBook);

module.exports = router;

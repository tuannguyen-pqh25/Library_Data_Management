// backend/routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middlewares/authMiddleware.js');
const {
  getAllBorrowRequests,
  getReaderBorrowHistory,
  createBorrowRequest,
  updateBorrowRequest,
  exportBorrowSlip,
  exportReturnSlip,
  exportPenaltyForm
} = require('../controllers/borrowController.js');

// Routes cho admin
router.get('/admin/requests', auth, adminAuth, getAllBorrowRequests);
router.put('/admin/requests/:maPhieuMuon', auth, adminAuth, updateBorrowRequest);

// Routes cho độc giả
router.get('/history', auth, getReaderBorrowHistory);
router.post('/request', auth, createBorrowRequest);

// Routes mới cho xuất phiếu
router.get('/export/borrow/:maPhieuMuon', auth, exportBorrowSlip); // Xuất phiếu mượn
router.get('/export/return/:maPhieuTra', auth, exportReturnSlip); // Xuất phiếu trả
router.get('/export/penalty/:maPhieuTra', auth, exportPenaltyForm); // Xuất form phạt

module.exports = router;
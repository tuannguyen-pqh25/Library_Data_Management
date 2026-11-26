const express = require('express');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const {
  getUnreturnedLoans,
  getStatistics,
  getDashboardSummary,
  getDetailedUnreturnedLoans,
  exportExcelReport,
} = require('../controllers/reportController');

const router = express.Router();
router.use(auth, adminAuth);
router.get('/unreturned-loans', getUnreturnedLoans);
router.get('/statistics', getStatistics);
router.get('/tong-quan', getDashboardSummary);
router.get('/phieu-chua-tra', getDetailedUnreturnedLoans);
router.get('/export-excel', exportExcelReport);

module.exports = router;

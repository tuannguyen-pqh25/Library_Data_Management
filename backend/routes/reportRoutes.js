const express = require('express');
const { auth, adminAuth } = require('../middlewares/authMiddleware');
const { getUnreturnedLoans, getStatistics } = require('../controllers/reportController');

const router = express.Router();
router.use(auth, adminAuth);
router.get('/unreturned-loans', getUnreturnedLoans);
router.get('/statistics', getStatistics);

module.exports = router;

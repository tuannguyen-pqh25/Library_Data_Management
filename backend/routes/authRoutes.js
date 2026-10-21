// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/authMiddleware.js');
const { loginStaff, loginReader, registerReader, checkReaderStatus } = require('../controllers/authController.js');
const { requestPasswordReset, confirmPasswordReset } = require('../controllers/authController.js');

router.post('/staff/login', loginStaff);
router.post('/reader/login', loginReader);
router.post('/reader/register', registerReader);
router.post('/reader/password/request-reset', requestPasswordReset);
router.post('/reader/password/reset', confirmPasswordReset);
router.get('/check-reader-status/:maDocGia', auth, checkReaderStatus);

module.exports = router;
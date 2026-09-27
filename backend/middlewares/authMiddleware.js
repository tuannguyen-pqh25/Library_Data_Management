// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { sequelize, NhanVien, DocGia } = require('../models');
const logger = require('../src/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.warn('No token provided in Authorization header');
      return res.status(401).json({ error: 'Không có token, truy cập bị từ chối' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Token decoded', { userId: decoded.id, role: decoded.role });

    let user;
    if (decoded.role === 'admin') {
      user = await NhanVien.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      req.userType = 'staff';
    } else if (decoded.role === 'reader') {
      user = await DocGia.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
      });
      req.userType = 'reader';
    }

    if (!user) {
      logger.warn('User not found', { userId: decoded.id, role: decoded.role });
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }

    req.token = token;
    req.user = user;
    logger.info('User authenticated', { userId: decoded.id, userType: req.userType });
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, stack: error.stack });
    res.status(401).json({ error: 'Token không hợp lệ' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    if (req.userType === 'staff') {
      logger.info('Admin access granted', { userId: req.user.MSNV });
      next();
    } else {
      logger.warn('Admin access denied', { userId: req.user.maDocGia || req.user.MSNV });
      return res.status(403).json({ error: 'Yêu cầu quyền admin' });
    }
  } catch (error) {
    logger.error('Admin auth error', { error: error.message, stack: error.stack });
    res.status(403).json({ error: 'Yêu cầu quyền admin' });
  }
};

module.exports = { auth, adminAuth };
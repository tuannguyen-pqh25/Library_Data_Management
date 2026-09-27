
const { sequelize, NhanVien, PhieuMuon } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../src/logger');
const { Op } = require('sequelize');


// Lấy danh sách tất cả nhân viên
const getAllStaff = async (req, res) => {
  try {
    logger.info('Fetching all staff', { userId: req.user?.MSNV });
    const staff = await NhanVien.findAll({
      attributes: { exclude: ['password'] },
    });
    logger.info('Staff fetched successfully', { count: staff.length });
    res.json(staff);
  } catch (error) {
    logger.error('Error fetching staff', { error: error.message, userId: req.user?.MSNV });
    res.status(500).json({ message: error.message });
  }
};

// Thêm nhân viên mới
const createStaff = async (req, res) => {
  try {
    logger.info('Creating new staff', { userId: req.user?.MSNV, data: req.body });
    const { password, ...staffData } = req.body;

    // Validate required fields
    if (!password || !staffData.hoTenNV || !staffData.chucVu || !staffData.diaChi || !staffData.soDienThoai) {
      logger.warn('Missing required fields in createStaff', { data: req.body });
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc' });
    }

    // Check for duplicate hoTenNV
    const existingStaff = await NhanVien.findOne({ where: { hoTenNV: staffData.hoTenNV } });
    if (existingStaff) {
      logger.warn('Duplicate hoTenNV detected', { hoTenNV: staffData.hoTenNV });
      return res.status(400).json({ message: 'Họ tên nhân viên đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const staff = await NhanVien.create({
      ...staffData,
      password: hashedPassword,
    });

    const staffResponse = { ...staff.toJSON(), password: undefined };
    logger.info('Staff created successfully', { MSNV: staffResponse.MSNV });
    res.status(201).json(staffResponse);
  } catch (error) {
    logger.error('Error creating staff', { error: error.message, userId: req.user?.MSNV });
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin nhân viên
const updateStaff = async (req, res) => {
  try {
    // Lấy ID đúng key (tùy router)
    const MSNV = parseInt(req.params.MSNV || req.params.id, 10);
    logger.info('Updating staff', { MSNV, data: req.body });

    if (isNaN(MSNV) || MSNV <= 0) {
      return res.status(400).json({ message: 'MSNV không hợp lệ' });
    }

    // Kiểm tra dữ liệu truyền lên
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Dữ liệu cập nhật trống' });
    }

    // Cho phép các trường này được cập nhật
    const allowedFields = ['hoTenNV', 'chucVu', 'diaChi', 'soDienThoai', 'password'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Mã hoá mật khẩu nếu có
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 8);
    }

    // Kiểm tra trùng tên nhân viên
    if (updateData.hoTenNV) {
      const existing = await NhanVien.findOne({
        where: {
          hoTenNV: updateData.hoTenNV,
          MSNV: { [Op.ne]: MSNV },
        },
      });
      if (existing) {
        return res.status(400).json({ message: 'Họ tên nhân viên đã tồn tại' });
      }
    }

    // Cập nhật trong DB
    const [affected] = await NhanVien.update(updateData, {
      where: { MSNV },
    });

    if (affected === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
    }

    // Lấy lại thông tin sau cập nhật
    const staff = await NhanVien.findByPk(MSNV, {
      attributes: { exclude: ['password'] },
    });

    logger.info('Staff updated successfully', { MSNV });
    return res.json(staff);

  } catch (error) {
    logger.error('Error updating staff', { error: error.message });
    return res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// Xóa nhân viên
const deleteStaff = async (req, res) => {
  try {
    logger.info('Attempting to delete staff', { MSNV: req.params.MSNV, userId: req.user?.MSNV });
    const MSNV = parseInt(req.params.id, 10);
    if (isNaN(MSNV) || MSNV <= 0) {
      logger.warn('Invalid MSNV in deleteStaff', { MSNV: req.params.MSNV });
      return res.status(400).json({ message: 'MSNV không hợp lệ' });
    }

    // Prevent deletion of active user
    if (req.user && req.user.MSNV === MSNV) {
      logger.warn('Attempt to delete active user', { MSNV, userId: req.user.MSNV });
      return res.status(403).json({ message: 'Không thể xóa tài khoản đang đăng nhập' });
    }

    // Check for related records
    // const hasLoans = await PhieuMuon.count({ where: { MSNV } });
    // if (hasLoans > 0) {
    //   logger.warn('Staff has active loans', { MSNV, loanCount: hasLoans });
    //   return res.status(400).json({ message: 'Không thể xóa nhân viên vì có phiếu mượn liên quan' });
    // }

    const deleted = await NhanVien.destroy({ where: { MSNV } });
    if (deleted === 0) {
      logger.warn('Staff not found for deletion', { MSNV });
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    logger.info('Staff deleted successfully', { MSNV });
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    logger.error('Error deleting staff', { error: error.message, MSNV: req.params.MSNV, userId: req.user?.MSNV });
    res.status(500).json({ message: error.message || 'Lỗi server khi xóa nhân viên' });
  }
};

// Lấy thông tin một nhân viên theo ID
const getStaffById = async (req, res) => {
  try {
    logger.info('Fetching staff by ID', { MSNV: req.params.MSNV, userId: req.user?.MSNV });
    const MSNV = parseInt(req.params.id, 10);
    if (isNaN(MSNV) || MSNV <= 0) {
      logger.warn('Invalid MSNV in getStaffById', { MSNV: req.params.MSNV });
      return res.status(400).json({ message: 'MSNV không hợp lệ' });
    }

    const staff = await NhanVien.findByPk(MSNV, {
      attributes: { exclude: ['password'] },
    });
    if (!staff) {
      logger.warn('Staff not found', { MSNV });
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    logger.info('Staff fetched successfully', { MSNV });
    res.json(staff);
  } catch (error) {
    logger.error('Error fetching staff by ID', { error: error.message, MSNV: req.params.MSNV, userId: req.user?.MSNV });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
};

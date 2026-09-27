
const { sequelize, DocGia, NhanVien, PhieuMuon } = require('../models');
const validator = require('validator');
const logger = require('../src/logger');

const getAllReaders = async (req, res) => {
  try {
    logger.info('Fetching all readers', { userId: req.user?.MSNV || req.user?.maDocGia });
    const readers = await DocGia.findAll({
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
    });
    logger.info('Readers fetched successfully', { count: readers.length });
    res.json(readers);
  } catch (error) {
    logger.error('Error fetching readers', { error: error.message, userId: req.user?.MSNV || req.user?.maDocGia });
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách độc giả' });
  }
};

const getReaderById = async (req, res) => {
  try {
    logger.info('Fetching reader by ID', { maDocGia: req.params.maDocGia, userId: req.user?.MSNV || req.user?.maDocGia });
    const maDocGia = parseInt(req.params.id, 10);
    if (isNaN(maDocGia) || maDocGia <= 0) {
      logger.warn('Invalid maDocGia in getReaderById', { maDocGia: req.params.maDocGia });
      return res.status(400).json({ error: 'Mã độc giả không hợp lệ' });
    }

    const reader = await DocGia.findByPk(maDocGia, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
    });
    if (!reader) {
      logger.warn('Reader not found', { maDocGia });
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }

    logger.info('Reader fetched successfully', { maDocGia });
    res.json(reader);
  } catch (error) {
    logger.error('Error fetching reader by ID', { error: error.message, maDocGia: req.params.maDocGia, userId: req.user?.MSNV || req.user?.maDocGia });
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin độc giả' });
  }
};

const deleteReader = async (req, res) => {
  try {
    logger.info('Attempting to delete reader', { maDocGia: req.params.maDocGia, userId: req.user?.MSNV || req.user?.maDocGia });
    const maDocGia = parseInt(req.params.id, 10);
    if (isNaN(maDocGia) || maDocGia <= 0) {
      logger.warn('Invalid maDocGia in deleteReader', { maDocGia: req.params.maDocGia });
      return res.status(400).json({ error: 'Mã độc giả không hợp lệ' });
    }

    // Prevent deletion of active user
    if (req.user?.userType === 'reader' && req.user?.maDocGia === maDocGia) {
      logger.warn('Attempt to delete active reader', { maDocGia, userId: req.user.maDocGia });
      return res.status(403).json({ error: 'Không thể xóa tài khoản đang đăng nhập' });
    }

    // Check for pending loans
    const hasLoans = await PhieuMuon.count({ where: { maDocGia } });
    if (hasLoans > 0) {
      logger.warn('Reader has pending loans', { maDocGia, loanCount: hasLoans });
      return res.status(400).json({ error: 'Không thể xóa độc giả vì có phiếu mượn chưa trả' });
    }

    const deleted = await DocGia.destroy({ where: { maDocGia } });
    if (deleted === 0) {
      logger.warn('Reader not found for deletion', { maDocGia });
      return res.status(404).json({ error: 'Không tìm thấy độc giả' });
    }

    logger.info('Reader deleted successfully', { maDocGia });
    res.json({ message: 'Xóa độc giả thành công' });
  } catch (error) {
    logger.error('Error deleting reader', { error: error.message, maDocGia: req.params.maDocGia, userId: req.user?.MSNV || req.user?.maDocGia });
    res.status(500).json({ error: error.message || 'Lỗi server khi xóa độc giả' });
  }
};

const updateProfile = async (req, res) => {
  try {
    logger.info('Updating profile', { userId: req.user?.MSNV || req.user?.maDocGia, userType: req.userType, data: req.body });
    const updates = Object.keys(req.body);
    const userType = req.userType;
    let allowedUpdates;

    if (userType === 'reader') {
      allowedUpdates = ['hoLot', 'ten', 'ngaySinh', 'phai', 'diaChi', 'dienThoai', 'email'];
    } else if (userType === 'staff') {
      allowedUpdates = ['hoTenNV', 'diaChi', 'soDienThoai'];
    } else {
      logger.warn('Invalid user type', { userType });
      return res.status(400).json({ error: 'Loại người dùng không hợp lệ' });
    }

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      logger.warn('Invalid fields in updateProfile', { invalidFields: updates.filter(u => !allowedUpdates.includes(u)) });
      return res.status(400).json({ error: 'Trường cập nhật không hợp lệ', errors: { invalidFields: updates.filter(u => !allowedUpdates.includes(u)) } });
    }

    let user;
    if (userType === 'reader') {
      user = await DocGia.findByPk(req.user.maDocGia);
    } else if (userType === 'staff') {
      user = await NhanVien.findByPk(req.user.MSNV);
    }

    if (!user) {
      logger.warn('User not found for profile update', { userId: req.user?.MSNV || req.user?.maDocGia });
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const errors = {};
    if (req.body.email && !validator.isEmail(req.body.email)) {
      errors.email = 'Email không hợp lệ';
    }
    if (req.body.dienThoai && !/^\d{10}$/.test(req.body.dienThoai)) {
      errors.dienThoai = 'Số điện thoại phải gồm 10 chữ số';
    }
    if (req.body.soDienThoai && !/^\d{10}$/.test(req.body.soDienThoai)) {
      errors.soDienThoai = 'Số điện thoại phải gồm 10 chữ số';
    }
    if (req.body.ngaySinh && isNaN(new Date(req.body.ngaySinh))) {
      errors.ngaySinh = 'Ngày sinh không hợp lệ';
    }
    if (req.body.phai && !['Nam', 'Nữ', 'Khác'].includes(req.body.phai)) {
      errors.phai = 'Giới tính không hợp lệ';
    }
    if (req.body.hoLot && !req.body.hoLot.trim()) {
      errors.hoLot = 'Họ lót không được để trống';
    }
    if (req.body.ten && !req.body.ten.trim()) {
      errors.ten = 'Tên không được để trống';
    }
    if (req.body.hoTenNV && !req.body.hoTenNV.trim()) {
      errors.hoTenNV = 'Họ tên nhân viên không được để trống';
    }

    if (Object.keys(errors).length > 0) {
      logger.warn('Invalid data in updateProfile', { errors });
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ', errors });
    }

    updates.forEach(update => (user[update] = req.body[update]));
    await user.save();

    const userResponse = { ...user.toJSON(), password: undefined, otp: undefined, otpExpiry: undefined };
    logger.info('Profile updated successfully', { userId: req.user?.MSNV || req.user?.maDocGia });
    res.json({ message: 'Cập nhật thông tin thành công', data: userResponse });
  } catch (error) {
    logger.error('Error updating profile', { error: error.message, userId: req.user?.MSNV || req.user?.maDocGia });
    res.status(400).json({ error: 'Lỗi khi cập nhật thông tin', errors: { server: error.message } });
  }
};

const getProfile = async (req, res) => {
  try {
    logger.info('Fetching profile', { userId: req.user?.MSNV || req.user?.maDocGia, userType: req.userType });
    const userType = req.userType;
    let user;
    if (userType === 'reader') {
      user = await DocGia.findByPk(req.user.maDocGia, {
        attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
      });
    } else if (userType === 'staff') {
      user = await NhanVien.findByPk(req.user.MSNV, {
        attributes: { exclude: ['password'] },
      });
    }

    if (!user) {
      logger.warn('User not found for profile fetch', { userId: req.user?.MSNV || req.user?.maDocGia });
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    logger.info('Profile fetched successfully', { userId: req.user?.MSNV || req.user?.maDocGia });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching profile', { error: error.message, userId: req.user?.MSNV || req.user?.maDocGia });
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin cá nhân' });
  }
};

module.exports = { getAllReaders, getReaderById, deleteReader, updateProfile, getProfile };

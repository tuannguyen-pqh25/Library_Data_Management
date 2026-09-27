// backend/controllers/authController.js

// Import các thư viện và model cần thiết
const jwt = require('jsonwebtoken'); // Thư viện để tạo và xác thực JWT
const bcrypt = require('bcryptjs'); // Thư viện để mã hóa và so sánh mật khẩu
const { sequelize, NhanVien, DocGia } = require('../models'); // Import model NhanVien và DocGia từ Sequelize
const { generateOTP, sendVerificationEmail } = require('../config/email'); // Import hàm tạo OTP và gửi email

// Hàm tạo JWT token (định nghĩa ở cấp độ module)
const generateToken = (user, type) => {
  const payload = {
    id: type === 'admin' ? user.MSNV : user.maDocGia,
    role: type,
    name: type === 'admin' ? user.hoTenNV : `${user.hoLot} ${user.ten}`
  };
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Đăng nhập dành cho nhân viên (admin)
const loginStaff = async (req, res) => {
  try {
    const { hoTenNV, password } = req.body;

    // Tìm nhân viên theo hoTenNV
    const nhanvien = await NhanVien.findOne({ where: { hoTenNV } });
    if (!nhanvien) {
      return res.status(401).json({ error: 'Tên nhân viên không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, nhanvien.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mật khẩu không đúng' });
    }

    // Tạo token
    const token = generateToken(nhanvien, 'admin');

    res.json({ message: 'Đăng nhập thành công', nhanvien, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Đăng nhập cho độc giả
const loginReader = async (req, res) => {
  try {
    const { email, password } = req.body;
    const docgia = await DocGia.findOne({ where: { email } });
    
    if (!docgia) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, docgia.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    
    const [results] = await sequelize.query('CALL sp_check_reader_status(:maDocGia)', {
      replacements: { maDocGia: docgia.maDocGia },
      type: sequelize.QueryTypes.SELECT
    });
    const hasPendingLoan = results[0]?.hasPendingLoan || 0;
    
    if (hasPendingLoan > 0) {
      return res.status(403).send({ error: 'Cannot login. You have pending borrow requests.' });
    }
    
    const token = generateToken(docgia, 'reader');
    res.send({ docgia, token });
  } catch (error) {
    res.status(400).send({ error: error.message || 'Đăng nhập thất bại' });
  }
};

// Đăng ký tài khoản độc giả
const registerReader = async (req, res) => {
  try {
    const { hoLot, ten, ngaySinh, phai, diaChi, dienThoai, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingReader = await DocGia.findOne({ where: { email } });
    if (existingReader) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 8);

    // Tạo độc giả mới (maDocGia tự động tạo bởi autoIncrement)
    const docgia = await DocGia.create({
      hoLot,
      ten,
      ngaySinh,
      phai,
      diaChi,
      dienThoai,
      email,
      password: hashedPassword,
    });

    // Tạo token
    const token = generateToken(docgia, 'reader');

    res.status(201).json({ message: 'Đăng ký thành công', docgia, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Gửi yêu cầu đổi mật khẩu
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body; // Lấy email từ body
    // Tìm độc giả theo email
    const docgia = await DocGia.findOne({ where: { email } });
  
    // Kiểm tra nếu không tìm thấy độc giả
    if (!docgia) {
      return res.status(404).send({ error: 'Email not found' });
    }
  
    // Tạo OTP và lưu vào model độc giả
    const otp = generateOTP();
    docgia.otp = otp; // Lưu OTP
    docgia.otpExpiry = Date.now() + 10 * 60 * 1000; // Thiết lập thời gian hết hạn OTP (10 phút)
    await docgia.save();
  
    // Gửi email chứa OTP
    await sendVerificationEmail(email, otp);
  
    // Trả về thông báo gửi email thành công
    res.send({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    // Xử lý lỗi, trả về mã trạng thái 500
    res.status(500).send({ error: error.message || 'Failed to request password reset' });
  }
};

// Xác nhận OTP và đổi mật khẩu
const confirmPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body; // Lấy email, OTP và mật khẩu mới từ body
    // Tìm độc giả theo email
    const docgia = await DocGia.findOne({ where: { email } });
  
    // Kiểm tra nếu không tìm thấy độc giả
    if (!docgia) {
      return res.status(404).send({ error: 'Email not found' });
    }
    
    // Kiểm tra OTP và thời gian hết hạn
    if (docgia.otp !== otp) {
      return res.status(400).send({ error: 'Invalid OTP' });
    }
    if (Date.now() > docgia.otpExpiry) {
      return res.status(400).send({ error: 'OTP has expired' });
    }
  
    // Cập nhật mật khẩu mới (mã hóa trước khi lưu)
    docgia.password = await bcrypt.hash(newPassword, 8);
    // Xóa OTP và thời gian hết hạn
    docgia.otp = null;
    docgia.otpExpiry = null;
    await docgia.save();
  
    // Trả về thông báo đổi mật khẩu thành công
    res.send({ message: 'Password updated successfully. Redirecting to login.' });
  } catch (error) {
    // Xử lý lỗi, trả về mã trạng thái 500
    res.status(500).send({ error: error.message || 'Failed to update password' });
  }
};

// Kiểm tra trạng thái độc giả
const checkReaderStatus = async (req, res) => {
  try {
    const { maDocGia } = req.params; // Lấy maDocGia từ URL
    const [results] = await sequelize.query('CALL sp_check_reader_status(:maDocGia, @hasPendingLoan)', {
      replacements: { maDocGia: parseInt(maDocGia) }, // Chuyển sang INT
      type: sequelize.QueryTypes.SELECT
    });
    const hasPendingLoan = results[0]?.hasPendingLoan || 0;

    res.send({ maDocGia, hasPendingLoan });
  } catch (error) {
    res.status(400).send({ error: error.message || 'Failed to check reader status' });
  }
};

// Xuất các hàm để sử dụng trong routes
module.exports = {
  loginStaff,
  loginReader,
  registerReader,
  requestPasswordReset,
  confirmPasswordReset,
  checkReaderStatus
};
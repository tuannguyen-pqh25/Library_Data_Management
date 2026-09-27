// src/utils/validation.js

// Validate thông tin sách
export const validateBookForm = (book) => {
  const errors = {};

  // Kiểm tra mã sách
  if (!book.maSach) errors.maSach = 'Mã sách là bắt buộc';

  // Kiểm tra tên sách
  if (!book.tenSach) errors.tenSach = 'Tên sách là bắt buộc';

  // Kiểm tra mã nhà xuất bản
  if (!book.maNXB) errors.maNXB = 'Nhà xuất bản là bắt buộc';

  // Đơn giá phải lớn hơn 0
  if (!book.donGia || book.donGia <= 0) errors.donGia = 'Đơn giá phải lớn hơn 0';

  // Số quyển phải >= 0
  if (!book.soQuyen || book.soQuyen < 0) errors.soQuyen = 'Số quyển không hợp lệ';

  // Năm xuất bản phải >= 1900
  if (!book.namXuatBan || book.namXuatBan < 1900) errors.namXuatBan = 'Năm xuất bản không hợp lệ';

  // Trả về object chứa kết quả hợp lệ và danh sách lỗi
  return {
    isValid: Object.keys(errors).length === 0, // true nếu không có lỗi
    errors
  };
};

// Validate thông tin độc giả
export const validateReaderForm = (reader) => {
  const errors = {};

  // Kiểm tra mã độc giả
  if (!reader.maDocGia) errors.maDocGia = 'Mã độc giả là bắt buộc';

  // Kiểm tra họ lót
  if (!reader.hoLot) errors.hoLot = 'Họ lót là bắt buộc';

  // Kiểm tra tên
  if (!reader.ten) errors.ten = 'Tên là bắt buộc';

  // Kiểm tra email
  if (!reader.email) {
    errors.email = 'Email là bắt buộc';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reader.email)) {
    errors.email = 'Email không hợp lệ';
  }

  // Kiểm tra mật khẩu
  if (!reader.password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (reader.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate thông tin nhà xuất bản
export const validatePublisherForm = (publisher) => {
  const errors = {};

  // Kiểm tra mã NXB
  if (!publisher.maNXB) errors.maNXB = 'Mã NXB là bắt buộc';

  // Kiểm tra tên NXB
  if (!publisher.tenNXB) errors.tenNXB = 'Tên NXB là bắt buộc';

  // Kiểm tra địa chỉ
  if (!publisher.diaChi) errors.diaChi = 'Địa chỉ là bắt buộc';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate thông tin nhân viên
export const validateStaffForm = (staff) => {
  const errors = {};

  // Kiểm tra mã số nhân viên
  if (!staff.MSNV) errors.MSNV = 'MSNV là bắt buộc';

  // Kiểm tra họ tên
  if (!staff.hoTenNV) errors.hoTenNV = 'Họ tên là bắt buộc';

  // Kiểm tra chức vụ
  if (!staff.chucVu) errors.chucVu = 'Chức vụ là bắt buộc';

  // Kiểm tra địa chỉ
  if (!staff.diaChi) errors.diaChi = 'Địa chỉ là bắt buộc';

  // Kiểm tra số điện thoại
  if (!staff.soDienThoai) errors.soDienThoai = 'Số điện thoại là bắt buộc';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate thông tin tác giả
export const validateAuthorForm = (author) => {
  const errors = {};

  // Kiểm tra mã tác giả
  if (!author.maTacGia) errors.maTacGia = 'Mã tác giả là bắt buộc';

  // Kiểm tra họ tên
  if (!author.tenTacGia) errors.tenTacGia = 'Họ tên là bắt buộc';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

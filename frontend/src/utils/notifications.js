// Import hàm getCurrentInstance để truy cập context bên trong một component Vue
import { getCurrentInstance } from 'vue';

/**
 * Hàm hiển thị thông báo thành công (toast success)
 * @param {string} message - Nội dung thông báo
 */
export const showSuccess = (message) => {
  const app = getCurrentInstance(); // Lấy thể hiện hiện tại của component đang chạy
  if (app) {
    // Sử dụng biến proxy để truy cập global property (ví dụ như $toast)
    app.proxy.$toast.show(message, 'success'); // Hiển thị toast kiểu success
  }
};

/**
 * Hàm hiển thị thông báo lỗi (toast danger)
 * @param {object} error - Đối tượng lỗi từ API hoặc hệ thống
 */
export const showError = (error) => {
  const app = getCurrentInstance();
  let message = 'Có lỗi xảy ra'; // Mặc định nếu không có thông tin lỗi cụ thể

  // Kiểm tra nếu lỗi có phản hồi từ server
  if (error.response) {
    // Lấy thông báo lỗi từ server (nếu có)
    message = error.response.data.message || error.response.data.error || 'Lỗi từ server';
  } else if (error.request) {
    // Trường hợp gửi request nhưng không có phản hồi
    message = 'Không thể kết nối đến server';
  } else {
    // Trường hợp lỗi khi xử lý trong client
    message = error.message;
  }

  if (app) {
    // Hiển thị thông báo lỗi dạng toast với màu đỏ
    app.proxy.$toast.show(message, 'danger');
  }
};

/**
 * Hàm hiển thị hộp thoại xác nhận thao tác
 * @param {string} message - Thông báo hỏi người dùng
 * @returns {boolean} - true nếu người dùng xác nhận, false nếu hủy
 */
export const showConfirm = (message) => {
  // Dùng window.confirm để hiện hộp thoại xác nhận
  return window.confirm(message || 'Bạn có chắc chắn muốn thực hiện thao tác này?');
};

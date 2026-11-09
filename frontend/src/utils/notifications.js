// Import hàm getCurrentInstance để truy cập context bên trong một component Vue
import { getCurrentInstance } from 'vue';

let globalToastInstance = null;

/**
 * Đăng ký instance của component Toast để gọi từ bất kỳ đâu (kể cả sau async/await)
 */
export const setToastInstance = (instance) => {
  globalToastInstance = instance;
};

/**
 * Hàm hiển thị thông báo thành công (toast success)
 * @param {string} message - Nội dung thông báo
 */
export const showSuccess = (message) => {
  if (globalToastInstance?.addToast) {
    globalToastInstance.addToast(message, 'success');
    return;
  }
  const app = getCurrentInstance();
  if (app?.proxy?.$toast) {
    app.proxy.$toast.show(message, 'success');
  }
};

/**
 * Hàm hiển thị thông báo lỗi (toast danger)
 * @param {object|string} error - Đối tượng lỗi từ API hoặc chuỗi thông báo
 */
export const showError = (error) => {
  let message = 'Có lỗi xảy ra';

  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data) {
    message = error.response.data.message || error.response.data.error || 'Lỗi từ server';
  } else if (error?.request) {
    message = 'Không thể kết nối đến server';
  } else if (error?.message) {
    message = error.message;
  }

  if (globalToastInstance?.addToast) {
    globalToastInstance.addToast(message, 'danger');
    return;
  }
  const app = getCurrentInstance();
  if (app?.proxy?.$toast) {
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

// src/services/api.js

// Import thư viện axios để gọi API
import axios from 'axios';

import store from '@/store';        // import Vuex store
import router from '@/router';      // mport Vue Router


// Tạo một instance axios riêng, với URL gốc lấy từ biến môi trường .env 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // Cấu hình baseURL dựa trên file .env
});

// -------------------------------
// INTERCEPTOR CHO REQUEST
// -------------------------------

// Interceptor cho mỗi request trước khi gửi lên server (để đính kèm token)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (nếu đã đăng nhập)
    const token = localStorage.getItem('token');

    // Nếu có token, đính kèm vào header Authorization theo chuẩn Bearer
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Trả về config đã chỉnh sửa
  },
  (error) => {
    // Nếu xảy ra lỗi trước khi gửi request, trả lỗi về
    return Promise.reject(error);
  }
);

// -------------------------------
// INTERCEPTOR CHO RESPONSE
// -------------------------------

api.interceptors.response.use(
  // Nếu phản hồi thành công, trả dữ liệu về như bình thường
  response => response,

  // Nếu có lỗi trong phản hồi (ví dụ: lỗi 401 Unauthorized)
  error => {
    if (error.response?.status === 401) {
      // Nếu lỗi là 401 (không có quyền, token sai hoặc hết hạn):
      // - Đăng xuất người dùng (xóa token, user...)
      // - Chuyển hướng sang trang đăng nhập
      store.dispatch('auth/logout'); // (import store ở đầu nếu chưa có)
      router.push('/login');         // (import router ở đầu nếu chưa có)
    }

    // Trả lỗi cho phần gọi API xử lý tiếp
    return Promise.reject(error);
  }
);

// Xuất instance axios đã cấu hình để dùng trong toàn bộ ứng dụng
export default api;

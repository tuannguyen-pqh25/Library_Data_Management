// frontend/src/main.js

// Import hàm tạo ứng dụng từ Vue 3
import { createApp } from 'vue';

// Import component gốc của ứng dụng
import App from './App.vue';

// Import router để điều hướng giữa các trang
import router from './router';

// Import Vuex store để quản lý trạng thái toàn cục
import store from './store';

// Import component Toast tùy chỉnh (dùng để hiển thị thông báo)
import Toast from './components/Toast.vue';

// Import các stylesheet từ Bootstrap và Font Awesome
import 'bootstrap/dist/css/bootstrap.min.css';               // CSS của Bootstrap
import '@fortawesome/fontawesome-free/css/all.min.css';      // Icon từ Font Awesome
import 'bootstrap/dist/js/bootstrap.bundle.min.js';          // JavaScript của Bootstrap (đã bao gồm Popper.js)

// Khởi tạo ứng dụng Vue
const app = createApp(App);

// Tạo plugin Toast để có thể sử dụng toàn cục trong các component
const toast = {
  // Hàm install là quy ước khi tạo một Vue plugin
  install: (app) => {
    // Tạo một thẻ div trong body để chứa các toast message
    const toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);

    // Mount component Toast vào div vừa tạo
    const toastInstance = createApp(Toast).mount(toastContainer);
    
    // Đăng ký hàm `$toast.show()` để có thể gọi từ bất kỳ component nào
    app.config.globalProperties.$toast = {
      /**
       * Hiển thị một toast message
       * @param {string} message - Nội dung thông báo
       * @param {string} type - Loại thông báo: 'success', 'error', 'info' (mặc định: 'success')
       */
      show(message, type = 'success') {
        toastInstance.addToast(message, type);
      }
    };
  }
};

// Đăng ký Vuex store vào ứng dụng
app.use(store);

// Đăng ký plugin toast (tự tạo ở trên)
app.use(toast);

// Đăng ký router để điều hướng trang
app.use(router);

// Mount ứng dụng vào thẻ HTML có id="app"
app.mount('#app');

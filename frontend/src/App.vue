<!-- frontend/src/App.vue -->
<template>
  <div class="app-container">
    <!-- Component hiển thị toast thông báo (nằm cố định toàn app) -->
    <Toast />
    
    <!-- Hiển thị component theo route hiện tại -->
    <router-view></router-view>
  </div>
</template>

<script>
// Import Toast component để hiển thị thông báo toàn cục
import Toast from '@/components/Toast.vue'

export default {
  name: 'App', // Tên component gốc
  components: {
    Toast // Đăng ký component Toast để dùng trong template
  }
}
</script>

<style>
/* Import CSS của Bootstrap và Font Awesome */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import '@fortawesome/fontawesome-free/css/all.min.css';

/* Style tổng thể cho ứng dụng Vue */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Container chính bao bọc toàn bộ ứng dụng */
.app-container {
  min-height: 100vh;                         /* Chiều cao tối thiểu là toàn màn hình */
  background-image: url('@/assets/nen.jpg'); /* Hình nền */
  background-size: cover;                    /* Phủ toàn bộ vùng nền */
  background-position: center;               /* Căn giữa hình nền */
  background-repeat: no-repeat;              /* Không lặp lại */
  background-attachment: fixed;              /* Cố định hình nền khi cuộn trang */
}

/* Lớp phủ mờ trắng phía sau nội dung, để chữ dễ nhìn hơn */
.app-container::before {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.85); /* Lớp phủ trắng mờ */
  z-index: -1; /* Đặt phía sau nội dung chính */
}

/* Style cho thẻ card (vd: dùng trong Bootstrap card) */
.card {
  background-color: rgba(255, 255, 255, 0.95); /* Trắng gần như hoàn toàn */
}

/* Style cho bảng dữ liệu */
.table {
  background-color: rgba(255, 255, 255, 0.95);
}

/* Style cho modal (hộp thoại) */
.modal-content {
  background-color: rgba(255, 255, 255, 0.98);
}

/* Style cho navbar (thanh điều hướng) */
.navbar {
  background-color: rgba(13, 110, 253, 0.95) !important; /* Màu xanh đặc trưng Bootstrap + độ trong suốt */
}
</style>

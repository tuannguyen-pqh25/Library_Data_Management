<!-- src\components\LoadingSpinner.vue -->
<template>
  <!-- Khi prop `show` là true thì hiển thị lớp overlay và spinner -->
  <div class="loading-overlay" v-if="show">
    <!-- Spinner từ Bootstrap (hoặc CSS tùy biến) -->
    <div class="spinner-border text-primary" role="status">
      <!-- Đọc bằng trình đọc màn hình để hỗ trợ người khuyết tật -->
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

  
<script>
export default {
  name: 'LoadingSpinner',

  // Component nhận vào 1 prop `show` từ cha
  // Nếu `show` là true thì component sẽ hiển thị spinner
  props: {
    show: {
      type: Boolean,
      default: false, // Mặc định spinner sẽ ẩn
    }
  }
}
</script>

  <style scoped>
/* Lớp phủ toàn màn hình */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  /* Màu nền mờ trắng để làm nổi bật spinner */
  background: rgba(255, 255, 255, 0.8);

  /* Căn giữa spinner */
  display: flex;
  justify-content: center;
  align-items: center;

  /* Đảm bảo hiển thị trên mọi lớp khác */
  z-index: 9999;
}
</style>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <!-- Duyệt qua mảng toasts để hiển thị từng thông báo -->
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="toast show"
      :class="toast.type"  
      role="alert"
    >
      <div class="toast-header">
        <strong class="me-auto">{{ toast.title }}</strong>
        <!-- Nút để xóa toast thủ công -->
        <button 
          type="button" 
          class="btn-close" 
          @click="removeToast(toast.id)"
        ></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Toast',
  setup() {
    const toasts = ref([]);     // Mảng chứa các toast đang hiển thị
    let nextId = 1;             // Dùng để tạo ID duy nhất cho mỗi toast

    /**
     * Thêm toast mới
     * @param {string} message - Nội dung thông báo
     * @param {string} type - Loại thông báo: success, danger, warning, info
     * @param {number} timeout - Thời gian hiển thị (ms)
     */
    const addToast = (message, type = 'success', timeout = 5000) => {
      const id = nextId++;
      const toast = {
        id,
        message,
        type: `bg-${type} text-white`,   // Bootstrap classes
        title: getTitleByType(type)
      };
      toasts.value.push(toast);

      // Tự động xóa toast sau timeout
      setTimeout(() => removeToast(id), timeout);
    };

    /**
     * Xác định tiêu đề hiển thị theo loại thông báo
     */
    const getTitleByType = (type) => {
      switch(type) {
        case 'success': return 'Thành công';
        case 'danger': return 'Lỗi';
        case 'warning': return 'Cảnh báo';
        case 'info': return 'Thông báo';
        default: return 'Thông báo';
      }
    };

    /**
     * Xóa toast theo ID
     */
    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.value.splice(index, 1);
      }
    };

    return {
      toasts,
      addToast,
      removeToast
    };
  }
};
</script>

<style scoped>
.toast-container {
  z-index: 1056; /* Đảm bảo hiển thị trên các thành phần khác */
}
</style>

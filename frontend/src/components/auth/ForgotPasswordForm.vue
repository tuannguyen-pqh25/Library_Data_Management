<template>
  <div class="login-form">
    <LoadingSpinner :show="loading" />

    <div class="card">
      <div class="card-header">
        <h3 class="text-center">Quên Mật Khẩu</h3>
      </div>

      <div class="card-body">
        <div v-if="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="clearError"></button>
        </div>
        <div v-if="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
          {{ message }}
          <button type="button" class="btn-close" @click="clearMessage"></button>
        </div>

        <form @submit.prevent="requestPasswordReset" novalidate>
          <div class="mb-3">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              v-model="email"
              required
              @input="validateField('email')"
            >
            <div class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Đang gửi...' : 'Gửi yêu cầu' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

export default {
  name: 'ForgotPasswordForm',
  components: { LoadingSpinner },
  setup() {
    const email = ref('');
    const loading = ref(false);
    const errors = ref({});
    const error = ref('');
    const message = ref('');
    const router = useRouter();

    const validateField = (field) => {
      const newErrors = { ...errors.value }; // Sao chép errors hiện tại

      if (field === 'email') {
        if (!email.value.trim()) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          newErrors.email = 'Email không hợp lệ';
        } else {
          delete newErrors.email; // Xóa lỗi nếu hợp lệ
        }
      }

      errors.value = newErrors; // Cập nhật errors
    };

    const validateForm = () => {
      const newErrors = {};
      if (!email.value.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        newErrors.email = 'Email không hợp lệ';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const requestPasswordReset = async () => {
      if (!validateForm()) {
        return;
      }

      loading.value = true;
      try {
        await api.post('/auth/reader/password/request-reset', { email: email.value });
        localStorage.setItem('resetEmail', email.value);
        message.value = 'Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.';
        errors.value = {}; // Xóa lỗi khi gửi thành công
        setTimeout(() => router.push('/auth/reader/password/reset'), 2000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Có lỗi xảy ra khi gửi yêu cầu';
        if (err.response?.data?.errors) {
          errors.value = err.response.data.errors;
        }
        console.error('Lỗi yêu cầu đặt lại mật khẩu:', err.response?.data || err.message);
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => { error.value = ''; };
    const clearMessage = () => { message.value = ''; };

    return {
      email,
      loading,
      errors,
      error,
      message,
      requestPasswordReset,
      clearError,
      clearMessage,
      validateField
    };
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
}
.position-relative .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
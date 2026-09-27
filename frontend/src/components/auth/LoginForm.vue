<template>
  <div class="login-form">
    <LoadingSpinner :show="loading" />

    <div class="card">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: userType === 'reader' }" @click="userType = 'reader'">
              Độc giả
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: userType === 'staff' }" @click="userType = 'staff'">
              Nhân viên
            </a>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="clearError"></button>
          <div v-if="loginAttempts >= 5" class="mt-2">
            <router-link to="/forgot-password" class="text-primary">Quên mật khẩu? Nhấn vào đây để đổi mật khẩu.</router-link>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3" v-if="userType === 'staff'">
            <label class="form-label">Tên nhân viên <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control"
              :class="{ 'is-invalid': errors.hoTenNV }"
              v-model="credentials.hoTenNV" 
              required
              @input="validateField('hoTenNV')"
            >
            <div class="invalid-feedback" v-if="errors.hoTenNV">
              {{ errors.hoTenNV }}
            </div>
          </div>

          <div class="mb-3" v-if="userType === 'reader'">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input 
              type="email" 
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              v-model="credentials.email" 
              required
              @input="validateField('email')"
            >
            <div class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <div class="mb-3 position-relative">
            <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              v-model="credentials.password" 
              required
              @input="validateField('password')"
            >
            <button
              type="button"
              class="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              @click="togglePasswordVisibility"
              style="z-index: 1;"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
            <div class="invalid-feedback" v-if="errors.password">
              {{ errors.password }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
          <div class="card-footer text-center">
            <p class="mb-0">
              Chưa có tài khoản? 
              <router-link to="/register" class="text-primary">Đăng ký ngay</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';

export default {
  name: 'LoginForm',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const router = useRouter();
    const userType = ref('reader');
    const credentials = ref({
      hoTenNV: '',
      email: '',
      password: ''
    });
    const errors = ref({});
    const loginAttempts = ref(0);
    const showPassword = ref(false);

    const loading = computed(() => store.state.auth.loading);
    const error = computed(() => store.state.auth.error);

    const validateField = (field) => {
      const newErrors = { ...errors.value };

      if (field === 'hoTenNV' && userType.value === 'staff') {
        if (!credentials.value.hoTenNV) {
          newErrors.hoTenNV = 'Tên nhân viên là bắt buộc';
        } else {
          delete newErrors.hoTenNV;
        }
      }

      if (field === 'email' && userType.value === 'reader') {
        if (!credentials.value.email) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.value.email)) {
          newErrors.email = 'Email không hợp lệ';
        } else {
          delete newErrors.email;
        }
      }

      if (field === 'password') {
        if (!credentials.value.password) {
          newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (credentials.value.password.length < 5) {
          newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
        } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(credentials.value.password)) {
          newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
        } else {
          delete newErrors.password;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (userType.value === 'staff' && !credentials.value.hoTenNV) {
        newErrors.hoTenNV = 'Tên nhân viên là bắt buộc';
      }
      if (userType.value === 'reader' && !credentials.value.email) {
        newErrors.email = 'Email là bắt buộc';
      } else if (userType.value === 'reader' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.value.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      if (!credentials.value.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (credentials.value.password.length < 5) {
        newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
      } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(credentials.value.password)) {
        newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        loginAttempts.value += 1;
        if (userType.value === 'staff') {
          await store.dispatch('auth/loginStaff', {
            hoTenNV: credentials.value.hoTenNV,
            password: credentials.value.password
          });
          router.push('/admin');
        } else {
          await store.dispatch('auth/loginReader', {
            email: credentials.value.email,
            password: credentials.value.password
          });
          router.push('/reader');
        }
        loginAttempts.value = 0;
        errors.value = {};
      } catch (err) {
        showError(err);
      }
    };

    const clearError = () => {
      store.commit('auth/SET_ERROR', null);
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      userType,
      credentials,
      loading,
      error,
      errors,
      loginAttempts,
      showPassword,
      togglePasswordVisibility,
      handleSubmit,
      clearError,
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
.nav-link {
  cursor: pointer;
}
.card-footer {
  background-color: transparent;
  border-top: 1px solid rgba(0,0,0,.125);
  padding: 1rem;
}
.position-relative .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
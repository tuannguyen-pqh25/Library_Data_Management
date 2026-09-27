<template>
  <div class="register-form">
    <LoadingSpinner :show="loading" />
    
    <div class="card">
      <div class="card-header">
        <h4>Đăng ký tài khoản độc giả</h4>
      </div>
      <div class="card-body">
        <!-- Error Alert -->
        <div v-if="error" class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
          {{ error }}
          <button type="button" class="btn-close" @click="clearError"></button>
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="mb-3">
            <label class="form-label">Họ <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control"
              :class="{ 'is-invalid': errors.hoLot }"
              v-model="formData.hoLot" 
              required
              @input="validateField('hoLot')"
            >
            <div class="invalid-feedback" v-if="errors.hoLot">
              {{ errors.hoLot }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Tên <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control"
              :class="{ 'is-invalid': errors.ten }"
              v-model="formData.ten" 
              required
              @input="validateField('ten')"
            >
            <div class="invalid-feedback" v-if="errors.ten">
              {{ errors.ten }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Ngày sinh <span class="text-danger">*</span></label>
            <input 
              type="date" 
              class="form-control"
              :class="{ 'is-invalid': errors.ngaySinh }"
              v-model="formData.ngaySinh" 
              required
              @input="validateField('ngaySinh')"
            >
            <div class="invalid-feedback" v-if="errors.ngaySinh">
              {{ errors.ngaySinh }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Giới tính <span class="text-danger">*</span></label>
            <select 
              class="form-select"
              :class="{ 'is-invalid': errors.phai }"
              v-model="formData.phai" 
              required
              @change="validateField('phai')"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <div class="invalid-feedback" v-if="errors.phai">
              {{ errors.phai }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
            <input 
              type="text" 
              class="form-control"
              :class="{ 'is-invalid': errors.diaChi }"
              v-model="formData.diaChi" 
              required
              @input="validateField('diaChi')"
            >
            <div class="invalid-feedback" v-if="errors.diaChi">
              {{ errors.diaChi }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
            <input 
              type="tel" 
              class="form-control"
              :class="{ 'is-invalid': errors.dienThoai }"
              v-model="formData.dienThoai" 
              required
              @input="validateField('dienThoai')"
            >
            <div class="invalid-feedback" v-if="errors.dienThoai">
              {{ errors.dienThoai }}
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Email <span class="text-danger">*</span></label>
            <input 
              type="email" 
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              v-model="formData.email"
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
              v-model="formData.password"
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
          <div class="mb-3 position-relative">
            <label class="form-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              v-model="formData.confirmPassword"
              required
              @input="validateField('confirmPassword')"
            >
            <button
              type="button"
              class="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              @click="togglePasswordVisibility"
              style="z-index: 1;"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
            <div class="invalid-feedback" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
          <div class="card-footer text-center">
            <p class="mb-0">
              Đã có tài khoản? 
              <router-link to="/login" class="text-primary">Đăng nhập</router-link>
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
import { showError, showSuccess } from '@/utils/notifications';

export default {
  name: 'RegisterForm',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const router = useRouter();
    const formData = ref({
      hoLot: '',
      ten: '',
      ngaySinh: '',
      phai: 'Nam',
      diaChi: '',
      dienThoai: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const errors = ref({});
    const loading = computed(() => store.state.auth.loading);
    const error = computed(() => store.state.auth.error);
    const showPassword = ref(false);

    const validateField = (field) => {
      const newErrors = { ...errors.value };

      if (field === 'hoLot') {
        if (!formData.value.hoLot) {
          newErrors.hoLot = 'Họ là bắt buộc';
        } else {
          delete newErrors.hoLot;
        }
      }

      if (field === 'ten') {
        if (!formData.value.ten) {
          newErrors.ten = 'Tên là bắt buộc';
        } else {
          delete newErrors.ten;
        }
      }

      if (field === 'ngaySinh') {
        if (!formData.value.ngaySinh) {
          newErrors.ngaySinh = 'Ngày sinh là bắt buộc';
        } else {
          delete newErrors.ngaySinh;
        }
      }

      if (field === 'phai') {
        if (!formData.value.phai) {
          newErrors.phai = 'Giới tính là bắt buộc';
        } else {
          delete newErrors.phai;
        }
      }

      if (field === 'diaChi') {
        if (!formData.value.diaChi) {
          newErrors.diaChi = 'Địa chỉ là bắt buộc';
        } else {
          delete newErrors.diaChi;
        }
      }

      if (field === 'dienThoai') {
        if (!formData.value.dienThoai) {
          newErrors.dienThoai = 'Số điện thoại là bắt buộc';
        } else if (!/^[0][0-9]{9}$/.test(formData.value.dienThoai)) {
          newErrors.dienThoai = 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số';
        } else {
          delete newErrors.dienThoai;
        }
      }

      if (field === 'email') {
        if (!formData.value.email) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
          newErrors.email = 'Email không hợp lệ';
        } else {
          delete newErrors.email;
        }
      }

      if (field === 'password') {
        if (!formData.value.password) {
          newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.value.password.length < 5) {
          newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
        } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(formData.value.password)) {
          newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
        } else {
          delete newErrors.password;
        }
        if (formData.value.confirmPassword && formData.value.confirmPassword !== formData.value.password) {
          newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu phải khớp';
        } else if (formData.value.confirmPassword) {
          delete newErrors.confirmPassword;
        }
      }

      if (field === 'confirmPassword') {
        if (!formData.value.confirmPassword) {
          newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (formData.value.confirmPassword !== formData.value.password) {
          newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu phải khớp';
        } else {
          delete newErrors.confirmPassword;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.value.hoLot) {
        newErrors.hoLot = 'Họ là bắt buộc';
      }
      if (!formData.value.ten) {
        newErrors.ten = 'Tên là bắt buộc';
      }
      if (!formData.value.ngaySinh) {
        newErrors.ngaySinh = 'Ngày sinh là bắt buộc';
      }
      if (!formData.value.phai) {
        newErrors.phai = 'Giới tính là bắt buộc';
      }
      if (!formData.value.diaChi) {
        newErrors.diaChi = 'Địa chỉ là bắt buộc';
      }
      if (!formData.value.dienThoai) {
        newErrors.dienThoai = 'Số điện thoại là bắt buộc';
      } else if (!/^[0][0-9]{9}$/.test(formData.value.dienThoai)) {
        newErrors.dienThoai = 'Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số';
      }
      if (!formData.value.email) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      if (!formData.value.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.value.password.length < 5) {
        newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
      } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(formData.value.password)) {
        newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
      }
      if (!formData.value.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (formData.value.confirmPassword !== formData.value.password) {
        newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu phải khớp';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      // Gộp họ + tên và đổi key cho phù hợp backend
      const payload = {
        hoLot: formData.value.hoLot.trim(),
        ten: formData.value.ten.trim(),
        ngaySinh: formData.value.ngaySinh,
        phai: formData.value.phai,
        diaChi: formData.value.diaChi,
        dienThoai: formData.value.dienThoai,
        email: formData.value.email,
        password: formData.value.password
      };


      try {
        await store.dispatch('auth/registerReader', payload);
        showSuccess('Đăng ký thành công');
        errors.value = {}; // Xóa lỗi khi đăng ký thành công
        router.push('/reader');
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
      formData,
      loading,
      error,
      errors,
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
.register-form {
  max-width: 500px;
  margin: 2rem auto;
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
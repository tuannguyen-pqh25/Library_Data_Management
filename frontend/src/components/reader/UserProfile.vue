<template>
  <div class="user-profile">
    <div class="profile-card">
      <div class="page-header">
        <h2 class="page-title">Thông tin cá nhân</h2>
        <p class="page-sub">Quản lý và cập nhật thông tin tài khoản độc giả</p>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading && !userProfile.fullName" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải thông tin...</span>
        </div>
      </div>

      <!-- Error Alert -->
      <div v-else-if="error" class="error-alert" role="alert" aria-live="assertive">
        <div class="error-alert__content">
          <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>{{ error }}
        </div>
        <div class="error-alert__actions">
          <button @click="fetchProfile" class="btn-retry" type="button" aria-label="Thử tải lại thông tin">
            <i class="fas fa-redo-alt me-1" aria-hidden="true"></i>Thử lại
          </button>
          <button type="button" class="error-alert__close" @click="clearError" aria-label="Đóng thông báo lỗi">×</button>
        </div>
      </div>

      <div v-else class="profile-details">
        <form @submit.prevent="handleUpdateProfile" class="needs-validation" novalidate>
          <div class="mb-3">
            <label for="fullName" class="form-label">
              Họ và tên <span class="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              class="form-control"
              id="fullName"
              v-model="userProfile.fullName"
              :class="{ 'is-invalid': errors.fullName }"
              required
              aria-required="true"
              :aria-invalid="errors.fullName ? 'true' : 'false'"
              aria-describedby="fullName-error"
              @input="validateField('fullName')"
            />
            <div id="fullName-error" class="invalid-feedback" v-if="errors.fullName">
              {{ errors.fullName }}
            </div>
          </div>

          <div class="mb-3">
            <label for="ngaySinh" class="form-label">Ngày sinh</label>
            <input
              type="date"
              class="form-control"
              id="ngaySinh"
              v-model="userProfile.ngaySinh"
              :class="{ 'is-invalid': errors.ngaySinh }"
              :aria-invalid="errors.ngaySinh ? 'true' : 'false'"
              aria-describedby="ngaySinh-error"
              @input="validateField('ngaySinh')"
            />
            <div id="ngaySinh-error" class="invalid-feedback" v-if="errors.ngaySinh">
              {{ errors.ngaySinh }}
            </div>
          </div>

          <div class="mb-3">
            <label for="phai" class="form-label">Giới tính</label>
            <select
              class="form-select"
              id="phai"
              v-model="userProfile.phai"
              :class="{ 'is-invalid': errors.phai }"
              :aria-invalid="errors.phai ? 'true' : 'false'"
              aria-describedby="phai-error"
              @change="validateField('phai')"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            <div id="phai-error" class="invalid-feedback" v-if="errors.phai">
              {{ errors.phai }}
            </div>
          </div>

          <div class="mb-3">
            <label for="diaChi" class="form-label">Địa chỉ</label>
            <input
              type="text"
              class="form-control"
              id="diaChi"
              v-model="userProfile.diaChi"
              :class="{ 'is-invalid': errors.diaChi }"
              :aria-invalid="errors.diaChi ? 'true' : 'false'"
              aria-describedby="diaChi-error"
              @input="validateField('diaChi')"
            />
            <div id="diaChi-error" class="invalid-feedback" v-if="errors.diaChi">
              {{ errors.diaChi }}
            </div>
          </div>

          <div class="mb-3">
            <label for="dienThoai" class="form-label">Số điện thoại</label>
            <input
              type="tel"
              class="form-control"
              id="dienThoai"
              v-model="userProfile.dienThoai"
              :class="{ 'is-invalid': errors.dienThoai }"
              :aria-invalid="errors.dienThoai ? 'true' : 'false'"
              aria-describedby="dienThoai-error"
              @input="validateField('dienThoai')"
            />
            <div id="dienThoai-error" class="invalid-feedback" v-if="errors.dienThoai">
              {{ errors.dienThoai }}
            </div>
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="userProfile.email"
              :class="{ 'is-invalid': errors.email }"
              :aria-invalid="errors.email ? 'true' : 'false'"
              aria-describedby="email-error"
              @input="validateField('email')"
            />
            <div id="email-error" class="invalid-feedback" v-if="errors.email">
              {{ errors.email }}
            </div>
          </div>

          <div class="mb-4">
            <router-link to="/forgot-password" class="text-primary link-reset-password">
              <i class="fas fa-key me-1" aria-hidden="true"></i>Quên mật khẩu? Nhấn vào đây để đặt lại mật khẩu.
            </router-link>
          </div>

          <div v-if="message" class="alert alert-success alert-dismissible fade show mb-4" role="status" aria-live="polite">
            <i class="fas fa-check-circle me-2" aria-hidden="true"></i>{{ message }}
            <button type="button" class="btn-close" @click="clearMessage" aria-label="Đóng thông báo thành công"></button>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary me-2" @click="cancelUpdate">
              Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading || Object.keys(errors).length > 0"
            >
              <i class="fas fa-save me-1" aria-hidden="true"></i>
              {{ loading ? 'Đang lưu...' : 'Cập nhật thông tin' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { showError, showSuccess } from '@/utils/notifications';

export default {
  name: 'UserProfile',
  setup() {
    const store = useStore();
    const userProfile = ref({
      fullName: '',
      ngaySinh: '',
      phai: 'Nam',
      diaChi: '',
      dienThoai: '',
      email: ''
    });
    const errors = ref({});
    const loading = ref(false);
    const error = ref(null);
    const message = ref('');
    const isReader = computed(() => store.getters['auth/isReader']);

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return dateStr.split('T')[0];
    };

    const validateField = (field) => {
      const newErrors = { ...errors.value };
      const currentDate = new Date();
      const inputDate = new Date(userProfile.value.ngaySinh);

      if (field === 'fullName') {
        if (!userProfile.value.fullName?.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
        else delete newErrors.fullName;
      }
      if (field === 'ngaySinh' && userProfile.value.ngaySinh) {
        if (isNaN(inputDate) || inputDate > currentDate) {
          newErrors.ngaySinh = 'Ngày sinh không hợp lệ hoặc không được trong tương lai';
        } else {
          delete newErrors.ngaySinh;
        }
      }
      if (field === 'phai') {
        if (!['Nam', 'Nữ', 'Khác'].includes(userProfile.value.phai)) {
          newErrors.phai = 'Giới tính không hợp lệ';
        } else {
          delete newErrors.phai;
        }
      }
      if (field === 'dienThoai' && userProfile.value.dienThoai) {
        if (!/^\d{10}$/.test(userProfile.value.dienThoai)) {
          newErrors.dienThoai = 'Số điện thoại phải gồm 10 chữ số';
        } else {
          delete newErrors.dienThoai;
        }
      }
      if (field === 'email' && userProfile.value.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userProfile.value.email)) {
          newErrors.email = 'Email không hợp lệ';
        } else {
          delete newErrors.email;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      const currentDate = new Date();
      const inputDate = new Date(userProfile.value.ngaySinh);

      if (!userProfile.value.fullName?.trim()) newErrors.fullName = 'Họ và tên là bắt buộc';
      if (userProfile.value.ngaySinh && (isNaN(inputDate) || inputDate > currentDate)) {
        newErrors.ngaySinh = 'Ngày sinh không hợp lệ hoặc không được trong tương lai';
      }
      if (userProfile.value.phai && !['Nam', 'Nữ', 'Khác'].includes(userProfile.value.phai)) {
        newErrors.phai = 'Giới tính không hợp lệ';
      }
      if (userProfile.value.dienThoai && !/^\d{10}$/.test(userProfile.value.dienThoai)) {
        newErrors.dienThoai = 'Số điện thoại phải gồm 10 chữ số';
      }
      if (userProfile.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userProfile.value.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const fetchProfile = async () => {
      if (!isReader.value) {
        error.value = 'Trang này chỉ dành cho độc giả';
        return;
      }
      try {
        loading.value = true;
        error.value = null;
        const response = await store.dispatch('auth/getProfile');
        userProfile.value = {
          ...response.data,
          ngaySinh: formatDate(response.data.ngaySinh)
        };
      } catch (err) {
        error.value = err.response?.data?.error || 'Không thể tải thông tin cá nhân';
        showError(error.value);
      } finally {
        loading.value = false;
      }
    };

    const handleUpdateProfile = async () => {
      if (!isReader.value) {
        error.value = 'Trang này chỉ dành cho độc giả';
        return;
      }
      if (!validateForm()) return;
      try {
        loading.value = true;
        error.value = null;
        const allowedFields = ['fullName', 'ngaySinh', 'phai', 'diaChi', 'dienThoai', 'email'];
        const updateData = Object.fromEntries(
          Object.entries(userProfile.value).filter(([key]) => allowedFields.includes(key))
        );
        await store.dispatch('auth/updateProfile', updateData);
        message.value = 'Cập nhật thông tin thành công';
        showSuccess(message.value);
      } catch (err) {
        error.value = err.response?.data?.error || 'Cập nhật thông tin thất bại';
        if (err.response?.data?.errors) {
          errors.value = err.response.data.errors;
          error.value = Object.values(err.response.data.errors)[0] || error.value;
        }
        showError(error.value);
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
      errors.value = {};
      store.commit('auth/SET_ERROR', null);
    };

    const clearMessage = () => {
      message.value = '';
    };

    const cancelUpdate = () => {
      fetchProfile();
      clearError();
      clearMessage();
    };

    onMounted(fetchProfile);

    return {
      userProfile,
      errors,
      loading,
      error,
      message,
      isReader,
      validateField,
      fetchProfile,
      handleUpdateProfile,
      cancelUpdate,
      clearError,
      clearMessage
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Outfit:wght@300;400;500;600;700&display=swap');

.user-profile {
  --c-primary:    #2563eb;
  --c-primary-dk: #1d4ed8;
  --c-bg:         #f8fafc;
  --c-surface:    #ffffff;
  --c-border:     #e2e8f0;
  --c-text:       #0f172a;
  --c-muted:      #64748b;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Outfit', system-ui, sans-serif;
  --trans:        0.2s ease;
  font-family: var(--font-body);
  color: var(--c-text);
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
  background: var(--c-bg);
}

.profile-card {
  max-width: 680px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 2.25rem 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.page-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 1.25rem;
}
.page-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}
.page-sub {
  color: var(--c-muted);
  font-size: 0.95rem;
  margin: 0;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
  margin-bottom: 0.4rem;
}
.form-label .text-danger { color: #dc2626; }

.form-control, .form-select {
  border: 1.5px solid var(--c-border);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-family: var(--font-body);
  font-size: 0.95rem;
  transition: all var(--trans);
}
.form-control:focus, .form-select:focus,
.form-control:focus-visible, .form-select:focus-visible {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.14);
  outline: none;
}
.form-control.is-invalid, .form-select.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  display: block;
  font-size: 0.82rem;
  color: #dc2626;
  margin-top: 0.35rem;
}

.link-reset-password {
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
.link-reset-password:hover {
  text-decoration: underline;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}
.error-alert__content { display: flex; align-items: center; }
.error-alert__actions { display: flex; align-items: center; gap: 0.75rem; }
.btn-retry {
  background: #fff;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all var(--trans);
}
.btn-retry:hover { background: #fee2e2; }
.error-alert__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #991b1b;
  font-size: 1.25rem;
  line-height: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--c-border);
}

.btn {
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--trans);
  display: inline-flex;
  align-items: center;
  border: none;
}
.btn-primary {
  background: var(--c-primary);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: var(--c-primary-dk);
}
.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}
.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}
.btn:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .user-profile { padding: 1.25rem 1rem 3rem; }
  .profile-card { padding: 1.5rem 1.25rem; }
  .form-actions { flex-direction: column-reverse; }
  .form-actions .btn { width: 100%; justify-content: center; }
}
</style>
<template>
  <div class="user-profile">
    <h2>Thông tin cá nhân</h2>
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>
    <div v-else class="profile-details">
      <form @submit.prevent="handleUpdateProfile" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="hoLot" class="form-label">Họ lót <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            id="hoLot"
            v-model="userProfile.hoLot"
            :class="{ 'is-invalid': errors.hoLot }"
            required
            @input="validateField('hoLot')"
          >
          <div class="invalid-feedback" v-if="errors.hoLot">{{ errors.hoLot }}</div>
        </div>

        <div class="mb-3">
          <label for="ten" class="form-label">Tên <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            id="ten"
            v-model="userProfile.ten"
            :class="{ 'is-invalid': errors.ten }"
            required
            @input="validateField('ten')"
          >
          <div class="invalid-feedback" v-if="errors.ten">{{ errors.ten }}</div>
        </div>

        <div class="mb-3">
          <label for="ngaySinh" class="form-label">Ngày sinh</label>
          <input
            type="date"
            class="form-control"
            id="ngaySinh"
            v-model="userProfile.ngaySinh"
            :class="{ 'is-invalid': errors.ngaySinh }"
            @input="validateField('ngaySinh')"
          >
          <div class="invalid-feedback" v-if="errors.ngaySinh">{{ errors.ngaySinh }}</div>
        </div>

        <div class="mb-3">
          <label for="phai" class="form-label">Giới tính</label>
          <select
            class="form-select"
            id="phai"
            v-model="userProfile.phai"
            :class="{ 'is-invalid': errors.phai }"
            @change="validateField('phai')"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <div class="invalid-feedback" v-if="errors.phai">{{ errors.phai }}</div>
        </div>

        <div class="mb-3">
          <label for="diaChi" class="form-label">Địa chỉ</label>
          <input
            type="text"
            class="form-control"
            id="diaChi"
            v-model="userProfile.diaChi"
            :class="{ 'is-invalid': errors.diaChi }"
            @input="validateField('diaChi')"
          >
          <div class="invalid-feedback" v-if="errors.diaChi">{{ errors.diaChi }}</div>
        </div>

        <div class="mb-3">
          <label for="dienThoai" class="form-label">Số điện thoại</label>
          <input
            type="text"
            class="form-control"
            id="dienThoai"
            v-model="userProfile.dienThoai"
            :class="{ 'is-invalid': errors.dienThoai }"
            @input="validateField('dienThoai')"
          >
          <div class="invalid-feedback" v-if="errors.dienThoai">{{ errors.dienThoai }}</div>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="userProfile.email"
            :class="{ 'is-invalid': errors.email }"
            @input="validateField('email')"
          >
          <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
        </div>

        <div class="mb-3">
          <router-link to="/forgot-password" class="text-primary">Quên mật khẩu? Nhấn vào đây để đổi mật khẩu.</router-link>
        </div>

        <div v-if="message" class="alert alert-success alert-dismissible fade show mb-3" role="alert">
          {{ message }}
          <button type="button" class="btn-close" @click="clearMessage"></button>
        </div>

        <div class="text-end">
          <button type="button" class="btn btn-secondary me-2" @click="cancelUpdate">Hủy</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || Object.keys(errors).length > 0">
            {{ loading ? 'Đang lưu...' : 'Cập nhật thông tin' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<!-- UserProfile.vue (updated script section) -->
<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { showError, showSuccess } from '@/utils/notifications';
import { useRouter } from 'vue-router';

export default {
  name: 'UserProfile',
  setup() {
    const store = useStore();
    const router = useRouter();
    const userProfile = ref({
      hoLot: '',
      ten: '',
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

      if (field === 'hoLot') {
        if (!userProfile.value.hoLot.trim()) {
          newErrors.hoLot = 'Họ lót là bắt buộc';
        } else {
          delete newErrors.hoLot;
        }
      }
      if (field === 'ten') {
        if (!userProfile.value.ten.trim()) {
          newErrors.ten = 'Tên là bắt buộc';
        } else {
          delete newErrors.ten;
        }
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

      if (!userProfile.value.hoLot.trim()) newErrors.hoLot = 'Họ lót là bắt buộc';
      if (!userProfile.value.ten.trim()) newErrors.ten = 'Tên là bắt buộc';
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
        console.log('Fetched profile:', userProfile.value);
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
        const allowedFields = ['hoLot', 'ten', 'ngaySinh', 'phai', 'diaChi', 'dienThoai', 'email'];
        const updateData = Object.fromEntries(
          Object.entries(userProfile.value).filter(([key]) => allowedFields.includes(key))
        );
        console.log('Sending update data:', updateData);
        await store.dispatch('auth/updateProfile', updateData);
        message.value = 'Cập nhật thông tin thành công';
        showSuccess(message.value);
      } catch (err) {
        error.value = err.response?.data?.error || 'Cập nhật thông tin thất bại';
        if (err.response?.data?.errors) {
          errors.value = err.response.data.errors;
          error.value = Object.values(err.response.data.errors)[0] || error.value;
        }
        console.error('Update profile error:', err.response?.data || err.message);
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
      handleUpdateProfile,
      cancelUpdate,
      clearError,
      clearMessage
    };
  }
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}
.profile-details {
  max-width: 600px;
  margin: 0 auto;
}
.form-label .text-danger {
  color: #dc3545;
}
.invalid-feedback {
  display: block;
}
</style>
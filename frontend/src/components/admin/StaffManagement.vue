
<template>
  <div class="staff-management">
    <LoadingSpinner :show="loading" />
    
    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý nhân viên</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhân viên mới
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchTerm"
            placeholder="Tìm kiếm theo họ tên, chức vụ, địa chỉ, số điện thoại"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách nhân viên -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Chức vụ</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="staff in staffList" :key="staff.MSNV">
            <td>{{ staff.hoTenNV }}</td>
            <td>{{ staff.chucVu }}</td>
            <td>{{ staff.diaChi }}</td>
            <td>{{ staff.soDienThoai }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editStaff(staff)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(staff)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa nhân viên -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3">
                <label class="form-label">Họ tên</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="staffForm.hoTenNV" 
                  :class="{ 'is-invalid': errors.hoTenNV }" 
                  required
                >
                <div class="invalid-feedback" v-if="errors.hoTenNV">
                  {{ errors.hoTenNV }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Chức vụ</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="staffForm.chucVu" 
                  :class="{ 'is-invalid': errors.chucVu }" 
                  required
                >
                <div class="invalid-feedback" v-if="errors.chucVu">
                  {{ errors.chucVu }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="staffForm.diaChi" 
                  :class="{ 'is-invalid': errors.diaChi }" 
                  required
                >
                <div class="invalid-feedback" v-if="errors.diaChi">
                  {{ errors.diaChi }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  v-model="staffForm.soDienThoai" 
                  :class="{ 'is-invalid': errors.soDienThoai }" 
                  required
                >
                <div class="invalid-feedback" v-if="errors.soDienThoai">
                  {{ errors.soDienThoai }}
                </div>
              </div>
              <div class="mb-3 position-relative">
                <label class="form-label">Mật khẩu</label>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  v-model="staffForm.password"
                  :required="!editingStaff"
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
                <small class="text-muted" v-if="editingStaff">
                  Để trống nếu không muốn thay đổi mật khẩu
                </small>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ editingStaff ? 'Cập nhật' : 'Thêm mới' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa nhân viên "{{ selectedStaff?.hoTenNV }}" không?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="handleDelete" :disabled="loading">
              {{ loading ? 'Đang xử lý...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'StaffManagement',
  components: { LoadingSpinner },
  setup() {
    const staffList = ref([]);
    const showAddModal = ref(false);
    const editingStaff = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const showDeleteModal = ref(false);
    const selectedStaff = ref(null);
    const searchTerm = ref('');
    const staffForm = ref({
      hoTenNV: '',
      chucVu: '',
      diaChi: '',
      soDienThoai: '',
      password: ''
    });
    const errors = ref({});
    const showPassword = ref(false);

    const validateStaffForm = (form) => {
      const errors = {};
      let isValid = true;

      if (!form.hoTenNV.trim()) {
        errors.hoTenNV = 'Họ tên không được để trống';
        isValid = false;
      }
      if (!form.chucVu.trim()) {
        errors.chucVu = 'Chức vụ không được để trống';
        isValid = false;
      }
      if (!form.diaChi.trim()) {
        errors.diaChi = 'Địa chỉ không được để trống';
        isValid = false;
      }
      if (!form.soDienThoai.match(/^\d{10}$/)) {
        errors.soDienThoai = 'Số điện thoại phải gồm 10 chữ số';
        isValid = false;
      }
      if (!editingStaff.value && !form.password) {
        errors.password = 'Mật khẩu không được để trống khi tạo mới';
        isValid = false;
      }

      return { isValid, errors };
    };

    const fetchStaff = async () => {
      loading.value = true;
      try {
        const response = await api.get('/nhanvien');
        staffList.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || 'Lỗi khi lấy danh sách nhân viên';
      } finally {
        loading.value = false;
      }
    };

    const confirmDelete = (staff) => {
      selectedStaff.value = staff;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedStaff.value = null;
    };

    const handleDelete = async () => {
      loading.value = true;
      try {
        await api.delete(`/nhanvien/${selectedStaff.value.MSNV}`);
        await fetchStaff();
        closeDeleteModal();
        proxy.$toast.show('Xóa nhân viên thành công', 'success');
      } catch (error) {
        error.value = error.response?.data?.message || 'Lỗi khi xóa nhân viên';
      } finally {
        loading.value = false;
      }
    };

    const filteredStaff = computed(() => {
      if (!searchTerm.value.trim()) return staffList.value;
      
      const search = searchTerm.value.toLowerCase().trim();
      return staffList.value.filter(staff => 
        staff.hoTenNV.toLowerCase().includes(search) ||
        staff.chucVu.toLowerCase().includes(search) ||
        staff.diaChi.toLowerCase().includes(search) ||
        staff.soDienThoai.includes(search)
      );
    });

    const closeModal = () => {
      showAddModal.value = false;
      editingStaff.value = null;
      staffForm.value = {
        hoTenNV: '',
        chucVu: '',
        diaChi: '',
        soDienThoai: '',
        password: ''
      };
      errors.value = {};
    };

    const editStaff = (staff) => {
      editingStaff.value = { ...staff }; // Create a copy to avoid mutating original
      staffForm.value = { ...staff, password: '' };
      showAddModal.value = true;
    };

    const handleSubmit = async () => {
      const { isValid, errors: validationErrors } = validateStaffForm(staffForm.value);
      if (!isValid) {
        errors.value = validationErrors;
        return;
      }

      loading.value = true;
      try {
        const formData = { ...staffForm.value };
        if (!formData.password) delete formData.password; // Remove password if empty for updates
        if (editingStaff.value) {
          await api.put(`/nhanvien/${editingStaff.value.MSNV}`, formData);
          proxy.$toast.show('Cập nhật nhân viên thành công', 'success');
        } else {
          await api.post('/nhanvien', formData);
          proxy.$toast.show('Thêm nhân viên thành công', 'success');
        }
        await fetchStaff();
        closeModal();
      } catch (error) {
        error.value = error.response?.data?.message || 'Lỗi khi lưu thông tin nhân viên';
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    onMounted(fetchStaff);

    return {
      staffList: filteredStaff,
      showAddModal,
      editingStaff,
      staffForm,
      loading,
      error,
      errors,
      searchTerm,
      closeModal,
      editStaff,
      handleSubmit,
      showDeleteModal,
      selectedStaff,
      confirmDelete,
      closeDeleteModal,
      handleDelete,
      clearError,
      showPassword,
      togglePasswordVisibility
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.input-group {
  max-width: 500px;
}
.input-group-text {
  background-color: white;
  border-left: none;
}
.form-control:focus + .input-group-text {
  border-color: #86b7fe;
}
.form-control {
  border-right: none;
}
</style>

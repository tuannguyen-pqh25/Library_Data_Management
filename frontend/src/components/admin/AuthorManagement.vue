<template>
  <div class="author-management">
    <LoadingSpinner :show="loading" />
    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Quản lý tác giả</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        Thêm tác giả
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Search Box -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm tác giả theo tên hoặc mã tác giả"
            @input="searchAuthors"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách tác giả -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã tác giả</th>
            <th>Tên tác giả</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Số sách đã xuất bản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in filteredAuthors" :key="author.maTacGia">
            <td>{{ author.maTacGia }}</td>
            <td>{{ author.tenTacGia }}</td>
            <td>{{ author.soDienThoai || 'N/A' }}</td>
            <td>{{ author.diaChi || 'N/A' }}</td>
            <td>{{ getAuthorBookCount(author.maTacGia) }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editAuthor(author)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(author)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa tác giả -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingAuthor ? 'Sửa thông tin tác giả' : 'Thêm tác giả' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3" v-if="editingAuthor">
                <label for="maTacGia" class="form-label">Mã tác giả <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maTacGia }"
                  v-model="AuthorForm.maTacGia"
                  readonly
                >
                <div class="invalid-feedback" v-if="errors.maTacGia">{{ errors.maTacGia }}</div>
              </div>
              <div class="mb-3">
                <label for="tenTacGia" class="form-label">Tên tác giả <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenTacGia }"
                  v-model="AuthorForm.tenTacGia"
                  required
                  @input="validateField('tenTacGia')"
                >
                <div class="invalid-feedback" v-if="errors.tenTacGia">{{ errors.tenTacGia }}</div>
              </div>
              <div class="mb-3">
                <label for="soDienThoai" class="form-label">Số điện thoại</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.soDienThoai }"
                  v-model="AuthorForm.soDienThoai"
                  @input="validateField('soDienThoai')"
                >
                <div class="invalid-feedback" v-if="errors.soDienThoai">{{ errors.soDienThoai }}</div>
              </div>
              <div class="mb-3">
                <label for="diaChi" class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.diaChi }"
                  v-model="AuthorForm.diaChi"
                  @input="validateField('diaChi')"
                >
                <div class="invalid-feedback" v-if="errors.diaChi">{{ errors.diaChi }}</div>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || Object.keys(errors).length > 0"
                >
                  {{ loading ? 'Đang xử lý...' : (editingAuthor ? 'Cập nhật' : 'Thêm mới') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddModal"></div>

    <!-- Modal xác nhận xóa tác giả -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa tác giả</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa tác giả "<strong>{{ selectedAuthor?.tenTacGia }}</strong>" không?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Hủy</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleDelete"
              :disabled="loading"
            >
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
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError, showSuccess } from '@/utils/notifications';

export default {
  name: 'AuthorManagement',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const editingAuthor = ref(null);
    const searchTerm = ref('');
    const showDeleteModal = ref(false);
    const selectedAuthor = ref(null);
    const AuthorForm = ref({
      maTacGia: '',
      tenTacGia: '',
      soDienThoai: '',
      diaChi: ''
    });
    const errors = ref({});

    const authors = computed(() => store.getters['author/allAuthors']);
    const loading = computed(() => store.getters['author/isLoading']);
    const error = computed(() => store.getters['author/error']);
    const allBooks = computed(() => store.getters['book/allBooks']);

    const filteredAuthors = computed(() => {
      if (!searchTerm.value.trim()) return authors.value;
      const search = searchTerm.value.toLowerCase().trim();
      return authors.value.filter(author =>
        author.tenTacGia.toLowerCase().includes(search) ||
        String(author.maTacGia).toLowerCase().includes(search)
      );
    });

    const getAuthorBookCount = (authorId) => {
      return allBooks.value.filter(book => book.maTacGia === authorId).length;
    };

    const validateField = (field) => {
      const newErrors = { ...errors.value };
      if (field === 'tenTacGia') {
        if (!AuthorForm.value.tenTacGia) {
          newErrors.tenTacGia = 'Tên tác giả là bắt buộc';
        } else {
          delete newErrors.tenTacGia;
        }
      }
      if (field === 'soDienThoai') {
        if (AuthorForm.value.soDienThoai && !/^\d{10}$/.test(AuthorForm.value.soDienThoai)) {
          newErrors.soDienThoai = 'Số điện thoại phải là 10 chữ số';
        } else {
          delete newErrors.soDienThoai;
        }
      }
      if (field === 'diaChi') {
        if (AuthorForm.value.diaChi && AuthorForm.value.diaChi.length < 5) {
          newErrors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
        } else {
          delete newErrors.diaChi;
        }
      }
      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (!AuthorForm.value.tenTacGia) {
        newErrors.tenTacGia = 'Tên tác giả là bắt buộc';
      }
      if (AuthorForm.value.soDienThoai && !/^\d{10}$/.test(AuthorForm.value.soDienThoai)) {
        newErrors.soDienThoai = 'Số điện thoại phải là 10 chữ số';
      }
      if (AuthorForm.value.diaChi && AuthorForm.value.diaChi.length < 5) {
        newErrors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const fetchData = async () => {
      try {
        console.log('Fetching authors and books...');
        await Promise.all([
          store.dispatch('author/fetchAuthors'),
          store.dispatch('book/fetchBooks')
        ]);
        console.log('Data fetched successfully');
      } catch (err) {
        console.error('Error fetching data:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi tải dữ liệu: ' + err.message);
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingAuthor.value = null;
      AuthorForm.value = {
        maTacGia: '',
        tenTacGia: '',
        soDienThoai: '',
        diaChi: ''
      };
      errors.value = {};
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedAuthor.value = null;
    };

    const editAuthor = (author) => {
      editingAuthor.value = author;
      AuthorForm.value = { ...author };
      showAddModal.value = true;
    };

    const confirmDelete = (author) => {
      selectedAuthor.value = author;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        console.log('Deleting author:', selectedAuthor.value.maTacGia);
        await store.dispatch('author/deleteAuthor', selectedAuthor.value.maTacGia);
        await fetchData();
        closeDeleteModal();
        showSuccess('Xóa tác giả thành công');
        console.log('Author deleted successfully');
      } catch (err) {
        console.error('Delete author error:', {
          message: err.response?.data?.message || err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi xóa tác giả: ' + err.response?.data?.message);
        console.log(err.response?.data?.message);
      }
    };

    const handleSubmit = async () => {
      console.log('handleSubmit triggered');
      try {
        const isValid = validateForm();
        console.log('Validation result:', { isValid, errors: errors.value });
        if (!isValid) {
          console.warn('Validation failed:', errors.value);
          showError('Vui lòng kiểm tra lại các trường thông tin');
          return;
        }

        const authorData = { ...AuthorForm.value };
        if (!editingAuthor.value) {
          delete authorData.maTacGia; // Không gửi maTacGia khi thêm mới
        }
        console.log('Submitting author data:', authorData);

        if (editingAuthor.value) {
          await store.dispatch('author/updateAuthor', {
            id: editingAuthor.value.maTacGia,
            authorData
          });
          showSuccess('Cập nhật tác giả thành công');
          console.log('Author updated successfully');
        } else {
          const response = await store.dispatch('author/createAuthor', authorData);
          console.log('Create author response:', response);
          showSuccess('Thêm tác giả thành công');
        }
        await fetchData();
        closeModal();
      } catch (err) {
        console.error('Error saving author:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi lưu tác giả: ' + (err.response?.data?.message || err.message));
      }
    };

    const searchAuthors = () => {
      searchTerm.value = searchTerm.value.trim();
      console.log('Searching authors with term:', searchTerm.value);
    };

    const clearError = () => {
      store.commit('author/SET_ERROR', null);
    };

    onMounted(fetchData);

    return {
      showAddModal,
      editingAuthor,
      AuthorForm,
      errors,
      loading,
      error,
      authors,
      filteredAuthors,
      searchTerm,
      closeModal,
      editAuthor,
      handleSubmit,
      clearError,
      getAuthorBookCount,
      showDeleteModal,
      selectedAuthor,
      confirmDelete,
      closeDeleteModal,
      handleDelete,
      searchAuthors
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.input-group {
  max-width: 400px;
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
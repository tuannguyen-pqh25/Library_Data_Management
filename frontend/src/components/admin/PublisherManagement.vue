<template>
  <div class="publisher-management">
    <LoadingSpinner :show="loading" />

    <!-- Header section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý nhà xuất bản</h2>
      <button class="btn btn-primary" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Thêm nhà xuất bản mới
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
            placeholder="Tìm kiếm theo mã NXB hoặc tên NXB"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách nhà xuất bản -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã NXB</th>
            <th>Tên NXB</th>
            <th>Địa chỉ</th>
            <th>Số sách đã xuất bản</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="publisher in filteredPublishers" :key="publisher.maNXB">
            <td>{{ publisher.maNXB }}</td>
            <td>{{ publisher.tenNXB }}</td>
            <td>{{ publisher.diaChi }}</td>
            <td>{{ getPublisherBookCount(publisher.maNXB) }}</td>
            <td>
              <button class="btn btn-sm btn-info me-2" @click="editPublisher(publisher)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(publisher)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal thêm/sửa nhà xuất bản -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showAddModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingPublisher ? 'Sửa thông tin nhà xuất bản' : 'Thêm nhà xuất bản mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="mb-3" v-if="editingPublisher">
                <label class="form-label">Mã NXB <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.maNXB }"
                  v-model="publisherForm.maNXB"
                  readonly
                >
                <div class="invalid-feedback" v-if="errors.maNXB">
                  {{ errors.maNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tên NXB <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.tenNXB }"
                  v-model="publisherForm.tenNXB"
                  required
                  @input="validateField('tenNXB')"
                >
                <div class="invalid-feedback" v-if="errors.tenNXB">
                  {{ errors.tenNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.diaChi }"
                  v-model="publisherForm.diaChi"
                  required
                  @input="validateField('diaChi')"
                >
                <div class="invalid-feedback" v-if="errors.diaChi">
                  {{ errors.diaChi }}
                </div>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Hủy</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading || Object.keys(errors).length > 0"
                >
                  {{ loading ? 'Đang xử lý...' : (editingPublisher ? 'Cập nhật' : 'Thêm mới') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận xóa -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showDeleteModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa nhà xuất bản "<strong>{{ selectedPublisher?.tenNXB }}</strong>" không?</p>
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
    <div class="modal-backdrop fade show" v-if="showAddModal || showDeleteModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError, showSuccess } from '@/utils/notifications';

export default {
  name: 'PublisherManagement',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const showAddModal = ref(false);
    const editingPublisher = ref(null);
    const searchTerm = ref('');
    const showDeleteModal = ref(false);
    const selectedPublisher = ref(null);
    const publisherForm = ref({
      maNXB: '',
      tenNXB: '',
      diaChi: ''
    });
    const errors = ref({});

    const publishers = computed(() => store.getters['publisher/allPublishers']);
    const loading = computed(() => store.getters['publisher/isLoading']);
    const error = computed(() => store.getters['publisher/error']);
    const allBooks = computed(() => store.getters['book/allBooks']);

    const filteredPublishers = computed(() => {
      if (!searchTerm.value.trim()) return publishers.value;
      const search = searchTerm.value.toLowerCase().trim();
      return publishers.value.filter(pub =>
        String(pub.maNXB).toLowerCase().includes(search) ||
        pub.tenNXB.toLowerCase().includes(search)
      );
    });

    const getPublisherBookCount = (publisherId) => {
      return allBooks.value.filter(book => book.maNXB === publisherId).length;
    };

    const validateField = (field) => {
      const newErrors = { ...errors.value };
      if (field === 'tenNXB') {
        if (!publisherForm.value.tenNXB) {
          newErrors.tenNXB = 'Tên nhà xuất bản là bắt buộc';
        } else {
          delete newErrors.tenNXB;
        }
      }
      if (field === 'diaChi') {
        if (!publisherForm.value.diaChi) {
          newErrors.diaChi = 'Địa chỉ là bắt buộc';
        } else if (publisherForm.value.diaChi.length < 5) {
          newErrors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
        } else {
          delete newErrors.diaChi;
        }
      }
      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (!publisherForm.value.tenNXB) {
        newErrors.tenNXB = 'Tên nhà xuất bản là bắt buộc';
      }
      if (!publisherForm.value.diaChi) {
        newErrors.diaChi = 'Địa chỉ là bắt buộc';
      } else if (publisherForm.value.diaChi.length < 5) {
        newErrors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const fetchData = async () => {
      try {
        console.log('Fetching publishers and books...');
        await Promise.all([
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('book/fetchBooks')
        ]);
        console.log('Data fetched successfully');
      } catch (err) {
        console.error('Error fetching data:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi tải dữ liệu: ' + (err.response?.data?.message || err.message));
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      editingPublisher.value = null;
      publisherForm.value = {
        maNXB: '',
        tenNXB: '',
        diaChi: ''
      };
      errors.value = {};
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      selectedPublisher.value = null;
    };

    const editPublisher = (publisher) => {
      if (!publisher.maNXB) {
        console.error('Publisher maNXB is undefined');
        showError('Không tìm thấy mã nhà xuất bản');
        return;
      }
      editingPublisher.value = publisher;
      publisherForm.value = { ...publisher };
      showAddModal.value = true;
    };

    const confirmDelete = (publisher) => {
      if (!publisher.maNXB) {
        console.error('Publisher maNXB is undefined');
        showError('Không tìm thấy mã nhà xuất bản');
        return;
      }
      selectedPublisher.value = publisher;
      showDeleteModal.value = true;
    };

    const handleDelete = async () => {
      try {
        if (!selectedPublisher.value?.maNXB) {
          console.error('Publisher maNXB is undefined for deletion');
          showError('Không tìm thấy mã nhà xuất bản');
          return;
        }
        console.log('Deleting publisher:', selectedPublisher.value.maNXB);
        await store.dispatch('publisher/deletePublisher', selectedPublisher.value.maNXB);
        await fetchData();
        closeDeleteModal();
        showSuccess('Xóa nhà xuất bản thành công');
        console.log('Publisher deleted successfully');
      } catch (err) {
        console.error('Delete publisher error:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi xóa nhà xuất bản: ' + (err.response?.data?.message || err.message));
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

        const publisherData = { ...publisherForm.value };
        if (!editingPublisher.value) {
          delete publisherData.maNXB; // Không gửi maNXB khi thêm mới
        }
        console.log('Submitting publisher data:', publisherData);

        if (editingPublisher.value) {
          if (!editingPublisher.value.maNXB) {
            console.error('maNXB is undefined for editing publisher');
            showError('Không tìm thấy mã nhà xuất bản');
            return;
          }
          await store.dispatch('publisher/updatePublisher', {
            id: editingPublisher.value.maNXB,
            publisherData
          });
          showSuccess('Cập nhật nhà xuất bản thành công');
          console.log('Publisher updated successfully');
        } else {
          const response = await store.dispatch('publisher/createPublisher', publisherData);
          console.log('Create publisher response:', response);
          showSuccess('Thêm nhà xuất bản thành công');
        }
        await fetchData();
        closeModal();
      } catch (err) {
        console.error('Error saving publisher:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError('Lỗi khi lưu nhà xuất bản: ' + (err.response?.data?.message || err.message));
      }
    };

    const clearError = () => {
      store.commit('publisher/SET_ERROR', null);
    };

    onMounted(fetchData);

    return {
      showAddModal,
      editingPublisher,
      publisherForm,
      errors,
      loading,
      error,
      filteredPublishers, // Changed from publishers: filteredPublishers
      searchTerm,
      closeModal,
      editPublisher,
      handleSubmit,
      clearError,
      getPublisherBookCount,
      showDeleteModal,
      selectedPublisher,
      confirmDelete,
      closeDeleteModal,
      handleDelete
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
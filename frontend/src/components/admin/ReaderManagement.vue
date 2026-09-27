
<template>
  <div class="reader-management">
    <LoadingSpinner :show="loading" />
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý độc giả</h2>
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
            placeholder="Tìm kiếm độc giả theo mã độc giả, họ và tên, email, số điện thoại"
          >
          <button class="btn btn-outline-secondary" type="button" @click="handleSearch">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Danh sách độc giả -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Mã độc giả</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reader in readers" :key="reader.maDocGia">
            <td>{{ reader.maDocGia }}</td>
            <td>{{ reader.hoLot }} {{ reader.ten }}</td>
            <td>{{ reader.email }}</td>
            <td>{{ reader.dienThoai }}</td>
            <td>{{ formatDate(reader.ngaySinh) }}</td>
            <td>{{ reader.diaChi }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(reader)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="closeConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc muốn xóa độc giả "{{ selectedReader?.hoLot }} {{ selectedReader?.ten }}" không?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeConfirmModal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="handleConfirmDelete" :disabled="loading">
              {{ loading ? 'Đang xử lý...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'ReaderManagement',
  components: { LoadingSpinner },
  setup() {
    const readers = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const searchTerm = ref('');
    const selectedReader = ref(null);
    const showConfirmModal = ref(false);

    const filteredReaders = computed(() => {
      if (!searchTerm.value) return readers.value;
      const search = searchTerm.value.toLowerCase();
      return readers.value.filter(reader => 
        String(reader.maDocGia).includes(search) ||
        `${reader.hoLot} ${reader.ten}`.toLowerCase().includes(search) ||
        reader.email.toLowerCase().includes(search) ||
        reader.dienThoai.toLowerCase().includes(search)
      );
    });

    const fetchReaders = async () => {
      loading.value = true;
      try {
        const response = await api.get('/docgia');
        readers.value = response.data;
      } catch (error) {
        error.value = error.response?.data?.error || 'Lỗi khi lấy danh sách độc giả';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('vi-VN');
    };

    const confirmDelete = (reader) => {
      selectedReader.value = reader;
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedReader.value = null;
    };

    const handleConfirmDelete = async () => {
      loading.value = true;
      try {
        // Ensure maDocGia is a number
        const maDocGia = parseInt(selectedReader.value.maDocGia, 10);
        if (isNaN(maDocGia)) {
          throw new Error('Mã độc giả không hợp lệ');
        }
        await api.delete(`/docgia/${maDocGia}`);
        await fetchReaders();
        proxy.$toast.show('Xóa độc giả thành công', 'success');
        closeConfirmModal();
      } catch (error) {
        error.value = error.response?.data?.error || 'Lỗi khi xóa độc giả';
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
    };

    const handleSearch = () => {
      // Filtering is handled by computed property
    };

    onMounted(fetchReaders);

    return {
      readers: filteredReaders,
      loading,
      error,
      searchTerm,
      showConfirmModal,
      handleSearch,
      selectedReader,
      confirmDelete,
      closeConfirmModal,
      handleConfirmDelete,
      clearError,
      formatDate
    };
  }
};
</script>

<style scoped>
.table {
  margin-top: 1rem;
}
</style>

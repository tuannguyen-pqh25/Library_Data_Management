
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
            <td>{{ reader.fullName }}</td>
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
            <p>Bạn có chắc muốn xóa độc giả "{{ selectedReader?.fullName }}" không?</p>
            <div v-if="checkingDeletion" class="alert alert-info mb-0">
              Đang kiểm tra sách mượn và lịch sử mượn...
            </div>
            <div v-else-if="deleteCheckError" class="alert alert-danger mb-0">
              {{ deleteCheckError }}
            </div>
            <div v-else-if="outstandingBooks.length" class="alert alert-warning">
              <p class="mb-2">
                Độc giả còn {{ outstandingBooks.length }} sách chưa trả. Không thể xóa cho đến khi hoàn tất trả sách:
              </p>
              <ul class="mb-0">
                <li v-for="book in outstandingBooks" :key="`${book.maPhieuMuon}:${book.maSach}`">
                  {{ book.tenSach || `Mã sách ${book.maSach}` }} (mượn {{ book.soLuongSachMuon }} quyển, phiếu {{ book.maPhieuMuon }})
                </li>
              </ul>
            </div>
            <div v-else-if="loanHistoryCount > 0" class="alert alert-warning mb-0">
              Độc giả có lịch sử mượn sách. Không thể xóa để bảo toàn dữ liệu mượn/trả.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeConfirmModal">Hủy</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleConfirmDelete"
              :disabled="loading || checkingDeletion || Boolean(deleteCheckError) || outstandingBooks.length > 0 || loanHistoryCount > 0"
            >
              {{ loading ? 'Đang xử lý...' : (checkingDeletion ? 'Đang kiểm tra...' : (outstandingBooks.length || loanHistoryCount ? 'Không thể xóa' : 'Xóa')) }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>
  </div>
</template>

<script>
import '@/assets/admin-management.css';
import { ref, onMounted, computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError, showSuccess } from '@/utils/notifications';
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
    const checkingDeletion = ref(false);
    const deleteCheckError = ref('');
    const outstandingBooks = ref([]);
    const loanHistoryCount = ref(0);

    const filteredReaders = computed(() => {
      if (!searchTerm.value) return readers.value;
      const search = searchTerm.value.toLowerCase();
      return readers.value.filter(reader => 
        String(reader.maDocGia).includes(search) ||
        (reader.fullName || '').toLowerCase().includes(search) ||
        reader.email.toLowerCase().includes(search) ||
        reader.dienThoai.toLowerCase().includes(search)
      );
    });

    const fetchReaders = async () => {
      loading.value = true;
      try {
        const response = await api.get('/docgia');
        readers.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.error || 'Lỗi khi lấy danh sách độc giả';
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('vi-VN');
    };

    const confirmDelete = async (reader) => {
      selectedReader.value = reader;
      outstandingBooks.value = [];
      loanHistoryCount.value = 0;
      deleteCheckError.value = '';
      showConfirmModal.value = true;
      checkingDeletion.value = true;
      try {
        const response = await api.get(`/docgia/${reader.maDocGia}/deletion-check`);
        outstandingBooks.value = response.data.books;
        loanHistoryCount.value = response.data.loanHistoryCount;
      } catch (err) {
        deleteCheckError.value = err.response?.data?.error || 'Không thể kiểm tra điều kiện xóa độc giả';
      } finally {
        checkingDeletion.value = false;
      }
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedReader.value = null;
      outstandingBooks.value = [];
      loanHistoryCount.value = 0;
      deleteCheckError.value = '';
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
        showSuccess('Xóa độc giả thành công');
        closeConfirmModal();
      } catch (err) {
        error.value = err.response?.data?.error || 'Lỗi khi xóa độc giả';
        showError(err);
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
      checkingDeletion,
      deleteCheckError,
      outstandingBooks,
      loanHistoryCount,
      confirmDelete,
      closeConfirmModal,
      handleConfirmDelete,
      clearError,
      formatDate
    };
  }
};
</script>

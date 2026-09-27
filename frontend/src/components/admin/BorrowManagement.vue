<template>
  <div class="borrow-management">
    <LoadingSpinner :show="loading" />
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý mượn sách</h2>
    </div>

    <!-- Phần tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchTerm"
            placeholder="Tìm kiếm theo tên độc giả, mã độc giả, tên sách, mã sách"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Tabs for different request status -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'pending' }" 
           @click="currentTab = 'pending'">
          Chờ duyệt
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'approved' }" 
           @click="currentTab = 'approved'">
          Đã duyệt
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'rejected' }" 
           @click="currentTab = 'rejected'">
          Từ chối
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: currentTab === 'returned' }" 
           @click="currentTab = 'returned'">
          Đã trả
        </a>
      </li>
    </ul>

    <!-- Danh sách yêu cầu mượn sách -->
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Độc giả</th>
            <th>Sách</th>
            <th>Ngày mượn</th>
            <th>Ngày trả</th>
            <th>Tiền phạt</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request.maPhieuMuon">
            <td>
              {{ request.DocGia?.hoLot || 'N/A' }} {{ request.DocGia?.ten || '' }}
              <br>
              <small class="text-muted">{{ request.DocGia?.maDocGia || 'N/A' }}</small>
            </td>
            <td>
              <div v-for="ct in request.ChiTietPhieuMuons" :key="ct.maChiTietPM">
                {{ ct.Sach?.tenSach || 'N/A' }}
                <br>
                <small class="text-muted">Mã sách: {{ ct.Sach?.maSach || 'N/A' }}</small>
                <br>
                <small :class="getQuantityClass(ct.Sach?.soLuongHienCo)">
                  Còn lại: {{ ct.Sach?.soLuongHienCo || 0 }} quyển
                </small>
              </div>
            </td>
            <td>{{ formatDate(request.ngayMuon) }}</td>
            <td>
              {{ request.ngayTra ? formatDate(request.ngayTra) : '-' }}
            </td>
            <td>
              <span v-if="request.trangThai === 'Đã trả' && request.ChiTietPhieuMuons.some(ct => ct.PhieuTra)">
                {{ request.ChiTietPhieuMuons.reduce((sum, ct) => sum + (ct.PhieuTra?.tienPhat || 0), 0) }} VND
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="getStatusBadgeClass(request.trangThai)">
                {{ request.trangThai }}
              </span>
            </td>
            <td>
              <template v-if="request.trangThai === 'Chờ duyệt'">
                <button class="btn btn-sm btn-success me-2" 
                        @click="showConfirmAction('approve', request)"
                        :disabled="request.ChiTietPhieuMuons.some(ct => ct.Sach?.soLuongHienCo <= 0)">
                  <i class="fas fa-check"></i> Duyệt
                </button>
                <button class="btn btn-sm btn-danger me-2" 
                        @click="showConfirmAction('reject', request)">
                  <i class="fas fa-times"></i> Từ chối
                </button>
              </template>
              <template v-if="request.trangThai === 'Đã duyệt'">
                <button class="btn btn-sm btn-info me-2" 
                        @click="showConfirmAction('return', request)">
                  <i class="fas fa-undo"></i> Đánh dấu đã trả
                </button>
              </template>
              <button 
                v-if="['Đã duyệt', 'Đã trả'].includes(request.trangThai)"
                class="btn btn-sm btn-primary me-2"
                @click="downloadBorrowSlip(request.maPhieuMuon)"
              >
                <i class="fas fa-download"></i> Phiếu mượn
              </button>
              <button 
                v-if="request.trangThai === 'Đã trả' && request.ChiTietPhieuMuons.some(ct => ct.PhieuTra)"
                class="btn btn-sm btn-info me-2"
                @click="downloadReturnSlip(request.ChiTietPhieuMuons.find(ct => ct.PhieuTra)?.PhieuTra?.maPhieuTra)"
              >
                <i class="fas fa-download"></i> Phiếu trả
              </button>
              <button 
                v-if="request.trangThai === 'Đã trả' && request.ChiTietPhieuMuons.some(ct => ct.PhieuTra && ct.PhieuTra.tienPhat > 0)"
                class="btn btn-sm btn-warning"
                @click="downloadPenaltyForm(request.ChiTietPhieuMuons.find(ct => ct.PhieuTra)?.PhieuTra?.maPhieuTra)"
              >
                <i class="fas fa-download"></i> Phiếu phạt
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận {{ getActionTitle }}</h5>
            <button type="button" class="btn-close" @click="closeConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeConfirmModal">Hủy</button>
            <button 
              type="button" 
              :class="getActionButtonClass" 
              @click="handleConfirmAction" 
              :disabled="loading"
            >
              {{ loading ? 'Đang xử lý...' : getActionButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'BorrowManagement',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const currentTab = ref('pending');
    const loading = ref(false);
    const { proxy } = getCurrentInstance();
    const showConfirmModal = ref(false);
    const selectedRequest = ref(null);
    const selectedAction = ref('');
    const searchTerm = ref('');

    const borrowRequests = computed(() => store.getters['borrow/allBorrowRequests']);

    const filteredRequests = computed(() => {
      let requests = borrowRequests.value;

      if (currentTab.value !== 'all') {
        const statusMap = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
          returned: 'Đã trả'
        };
        requests = requests.filter(
          request => request.trangThai === statusMap[currentTab.value]
        );
      }

      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase().trim();
        requests = requests.filter(request => 
          `${request.DocGia?.hoLot || ''} ${request.DocGia?.ten || ''}`.toLowerCase().includes(search) ||
          request.DocGia?.maDocGia?.toString().includes(search) ||
          request.ChiTietPhieuMuons.some(ct => 
            ct.Sach?.tenSach?.toLowerCase().includes(search) ||
            ct.Sach?.maSach?.toString().includes(search)
          )
        );
      }

      return requests;
    });

    const getActionTitle = computed(() => {
      const titles = {
        approve: 'duyệt yêu cầu',
        reject: 'từ chối yêu cầu',
        return: 'xác nhận trả sách'
      };
      return titles[selectedAction.value] || '';
    });

    const confirmMessage = computed(() => {
      if (!selectedRequest.value) return '';
      const messages = {
        approve: `Bạn có chắc muốn duyệt yêu cầu mượn sách của độc giả "${selectedRequest.value.DocGia?.hoLot} ${selectedRequest.value.DocGia?.ten}" không?`,
        reject: `Bạn có chắc muốn từ chối yêu cầu mượn sách của độc giả "${selectedRequest.value.DocGia?.hoLot} ${selectedRequest.value.DocGia?.ten}" không?`,
        return: `Bạn có chắc muốn xác nhận độc giả "${selectedRequest.value.DocGia?.hoLot} ${selectedRequest.value.DocGia?.ten}" đã trả sách không?`
      };
      return messages[selectedAction.value] || '';
    });

    const getActionButtonClass = computed(() => {
      const classes = {
        approve: 'btn btn-success',
        reject: 'btn btn-danger',
        return: 'btn btn-info'
      };
      return classes[selectedAction.value] || 'btn btn-primary';
    });

    const getActionButtonText = computed(() => {
      const texts = {
        approve: 'Duyệt',
        reject: 'Từ chối',
        return: 'Xác nhận'
      };
      return texts[selectedAction.value] || '';
    });

    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('vi-VN') : '-';
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        'Chờ duyệt': 'badge bg-warning',
        'Đã duyệt': 'badge bg-success',
        'Từ chối': 'badge bg-danger',
        'Đã trả': 'badge bg-info'
      };
      return classes[status] || 'badge bg-secondary';
    };

    const getQuantityClass = (quantity) => {
      if (quantity <= 0) return 'text-danger fw-bold';
      if (quantity < 3) return 'text-warning fw-bold';
      return 'text-success';
    };

    const fetchBorrowRequests = async () => {
      loading.value = true;
      try {
        await store.dispatch('borrow/fetchBorrowRequests');
      } catch (error) {
        showError(error.response?.data?.message || 'Có lỗi xảy ra');
      } finally {
        loading.value = false;
      }
    };

    const downloadBorrowSlip = async (maPhieuMuon) => {
      try {
        loading.value = true;
        const response = await api.get(`/muonsach/export/borrow/${maPhieuMuon}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `phieu_muon_${maPhieuMuon}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        showError(err.response?.data?.message || 'Không thể tải phiếu mượn');
      } finally {
        loading.value = false;
      }
    };

    const downloadReturnSlip = async (maPhieuTra) => {
      try {
        loading.value = true;
        const response = await api.get(`/muonsach/export/return/${maPhieuTra}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `phieu_tra_${maPhieuTra}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        showError(err.response?.data?.message || 'Không thể tải phiếu trả');
      } finally {
        loading.value = false;
      }
    };

    const downloadPenaltyForm = async (maPhieuTra) => {
      try {
        loading.value = true;
        const response = await api.get(`/muonsach/export/penalty/${maPhieuTra}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `form_phat_${maPhieuTra}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        showError(err.response?.data?.message || 'Không thể tải phiếu phạt');
      } finally {
        loading.value = false;
      }
    };

    const showConfirmAction = (action, request) => {
      selectedAction.value = action;
      selectedRequest.value = request;
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      selectedRequest.value = null;
      selectedAction.value = '';
    };

    const handleConfirmAction = async () => {
      const statusMap = {
        approve: 'Đã duyệt',
        reject: 'Từ chối',
        return: 'Đã trả'
      };

      await updateStatus(selectedRequest.value.maPhieuMuon, statusMap[selectedAction.value]);
      closeConfirmModal();
    };

    const updateStatus = async (id, status) => {
      loading.value = true;
      try {
        await store.dispatch('borrow/updateBorrowStatus', { id, status });
        proxy.$toast.show('Cập nhật trạng thái thành công', 'success');
        await fetchBorrowRequests();
      } catch (error) {
        proxy.$toast.show(error.response?.data?.message || 'Có lỗi xảy ra', 'danger');
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchBorrowRequests);

    return {
      currentTab,
      loading,
      searchTerm,
      filteredRequests,
      showConfirmModal,
      selectedRequest,
      selectedAction,
      getActionTitle,
      confirmMessage,
      getActionButtonClass,
      getActionButtonText,
      formatDate,
      getStatusBadgeClass,
      getQuantityClass,
      showConfirmAction,
      closeConfirmModal,
      handleConfirmAction,
      updateStatus,
      downloadBorrowSlip,
      downloadReturnSlip,
      downloadPenaltyForm
    };
  }
};
</script>

<style scoped>
.nav-link {
  cursor: pointer;
}
.badge {
  font-size: 0.9em;
}
.text-danger {
  color: #dc3545 !important;
}
.text-warning {
  color: #ffc107 !important;
}
.text-success {
  color: #198754 !important;
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

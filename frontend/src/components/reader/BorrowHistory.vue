<template>
  <div class="borrow-history">
    <LoadingSpinner :show="loading" />

    <h2>Lịch sử mượn sách</h2>

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
            placeholder="Tìm kiếm theo tên sách, mã sách"
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
        <a class="nav-link" :class="{ active: currentTab === 'all' }" 
           @click="currentTab = 'all'">
          Tất cả
        </a>
      </li>
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
          Bị từ chối
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
              <div v-for="ct in request.ChiTietPhieuMuons" :key="ct.maChiTietPM">
                {{ ct.Sach?.tenSach || 'N/A' }}
                <br>
                <small class="text-muted">Mã sách: {{ ct.Sach?.maSach || 'N/A' }}</small>
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
          <tr v-if="filteredRequests.length === 0">
            <td :colspan="getColspan">Không có dữ liệu</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'BorrowHistory',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const currentTab = ref('all');
    const loading = ref(false);
    const error = ref(null);
    const searchTerm = ref('');

    const borrowHistory = computed(() => store.getters['borrow/borrowHistory']);

    const filteredRequests = computed(() => {
      let results = borrowHistory.value;

      if (currentTab.value !== 'all') {
        const statusMap = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
          returned: 'Đã trả'
        };
        results = results.filter(
          request => request.trangThai === statusMap[currentTab.value]
        );
      }

      if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase().trim();
        results = results.filter(request =>
          request.ChiTietPhieuMuons.some(ct =>
            ct.Sach?.tenSach?.toLowerCase().includes(search) ||
            ct.Sach?.maSach?.toString().includes(search)
          )
        );
      }

      return results;
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

    const fetchHistory = async () => {
      loading.value = true;
      try {
        await store.dispatch('borrow/fetchBorrowHistory');
      } catch (err) {
        error.value = err.response?.data?.message || 'Có lỗi khi tải lịch sử mượn sách';
        showError(error.value);
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

    const clearError = () => {
      error.value = null;
      store.commit('borrow/CLEAR_ERROR');
    };

    const getColspan = computed(() => {
      return 6; // Cột: Sách, Ngày mượn, Ngày trả, Tiền phạt, Trạng thái, Thao tác
    });

    onMounted(fetchHistory);

    return {
      currentTab,
      filteredRequests,
      loading,
      error,
      searchTerm,
      formatDate,
      getStatusBadgeClass,
      clearError,
      getColspan,
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

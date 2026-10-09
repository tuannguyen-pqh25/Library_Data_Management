<template>
  <div class="list-page">
    <LoadingSpinner :show="loading" />

    <div class="page-header">
      <h2 class="page-title">Lịch sử mượn sách</h2>
      <p class="page-sub">Theo dõi và quản lý các yêu cầu mượn sách của bạn</p>
    </div>



    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      <button @click="clearError" class="error-alert__close">×</button>
    </div>

    <div class="toolbar">
      <!-- Search -->
      <div class="search-wrap">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          class="search-input"
          v-model="searchTerm"
          placeholder="Tìm kiếm theo tên sách, mã sách..."
        >
        <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''"><i class="fas fa-times"></i></button>
      </div>

      <!-- Tabs -->
      <div class="custom-tabs">
        <button class="tab-item" :class="{ active: currentTab === 'all' }" @click="currentTab = 'all'">Tất cả</button>
        <button class="tab-item" :class="{ active: currentTab === 'pending' }" @click="currentTab = 'pending'">Chờ duyệt</button>
        <button class="tab-item" :class="{ active: currentTab === 'active' }" @click="currentTab = 'active'">Đang mượn</button>
        <button class="tab-item" :class="{ active: currentTab === 'rejected' }" @click="currentTab = 'rejected'">Bị từ chối</button>
        <button class="tab-item" :class="{ active: currentTab === 'returned' }" @click="currentTab = 'returned'">Đã trả</button>
      </div>
    </div>

    <!-- Danh sách yêu cầu mượn sách -->
    <div class="table-container">
      <div class="table-responsive">
        <table class="custom-table">
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
            <tr v-for="request in filteredRequests" :key="`${request.maPhieuMuon}:${request.maDocGia}`">
              <td>
                <div class="book-info-cell" v-for="ct in request.ChiTietPhieuMuons" :key="`${ct.maChiTietPM}:${ct.maPhieuMuon}:${ct.maSach}`">
                  <div class="fw-bold text-dark">{{ ct.Sach?.tenSach || 'N/A' }}</div>
                  <div class="text-sm text-muted">Mã sách: {{ ct.Sach?.maSach || 'N/A' }}</div>
                </div>
              </td>
              <td>{{ formatDate(request.ngayMuon) }}</td>
              <td>
                {{ request.ngayTra ? formatDate(request.ngayTra) : '—' }}
                <span v-if="(request.trangThai === 'Đã duyệt' || request.trangThai === 'Đang mượn') && new Date(request.ngayTra) < new Date()" class="badge bg-danger ms-2">
                  <i class="fas fa-exclamation-circle me-1"></i> Quá hạn
                </span>
              </td>
              <td>
                <span v-if="request.trangThai === 'Đã trả' && hasReturns(request) && getTotalFine(request) > 0" class="text-danger fw-bold">
                  {{ formatCurrency(getTotalFine(request)) }}
                </span>
                <span v-else>—</span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusBadgeClass(request.trangThai)">
                  {{ request.trangThai }}
                </span>
              </td>
              <td class="action-cell">
                <button
                  v-if="['Đang mượn', 'Đã trả'].includes(request.trangThai)"
                  class="action-btn action-btn--primary"
                  title="Phiếu mượn"
                  @click="downloadBorrowSlip(request.maPhieuMuon, request.maDocGia || request.DocGia?.maDocGia)"
                >
                  <i class="fas fa-file-download"></i>
                </button>
                <button
                  v-if="request.trangThai === 'Đã trả' && hasReturns(request)"
                  class="action-btn action-btn--info"
                  title="Phiếu trả"
                  @click="downloadReturnSlip(firstReturn(request)?.returnRow.maPhieuTra, firstReturn(request)?.detail.maChiTietPM)"
                >
                  <i class="fas fa-file-invoice"></i>
                </button>
                <button
                  v-if="request.trangThai === 'Đã trả' && firstPenalizedReturn(request) !== null"
                  class="action-btn action-btn--warning"
                  title="Phiếu phạt"
                  @click="downloadPenaltyForm(firstPenalizedReturn(request)?.returnRow.maPhieuTra, firstPenalizedReturn(request)?.detail.maChiTietPM)"
                >
                  <i class="fas fa-exclamation-triangle"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="6">
                <div class="empty-state">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-30"></i>
                  <h5>Không có dữ liệu</h5>
                  <p class="text-muted">Chưa có lịch sử mượn sách nào phù hợp.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

    const getReturns = (request) => request.ChiTietPhieuMuons.flatMap(detail =>
      detail.PhieuTra.map(returnRow => ({ detail, returnRow }))
    );
    const hasReturns = (request) => getReturns(request).length > 0;
    const firstReturn = (request) => getReturns(request)[0] || null;
    const firstPenalizedReturn = (request) => getReturns(request).find(
      ({ returnRow }) => Number(returnRow.tienPhat) > 0
    ) || null;
    const getTotalFine = (request) => getReturns(request).reduce(
      (total, { returnRow }) => total + Number(returnRow.tienPhat || 0), 0
    );

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    };
    const formatDate = (date) => {
      return date ? new Date(date).toLocaleDateString('vi-VN') : '—';
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        'Chờ duyệt': 'badge bg-warning',
        'Đã duyệt': 'badge bg-success',
        'Từ chối': 'badge bg-danger',
        'Đã trả': 'badge bg-info'
      };
      return classes[status] || 'badge-secondary';
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

    onMounted(fetchHistory);

    return {
      currentTab,
      filteredRequests,
      loading,
      error,
      searchTerm,
      formatDate,
      formatCurrency,
      hasReturns,
      firstReturn,
      firstPenalizedReturn,
      getTotalFine,
      getStatusBadgeClass,
      clearError,
      downloadBorrowSlip,
      downloadReturnSlip,
      downloadPenaltyForm
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Shared Variables ────────────────────────────────────── */
.list-page {
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

.page-header { margin-bottom: 2rem; }
.page-title { font-family: var(--font-display); font-size: 1.9rem; font-weight: 700; margin: 0 0 0.2rem; }
.page-sub { color: var(--c-muted); font-size: 0.95rem; margin: 0; }

/* ── Error Alert ─────────────────────────────────────────── */
.error-alert { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 0.8rem 1.2rem; border-radius: 12px; display: flex; align-items: center; margin-bottom: 1.5rem; }
.error-alert__close { margin-left: auto; background: none; border: none; cursor: pointer; color: #991b1b; }

/* ── Toolbar (Search + Tabs) ─────────────────────────────── */
.toolbar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
@media (min-width: 768px) {
  .toolbar { flex-direction: row; justify-content: space-between; align-items: flex-end; }
}

.search-wrap { position: relative; width: 100%; max-width: 400px; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--c-muted); }
.search-input { width: 100%; padding: 0.75rem 2.5rem; border: 1.5px solid var(--c-border); border-radius: 10px; background: var(--c-surface); outline: none; font-family: var(--font-body); transition: all var(--trans); }
.search-input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.search-clear { position: absolute; right: 0.8rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--c-muted); cursor: pointer; }

.custom-tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
.custom-tabs::-webkit-scrollbar { display: none; }
.tab-item { padding: 0.6rem 1.2rem; border: none; background: var(--c-surface); border-radius: 20px; font-family: var(--font-body); font-weight: 500; color: var(--c-muted); cursor: pointer; white-space: nowrap; transition: all var(--trans); border: 1px solid var(--c-border); }
.tab-item:hover { background: #f1f5f9; color: var(--c-text); }
.tab-item.active { background: var(--c-text); color: white; border-color: var(--c-text); }

/* ── Table ───────────────────────────────────────────────── */
.table-container { background: var(--c-surface); border-radius: 16px; border: 1px solid var(--c-border); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.table-responsive { overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.custom-table th, .custom-table td { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--c-border); text-align: left; vertical-align: middle; }
.custom-table th { background: #f8fafc; color: var(--c-muted); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.custom-table tbody tr { transition: background var(--trans); }
.custom-table tbody tr:hover { background: #f8fafc; }

.book-info-cell { margin-bottom: 0.5rem; }
.book-info-cell:last-child { margin-bottom: 0; }
.text-sm { font-size: 0.85rem; }
.fw-bold { font-weight: 600; }
.text-muted { color: var(--c-muted); }
.text-dark { color: var(--c-text); }
.text-danger { color: #dc2626; }

/* ── Badges ──────────────────────────────────────────────── */
.status-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-block; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-info { background: #e0f2fe; color: #0369a1; }
.badge-secondary { background: #f1f5f9; color: #475569; }

/* ── Actions ─────────────────────────────────────────────── */
.action-cell { display: flex; gap: 0.5rem; }
.action-btn { width: 36px; height: 36px; border-radius: 8px; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all var(--trans); color: white; }
.action-btn--primary { background: var(--c-primary); }
.action-btn--primary:hover { background: var(--c-primary-dk); }
.action-btn--info { background: #0ea5e9; }
.action-btn--info:hover { background: #0284c7; }
.action-btn--warning { background: #f59e0b; }
.action-btn--warning:hover { background: #d97706; }

/* ── Empty State ─────────────────────────────────────────── */
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--c-muted); }
.empty-state h5 { font-family: var(--font-display); font-weight: 600; color: var(--c-text); margin-bottom: 0.5rem; }
</style>

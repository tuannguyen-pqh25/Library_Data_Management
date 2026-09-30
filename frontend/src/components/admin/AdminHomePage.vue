
<template>
  <div class="admin-home-page">
    <LoadingSpinner v-if="loading" show />

    <h2 class="mb-4">Tổng quan thư viện</h2>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Thống kê -->
    <div class="row mb-5">
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-danger">{{ statistics.tongSachMuonThang ?? '—' }}</h3>
            <p class="card-text">Số quyển đã mượn trong tháng này</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-info">{{ statistics.tongDocGiaMuonSachNam ?? '—' }}</h3>
            <p class="card-text">Độc giả đã mượn sách trong năm nay</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-success">{{ totalBooks }}</h3>
            <p class="card-text">Tổng số sách</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-warning">{{ totalAuthors }}</h3>
            <p class="card-text">Tổng số tác giả</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-primary">{{ totalPublishers }}</h3>
            <p class="card-text">Tổng số nhà xuất bản</p>
          </div>
        </div>
      </div>
    </div>

    <section>
      <h3 class="mb-3">Phiếu mượn chưa trả</h3>
      <p v-if="reportError" class="alert alert-warning">{{ reportError }}</p>
      <p v-else-if="unreturnedLoans.length === 0" class="text-muted">Không có phiếu mượn đang mượn.</p>
      <div v-else class="table-responsive">
        <table class="table table-striped">
          <thead><tr><th>Mã phiếu mượn</th><th>Độc giả</th><th>Ngày mượn</th><th>Ngày trả dự kiến</th></tr></thead>
          <tbody>
            <tr v-for="loan in unreturnedLoans" :key="`${loan.maPhieuMuon}:${loan.maDocGia}`">
              <td>{{ loan.maPhieuMuon }}</td>
              <td>{{ loan.fullName || loan.DocGia?.fullName || loan.maDocGia }}</td>
              <td>{{ formatDate(loan.ngayMuon) }}</td>
              <td>{{ formatDate(loan.ngayTra) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';
import api from '@/services/api';

export default {
  name: 'AdminHomePage',
  components: {
    LoadingSpinner
  },
  setup() {
    const store = useStore();

    // Computed properties từ Vuex
    const totalBooks = computed(() => store.getters['book/allBooks']?.length || 0);
    const totalAuthors = computed(() => store.getters['author/allAuthors']?.length || 0);
    const totalPublishers = computed(() => store.getters['publisher/allPublishers']?.length || 0);
    const statistics = ref({});
    const unreturnedLoans = ref([]);
    const reportError = ref(null);
    const loading = computed(() => 
      store.getters['book/isLoading'] ||
      store.getters['author/isLoading'] ||
      store.getters['publisher/isLoading'] ||
      store.getters['borrow/isLoading']
    );
    const error = computed(() => 
      store.getters['book/error'] ||
      store.getters['author/error'] ||
      store.getters['publisher/error'] ||
      store.getters['borrow/error']
    );

    // Lấy tất cả dữ liệu cần thiết
    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('author/fetchAuthors'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('borrow/fetchBorrowRequests'),
          fetchReports()
        ]);
      } catch (error) {
        showError(error.message);
      }
    };

    const fetchReports = async () => {
      try {
        const [statisticsResponse, unreturnedResponse] = await Promise.all([
          api.get('/reports/statistics'),
          api.get('/reports/unreturned-loans')
        ]);
        statistics.value = statisticsResponse.data;
        unreturnedLoans.value = unreturnedResponse.data;
        reportError.value = null;
      } catch (error) {
        reportError.value = error.response?.data?.message || 'Không thể tải báo cáo mượn sách';
      }
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-';

    const clearError = () => {
      store.commit('book/SET_ERROR', null);
      store.commit('author/SET_ERROR', null);
      store.commit('publisher/SET_ERROR', null);
      store.commit('borrow/SET_ERROR', null);
    };

    onMounted(fetchData);

    return {
      totalBooks,
      totalAuthors,
      totalPublishers,
      statistics,
      unreturnedLoans,
      reportError,
      formatDate,
      loading,
      error,
      clearError
    };
  }
};
</script>

<style scoped>
.admin-home-page {
  padding: 20px 0;
}
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
.card-title {
  font-size: 2rem;
  font-weight: bold;
}
.card-text {
  font-size: 1rem;
  color: #6c757d;
}
</style>

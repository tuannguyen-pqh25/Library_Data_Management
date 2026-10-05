<template>
  <div class="admin-home-page">
    <div class="page-heading d-flex flex-column flex-sm-row justify-content-between align-items-sm-end gap-3 mb-4">
      <div>
        <p class="eyebrow mb-2">Không gian quản trị</p>
        <h1 class="page-title mb-2">Tổng quan thư viện</h1>
        <p class="page-subtitle mb-0">Theo dõi tình hình mượn sách và các phiếu cần xử lý.</p>
      </div>
      <span class="period-chip"><i class="fas fa-calendar-alt me-2" aria-hidden="true"></i>{{ currentPeriod }}</span>
    </div>

    <section class="mb-4" aria-labelledby="report-heading">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 id="report-heading" class="section-heading mb-0">Chỉ số mượn trả</h2>
        <span class="demo-badge"><span class="demo-dot"></span>Dữ liệu minh họa</span>
      </div>

      <div v-if="reportLoading" class="alert alert-light border d-flex align-items-center gap-2" role="status" aria-live="polite">
        <span class="spinner-border spinner-border-sm text-success" aria-hidden="true"></span>
        <span>Đang tải số liệu tổng quan...</span>
      </div>

      <div v-else-if="reportError" class="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" role="alert">
        <span><i class="fas fa-circle-exclamation me-2" aria-hidden="true"></i>{{ reportError }}</span>
        <button class="btn btn-sm btn-outline-danger" type="button" @click="loadDashboard">Thử lại</button>
      </div>

      <div v-else-if="isReportEmpty" class="empty-state text-center py-5 px-3">
        <span class="empty-icon mb-3"><i class="fas fa-chart-simple" aria-hidden="true"></i></span>
        <h3 class="h6 mb-1">Chưa có số liệu thống kê</h3>
        <p class="text-muted small mb-0">Các chỉ số sẽ xuất hiện khi có dữ liệu mượn trả.</p>
      </div>

      <div v-else class="row g-3">
        <div class="col-12 col-md-4">
          <article class="metric-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <p class="metric-label mb-0">Sách mượn tháng này</p>
              <span class="metric-icon icon-green"><i class="fas fa-book-open" aria-hidden="true"></i></span>
            </div>
            <p class="metric-value mb-1">{{ formatNumber(statistics.tongSachMuonThang) }}</p>
            <p class="metric-caption mb-0">Quyển sách được mượn trong tháng</p>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <p class="metric-label mb-0">Độc giả đã mượn năm nay</p>
              <span class="metric-icon icon-blue"><i class="fas fa-users" aria-hidden="true"></i></span>
            </div>
            <p class="metric-value mb-1">{{ formatNumber(statistics.tongDocGiaMuonSachNam) }}</p>
            <p class="metric-caption mb-0">Độc giả duy nhất từ đầu năm</p>
          </article>
        </div>
        <div class="col-12 col-md-4">
          <article class="metric-card h-100">
            <div class="d-flex justify-content-between align-items-start">
              <p class="metric-label mb-0">Phiếu chưa trả</p>
              <span class="metric-icon icon-amber"><i class="fas fa-clock" aria-hidden="true"></i></span>
            </div>
            <p class="metric-value mb-1">{{ formatNumber(statistics.phieuChuaTra) }}</p>
            <p class="metric-caption mb-0">Phiếu mượn đang chờ hoàn tất</p>
          </article>
        </div>
      </div>
    </section>

    <section class="mb-4" aria-labelledby="trend-heading">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-1 mb-3">
        <div>
          <h2 id="trend-heading" class="section-heading mb-1">Lượt mượn theo tháng</h2>
          <p class="section-caption mb-0">Xu hướng minh họa trong 6 tháng gần nhất.</p>
        </div>
        <span class="chart-unit">Đơn vị: quyển sách</span>
      </div>
      <div v-if="reportLoading" class="chart-skeleton" role="status" aria-label="Đang tải biểu đồ">
        <span v-for="n in 6" :key="n" class="skeleton-bar" :style="{ height: `${20 + n * 9}%` }"></span>
      </div>
      <div v-else-if="reportError" class="empty-state chart-message">Không thể hiển thị biểu đồ khi số liệu báo cáo gặp lỗi.</div>
      <div v-else-if="monthlyLoans.length === 0" class="empty-state chart-message">Chưa có dữ liệu lượt mượn theo tháng.</div>
      <div v-else class="trend-card" role="img" :aria-label="monthlyChartLabel">
        <div class="chart-scale" aria-hidden="true"><span>{{ chartMax }}</span><span>{{ Math.round(chartMax / 2) }}</span><span>0</span></div>
        <div class="chart-plot" aria-hidden="true">
          <div class="chart-gridline grid-top"></div><div class="chart-gridline grid-middle"></div><div class="chart-gridline grid-bottom"></div>
          <div v-for="month in monthlyLoans" :key="month.label" class="chart-column">
            <div class="chart-bar-track"><span class="chart-bar" :style="{ height: `${Math.max((month.value / chartMax) * 100, 2)}%` }"></span></div>
            <span class="chart-label">{{ month.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="library-section" aria-labelledby="library-heading">
      <h2 id="library-heading" class="section-heading mb-3">Danh mục thư viện</h2>
      <div class="row g-3">
        <div class="col-12 col-sm-4">
          <article class="library-card h-100">
            <span class="library-icon icon-green"><i class="fas fa-book" aria-hidden="true"></i></span>
            <div><p class="library-value mb-1">{{ formatNumber(totalBooks) }}</p><p class="library-label mb-0">Tổng số sách</p></div>
          </article>
        </div>
        <div class="col-12 col-sm-4">
          <article class="library-card h-100">
            <span class="library-icon icon-blue"><i class="fas fa-pen-nib" aria-hidden="true"></i></span>
            <div><p class="library-value mb-1">{{ formatNumber(totalAuthors) }}</p><p class="library-label mb-0">Tác giả</p></div>
          </article>
        </div>
        <div class="col-12 col-sm-4">
          <article class="library-card h-100">
            <span class="library-icon icon-amber"><i class="fas fa-building" aria-hidden="true"></i></span>
            <div><p class="library-value mb-1">{{ formatNumber(totalPublishers) }}</p><p class="library-label mb-0">Nhà xuất bản</p></div>
          </article>
        </div>
      </div>
    </section>

    <section class="loans-section mt-4" aria-labelledby="loans-heading">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <h2 id="loans-heading" class="section-heading mb-1">Phiếu chưa trả</h2>
          <p class="section-caption mb-0">Các phiếu đang mượn, sắp xếp theo hạn trả.</p>
        </div>
        <span v-if="!reportLoading && !reportError && unreturnedLoans.length" class="loan-count">{{ unreturnedLoans.length }} phiếu</span>
      </div>

      <div v-if="reportLoading" class="alert alert-light border d-flex align-items-center gap-2" role="status" aria-live="polite">
        <span class="spinner-border spinner-border-sm text-success" aria-hidden="true"></span>
        <span>Đang tải danh sách phiếu...</span>
      </div>
      <div v-else-if="reportError" class="alert alert-warning mb-0" role="alert">{{ reportError }}</div>
      <div v-else-if="unreturnedLoans.length === 0" class="empty-state text-center py-5 px-3">
        <span class="empty-icon mb-3"><i class="fas fa-inbox" aria-hidden="true"></i></span>
        <h3 class="h6 mb-1">Không có phiếu chưa trả</h3>
        <p class="text-muted small mb-0">Danh sách sẽ cập nhật khi có phiếu đang mượn.</p>
      </div>
      <div v-else class="table-responsive loan-table-wrap">
        <table class="table align-middle mb-0">
          <thead>
            <tr><th scope="col">Mã phiếu</th><th scope="col">Độc giả</th><th scope="col">Ngày mượn</th><th scope="col">Hạn trả</th></tr>
          </thead>
          <tbody>
            <tr v-for="loan in unreturnedLoans" :key="`${loan.maPhieuMuon}:${loan.maDocGia}`">
              <td class="loan-id">#{{ loan.maPhieuMuon }}</td>
              <td>{{ loan.fullName || loan.DocGia?.fullName || loan.maDocGia }}</td>
              <td>{{ formatDate(loan.ngayMuon) }}</td>
              <td>{{ formatDate(loan.ngayTra) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p class="demo-note mt-3 mb-0">Số liệu báo cáo và danh sách phiếu hiện là dữ liệu minh họa cho giai đoạn 1.</p>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import dashboardReportService from '@/services/dashboardReportService';

export default {
  name: 'AdminHomePage',
  setup() {
    const store = useStore();
    const statistics = ref({ tongSachMuonThang: 0, tongDocGiaMuonSachNam: 0, phieuChuaTra: 0 });
    const unreturnedLoans = ref([]);
    const reportLoading = ref(false);
    const reportError = ref('');
    const monthlyLoans = ref([]);
    const totalBooks = computed(() => store.getters['book/allBooks']?.length || 0);
    const totalAuthors = computed(() => store.getters['author/allAuthors']?.length || 0);
    const totalPublishers = computed(() => store.getters['publisher/allPublishers']?.length || 0);
    const isReportEmpty = computed(() =>
      statistics.value.tongSachMuonThang === 0 &&
      statistics.value.tongDocGiaMuonSachNam === 0 &&
      statistics.value.phieuChuaTra === 0 &&
      unreturnedLoans.value.length === 0
    );
    const currentPeriod = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date());
    const chartMax = computed(() => Math.max(10, Math.ceil(Math.max(...monthlyLoans.value.map((month) => month.value), 0) / 10) * 10));
    const monthlyChartLabel = computed(() => `Biểu đồ lượt mượn theo tháng: ${monthlyLoans.value.map((month) => `${month.label} ${month.value}`).join(', ')}`);

    const loadDashboard = async () => {
      reportLoading.value = true;
      reportError.value = '';
      try {
        const report = await dashboardReportService.getDashboardReport();
        statistics.value = report.statistics;
        unreturnedLoans.value = report.unreturnedLoans;
        monthlyLoans.value = report.monthlyLoans || [];
      } catch (error) {
        reportError.value = error.message || 'Không thể tải số liệu tổng quan.';
      } finally {
        reportLoading.value = false;
      }
    };

    const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
    const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '—';

    onMounted(loadDashboard);

    return {
      statistics,
      unreturnedLoans,
      monthlyLoans,
      reportLoading,
      reportError,
      isReportEmpty,
      currentPeriod,
      chartMax,
      monthlyChartLabel,
      totalBooks,
      totalAuthors,
      totalPublishers,
      formatNumber,
      formatDate,
      loadDashboard
    };
  }
};
</script>

<style scoped>
.admin-home-page { --dashboard-ink: #27352c; --dashboard-muted: #78837b; --dashboard-line: #e8ebe6; --dashboard-paper: #f7f8f5; padding: 20px 0 30px; color: var(--dashboard-ink); }
.eyebrow { color: #819084; font-size: .68rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.page-title { color: #26352b; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.65rem, 3vw, 2.05rem); font-weight: 500; letter-spacing: -.035em; }
.page-subtitle, .section-caption { color: var(--dashboard-muted); font-size: .88rem; }
.period-chip, .demo-badge, .loan-count { align-items: center; background: #fff; border: 1px solid var(--dashboard-line); border-radius: .55rem; color: #647168; display: inline-flex; font-size: .78rem; padding: .55rem .75rem; white-space: nowrap; }
.demo-badge { background: #fbf7eb; border-color: #f0e8d5; color: #88774f; font-size: .67rem; gap: .4rem; padding: .35rem .55rem; text-transform: uppercase; letter-spacing: .045em; }
.demo-dot { background: #b39459; border-radius: 50%; height: .4rem; width: .4rem; }
.section-heading { color: #39483e; font-size: 1rem; font-weight: 700; }
.chart-unit { color: #929b94; font-size: .7rem; }
.trend-card { background: #fff; border: 1px solid var(--dashboard-line); border-radius: .75rem; box-shadow: 0 .2rem .8rem rgb(38 53 43 / 3%); display: flex; height: 220px; padding: 1rem 1rem .65rem .65rem; }
.chart-scale { color: #9aa29b; display: flex; flex: 0 0 2rem; flex-direction: column; font-size: .62rem; justify-content: space-between; padding: .1rem .35rem 1.6rem 0; text-align: right; }
.chart-plot { display: flex; flex: 1; justify-content: space-around; min-width: 0; position: relative; }
.chart-gridline { border-top: 1px dashed #e9ede8; left: 0; position: absolute; right: 0; }
.grid-top { top: 0; }.grid-middle { top: 50%; }.grid-bottom { bottom: 1.6rem; border-top-style: solid; }
.chart-column { align-items: center; display: flex; flex: 1; flex-direction: column; max-width: 5rem; min-width: 1.7rem; position: relative; }
.chart-bar-track { align-items: flex-end; display: flex; height: calc(100% - 1.6rem); justify-content: center; width: 100%; }
.chart-bar { background: linear-gradient(180deg,#83a98a,#4d7958); border-radius: .35rem .35rem .1rem .1rem; max-width: 1.8rem; min-height: .2rem; transition: height .25s ease; width: 44%; }
.chart-label { color: #7e8980; font-size: .65rem; margin-top: .35rem; }
.chart-skeleton { align-items: flex-end; background: #fff; border: 1px solid var(--dashboard-line); border-radius: .75rem; display: flex; gap: 1rem; height: 220px; justify-content: space-around; padding: 1.5rem 2rem; }
.skeleton-bar { animation: pulse 1s ease-in-out infinite alternate; background: #e9efe9; border-radius: .35rem .35rem 0 0; max-width: 1.8rem; width: 12%; }
.chart-message { color: #7f8a82; font-size: .8rem; min-height: 150px; }
@keyframes pulse { to { opacity: .45; } }
.metric-card, .library-card, .loan-table-wrap, .empty-state { background: #fff; border: 1px solid var(--dashboard-line); border-radius: .75rem; box-shadow: 0 .2rem .8rem rgb(38 53 43 / 3%); }
.metric-card { min-height: 156px; padding: 1.15rem 1.2rem; }
.metric-label { color: #67746b; font-size: .83rem; font-weight: 600; }
.metric-icon, .library-icon { align-items: center; border-radius: .65rem; display: inline-flex; flex: 0 0 auto; height: 2.4rem; justify-content: center; width: 2.4rem; }
.icon-green { background: #eaf2ec; color: #477457; }
.icon-blue { background: #edf2f7; color: #537494; }
.icon-amber { background: #f8f1e6; color: #a2753b; }
.metric-value { color: #29382f; font-family: Georgia, 'Times New Roman', serif; font-size: 2.25rem; font-weight: 600; letter-spacing: -.04em; line-height: 1.15; margin-top: .9rem; }
.metric-caption, .library-label { color: #89928b; font-size: .75rem; }
.library-card { align-items: center; display: flex; gap: .9rem; padding: 1rem 1.05rem; }
.library-value { color: #34443a; font-size: 1.1rem; font-weight: 700; }
.loan-count { font-size: .72rem; padding: .35rem .6rem; }
.loan-table-wrap { overflow: hidden; }
.loan-table-wrap .table { --bs-table-bg: transparent; }
.loan-table-wrap th { background: #fafbf9; border-bottom-color: var(--dashboard-line); color: #879189; font-size: .66rem; font-weight: 700; letter-spacing: .07em; padding: .85rem 1rem; text-transform: uppercase; white-space: nowrap; }
.loan-table-wrap td { border-bottom-color: #eef0ed; color: #5e6a61; font-size: .8rem; padding: .85rem 1rem; }
.loan-table-wrap tbody tr:last-child td { border-bottom: 0; }
.loan-id { color: #477457 !important; font-weight: 700; }
.empty-state { border-style: dashed; box-shadow: none; }
.empty-icon { align-items: center; background: #eef3ee; border-radius: 50%; color: #67836c; display: inline-flex; height: 2.6rem; justify-content: center; width: 2.6rem; }
.demo-note { color: #969e97; font-size: .7rem; }
@media (max-width: 575.98px) {
  .admin-home-page { padding-top: 10px; }
  .page-heading { margin-bottom: 1.4rem !important; }
  .period-chip { align-self: flex-start; }
  .metric-card { min-height: 0; padding: 1rem; }
  .metric-value { font-size: 2rem; margin-top: .6rem; }
  .library-card { padding: .85rem; }
  .loan-table-wrap th, .loan-table-wrap td { padding-left: .75rem; padding-right: .75rem; }
}
</style>

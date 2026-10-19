<template>
  <div class="home-page">
    <LoadingSpinner :show="loading" />

    <div class="container py-4 py-md-5">
      <!-- Error Alert with Retry -->
      <div v-if="error" class="error-alert mb-4" role="alert" aria-live="assertive">
        <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
        <span class="error-alert__text">{{ error }}</span>
        <div class="error-alert__actions">
          <button class="btn-retry" @click="loadData" aria-label="Thử lại tải dữ liệu trang chủ">
            <i class="fas fa-sync-alt me-1" aria-hidden="true"></i>Thử lại
          </button>
          <button @click="error = null" class="error-alert__close" aria-label="Đóng thông báo lỗi">×</button>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-10 mx-auto text-center">
          <div class="hero-section mb-5">
            <span class="hero-badge mb-3">
              <i class="fas fa-graduation-cap me-2" aria-hidden="true"></i>Đại học Cần Thơ
            </span>
            <h1 class="hero-title mb-3">Chào mừng đến với Thư viện CTU</h1>
            <p class="hero-subtitle mb-4">
              Khám phá kho tàng sách phong phú, tra cứu tài liệu học thuật và quản lý các yêu cầu mượn trả dễ dàng.
            </p>
            <div class="hero-actions d-flex justify-content-center gap-3 flex-wrap">
              <button class="btn-primary-custom" @click="goTo('BookList')">
                <i class="fas fa-book-open me-2" aria-hidden="true"></i>Khám phá danh mục sách
              </button>
              <button class="btn-outline-custom" @click="goTo('BorrowHistory')">
                <i class="fas fa-history me-2" aria-hidden="true"></i>Xem lịch sử mượn
              </button>
            </div>
          </div>

          <!-- Thống kê nhanh -->
          <div class="stats-grid mb-5" role="region" aria-label="Thống kê tổng quan thư viện">
            <div class="stat-card stat-card--books" @click="goTo('BookList')" role="button" tabindex="0" @keyup.enter="goTo('BookList')">
              <div class="stat-card__icon" aria-hidden="true">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-card__content">
                <h2 class="stat-card__number">{{ totalBooks }}</h2>
                <p class="stat-card__label">Đầu sách trong kho</p>
              </div>
            </div>

            <div class="stat-card stat-card--publishers" @click="goTo('PublisherList')" role="button" tabindex="0" @keyup.enter="goTo('PublisherList')">
              <div class="stat-card__icon" aria-hidden="true">
                <i class="fas fa-building"></i>
              </div>
              <div class="stat-card__content">
                <h2 class="stat-card__number">{{ totalPublishers }}</h2>
                <p class="stat-card__label">Nhà xuất bản</p>
              </div>
            </div>

            <div class="stat-card stat-card--authors" @click="goTo('AuthorList')" role="button" tabindex="0" @keyup.enter="goTo('AuthorList')">
              <div class="stat-card__icon" aria-hidden="true">
                <i class="fas fa-pen-nib"></i>
              </div>
              <div class="stat-card__content">
                <h2 class="stat-card__number">{{ totalAuthors }}</h2>
                <p class="stat-card__label">Tác giả</p>
              </div>
            </div>

            <div class="stat-card stat-card--active" @click="goTo('BorrowHistory')" role="button" tabindex="0" @keyup.enter="goTo('BorrowHistory')">
              <div class="stat-card__icon" aria-hidden="true">
                <i class="fas fa-book-reader"></i>
              </div>
              <div class="stat-card__content">
                <h2 class="stat-card__number">{{ approvedBooks }}</h2>
                <p class="stat-card__label">Sách bạn đang mượn</p>
              </div>
            </div>
          </div>

          <!-- Hướng dẫn sử dụng -->
          <div class="guide-section text-start">
            <h2 class="guide-title mb-4 text-center">Hướng dẫn nhanh cho độc giả</h2>
            <div class="row g-4">
              <div class="col-md-6">
                <div class="guide-card h-100">
                  <div class="guide-card__header">
                    <span class="guide-step">1</span>
                    <h3 class="guide-card__title">
                      <i class="fas fa-search me-2 text-primary" aria-hidden="true"></i>Tìm kiếm & Chọn sách
                    </h3>
                  </div>
                  <p class="guide-card__text">
                    Dễ dàng tra cứu sách theo tên sách, tác giả, nhà xuất bản hoặc phân loại thể loại. Thêm các đầu sách yêu thích vào giỏ mượn (tối đa 5 quyển cùng lúc).
                  </p>
                  <button class="btn-card-link" @click="goTo('BookList')">
                    Đến trang tìm sách <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
                  </button>
                </div>
              </div>

              <div class="col-md-6">
                <div class="guide-card h-100">
                  <div class="guide-card__header">
                    <span class="guide-step">2</span>
                    <h3 class="guide-card__title">
                      <i class="fas fa-clipboard-check me-2 text-primary" aria-hidden="true"></i>Gửi mượn & Theo dõi
                    </h3>
                  </div>
                  <p class="guide-card__text">
                    Gửi yêu cầu mượn sách trực tuyến (trạng thái Chờ duyệt). Khi quản trị viên duyệt, bạn đến thư viện nhận sách và theo dõi thời hạn trả trên trang Lịch sử.
                  </p>
                  <button class="btn-card-link" @click="goTo('BorrowHistory')">
                    Xem lịch sử mượn <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, inject } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

export default {
  name: 'HomePage',
  components: {
    LoadingSpinner
  },
  setup() {
    const store = useStore();
    const loading = ref(false);
    const error = ref(null);
    const navigateToTab = inject('navigateToTab', null);

    const totalBooks = computed(() => (store.getters['book/allBooks'] || []).length);
    const totalPublishers = computed(() => (store.getters['publisher/allPublishers'] || []).length);
    const totalAuthors = computed(() => (store.getters['author/allAuthors'] || []).length);

    const approvedBooks = computed(() => {
      const history = store.getters['borrow/borrowHistory'] || [];
      return history.filter(item => item.trangThai === 'Đang mượn').length;
    });

    const loadData = async () => {
      loading.value = true;
      error.value = null;
      try {
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('borrow/fetchBorrowHistory'),
          store.dispatch('author/fetchAuthors')
        ]);
      } catch (err) {
        error.value = err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu trang chủ';
      } finally {
        loading.value = false;
      }
    };

    const goTo = (tabName) => {
      if (typeof navigateToTab === 'function') {
        navigateToTab(tabName);
      } else {
        localStorage.setItem('readerCurrentComponent', tabName);
        window.location.reload();
      }
    };

    onMounted(loadData);

    return {
      loading,
      error,
      totalBooks,
      totalPublishers,
      approvedBooks,
      totalAuthors,
      loadData,
      goTo
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Outfit:wght@300;400;500;600;700&display=swap');

.home-page {
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
  min-height: 80vh;
}

/* ── Hero ────────────────────────────────────────────────── */
.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  background: #eff6ff;
  color: var(--c-primary);
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--c-text);
}
.hero-subtitle {
  font-size: 1.05rem;
  color: var(--c-muted);
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Buttons ─────────────────────────────────────────────── */
.btn-primary-custom {
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--trans);
}
.btn-primary-custom:hover {
  background: var(--c-primary-dk);
  box-shadow: 0 4px 14px rgba(37,99,235,0.35);
  transform: translateY(-2px);
}
.btn-outline-custom {
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--trans);
}
.btn-outline-custom:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

/* ── Stats Grid ──────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}
.stat-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all var(--trans);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  border-color: #bfdbfe;
}
.stat-card:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}
.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.stat-card--books .stat-card__icon { background: #dcfce7; color: #16a34a; }
.stat-card--publishers .stat-card__icon { background: #fef3c7; color: #d97706; }
.stat-card--authors .stat-card__icon { background: #e0f2fe; color: #0284c7; }
.stat-card--active .stat-card__icon { background: #fee2e2; color: #dc2626; }

.stat-card__content { text-align: left; }
.stat-card__number {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-text);
  line-height: 1.1;
}
.stat-card__label {
  font-size: 0.85rem;
  color: var(--c-muted);
  margin: 0.25rem 0 0;
}

/* ── Guide Section ───────────────────────────────────────── */
.guide-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
}
.guide-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}
.guide-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.guide-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--c-primary);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guide-card__title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0;
  color: var(--c-text);
}
.guide-card__text {
  color: var(--c-muted);
  font-size: 0.92rem;
  line-height: 1.6;
  flex: 1;
  margin-bottom: 1.25rem;
}
.btn-card-link {
  background: none;
  border: none;
  color: var(--c-primary);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: color var(--trans);
}
.btn-card-link:hover {
  color: var(--c-primary-dk);
  text-decoration: underline;
}

/* ── Error Alert ─────────────────────────────────────────── */
.error-alert {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.error-alert__text { flex: 1; font-weight: 500; font-size: 0.92rem; }
.error-alert__actions { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; }
.btn-retry {
  background: #fff;
  border: 1px solid #f87171;
  color: #b91c1c;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all var(--trans);
}
.btn-retry:hover { background: #fee2e2; border-color: #ef4444; }
.error-alert__close { background: none; border: none; font-size: 1.25rem; line-height: 1; color: #991b1b; cursor: pointer; padding: 0.2rem; }

/* ── Focus ───────────────────────────────────────────────── */
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}
</style>
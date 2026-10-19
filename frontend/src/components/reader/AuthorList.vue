<template>
  <div class="list-page">
    <LoadingSpinner :show="loading" />

    <div class="page-header">
      <h2 class="page-title">Danh sách tác giả</h2>
      <p class="page-sub">Những người sáng tạo nên các tác phẩm tại thư viện</p>
    </div>

    <!-- Error Alert with Retry -->
    <div v-if="error" class="error-alert" role="alert" aria-live="assertive">
      <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
      <span class="error-alert__text">{{ error }}</span>
      <div class="error-alert__actions">
        <button class="btn-retry" @click="fetchData" aria-label="Thử lại tải danh sách tác giả">
          <i class="fas fa-sync-alt me-1" aria-hidden="true"></i>Thử lại
        </button>
        <button @click="clearError" class="error-alert__close" aria-label="Đóng thông báo lỗi">×</button>
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <label for="author-search-input" class="visually-hidden">Tìm kiếm tác giả</label>
      <i class="fas fa-search search-icon" aria-hidden="true"></i>
      <input
        type="text"
        id="author-search-input"
        class="search-input"
        v-model="searchTerm"
        placeholder="Tìm kiếm tác giả theo tên hoặc mã..."
        aria-label="Tìm kiếm tác giả theo tên hoặc mã"
      />
      <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''" aria-label="Xóa từ khóa tìm kiếm">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <!-- List -->
    <div v-if="!authors.length && !loading" class="empty-state">
      <i class="fas fa-pen-nib fa-3x mb-3 opacity-30" aria-hidden="true"></i>
      <h5>Không tìm thấy tác giả</h5>
      <p class="text-muted">Thử tìm kiếm với từ khóa khác.</p>
    </div>

    <div v-else class="card-grid">
      <div v-for="author in authors" :key="author.maTacGia" class="info-card">
        <div class="info-card__body">
          <h5 class="info-card__title">{{ author.tenTacGia }}</h5>
          <p class="info-card__code">Mã tác giả: {{ author.maTacGia }}</p>
          <div class="info-card__meta">
            <div class="meta-row">
              <i class="fas fa-book" aria-hidden="true"></i>
              <span>Đã xuất bản: <strong>{{ getAuthorBookCount(author.maTacGia) }}</strong> sách</span>
            </div>
          </div>
        </div>
        <div class="info-card__footer">
          <button class="btn-primary-custom" @click="showAuthorBooks(author)" :aria-label="`Xem danh sách sách của ${author.tenTacGia}`">
            Xem danh sách sách
          </button>
        </div>
      </div>
    </div>

    <!-- Book Modal -->
    <transition name="modal-fade">
      <div v-if="showBooksModal" class="modal-overlay" @click.self="closeBooksModal">
        <div class="detail-modal" role="dialog" aria-modal="true" aria-labelledby="author-modal-heading">
          <div class="detail-modal__header">
            <h5 class="detail-modal__title" id="author-modal-heading">Sách của {{ selectedAuthor?.tenTacGia }}</h5>
            <button class="modal-close" @click="closeBooksModal" aria-label="Đóng cửa sổ sách tác giả">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="detail-modal__body">
            <div class="table-responsive" v-if="authorBooks.length">
              <table class="custom-table" aria-label="Bảng sách của tác giả">
                <thead>
                  <tr>
                    <th scope="col">Mã sách</th>
                    <th scope="col">Tên sách</th>
                    <th scope="col">Nhà xuất bản</th>
                    <th scope="col">Năm XB</th>
                    <th scope="col">Số quyển</th>
                    <th scope="col">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in authorBooks" :key="`${book.maSach}:${book.maTacGia}:${book.maTheLoai}`">
                    <td>{{ book.maSach }}</td>
                    <td class="fw-bold">{{ book.tenSach }}</td>
                    <td>{{ book.maNXB?.tenNXB || book.NhaXuatBan?.tenNXB || '—' }}</td>
                    <td>{{ book.namXuatBan }}</td>
                    <td>{{ book.soQuyen }}</td>
                    <td>{{ formatCurrency(book.donGia) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state py-4">
              <p>Chưa có sách nào của tác giả này.</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';

export default {
  name: 'AuthorList',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const searchTerm = ref('');
    const showBooksModal = ref(false);
    const selectedAuthor = ref(null);

    const loading = computed(() => store.getters['author/isLoading']);
    const error = computed(() => store.getters['author/error']);
    const allAuthors = computed(() => store.getters['author/allAuthors']);
    const allBooks = computed(() => store.getters['book/allBooks']);

    const authors = computed(() => {
      if (!searchTerm.value) return allAuthors.value;
      const search = searchTerm.value.toLowerCase();
      return allAuthors.value.filter(author => 
        author.tenTacGia.toLowerCase().includes(search) ||
        author.maTacGia.toLowerCase().includes(search)
      );
    });

    const authorBooks = computed(() => {
      if (!selectedAuthor.value) return [];
      return allBooks.value.filter(book => 
        book.maTacGia === selectedAuthor.value.maTacGia
      );
    });

    const getAuthorBookCount = (authorId) => {
      return allBooks.value.filter(book => book.maTacGia === authorId).length;
    };

    const formatCurrency = (value) => {
      if (!value) return '—';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    };
    
    const showAuthorBooks = (author) => {
      selectedAuthor.value = author;
      showBooksModal.value = true;
    };

    const closeBooksModal = () => {
      showBooksModal.value = false;
      selectedAuthor.value = null;
    };

    const clearError = () => {
      store.commit('author/SET_ERROR', null);
    };

    const fetchData = async () => {
      try {
        await Promise.all([
          store.dispatch('author/fetchAuthors'),
          store.dispatch('book/fetchBooks')
        ]);
      } catch (err) {
        showError(err.message || 'Lỗi khi tải dữ liệu tác giả');
      }
    };

    onMounted(fetchData);

    return {
      authors,
      loading,
      error,
      searchTerm,
      showBooksModal,
      selectedAuthor,
      authorBooks,
      showAuthorBooks,
      closeBooksModal,
      getAuthorBookCount,
      formatCurrency,
      clearError,
      fetchData
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

/* ── Error & Empty State ─────────────────────────────────── */
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
  margin-bottom: 1.5rem;
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
.empty-state { text-align: center; padding: 3rem; color: var(--c-muted); }

/* ── Search ──────────────────────────────────────────────── */
.search-wrap { position: relative; max-width: 560px; margin-bottom: 2rem; }
.search-icon { position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%); color: var(--c-muted); }
.search-input { width: 100%; padding: 0.85rem 2.8rem; border: 1.5px solid var(--c-border); border-radius: 12px; background: var(--c-surface); outline: none; font-family: var(--font-body); box-shadow: 0 1px 4px rgba(0,0,0,0.02); transition: all var(--trans); }
.search-input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
.search-clear { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--c-muted); cursor: pointer; }

/* ── Card Grid ───────────────────────────────────────────── */
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.info-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 16px; display: flex; flex-direction: column; padding: 1.5rem; transition: transform var(--trans), box-shadow var(--trans); }
.info-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
.info-card__body { flex: 1; display: flex; flex-direction: column; }
.info-card__title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin: 0 0 0.2rem; color: var(--c-text); }
.info-card__code { font-size: 0.8rem; color: var(--c-muted); margin: 0 0 1rem; }
.info-card__meta { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
.meta-row { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.9rem; color: var(--c-text); }
.meta-row i { color: var(--c-primary); width: 16px; margin-top: 4px; }

.btn-primary-custom { width: 100%; padding: 0.75rem; border-radius: 10px; border: none; background: var(--c-primary); color: #fff; font-family: var(--font-body); font-weight: 600; cursor: pointer; transition: background var(--trans); }
.btn-primary-custom:hover { background: var(--c-primary-dk); }

/* ── Modal ───────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; justify-content: center; align-items: center; z-index: 1500; padding: 1rem; backdrop-filter: blur(4px); }
.detail-modal { background: var(--c-surface); border-radius: 20px; width: 100%; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.detail-modal__header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--c-border); }
.detail-modal__title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; margin: 0; }
.modal-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-muted); transition: background var(--trans); }
.modal-close:hover { background: #e2e8f0; }
.detail-modal__body { padding: 1.5rem; overflow-y: auto; }

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th, .custom-table td { padding: 1rem; border-bottom: 1px solid var(--c-border); text-align: left; }
.custom-table th { color: var(--c-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.custom-table td { font-size: 0.95rem; }
.fw-bold { font-weight: 600; color: var(--c-text); }

/* ── Focus ───────────────────────────────────────────────── */
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}
</style>
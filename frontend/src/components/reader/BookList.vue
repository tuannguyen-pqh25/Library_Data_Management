<template>
  <div class="book-list-page">
    <LoadingSpinner :show="loading" />

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div v-if="toastMsg.show" class="app-toast" :class="toastMsg.type === 'success' ? 'app-toast--success' : 'app-toast--error'">
        <i class="fas me-2" :class="toastMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ toastMsg.text }}
      </div>
    </transition>

    <!-- Borrow Cart Drawer / Modal -->
    <transition name="modal-fade">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="borrow-drawer">
          <div class="borrow-drawer__header">
            <h5 class="borrow-drawer__title">
              <i class="fas fa-shopping-basket me-2"></i>Giỏ mượn sách
            </h5>
            <button class="borrow-drawer__close" @click="closeConfirmModal" aria-label="Đóng">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="borrow-drawer__body">
            <p class="borrow-drawer__note">
              <i class="fas fa-info-circle me-1 text-primary"></i>
              Sau khi gửi, yêu cầu sẽ ở trạng thái <strong>Chờ duyệt</strong> và cần chờ quản lý xác nhận.
            </p>

            <ul class="cart-list">
              <li
                v-for="item in borrowCart"
                :key="`${item.maSach}:${item.maTacGia}:${item.maTheLoai}`"
                class="cart-item"
              >
                <div class="cart-item__cover">
                  <img
                    :src="getImageUrl(item.imagePath)"
                    :alt="item.tenSach"
                    class="cart-item__img"
                    @error="onImgError"
                  />
                </div>
                <div class="cart-item__info">
                  <p class="cart-item__name">{{ item.tenSach }}</p>
                  <p class="cart-item__stock">Còn lại: {{ item.soLuongHienCo }} quyển</p>
                </div>
                <div class="cart-item__qty">
                  <label class="qty-label">Số lượng</label>
                  <div class="qty-control">
                    <button
                      class="qty-btn"
                      @click="changeQty(item, -1)"
                      :disabled="item.soLuongSachMuon <= 1"
                      aria-label="Giảm"
                    >−</button>
                    <input
                      type="number"
                      class="qty-input"
                      v-model.number="item.soLuongSachMuon"
                      :min="1"
                      :max="item.soLuongHienCo"
                      @change="validateQuantity(item)"
                    />
                    <button
                      class="qty-btn"
                      @click="changeQty(item, 1)"
                      :disabled="item.soLuongSachMuon >= item.soLuongHienCo"
                      aria-label="Tăng"
                    >+</button>
                  </div>
                  <p v-if="!isItemValid(item)" class="qty-error">Số lượng không hợp lệ</p>
                </div>
                <button class="cart-item__remove" @click="removeFromCart(item)" aria-label="Xóa">
                  <i class="fas fa-trash-alt"></i>
                </button>

              </li>
            </ul>

            <div v-if="!borrowCart.length" class="cart-empty">
              <i class="fas fa-shopping-basket fa-2x mb-2 opacity-40"></i>
              <p>Giỏ mượn đang trống</p>
            </div>
          </div>

          <div class="borrow-drawer__footer">
            <button class="btn-outline-secondary-custom" @click="closeConfirmModal">Hủy</button>
            <button
              class="btn-primary-custom"
              @click="handleConfirmBorrow"
              :disabled="loading || !isValidCart || !borrowCart.length"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
              <span v-else><i class="fas fa-paper-plane me-2"></i></span>
              {{ loading ? 'Đang gửi...' : 'Gửi yêu cầu mượn' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Book Detail Modal -->
    <transition name="modal-fade">
      <div v-if="selectedBook" class="modal-overlay modal-overlay--center" @click.self="selectedBook = null">
        <div class="book-detail-modal">
          <button class="modal-close" @click="selectedBook = null" aria-label="Đóng"><i class="fas fa-times"></i></button>
          <div class="book-detail-content">
            <div class="book-detail-cover">
              <img :src="getImageUrl(selectedBook.imagePath)" :alt="selectedBook.tenSach" @error="onImgError" />
            </div>
            <div class="book-detail-info">
              <span class="category-tag mb-2">{{ selectedBook.TheLoai?.tenTheLoai || 'Khác' }}</span>
              <h3 class="book-detail-title">{{ selectedBook.tenSach }}</h3>
              <p class="book-detail-author"><i class="fas fa-pen-nib me-2"></i>{{ selectedBook.TacGia?.tenTacGia || 'Tác giả không rõ' }}</p>
              
              <div class="detail-grid mt-4">
                <div class="detail-item">
                  <label>Nhà xuất bản</label>
                  <span>{{ selectedBook.NhaXuatBan?.tenNXB || '—' }}</span>
                </div>
                <div class="detail-item">
                  <label>Năm xuất bản</label>
                  <span>{{ selectedBook.namXuatBan || '—' }}</span>
                </div>
                <div class="detail-item">
                  <label>Đơn giá</label>
                  <span>{{ selectedBook.donGia ? selectedBook.donGia.toLocaleString('vi-VN') + ' đ' : '—' }}</span>
                </div>
                <div class="detail-item">
                  <label>Số lượng</label>
                  <span>Còn {{ selectedBook.soLuongHienCo }} quyển</span>
                </div>
                <div class="detail-item detail-item--full">
                  <label>Nguồn gốc</label>
                  <span>{{ selectedBook.nguonGoc || 'Không rõ' }}</span>
                </div>
              </div>

              <div class="book-detail-actions mt-4">
                <button
                  class="btn-primary-custom w-100"
                  style="padding: 0.8rem; font-size: 1rem;"
                  @click="addToBorrowCart(selectedBook); selectedBook = null"
                  :disabled="selectedBook.soLuongHienCo === 0 || loading || isBookInCart(selectedBook)"
                >
                  <i class="fas me-2" :class="isBookInCart(selectedBook) ? 'fa-check' : selectedBook.soLuongHienCo === 0 ? 'fa-ban' : 'fa-plus'"></i>
                  {{ isBookInCart(selectedBook) ? 'Đã có trong giỏ mượn' : selectedBook.soLuongHienCo === 0 ? 'Sách đã hết' : 'Thêm vào giỏ mượn' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Page Header -->
    <div class="book-list-header">
      <div class="book-list-header__left">
        <h2 class="book-list-header__title">Danh sách sách</h2>
        <p class="book-list-header__sub">Khám phá kho sách phong phú của thư viện</p>
      </div>
      <div class="book-list-header__right">
        <button
          class="cart-badge-btn"
          :class="{ 'cart-badge-btn--active': borrowCart.length > 0 }"
          @click="borrowCart.length && showBorrowCart()"
          :disabled="!borrowCart.length || loading"
          id="open-cart-btn"
        >
          <i class="fas fa-basket-shopping me-2"></i>
          <span v-if="borrowCart.length">Giỏ mượn ({{ borrowCart.length }})</span>
          <span v-else>Giỏ mượn trống</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="error-alert">
      <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
      <button @click="clearError" class="error-alert__close">×</button>
    </div>

    <!-- Filters & Search Bar -->
    <div class="search-row">
      <div class="search-filters">
        <div class="search-wrap flex-grow-1">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            v-model="searchTerm"
            placeholder="Tìm theo tên sách, tác giả, NXB..."
            id="book-search-input"
          />
          <button v-if="searchTerm" class="search-clear" @click="searchTerm = ''" aria-label="Xóa tìm kiếm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="category-filter-wrap">
          <i class="fas fa-filter category-icon"></i>
          <select class="category-select" v-model="selectedCategory">
            <option value="">Tất cả thể loại</option>
            <option v-for="cat in categories" :key="cat.maTheLoai" :value="cat.maTheLoai">
              {{ cat.tenTheLoai }}
            </option>
          </select>
        </div>
        <div class="category-filter-wrap">
          <i class="fas fa-user category-icon"></i>
          <select class="category-select" v-model="selectedAuthor">
            <option value="">Tất cả tác giả</option>
            <option v-for="author in authors" :key="author.maTacGia" :value="author.maTacGia">
              {{ author.tenTacGia }}
            </option>
          </select>
        </div>
        <div class="category-filter-wrap">
          <i class="fas fa-building category-icon"></i>
          <select class="category-select" v-model="selectedPublisher">
            <option value="">Tất cả NXB</option>
            <option v-for="pub in publishers" :key="pub.maNXB" :value="pub.maNXB">
              {{ pub.tenNXB }}
            </option>
          </select>
        </div>
        <div class="category-filter-wrap">
          <i class="fas fa-sort category-icon"></i>
          <select class="category-select" v-model="sortOption">
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Empty Search Result -->
    <div v-if="!books.length && !loading" class="empty-state">
      <i class="fas fa-book-open fa-3x mb-3 opacity-30"></i>
      <h5>Không tìm thấy sách</h5>
      <p class="text-muted">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
      <button v-if="searchTerm || selectedCategory || selectedAuthor || selectedPublisher" class="btn-outline-secondary-custom mt-2" @click="clearFilters">Xóa bộ lọc</button>
    </div>

    <!-- Book Grid -->
    <div v-else class="book-grid">
      <div
        v-for="book in books"
        :key="`${book.maSach}:${book.maTacGia}:${book.maTheLoai}`"
        class="book-card"
        :class="{ 'book-card--out': book.soLuongHienCo === 0 }"
      >
        <!-- Cover -->
        <div class="book-card__cover-wrap" @click="selectedBook = book" title="Nhấn để xem chi tiết">
          <img
            :src="getImageUrl(book.imagePath)"
            :alt="book.tenSach"
            class="book-card__cover"
            @error="onImgError"
          />
          <div class="book-card__overlay">
            <span class="stock-badge" :class="book.soLuongHienCo > 0 ? 'stock-badge--ok' : 'stock-badge--out'">
              <i class="fas" :class="book.soLuongHienCo > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
              {{ book.soLuongHienCo > 0 ? `${book.soLuongHienCo} quyển` : 'Hết sách' }}
            </span>
          </div>
          <div class="book-card__hover-view">
            <span>Xem chi tiết</span>
          </div>
        </div>

        <!-- Body -->
        <div class="book-card__body">
          <!-- Category tag -->
          <span class="category-tag">{{ book.TheLoai?.tenTheLoai || 'Khác' }}</span>

          <h6 class="book-card__title" :title="book.tenSach" @click="selectedBook = book">{{ book.tenSach }}</h6>

          <p class="book-card__author">
            <i class="fas fa-pen-nib me-1"></i>
            {{ book.TacGia?.tenTacGia || 'Tác giả không rõ' }}
          </p>

          <div class="book-card__meta">
            <span class="meta-item" :title="book.NhaXuatBan?.tenNXB">
              <i class="fas fa-building me-1 text-muted"></i>{{ book.NhaXuatBan?.tenNXB || '—' }}
            </span>
            <span class="meta-item">
              <i class="fas fa-calendar me-1 text-muted"></i>{{ book.namXuatBan }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="book-card__footer">
          <button
            class="btn-add-to-cart"
            :class="{
              'btn-add-to-cart--added': isBookInCart(book),
              'btn-add-to-cart--out': book.soLuongHienCo === 0,
            }"
            @click="addToBorrowCart(book)"
            :disabled="book.soLuongHienCo === 0 || loading || isBookInCart(book)"
            :id="`add-cart-${book.maSach}`"
          >
            <i
              class="fas me-2"
              :class="isBookInCart(book) ? 'fa-check' : book.soLuongHienCo === 0 ? 'fa-ban' : 'fa-plus'"
            ></i>
            {{ isBookInCart(book) ? 'Đã thêm' : book.soLuongHienCo === 0 ? 'Hết sách' : 'Thêm vào giỏ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-wrap mt-5 d-flex justify-content-center align-items-center gap-2">
      <button class="btn-outline-secondary-custom" :disabled="currentPage === 1" @click="currentPage--">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="fw-medium mx-3">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button class="btn-outline-secondary-custom" :disabled="currentPage === totalPages" @click="currentPage++">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showSuccess, showError } from '@/utils/notifications';

const DEFAULT_BOOK_IMG = '/uploads/default-book.jpg';

export default {
  name: 'BookList',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const error = ref(null);
    const loading = ref(false);
    
    // Filters
    const searchTerm = ref('');
    const selectedCategory = ref('');
    const selectedAuthor = ref('');
    const selectedPublisher = ref('');
    const sortOption = ref('name_asc');

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // Cart & Modal state
    const borrowCart = ref(JSON.parse(localStorage.getItem('readerBorrowCart') || '[]'));
    watch(borrowCart, (val) => {
      localStorage.setItem('readerBorrowCart', JSON.stringify(val));
    }, { deep: true });
    const showConfirmModal = ref(false);
    const selectedBook = ref(null);

    const API_URL = import.meta.env.VITE_API_IMAGE_URL || '';

    const toastMsg = ref({ show: false, text: '', type: 'success' });

    const showToast = (text, type = 'success') => {
      toastMsg.value = { show: true, text, type };
      setTimeout(() => { toastMsg.value.show = false; }, 4500);
    };

    const getImageUrl = (imagePath) => {
      if (!imagePath) return `${API_URL}/${DEFAULT_BOOK_IMG.replace(/^\//, '')}`;
      if (imagePath.startsWith('http')) return imagePath;
      return `${API_URL}/${imagePath.replace(/^\//, '')}`;
    };

    const onImgError = (e) => {
      e.target.src = `${API_URL}/${DEFAULT_BOOK_IMG.replace(/^\//, '')}`;
    };

    const categories = computed(() => store.getters['category/allCategories'] || []);
    const authors = computed(() => store.getters['author/allAuthors'] || []);
    const publishers = computed(() => store.getters['publisher/allPublishers'] || []);
    const allBooks = computed(() => store.getters['book/allBooks'] || []);
    
    const filteredAndSortedBooks = computed(() => {
      let result = [...allBooks.value];

      if (selectedCategory.value) {
        result = result.filter(b => b.maTheLoai === selectedCategory.value);
      }
      if (selectedAuthor.value) {
        result = result.filter(b => b.maTacGia === selectedAuthor.value);
      }
      if (selectedPublisher.value) {
        result = result.filter(b => b.maNXB === selectedPublisher.value);
      }

      if (searchTerm.value) {
        const s = searchTerm.value.toLowerCase().trim();
        result = result.filter(b =>
          String(b.maSach).toLowerCase().includes(s) ||
          b.tenSach.toLowerCase().includes(s) ||
          (b.NhaXuatBan?.tenNXB?.toLowerCase().includes(s) ?? false) ||
          (b.TacGia?.tenTacGia?.toLowerCase().includes(s) ?? false) ||
          b.nguonGoc?.toLowerCase().includes(s)
        );
      }

      switch (sortOption.value) {
        case 'name_asc':
          result.sort((a, b) => a.tenSach.localeCompare(b.tenSach));
          break;
        case 'name_desc':
          result.sort((a, b) => b.tenSach.localeCompare(a.tenSach));
          break;
        case 'newest':
          result.sort((a, b) => (b.namXuatBan || 0) - (a.namXuatBan || 0));
          break;
        case 'price_asc':
          result.sort((a, b) => (a.donGia || 0) - (b.donGia || 0));
          break;
        case 'price_desc':
          result.sort((a, b) => (b.donGia || 0) - (a.donGia || 0));
          break;
      }

      return result;
    });

    const totalPages = computed(() => Math.ceil(filteredAndSortedBooks.value.length / itemsPerPage.value) || 1);
    
    const books = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      return filteredAndSortedBooks.value.slice(start, start + itemsPerPage.value);
    });

    // Reset pagination when filters change
    watch([searchTerm, selectedCategory, selectedAuthor, selectedPublisher, sortOption], () => {
      currentPage.value = 1;
    });

    const clearFilters = () => {
      searchTerm.value = '';
      selectedCategory.value = '';
      selectedAuthor.value = '';
      selectedPublisher.value = '';
      sortOption.value = 'name_asc';
      currentPage.value = 1;
    };

    // --- Cart validation ---
    const isItemValid = (item) =>
      Number.isInteger(item.soLuongSachMuon) &&
      item.soLuongSachMuon >= 1 &&
      item.soLuongSachMuon <= item.soLuongHienCo;

    const isValidCart = computed(() => borrowCart.value.length > 0 && borrowCart.value.every(isItemValid));

    const isBookInCart = (book) =>
      borrowCart.value.some(
        i => i.maSach === book.maSach && i.maTacGia === book.maTacGia && i.maTheLoai === book.maTheLoai
      );

    const addToBorrowCart = (book) => {
      if (isBookInCart(book)) return; // Không thêm trùng
      borrowCart.value.push({ ...book, soLuongSachMuon: 1 });
      showToast(`Đã thêm "${book.tenSach}" vào giỏ mượn`, 'success');
    };

    const removeFromCart = (item) => {
      borrowCart.value = borrowCart.value.filter(
        i => !(i.maSach === item.maSach && i.maTacGia === item.maTacGia && i.maTheLoai === item.maTheLoai)
      );
    };

    const changeQty = (item, delta) => {
      const next = item.soLuongSachMuon + delta;
      item.soLuongSachMuon = Math.max(1, Math.min(item.soLuongHienCo, next));
    };

    const validateQuantity = (item) => {
      let v = parseInt(item.soLuongSachMuon, 10);
      if (isNaN(v) || v < 1) v = 1;
      if (v > item.soLuongHienCo) v = item.soLuongHienCo;
      item.soLuongSachMuon = v;
    };

    const fetchData = async () => {
      try {
        loading.value = true;
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('author/fetchAuthors'),
          store.dispatch('category/fetchCategories'),
        ]);
      } catch (err) {
        error.value = err.message;
        showError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        loading.value = false;
      }
    };

    const showBorrowCart = () => { showConfirmModal.value = true; };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
    };

    const handleConfirmBorrow = async () => {
      if (!isValidCart.value) return;
      try {
        loading.value = true;
        const chiTiet = borrowCart.value.map(item => ({
          maSach: item.maSach,
          maTacGia: item.maTacGia,
          maTheLoai: item.maTheLoai,
          soLuongSachMuon: item.soLuongSachMuon,
        }));
        await store.dispatch('borrow/createBorrowRequest', { chiTiet });
        closeConfirmModal();
        borrowCart.value = [];
        showToast('Yêu cầu mượn đã được gửi. Trạng thái: Chờ duyệt — vui lòng chờ quản lý xác nhận.', 'success');
        await fetchData();
      } catch (err) {
        showToast(err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu', 'error');
      } finally {
        loading.value = false;
      }
    };

    const clearError = () => {
      error.value = null;
      store.commit('book/SET_ERROR', null);
    };

    onMounted(fetchData);

    return {
      books, categories, authors, publishers, loading, error, searchTerm, selectedCategory, selectedAuthor, selectedPublisher, sortOption, clearFilters,
      currentPage, totalPages, itemsPerPage,
      borrowCart, showConfirmModal, selectedBook,
      toastMsg, showToast,
      getImageUrl, onImgError,
      isValidCart, isItemValid, isBookInCart,
      addToBorrowCart, removeFromCart, changeQty, validateQuantity,
      showBorrowCart, closeConfirmModal, handleConfirmBorrow, clearError,
      API_URL,
    };
  },
};
</script>

<style scoped>
/* ── Imports ─────────────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── CSS Variables ───────────────────────────────────────── */
.book-list-page {
  --c-primary:      #2563eb;
  --c-primary-dk:   #1d4ed8;
  --c-success:      #16a34a;
  --c-danger:       #dc2626;
  --c-bg:           #f8fafc;
  --c-surface:      #ffffff;
  --c-border:       #e2e8f0;
  --c-text:         #0f172a;
  --c-muted:        #64748b;
  --c-overlay:      rgba(15, 23, 42, 0.65);
  --font-display:   'Playfair Display', Georgia, serif;
  --font-body:      'Outfit', system-ui, sans-serif;
  --radius-card:    18px;
  --radius-btn:     999px;
  --shadow-card:    0 4px 20px rgba(15, 23, 42, 0.07);
  --shadow-card-h:  0 16px 36px rgba(15, 23, 42, 0.13);
  --trans:          0.2s ease;

  font-family: var(--font-body);
  color: var(--c-text);
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
  background: var(--c-bg);
}

/* ── Toast ───────────────────────────────────────────────── */
.app-toast {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 2000;
  padding: 0.9rem 1.4rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  backdrop-filter: blur(8px);
}
.app-toast--success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
.app-toast--error   { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }
.toast-slide-enter-active,
.toast-slide-leave-active { transition: all 0.35s ease; }
.toast-slide-enter-from,
.toast-slide-leave-to   { opacity: 0; transform: translateY(-12px); }

/* ── Header ──────────────────────────────────────────────── */
.book-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.8rem;
}
.book-list-header__title {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 0.2rem;
}
.book-list-header__sub { color: var(--c-muted); margin: 0; font-size: 0.95rem; }

/* ── Cart Button ─────────────────────────────────────────── */
.cart-badge-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-btn);
  border: 2px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-muted);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--trans);
}
.cart-badge-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.cart-badge-btn--active {
  border-color: var(--c-primary);
  background: var(--c-primary);
  color: #fff;
  box-shadow: 0 4px 14px rgba(37,99,235,0.35);
}
.cart-badge-btn--active:hover { background: var(--c-primary-dk); }

/* ── Error Alert ─────────────────────────────────────────── */
.error-alert {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.error-alert__close { margin-left: auto; background: none; border: none; font-size: 1.1rem; color: inherit; cursor: pointer; }

/* ── Search & Filters ────────────────────────────────────── */
.search-row { margin-bottom: 2.5rem; }
.search-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 800px;
}
.search-wrap {
  position: relative;
  min-width: 250px;
}
.search-icon {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-muted);
  font-size: 0.9rem;
}
.search-input {
  width: 100%;
  padding: 0.85rem 2.8rem 0.85rem 2.8rem;
  border: 1.5px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-surface);
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--c-text);
  outline: none;
  transition: border-color var(--trans), box-shadow var(--trans);
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.search-input:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
}
.search-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--c-muted);
  cursor: pointer;
  font-size: 0.85rem;
}
.category-filter-wrap {
  position: relative;
  min-width: 220px;
}
.category-icon {
  position: absolute;
  left: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-muted);
  font-size: 0.9rem;
  pointer-events: none;
}
.category-select {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  border: 1.5px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-surface);
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--c-text);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  transition: border-color var(--trans), box-shadow var(--trans);
}
.category-select:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
}

/* ── Empty State ─────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--c-muted);
}
.empty-state h5 { color: var(--c-text); font-weight: 600; margin-bottom: 0.4rem; }

/* ── Book Grid ───────────────────────────────────────────── */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.8rem;
}

/* ── Book Card ───────────────────────────────────────────── */
.book-card {
  background: var(--c-surface);
  border-radius: var(--radius-card);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--trans), box-shadow var(--trans);
}
.book-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card-h);
}
.book-card--out { opacity: 0.72; }

.book-card__cover-wrap {
  position: relative;
  padding-top: 135%; /* Standard book aspect ratio (3:4) */
  overflow: hidden;
  background: #f1f5f9;
  cursor: pointer;
}
.book-card__cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease, filter 0.4s ease;
}
.book-card:hover .book-card__cover { transform: scale(1.05); filter: brightness(0.9); }

.book-card__overlay {
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  z-index: 2;
}
.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}
.stock-badge--ok  { background: rgba(22,163,74,0.88); color: #fff; }
.stock-badge--out { background: rgba(220,38,38,0.88); color: #fff; }

.book-card__hover-view {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  opacity: 0;
  transition: opacity var(--trans);
  z-index: 1;
}
.book-card__cover-wrap:hover .book-card__hover-view { opacity: 1; }
.book-card__hover-view span {
  background: rgba(255,255,255,0.9);
  color: var(--c-text);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  transform: translateY(10px);
  transition: transform var(--trans);
}
.book-card__cover-wrap:hover .book-card__hover-view span { transform: translateY(0); }

.book-card__body {
  padding: 1.25rem 1.25rem 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.category-tag {
  display: inline-block;
  background: #eff6ff;
  color: var(--c-primary);
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  align-self: flex-start;
  margin-bottom: 0.75rem;
}
.book-card__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--c-text);
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  line-height: 1.3;
}
.book-card__title:hover { color: var(--c-primary); }
.book-card__author {
  font-size: 0.85rem;
  color: var(--c-muted);
  margin: 0 0 0.75rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.book-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px dashed #e2e8f0;
}
.meta-item { font-size: 0.8rem; color: var(--c-muted); display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.book-card__footer {
  padding: 0 1.25rem 1.25rem;
}
.btn-add-to-cart {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--trans);
  background: var(--c-primary);
  color: #fff;
}
.btn-add-to-cart:hover:not(:disabled) {
  background: var(--c-primary-dk);
  box-shadow: 0 4px 12px rgba(37,99,235,0.35);
}
.btn-add-to-cart--added {
  background: var(--c-success);
  cursor: not-allowed;
}
.btn-add-to-cart--out {
  background: #94a3b8;
  cursor: not-allowed;
}
.btn-add-to-cart:disabled { opacity: 0.8; }

/* ── Modal Overlay (Shared) ──────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--c-overlay);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 1500;
  backdrop-filter: blur(5px);
}
.modal-overlay--center {
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-active .borrow-drawer,
.modal-fade-leave-active .borrow-drawer { transition: transform 0.3s ease; }
.modal-fade-enter-from .borrow-drawer,
.modal-fade-leave-to .borrow-drawer { transform: translateX(100%); }

.modal-fade-enter-active .book-detail-modal,
.modal-fade-leave-active .book-detail-modal { transition: transform 0.3s ease, opacity 0.3s ease; }
.modal-fade-enter-from .book-detail-modal,
.modal-fade-leave-to .book-detail-modal { transform: scale(0.95) translateY(10px); opacity: 0; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

/* ── Book Detail Modal ───────────────────────────────────── */
.book-detail-modal {
  background: var(--c-surface);
  border-radius: 20px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: rgba(0,0,0,0.05);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: var(--c-text);
  z-index: 10;
  transition: background 0.2s;
}
.modal-close:hover { background: rgba(0,0,0,0.1); }
.book-detail-content {
  display: flex;
  flex-direction: row;
  overflow-y: auto;
}
.book-detail-cover {
  flex: 0 0 40%;
  background: #f1f5f9;
  display: flex;
  padding: 2rem;
  align-items: center;
  justify-content: center;
}
.book-detail-cover img {
  width: 100%;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.book-detail-info {
  flex: 1;
  padding: 2.5rem 2rem 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
}
.book-detail-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--c-text);
  line-height: 1.2;
}
.book-detail-author {
  font-size: 1.1rem;
  color: var(--c-muted);
  font-weight: 500;
  margin: 0;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-top: 1.5rem;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--c-border);
}
.detail-item { display: flex; flex-direction: column; gap: 0.2rem; }
.detail-item--full { grid-column: 1 / -1; }
.detail-item label { font-size: 0.8rem; font-weight: 600; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.detail-item span { font-size: 0.95rem; font-weight: 500; color: var(--c-text); }

/* ── Borrow Drawer ───────────────────────────────────────── */
.borrow-drawer {
  width: min(480px, 100vw);
  background: var(--c-surface);
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -8px 0 40px rgba(0,0,0,0.18);
}
.borrow-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}
.borrow-drawer__title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--c-text);
}
.borrow-drawer__close {
  background: #f1f5f9;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  color: var(--c-muted);
  font-size: 0.9rem;
  transition: background var(--trans);
}
.borrow-drawer__close:hover { background: #e2e8f0; }

.borrow-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}
.borrow-drawer__note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  color: #1e40af;
  margin-bottom: 1rem;
}

.borrow-drawer__footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--c-border);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* ── Cart List ───────────────────────────────────────────── */
.cart-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }

.cart-item {
  display: grid;
  grid-template-columns: 56px 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: #f8fafc;
}
.cart-item__cover { width: 56px; height: 72px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
.cart-item__img   { width: 100%; height: 100%; object-fit: cover; }
.cart-item__info  { overflow: hidden; }
.cart-item__name  { font-weight: 600; font-size: 0.85rem; margin: 0 0 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-item__stock { font-size: 0.75rem; color: var(--c-muted); margin: 0; }

.cart-item__qty { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
.qty-label { font-size: 0.7rem; color: var(--c-muted); white-space: nowrap; }
.qty-control { display: flex; align-items: center; border: 1px solid var(--c-border); border-radius: 8px; overflow: hidden; }
.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f1f5f9;
  color: var(--c-text);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background var(--trans);
}
.qty-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
.qty-btn:hover:not(:disabled) { background: #e2e8f0; }
.qty-input {
  width: 40px;
  border: none;
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.2rem 0;
  outline: none;
  background: transparent;
  -moz-appearance: textfield;
}
.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.qty-error { font-size: 0.7rem; color: var(--c-danger); margin: 0; }

.cart-item__remove {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color var(--trans);
  padding: 0.3rem;
}
.cart-item__remove:hover { color: var(--c-danger); }

.cart-empty { text-align: center; padding: 2.5rem; color: var(--c-muted); }

/* ── Buttons ─────────────────────────────────────────────── */
.btn-primary-custom {
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-btn);
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--trans);
}
.btn-primary-custom:hover:not(:disabled) { background: var(--c-primary-dk); box-shadow: 0 4px 14px rgba(37,99,235,0.35); }
.btn-primary-custom:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-outline-secondary-custom {
  padding: 0.65rem 1.2rem;
  border-radius: var(--radius-btn);
  border: 1.5px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--trans);
}
.btn-outline-secondary-custom:hover { background: #f1f5f9; border-color: #cbd5e1; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .book-detail-content { flex-direction: column; }
  .book-detail-cover { padding: 1.5rem; }
  .book-detail-cover img { max-height: 250px; }
  .book-detail-info { padding: 1.5rem; }
}
@media (max-width: 640px) {
  .book-list-page { padding: 1.25rem 0.75rem 3rem; }
  .book-list-header { flex-direction: column; align-items: flex-start; }
  .search-filters { flex-direction: column; }
  .book-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
  .cart-item { grid-template-columns: 48px 1fr auto auto; }
}
</style>
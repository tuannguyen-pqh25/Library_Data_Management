<template>
  <div class="book-list">
    <LoadingSpinner :show="loading" />

    <h2>Danh sách sách</h2>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showConfirmModal }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận mượn sách</h5>
            <button type="button" class="btn-close" @click="closeConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>Bạn muốn mượn các sách sau?</p>
            <ul>
              <li v-for="item in borrowCart" :key="item.maSach">
                {{ item.tenSach }} - Số lượng: 
                <input 
                  type="number" 
                  v-model.number="item.soLuongSachMuon" 
                  min="1" 
                  :max="item.soLuongHienCo" 
                  class="form-control d-inline-block w-auto"
                  @input="validateQuantity(item)"
                >
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeConfirmModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="handleConfirmBorrow" :disabled="loading || !isValidCart">
              {{ loading ? 'Đang xử lý...' : 'Mượn sách' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showConfirmModal"></div>

    <!-- Tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchTerm"
            placeholder="Tìm kiếm theo tên sách, mã sách, tên NXB, tên tác giả, thể loại"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-primary" @click="showBorrowCart" :disabled="!borrowCart.length || loading">
          {{ borrowCart.length ? `Xem giỏ mượn (${borrowCart.length})` : 'Giỏ mượn trống' }}
        </button>
      </div>
    </div>

    <!-- Danh sách sách -->
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="book in books" :key="book.maSach">
        <div class="card h-100">
          <div class="card-img-top" style="height: 200px; overflow: hidden;">
            <img :src="`${API_URL}/${book.imagePath || 'Uploads/default-book.jpg'}`" style="width: 100%; height: 100%; object-fit: cover;" alt="Book cover">
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ book.tenSach }}</h5>
            <p class="card-text">
              <small class="text-muted">Mã sách: {{ book.maSach }}</small>
            </p>
            <p class="card-text">
              <strong>Nhà xuất bản:</strong> {{ book.NhaXuatBan?.tenNXB || 'Chưa có NXB' }}
            </p>
            <p class="card-text">
              <strong>Tác giả:</strong> {{ book.TacGia?.tenTacGia || 'Chưa có tác giả' }}
            </p>
            <p class="card-text">
              <strong>Thể loại:</strong> {{ book.TheLoai?.tenTheLoai || 'Chưa có thể loại' }}
            </p>
            <p class="card-text">
              <strong>Năm xuất bản:</strong> {{ book.namXuatBan }}
            </p>
            <p class="card-text">
              <strong>Nguồn gốc:</strong> {{ book.nguonGoc }}
            </p>
            <p class="card-text">
              <strong>Số quyển còn:</strong> {{ book.soLuongHienCo }}
            </p>
          </div>
          <div class="card-footer">
            <button 
              class="btn btn-primary"
              @click="addToBorrowCart(book)"
              :disabled="book.soLuongHienCo === 0 || loading || isBookInCart(book.maSach)"
            >
              {{ isBookInCart(book.maSach) ? 'Đã thêm' : 'Thêm vào giỏ mượn' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showSuccess, showError } from '@/utils/notifications';

export default {
  name: 'BookList',
  components: { LoadingSpinner },
  setup() {
    const { proxy } = getCurrentInstance();
    const error = ref(null);
    const loading = ref(false);
    const searchTerm = ref('');
    const borrowCart = ref([]);
    const showConfirmModal = ref(false);
    const store = useStore();
    const API_URL = import.meta.env.VITE_API_IMAGE_URL;

    const allBooks = computed(() => store.getters['book/allBooks']);
    const books = computed(() => {
      if (!searchTerm.value) return allBooks.value;
      const search = searchTerm.value.toLowerCase().trim();
      return allBooks.value.filter(book => 
        String(book.maSach).toLowerCase().includes(search) ||
        book.tenSach.toLowerCase().includes(search) ||
        (book.NhaXuatBan?.tenNXB?.toLowerCase().includes(search) || false) ||
        (book.TacGia?.tenTacGia?.toLowerCase().includes(search) || false) ||
        (book.TheLoai?.tenTheLoai?.toLowerCase().includes(search) || false) ||
        book.nguonGoc.toLowerCase().includes(search)
      );
    });

    const isValidCart = computed(() => {
      return borrowCart.value.every(item => item.soLuongSachMuon > 0 && item.soLuongSachMuon <= item.soLuongHienCo);
    });

    const fetchData = async () => {
      try {
        loading.value = true;
        console.log('Fetching books, publishers, authors, and categories...');
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('author/fetchAuthors'),
          store.dispatch('category/fetchCategories')
        ]);
        console.log('Data fetched successfully', {
          books: allBooks.value,
          publishers: store.getters['publisher/allPublishers'],
          authors: store.getters['author/allAuthors'],
          categories: store.getters['category/allCategories']
        });
      } catch (err) {
        error.value = err.message;
        console.error('Error fetching data:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        showError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        loading.value = false;
      }
    };

    const isBookInCart = (bookId) => {
      return borrowCart.value.some(item => item.maSach === bookId);
    };

    const addToBorrowCart = (book) => {
      if (!isBookInCart(book.maSach)) {
        borrowCart.value.push({
          ...book,
          soLuongSachMuon: 1
        });
      }
    };

    const validateQuantity = (item) => {
      if (item.soLuongSachMuon < 1) {
        item.soLuongSachMuon = 1;
      }
      if (item.soLuongSachMuon > item.soLuongHienCo) {
        item.soLuongSachMuon = item.soLuongHienCo;
      }
    };

    const showBorrowCart = () => {
      showConfirmModal.value = true;
    };

    const closeConfirmModal = () => {
      showConfirmModal.value = false;
      borrowCart.value = [];
    };

    const handleConfirmBorrow = async () => {
      try {
        loading.value = true;
        const chiTiet = borrowCart.value.map(item => ({
          maSach: item.maSach,
          soLuongSachMuon: item.soLuongSachMuon
        }));
        await store.dispatch('borrow/createBorrowRequest', { chiTiet });
        proxy.$toast.show('Yêu cầu mượn sách đã được gửi. Vui lòng chờ quản lý duyệt!', 'success');
        closeConfirmModal();
        await fetchData();
      } catch (error) {
        proxy.$toast.show(error.response?.data?.message || 'Có lỗi xảy ra', 'danger');
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
      books,
      loading,
      error,
      searchTerm,
      borrowCart,
      showConfirmModal,
      closeConfirmModal,
      handleConfirmBorrow,
      addToBorrowCart,
      showBorrowCart,
      isBookInCart,
      validateQuantity,
      isValidCart,
      clearError,
      API_URL
    };
  }
};
</script>

<style scoped>
.card-title {
  font-size: 1.1rem;
}
.card-footer {
  background-color: transparent;
  border-top: none;
  padding-top: 0;
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
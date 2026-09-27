<template>
  <div class="category-list">
    <LoadingSpinner :show="loading" />

    <h2>Danh sách thể loại</h2>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Tìm kiếm -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchTerm"
            placeholder="Tìm kiếm thể loại theo tên hoặc mã thể loại"
          >
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Danh sách thể loại -->
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col" v-for="category in categories" :key="category.maTheLoai">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ category.tenTheLoai }}</h5>
            <p class="card-text">
              <small class="text-muted">Mã thể loại: {{ category.maTheLoai }}</small>
            </p>
            <p class="card-text">
              <strong>Số sách:</strong> {{ category.soLuongSach || 0 }}
            </p>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" @click="showCategoryBooks(category)">
              Xem danh sách sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem sách của thể loại -->
    <div class="modal" tabindex="-1" :class="{ 'd-block': showBooksModal }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sách thuộc thể loại {{ selectedCategory?.tenTheLoai }}</h5>
            <button type="button" class="btn-close" @click="closeBooksModal"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Năm xuất bản</th>
                    <th>Số quyển</th>
                    <th>Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in categoryBooks" :key="book.maSach">
                    <td>{{ book.maSach }}</td>
                    <td>{{ book.tenSach }}</td>
                    <td>{{ book.namXuatBan }}</td>
                    <td>{{ book.soQuyen }}</td>
                    <td>{{ formatCurrency(book.donGia) }}</td>
                  </tr>
                  <tr v-if="categoryBooks.length === 0">
                    <td colspan="5" class="text-center">Không có sách nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showBooksModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';

export default {
  name: 'CategoryList',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const searchTerm = ref('');
    const showBooksModal = ref(false);
    const selectedCategory = ref(null);

    const loading = computed(() => store.getters['category/isLoading']);
    const error = computed(() => store.getters['category/error']);
    const allCategories = computed(() => store.getters['category/allCategories'] || []);
    const allBooks = computed(() => store.getters['book/allBooks'] || []);

    const categories = computed(() => {
      if (!searchTerm.value) return allCategories.value;
      const search = searchTerm.value.toLowerCase();
      return allCategories.value.filter(cat =>
        cat.tenTheLoai.toLowerCase().includes(search) ||
        String(cat.maTheLoai).toLowerCase().includes(search)
      );
    });

    const categoryBooks = computed(() => {
      if (!selectedCategory.value) return [];
      return allBooks.value.filter(book =>
        book.maTheLoai === selectedCategory.value.maTheLoai
      );
    });

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    };

    const showCategoryBooks = (category) => {
      selectedCategory.value = category;
      showBooksModal.value = true;
    };

    const closeBooksModal = () => {
      showBooksModal.value = false;
      selectedCategory.value = null;
    };

    const clearError = () => {
      store.commit('category/SET_ERROR', null);
    };

    onMounted(async () => {
      try {
        console.log('Fetching categories and books...');
        await Promise.all([
          store.dispatch('category/fetchCategories'),
          store.dispatch('book/fetchBooks')
        ]);
        console.log('Categories fetched:', allCategories.value);
        console.log('Books fetched:', allBooks.value);
      } catch (error) {
        console.error('Error fetching data:', error);
        showError(error.response?.data?.message || error.message);
      }
    });

    return {
      categories,
      loading,
      error,
      searchTerm,
      showBooksModal,
      selectedCategory,
      categoryBooks,
      clearError,
      showCategoryBooks,
      closeBooksModal,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.table {
  margin-bottom: 0;
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
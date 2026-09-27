
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
      <!-- <div class="col-md-3">
        <div class="card mb-3">
          <div class="card-body">
            <h3 class="card-title text-danger">{{ totalBorrowedBooks }}</h3>
            <p class="card-text">Số sách đã mượn</p>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';

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
    const totalBorrowedBooks = computed(() => 
      store.getters['borrow/allBorrowRequests']?.filter(req => req.trangThai === 'approved').length || 0
    );
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
          store.dispatch('borrow/fetchBorrowRequests')
        ]);
      } catch (error) {
        showError(error.message);
      }
    };

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
      totalBorrowedBooks,
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

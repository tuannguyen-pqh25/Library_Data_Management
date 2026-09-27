<template>
    <div class="publisher-list">
      <LoadingSpinner :show="loading" />
  
      <h2>Danh sách nhà xuất bản</h2>
  
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
              placeholder="Tìm kiếm nhà xuất bản theo tên hoặc mã nhà xuất bản"
            >
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
          </div>
        </div>
      </div>
  
      <!-- Danh sách nhà xuất bản -->
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col" v-for="publisher in publishers" :key="publisher._id">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ publisher.tenNXB }}</h5>
              <p class="card-text">
                <small class="text-muted">Mã NXB: {{ publisher.maNXB }}</small>
              </p>
              <p class="card-text">
                <strong>Địa chỉ:</strong> {{ publisher.diaChi }}
              </p>
              <p class="card-text">
                <strong>Số sách đã xuất bản:</strong> {{ getPublisherBookCount(publisher._id) }}
              </p>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary" @click="showPublisherBooks(publisher)">
                Xem danh sách sách
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal xem sách của nhà xuất bản -->
      <div class="modal" tabindex="-1" :class="{ 'd-block': showBooksModal }">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Sách của {{ selectedPublisher?.tenNXB }}</h5>
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
                    <tr v-for="book in publisherBooks" :key="book._id">
                      <td>{{ book.maSach }}</td>
                      <td>{{ book.tenSach }}</td>
                      <td>{{ book.namXuatBan }}</td>
                      <td>{{ book.soQuyen }}</td>
                      <td>{{ formatCurrency(book.donGia) }}</td>
                    </tr>
                    <tr v-if="publisherBooks.length === 0">
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
    name: 'PublisherList',
    components: { LoadingSpinner },
    setup() {
      const store = useStore();
      const searchTerm = ref('');
      const showBooksModal = ref(false);
      const selectedPublisher = ref(null);
  
      const loading = computed(() => store.getters['publisher/isLoading']);
      const error = computed(() => store.getters['publisher/error']);
      const allPublishers = computed(() => store.getters['publisher/allPublishers']);
      const allBooks = computed(() => store.getters['book/allBooks']);
  
      const publishers = computed(() => {
        if (!searchTerm.value) return allPublishers.value;
        const search = searchTerm.value.toLowerCase();
        return allPublishers.value.filter(pub => 
          pub.tenNXB.toLowerCase().includes(search) ||
          pub.maNXB.toLowerCase().includes(search)
        );
      });
  
      const publisherBooks = computed(() => {
        if (!selectedPublisher.value) return [];
        return allBooks.value.filter(book => 
          book.maNXB?._id === selectedPublisher.value._id
        );
      });
  
      const getPublisherBookCount = (publisherId) => {
        return allBooks.value.filter(book => book.maNXB?._id === publisherId).length;
      };
  
      const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value);
      };
  
      
  
      const showPublisherBooks = (publisher) => {
        selectedPublisher.value = publisher;
        showBooksModal.value = true;
      };
  
      const closeBooksModal = () => {
        showBooksModal.value = false;
        selectedPublisher.value = null;
      };
  
      const clearError = () => {
        store.commit('publisher/SET_ERROR', null);
      };
  
      onMounted(async () => {
        try {
          await Promise.all([
            store.dispatch('publisher/fetchPublishers'),
            store.dispatch('book/fetchBooks')
          ]);
        } catch (error) {
          showError(error);
        }
      });
  
      return {
        publishers,
        loading,
        error,
        searchTerm,
        showBooksModal,
        selectedPublisher,
        publisherBooks,
        clearError,
        showPublisherBooks,
        closeBooksModal,
        getPublisherBookCount,
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
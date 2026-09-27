<template>
    <div class="home-page">
        <LoadingSpinner :show="loading" />
      <div class="container py-5">
        <div class="row">
          <div class="col-md-8 mx-auto text-center">
            <h1 class="display-4 mb-4">Chào mừng đến với Thư viện sách TM</h1>
            <p class="lead mb-5">
              Khám phá kho tàng sách phong phú của chúng tôi và tận hưởng trải nghiệm đọc sách tuyệt vời.
            </p>
            
            <!-- Thống kê -->
            <div class="row mb-5">
                <div class="col-md-3">
                    <div class="card mb-3"> <div class="card-body">
                            <h3 class="card-title text-success">{{ totalBooks }}</h3>
                            <p class="card-text">Số sách của chúng tôi</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card mb-3"> <div class="card-body">
                            <h3 class="card-title text-warning">{{ totalPublishers }}</h3>
                            <p class="card-text">Số nhà xuất bản chúng tôi có</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card mb-3"> <div class="card-body">
                            <h3 class="card-title text-primary">{{ totalAuthors }}</h3>
                            <p class="card-text">Số tác giả chúng tôi có</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card mb-3"> <div class="card-body">
                            <h3 class="card-title text-danger">{{ approvedBooks }}</h3>
                            <p class="card-text">Số sách bạn đã mượn</p>
                        </div>
                    </div>
            </div>
        </div>
  
            <!-- Hướng dẫn -->
            <div class="guide-section">
              <h2 class="mb-4">Hướng dẫn sử dụng</h2>
              <div class="row">
                <div class="col-md-6 mb-4">
                  <div class="card h-100">
                    <div class="card-body">
                      <h5 class="card-title">
                        <i class="fas fa-search"></i> Tìm sách
                      </h5>
                      <p class="card-text">
                        Dễ dàng tìm kiếm sách theo tên sách, mã sách, tên NXB, tên tác giả
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-4">
                  <div class="card h-100">
                    <div class="card-body">
                      <h5 class="card-title">
                        <i class="fas fa-book"></i> Mượn sách
                      </h5>
                      <p class="card-text">
                        Đặt yêu cầu mượn sách và theo dõi trạng thái
                      </p>
                    </div>
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
  import { ref, onMounted, computed } from 'vue';
  import { useStore } from 'vuex';
  import LoadingSpinner from '@/components/LoadingSpinner.vue';
  
  export default {
    name: 'HomePage',
    components: {
      LoadingSpinner
    },
    setup() {
      const store = useStore();
      const totalBooks = computed(() => store.getters['book/allBooks'].length);
      const totalPublishers = computed(() => store.getters['publisher/allPublishers'].length);
      const totalAuthors = computed(() => store.getters['author/allAuthors'].length);
      
  
      const approvedBooks = computed(() => {
        return store.getters['borrow/borrowHistory'].filter(
          item => item.trangThai === 'Đã duyệt'
        ).length;
      });

      
  
      onMounted(async () => {
        await Promise.all([
          store.dispatch('book/fetchBooks'),
          store.dispatch('publisher/fetchPublishers'),
          store.dispatch('borrow/fetchBorrowHistory'),
          store.dispatch('author/fetchAuthors')
        ]);
      });
  
      return {
        totalBooks,
        totalPublishers,
        approvedBooks,
        totalAuthors
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
  
  .guide-section .card {
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .guide-section .card-title {
    color: #0d6efd;
  }
  
  .guide-section .fas {
    margin-right: 8px;
  }
  .text-danger {
    color: #dc3545 !important;
  }
  .text-warning {
    color: #ffc107 !important;
  }
  .text-success {
    color: #198754 !important;
  }
  .text-primary {
    color: #0d6efd !important;
  }
  
  </style>
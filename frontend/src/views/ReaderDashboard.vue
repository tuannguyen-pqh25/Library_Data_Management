<template>
    <div class="reader-dashboard">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" href="#" @click.prevent="currentComponent = 'HomePage'">
            <i class="fas fa-book-reader me-2"></i>Thư viện sách TM
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BookList' }"
                   @click="currentComponent = 'BookList'">
                  Sách
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'PublisherList' }"
                   @click="currentComponent = 'PublisherList'">
                  Nhà xuất bản
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'AuthorList' }"
                   @click="currentComponent = 'AuthorList'">
                  Tác giả
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'CategoryList' }"
                   @click="currentComponent = 'CategoryList'">
                  Thể loại
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BorrowHistory' }"
                   @click="currentComponent = 'BorrowHistory'">
                  Lịch sử mượn sách
                </a>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item me-3">
                <span class="nav-link" style="cursor: pointer;" @click="currentComponent = 'UserProfile'">
                  Xin chào, {{ currentUser?.hoLot }} {{ currentUser?.ten || 'Độc giả' }}
                </span>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" @click="handleLogout">Đăng xuất</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  
      <div class="container mt-4">
        <component :is="currentComponent"></component>
      </div>
    </div>
    <footer class="footer mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4">
            <h5>Về chúng tôi</h5>
            <p>
              Thư viện trực tuyến - nơi kết nối tri thức và đam mê đọc sách. 
              Chúng tôi cam kết mang đến trải nghiệm đọc sách tốt nhất cho độc giả.
            </p>
          </div>
          <div class="col-md-4 mb-4">
            <h5>Liên kết nhanh</h5>
            <ul class="list-unstyled">
                <li><a href="#" @click.prevent="navigateTo('BookList')">Danh sách sách</a></li>
                <li><a href="#" @click.prevent="navigateTo('PublisherList')">Nhà xuất bản</a></li>
                <li><a href="#" @click.prevent="navigateTo('AuthorList')">Tác giả</a></li>
                <li><a href="#" @click.prevent="navigateTo('BorrowHistory')">Lịch sử mượn sách</a></li>
            </ul>
          </div>
          <div class="col-md-4 mb-4">
            <h5>Liên hệ</h5>
            <ul class="list-unstyled">
              <li><i class="fas fa-map-marker-alt me-2"></i> Đại học Cần Thơ</li>
              <li><i class="fas fa-phone me-2"></i> 0946140372</li>
              <li><i class="fas fa-envelope me-2"></i> manb2207540@student.ctu.edu.vn</li>
            </ul>
            <div class="social-links mt-3">
              <a href="#" class="me-3"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="me-3"><i class="fab fa-twitter"></i></a>
              <a href="#" class="me-3"><i class="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <hr />
        <div class="row">
          <div class="col-md-12 text-center">
            <p class="mb-0">
              © B2207540 - {{ currentYear }} Hệ thống Quản lý Thư viện. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import HomePage from '@/components/reader/HomePage.vue';
  import BookList from '@/components/reader/BookList.vue';
  import PublisherList from '@/components/reader/PublisherList.vue';
  import AuthorList from '@/components/reader/AuthorList.vue';
  import BorrowHistory from '@/components/reader/BorrowHistory.vue';
  import UserProfile from '@/components/reader/UserProfile.vue';
  import CategoryList from '@/components/reader/CategoryList.vue';
  
  export default {
    name: 'ReaderDashboard',
    components: {
      HomePage,
      BookList,
      PublisherList,
      AuthorList,
      BorrowHistory,
      CategoryList,
      UserProfile
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      
      const currentComponent = ref(localStorage.getItem('readerCurrentComponent') || 'HomePage');
      const currentYear = computed(() => new Date().getFullYear());
      
      watch(currentComponent, (newValue) => {
        localStorage.setItem('readerCurrentComponent', newValue);
      });
  
      const currentUser = computed(() => store.getters['auth/currentUser']);
  
      const handleLogout = async () => {
        await store.dispatch('auth/logout');
        localStorage.removeItem('readerCurrentComponent');
        router.push('/login');
      };
      const navigateTo = (componentName) => {
        currentComponent.value = componentName;
      };
  
      return {
        currentComponent,
        currentUser,
        handleLogout,
        currentYear,
        navigateTo
      };
    }
  };
  </script>
  
  <style scoped>
  .nav-link {
    cursor: pointer;
  }
  
  .navbar-nav .nav-item .nav-link {
    color: rgba(255, 255, 255, 0.9) !important;
  }
  .footer {
    padding: 15px 0;
    color: #6c757d;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
  }
  
  .footer h5 {
    color: #0d6efd;
    font-weight: 600;
    margin-bottom: 15px;
    font-size: 1.2rem;
  }
  
  .footer ul li {
    margin-bottom: 10px;
  }
  
  .footer a {
    color: #6c757d;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .footer a:hover {
    color: #0d6efd;
  }
  
  .social-links a {
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
    background-color: #0d6efd;
    color: white !important;
    transition: transform 0.3s, background-color 0.3s;
  }
  
  .social-links a:hover {
    transform: translateY(-3px);
    background-color: #0b5ed7;
  }
  .social-links span:hover {
    transform: translateY(-3px);
    background-color: #0b5ed7;
  }
  
  .footer hr {
    margin: 20px 0;
    border-color: rgba(108, 117, 125, 0.2);
  }
  
  .footer i {
    width: 16px;
  }
  
  .footer .row > [class*='col-'] {
    padding-top: 0;
    padding-bottom: 10px;
  }
  
  .footer .mb-4 {
    margin-bottom: 1rem !important;
  }
  </style>
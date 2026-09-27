<template>
    <div class="admin-dashboard">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" href="#" @click.prevent="currentComponent = 'AdminHomePage'">
            <i class="fas fa-book-reader me-2"></i>Quản lý thư viện
        </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BookManagement' }" 
                   @click.prevent="currentComponent = 'BookManagement'">
                  Quản lý sách
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'PublisherManagement' }"
                   @click.prevent="currentComponent = 'PublisherManagement'">
                  Quản lý NXB
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'AuthorManagement' }"
                   @click.prevent="currentComponent = 'AuthorManagement'">
                  Quản lý tác giả
                </a>
              </li>
              <li class="nav-item">
              <a class="nav-link" :class="{ active: currentComponent === 'CategoryManagement' }"
                 @click.prevent="currentComponent = 'CategoryManagement'">
                Quản lý thể loại
              </a>
            </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'StaffManagement' }"
                   @click.prevent="currentComponent = 'StaffManagement'">
                  Quản lý nhân viên
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'ReaderManagement' }"
                   @click.prevent="currentComponent = 'ReaderManagement'">
                  Quản lý độc giả
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BorrowManagement' }"
                   @click.prevent="currentComponent = 'BorrowManagement'">
                  Quản lý mượn sách
                </a>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item me-3">
                <span class="nav-link">
                  Xin chào, {{ currentUser?.hoTenNV || 'Nhân viên' }}
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
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import BookManagement from '@/components/admin/BookManagement.vue';
  import PublisherManagement from '@/components/admin/PublisherManagement.vue';
  import StaffManagement from '@/components/admin/StaffManagement.vue';
  import ReaderManagement from '@/components/admin/ReaderManagement.vue';
  import BorrowManagement from '@/components/admin/BorrowManagement.vue';
  import AuthorManagement from '@/components/admin/AuthorManagement.vue';
  import AdminHomePage from '@/components/admin/AdminHomePage.vue';
  import CategoryManagement from '@/components/admin/CategoryManagement.vue';

  
  export default {
    name: 'AdminDashboard',
    components: {
      BookManagement,
      PublisherManagement,
      StaffManagement,
      ReaderManagement,
      BorrowManagement,
      AuthorManagement,
      CategoryManagement,
      AdminHomePage
    },
    setup() {
      const store = useStore();
      const router = useRouter();
      
      const currentComponent = ref(localStorage.getItem('adminCurrentComponent') || 'AdminHomePage');
      
      watch(currentComponent, (newValue) => {
        localStorage.setItem('adminCurrentComponent', newValue);
      });
  
      const currentUser = computed(() => store.getters['auth/currentUser']);
  
      const handleLogout = async () => {
        await store.dispatch('auth/logout');
        localStorage.removeItem('adminCurrentComponent');
        router.push('/login');
      };
  
      return {
        currentComponent,
        currentUser,
        handleLogout
      };
    }
  };
  </script>
  
  <style scoped>
  .nav-link {
    cursor: pointer;
  }
  </style>
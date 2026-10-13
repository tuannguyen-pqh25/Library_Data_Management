<template>
    <div class="admin-dashboard">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary admin-navbar" aria-label="Điều hướng quản trị">
        <div class="container">
          <a class="navbar-brand" href="#" @click.prevent="currentComponent = 'AdminHomePage'">
            <i class="fas fa-book-reader me-2"></i>Quản lý thư viện
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Mở menu quản trị">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BookManagement' }"
                   :aria-current="currentComponent === 'BookManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'BookManagement'">
                  Quản lý sách
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'PublisherManagement' }"
                   :aria-current="currentComponent === 'PublisherManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'PublisherManagement'">
                  Quản lý NXB
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'AuthorManagement' }"
                   :aria-current="currentComponent === 'AuthorManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'AuthorManagement'">
                  Quản lý tác giả
                </a>
              </li>
              <li class="nav-item">
              <a class="nav-link" :class="{ active: currentComponent === 'CategoryManagement' }"
                 :aria-current="currentComponent === 'CategoryManagement' ? 'page' : null"
                 @click.prevent="currentComponent = 'CategoryManagement'">
                Quản lý thể loại
              </a>
            </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'StaffManagement' }"
                   :aria-current="currentComponent === 'StaffManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'StaffManagement'">
                  Quản lý nhân viên
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'ReaderManagement' }"
                   :aria-current="currentComponent === 'ReaderManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'ReaderManagement'">
                  Quản lý độc giả
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: currentComponent === 'BorrowManagement' }"
                   :aria-current="currentComponent === 'BorrowManagement' ? 'page' : null"
                   @click.prevent="currentComponent = 'BorrowManagement'">
                  Quản lý mượn sách
                </a>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item me-3">
                <div class="admin-user">
                  <span class="admin-user-icon"><i class="fas fa-user" aria-hidden="true"></i></span>
                  <span class="admin-user-copy">
                    <span class="admin-user-greeting">Xin chào</span>
                    <strong>{{ currentUser?.hoTenNV || 'Nhân viên' }}</strong>
                  </span>
                </div>
              </li>
              <li class="nav-item">
                <a class="nav-link admin-logout" href="#" @click.prevent="handleLogout">
                  <i class="fas fa-right-from-bracket" aria-hidden="true"></i>
                  <span>Đăng xuất</span>
                </a>
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
  .admin-dashboard {
    min-height: 100vh;
    background-color: #f2f7f6;
    background-image:
      radial-gradient(ellipse at 8% 20%, rgb(196 232 220 / 38%), transparent 34rem),
      radial-gradient(ellipse at 94% 48%, rgb(204 224 241 / 34%), transparent 38rem),
      linear-gradient(145deg, #f8fafb 0%, #f0f6f4 52%, #edf3f8 100%);
    background-attachment: fixed;
  }

  .admin-navbar {
    position: relative;
    z-index: 10;
    min-height: 78px;
    border-bottom: 1px solid rgb(255 255 255 / 12%);
    background: linear-gradient(110deg, #102d3b 0%, #164b52 54%, #17675f 100%) !important;
    box-shadow: 0 8px 24px rgb(16 45 59 / 18%);
  }

  .admin-navbar :deep(.container) {
    gap: 18px;
  }

  .admin-navbar .navbar-brand {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: 3px;
    margin-right: clamp(10px, 1.4vw, 24px);
    color: #fff;
    font-size: 1.12rem;
    font-weight: 750;
    letter-spacing: -0.035em;
  }

  .admin-navbar .navbar-brand i {
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    margin-right: 7px;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 12px;
    background: rgb(255 255 255 / 11%);
    color: #b8f1df;
    font-size: 1rem;
  }

  .admin-navbar .navbar-collapse {
    align-items: center;
    gap: 14px;
  }

  .admin-navbar .navbar-nav {
    align-items: center;
    gap: 3px;
  }

  .admin-navbar .navbar-nav.me-auto {
    flex: 1 1 auto;
    justify-content: space-between;
  }

  .admin-navbar .nav-link {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
    border-radius: 10px;
    color: rgb(241 248 250 / 76%);
    font-size: 0.88rem;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    text-decoration: none;
    white-space: nowrap;
    transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
    cursor: pointer;
  }

  .admin-navbar .navbar-nav.me-auto .nav-link:hover,
  .admin-navbar .navbar-nav.me-auto .nav-link:focus-visible {
    background: rgb(255 255 255 / 10%);
    color: #fff;
  }

  .admin-navbar .navbar-nav.me-auto .nav-link.active {
    background: #e4f4ed;
    color: #174d49;
    box-shadow: 0 4px 12px rgb(7 31 34 / 15%);
  }

  .admin-navbar .navbar-nav:last-child {
    flex-shrink: 0;
    gap: 8px;
    margin-left: 10px;
  }

  .admin-navbar .navbar-nav:last-child .nav-item.me-3 {
    margin-right: 0 !important;
  }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 4px 10px 4px 5px;
    border: 1px solid rgb(255 255 255 / 13%);
    border-radius: 13px;
    background: rgb(255 255 255 / 8%);
    color: #fff;
    white-space: nowrap;
  }

  .admin-user-icon {
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 10px;
    background: rgb(184 241 223 / 17%);
    color: #b8f1df;
  }

  .admin-user-copy {
    display: grid;
    gap: 1px;
    line-height: 1.2;
  }

  .admin-user-greeting {
    color: rgb(241 248 250 / 68%);
    font-size: 0.68rem;
  }

  .admin-user-copy strong {
    max-width: 135px;
    overflow: hidden;
    font-size: 0.84rem;
    font-weight: 650;
    text-overflow: ellipsis;
  }

  .admin-navbar .nav-link.admin-logout {
    gap: 8px;
    padding-inline: 12px;
    border: 1px solid rgb(255 255 255 / 18%);
    color: #fff;
  }

  .admin-navbar .nav-link.admin-logout:hover,
  .admin-navbar .nav-link.admin-logout:focus-visible {
    transform: translateY(-1px);
    border-color: rgb(255 255 255 / 34%);
    background: rgb(255 255 255 / 12%);
  }

  .admin-navbar .navbar-toggler {
    border-color: rgb(255 255 255 / 30%);
    border-radius: 10px;
  }

  .admin-navbar .navbar-toggler:focus {
    box-shadow: 0 0 0 3px rgb(184 241 223 / 28%);
  }

  @media (min-width: 992px) and (max-width: 1199.98px) {
    .admin-navbar .navbar-brand {
      margin-right: 6px;
      font-size: 1rem;
    }

    .admin-navbar .navbar-nav {
      gap: 0;
    }

    .admin-navbar .nav-link {
      padding-inline: 6px;
      font-size: 0.79rem;
    }

    .admin-navbar .navbar-collapse {
      gap: 7px;
    }
  }

  @media (max-width: 991.98px) {
    .admin-navbar {
      min-height: 68px;
    }

    .admin-navbar .navbar-collapse {
      padding: 12px 0 16px;
    }

    .admin-navbar .navbar-nav {
      align-items: stretch;
    }

    .admin-navbar .navbar-nav.me-auto {
      gap: 4px;
    }

    .admin-navbar .nav-link {
      justify-content: flex-start;
      padding-inline: 12px;
      text-align: left;
    }

    .admin-navbar .navbar-nav.me-auto .nav-link.active {
      justify-content: flex-start;
    }

    .admin-navbar .navbar-nav:last-child {
      align-items: flex-start;
      gap: 8px;
      margin: 10px 0 0;
      padding-top: 12px;
      border-top: 1px solid rgb(255 255 255 / 14%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-navbar .nav-link {
      transition: none;
    }
  }
  </style>
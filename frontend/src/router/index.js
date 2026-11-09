// src/router/index.js

// Import các hàm tạo router và lịch sử từ Vue Router
import { createRouter, createWebHistory } from 'vue-router';

// Import các component dùng làm trang (views)
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import ReaderDashboard from '../views/ReaderDashboard.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ConfirmPassword from '../views/ConfirmPassword.vue';

// Import Vuex store để kiểm tra trạng thái đăng nhập và vai trò
import store from '../store';

// Khai báo các route (đường dẫn URL và component tương ứng)
const routes = [
  {
    path: '/',                     // Đường dẫn: /
    name: 'home',                  // Tên route
    component: HomeView,          // Component được hiển thị
    meta: { guestOnly: true }     // Chỉ cho khách (người chưa đăng nhập) vào
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    props: { portalType: 'reader' },
    meta: { guestOnly: true }
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: LoginView,
    props: { portalType: 'staff' },
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, adminOnly: true }  // Phải đăng nhập và là admin
  },
  {
    path: '/reader',
    name: 'reader',
    component: ReaderDashboard,
    meta: { requiresAuth: true }   // Chỉ cần đăng nhập (bất kỳ người dùng nào)
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { requiresAuth: false } // Không yêu cầu đăng nhập
  },
  {
    path: '/auth/reader/password/reset',
    name: 'confirm-password',
    component: ConfirmPassword,
    meta: { requiresAuth: false } // Không yêu cầu đăng nhập
  }
];

// Tạo đối tượng router với lịch sử HTML5 và danh sách route
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Sử dụng BASE_URL từ môi trường
  routes
});

// Hàm kiểm tra xem ứng dụng có đang chạy trên Cổng Quản trị (Port 5174) hay không
export const isAdminPortal = () => {
  if (import.meta.env.VITE_PORTAL === 'admin') return true;
  if (typeof window !== 'undefined' && window.location.port === '5174') return true;
  return false;
};

// Hàm khởi tạo auth từ localStorage (dùng cho làm mới trang hoặc reload)
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const userType = localStorage.getItem('userType');
  
  // Nếu tồn tại token và user thì cập nhật store (Vuex)
  if (token && user) {
    store.commit('auth/SET_TOKEN', token);
    store.commit('auth/SET_USER', user);
    store.commit('auth/SET_USER_TYPE', userType);
  }
};

// Trước khi chuyển trang (navigation guard)
router.beforeEach((to, from, next) => {
  initializeAuth(); // Cập nhật trạng thái auth trước mỗi route

  const isAuthenticated = store.getters['auth/isAuthenticated']; // Người dùng đã đăng nhập?
  const isAdmin = store.getters['auth/isAdmin'];                 // Là admin?
  const inAdminPortal = isAdminPortal();

  // =========================================================================
  // 1. CỔNG 5174: CỔNG QUẢN TRỊ NỘI BỘ (ADMIN & STAFF PORTAL)
  // =========================================================================
  if (inAdminPortal) {
    // Nếu chưa đăng nhập: Mọi route (ngoại trừ /admin/login và /forgot-password) đều đưa về /admin/login
    if (!isAuthenticated) {
      if (to.path !== '/admin/login' && to.path !== '/forgot-password') {
        return next('/admin/login');
      }
      return next();
    }

    // Nếu đã đăng nhập:
    if (isAdmin) {
      // Đã là admin mà vào trang chủ hoặc login -> chuyển thẳng vào dashboard quản trị
      if (to.path === '/' || to.path === '/admin/login' || to.path === '/login') {
        return next('/admin');
      }
      return next();
    } else {
      // Tài khoản độc giả không có quyền trên cổng Admin -> đăng xuất và về /admin/login
      store.dispatch('auth/logout');
      return next('/admin/login');
    }
  }

  // =========================================================================
  // 2. CỔNG 5173: CỔNG DỊCH VỤ ĐỘC GIẢ (READER / USER PORTAL)
  // =========================================================================
  // Nếu cố tình gõ URL /admin hoặc các trang admin khi chưa đăng nhập:
  // Chuyển hướng về /login của ĐỘC GIẢ (đảm bảo bảo mật, không để lộ cổng admin)
  if (to.path === '/admin' || to.meta.adminOnly) {
    if (!isAuthenticated) {
      return next('/login');
    }
    // Nếu đã đăng nhập nhưng chỉ là độc giả thông thường: không cho vào admin
    if (!isAdmin) {
      return next('/reader');
    }
  }

  // Nếu ai đó ở cổng 5173 cố tình gõ /admin/login khi chưa đăng nhập:
  // Chuyển về /login của độc giả
  if (to.path === '/admin/login' && !isAuthenticated) {
    return next('/login');
  }

  // Nếu route yêu cầu đăng nhập chung (như /reader) mà chưa đăng nhập:
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // Nếu route chỉ cho khách (guest) nhưng người dùng đã đăng nhập → chuyển đến dashboard phù hợp
  if (to.meta.guestOnly && isAuthenticated) {
    return next(isAdmin ? '/admin' : '/reader');
  }

  // Ngược lại, cho phép tiếp tục điều hướng
  next();
});

// Xuất router để sử dụng trong main.js
export default router;

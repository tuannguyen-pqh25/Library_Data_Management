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

  // Nếu route yêu cầu đăng nhập nhưng người dùng chưa đăng nhập → chuyển về login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  }
  // Nếu route chỉ dành cho admin mà người dùng không phải admin → chuyển về trang chủ
  else if (to.meta.adminOnly && !isAdmin) {
    next('/');
  }
  // Nếu route chỉ cho khách (guest) nhưng người dùng đã đăng nhập → chuyển đến dashboard phù hợp
  else if (to.meta.guestOnly && isAuthenticated) {
    next(isAdmin ? '/admin' : '/reader');
  }
  // Ngược lại, cho phép tiếp tục điều hướng
  else {
    next();
  }
});

// Xuất router để sử dụng trong main.js
export default router;

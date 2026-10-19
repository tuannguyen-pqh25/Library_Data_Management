<template>
  <div class="login-page">
    <LoadingSpinner :show="loading" />

    <!-- Ambient Glow Orbs -->
    <div class="glow-orb glow-orb--1" aria-hidden="true"></div>
    <div class="glow-orb glow-orb--2" aria-hidden="true"></div>
    <div class="glow-orb glow-orb--3" aria-hidden="true"></div>

    <!-- Back to Home Link -->
    <router-link to="/" class="btn-back-home" aria-label="Quay về trang chủ">
      <i class="fas fa-arrow-left me-2" aria-hidden="true"></i>Về trang chủ
    </router-link>

    <!-- Main Auth Card Container -->
    <div class="auth-card">
      <!-- Left Panel: Hero Showcase -->
      <div class="auth-showcase">
        <div class="showcase-content">
          <div class="brand-badge">
            <div class="brand-icon">
              <i class="fas fa-university" aria-hidden="true"></i>
            </div>
            <div class="brand-info">
              <span class="brand-sub">HỆ THỐNG QUẢN LÝ</span>
              <span class="brand-name">THƯ VIỆN SỐ CTU</span>
            </div>
          </div>

          <div class="showcase-hero">
            <h2 class="showcase-title">
              Khám phá kho tàng <br />
              <span class="text-gradient">tri thức học thuật</span>
            </h2>
            <p class="showcase-desc">
              Truy cập nhanh chóng hàng chục ngàn tài liệu giáo trình, sách nghiên cứu và quản lý lịch trình mượn trả trực tuyến 24/7.
            </p>
          </div>

          <div class="feature-pills">
            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-book-open" aria-hidden="true"></i></div>
              <div class="feature-text">
                <strong>50,000+ Đầu sách</strong>
                <span>Cập nhật liên tục từ các NXB uy tín</span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-bolt" aria-hidden="true"></i></div>
              <div class="feature-text">
                <strong>Mượn sách tức thì</strong>
                <span>Thao tác chọn & giữ sách chỉ với 1 click</span>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon"><i class="fas fa-shield-alt" aria-hidden="true"></i></div>
              <div class="feature-text">
                <strong>An toàn & Minh bạch</strong>
                <span>Quản lý hạn trả, thông báo quá hạn tự động</span>
              </div>
            </div>
          </div>

          <div class="showcase-footer">
            <div class="footer-badge">
              <i class="fas fa-check-circle text-success me-2" aria-hidden="true"></i>
              Hệ thống vận hành chính thức CT467
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Form Section -->
      <div class="auth-form-panel">
        <div class="form-panel-header">
          <div class="mobile-brand d-lg-none mb-3">
            <i class="fas fa-book-reader me-2 text-primary" aria-hidden="true"></i>
            <strong>THƯ VIỆN CTU</strong>
          </div>
          <h1 class="form-title">Đăng nhập</h1>
          <p class="form-subtitle">Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <!-- Role Switcher (Pill Tabs) -->
        <div class="role-switcher" role="tablist" aria-label="Chọn vai trò đăng nhập">
          <button
            type="button"
            class="role-btn"
            :class="{ active: userType === 'reader' }"
            @click="switchUserType('reader')"
            role="tab"
            :aria-selected="userType === 'reader'"
          >
            <i class="fas fa-user-graduate me-2" aria-hidden="true"></i>
            <span>Độc giả</span>
          </button>
          <button
            type="button"
            class="role-btn"
            :class="{ active: userType === 'staff' }"
            @click="switchUserType('staff')"
            role="tab"
            :aria-selected="userType === 'staff'"
          >
            <i class="fas fa-user-tie me-2" aria-hidden="true"></i>
            <span>Nhân viên / Admin</span>
          </button>
        </div>


        <!-- Error Alert -->
        <div
          v-if="error"
          class="auth-alert auth-alert--danger"
          role="alert"
          aria-live="assertive"
        >
          <div class="alert-content">
            <i class="fas fa-exclamation-triangle alert-icon" aria-hidden="true"></i>
            <div class="alert-text">
              {{ error }}
              <div v-if="loginAttempts >= 5" class="mt-1">
                <router-link to="/forgot-password" class="text-danger fw-bold text-decoration-underline">
                  Quên mật khẩu? Nhấn vào đây để đặt lại mật khẩu.
                </router-link>
              </div>
            </div>
          </div>
          <button type="button" class="alert-close" @click="clearError" aria-label="Đóng thông báo lỗi">×</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" novalidate class="auth-form">
          <!-- Staff Field: hoTenNV -->
          <div class="form-group mb-3" v-if="userType === 'staff'">
            <label for="hoTenNV" class="form-label">
              Tên nhân viên <span class="text-danger" aria-hidden="true">*</span>
            </label>
            <div class="input-wrapper" :class="{ 'has-error': errors.hoTenNV }">
              <i class="fas fa-id-badge input-icon" aria-hidden="true"></i>
              <input
                id="hoTenNV"
                type="text"
                class="form-control-custom"
                v-model="credentials.hoTenNV"
                placeholder="Nhập tên tài khoản nhân viên (VD: Admin)"
                required
                aria-required="true"
                :aria-invalid="errors.hoTenNV ? 'true' : 'false'"
                aria-describedby="hoTenNV-error"
                @input="validateField('hoTenNV')"
              />
            </div>
            <div id="hoTenNV-error" class="field-error" v-if="errors.hoTenNV">
              <i class="fas fa-circle-exclamation me-1" aria-hidden="true"></i>{{ errors.hoTenNV }}
            </div>
          </div>

          <!-- Reader Field: email -->
          <div class="form-group mb-3" v-if="userType === 'reader'">
            <label for="email" class="form-label">
              Địa chỉ Email <span class="text-danger" aria-hidden="true">*</span>
            </label>
            <div class="input-wrapper" :class="{ 'has-error': errors.email }">
              <i class="fas fa-envelope input-icon" aria-hidden="true"></i>
              <input
                id="email"
                type="email"
                class="form-control-custom"
                v-model="credentials.email"
                placeholder="example@ctu.edu.vn"
                required
                aria-required="true"
                :aria-invalid="errors.email ? 'true' : 'false'"
                aria-describedby="email-error"
                @input="validateField('email')"
              />
            </div>
            <div id="email-error" class="field-error" v-if="errors.email">
              <i class="fas fa-circle-exclamation me-1" aria-hidden="true"></i>{{ errors.email }}
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group mb-4">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label for="password" class="form-label mb-0">
                Mật khẩu <span class="text-danger" aria-hidden="true">*</span>
              </label>
              <router-link to="/forgot-password" class="link-forgot-pw" tabindex="0">
                Quên mật khẩu?
              </router-link>
            </div>
            <div class="input-wrapper" :class="{ 'has-error': errors.password }">
              <i class="fas fa-lock input-icon" aria-hidden="true"></i>
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control-custom pe-5"
                v-model="credentials.password"
                placeholder="••••••••"
                required
                aria-required="true"
                :aria-invalid="errors.password ? 'true' : 'false'"
                aria-describedby="password-error"
                @input="validateField('password')"
              />
              <button
                type="button"
                class="btn-toggle-pw"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'"
                tabindex="0"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" aria-hidden="true"></i>
              </button>
            </div>
            <div id="password-error" class="field-error" v-if="errors.password">
              <i class="fas fa-circle-exclamation me-1" aria-hidden="true"></i>{{ errors.password }}
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit-login"
            :disabled="loading"
            aria-label="Xác nhận đăng nhập"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span v-if="!loading"><i class="fas fa-sign-in-alt me-2" aria-hidden="true"></i></span>
            {{ loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống' }}
          </button>
        </form>

        <!-- Footer / Register Link -->
        <div class="form-panel-footer">
          <p class="register-hint">
            Chưa có tài khoản độc giả?
            <router-link to="/register" class="link-register">
              Đăng ký ngay <i class="fas fa-arrow-right ms-1" aria-hidden="true"></i>
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { showError } from '@/utils/notifications';

export default {
  name: 'LoginForm',
  components: { LoadingSpinner },
  setup() {
    const store = useStore();
    const router = useRouter();
    const userType = ref('reader');
    const credentials = ref({
      hoTenNV: '',
      email: '',
      password: ''
    });
    const errors = ref({});
    const loginAttempts = ref(0);
    const showPassword = ref(false);

    const loading = computed(() => store.state.auth.loading);
    const error = computed(() => store.state.auth.error);

    const switchUserType = (type) => {
      userType.value = type;
      errors.value = {};
      clearError();
    };


    const validateField = (field) => {
      const newErrors = { ...errors.value };

      if (field === 'hoTenNV' && userType.value === 'staff') {
        if (!credentials.value.hoTenNV?.trim()) {
          newErrors.hoTenNV = 'Tên nhân viên là bắt buộc';
        } else {
          delete newErrors.hoTenNV;
        }
      }

      if (field === 'email' && userType.value === 'reader') {
        if (!credentials.value.email?.trim()) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.value.email)) {
          newErrors.email = 'Email không đúng định dạng';
        } else {
          delete newErrors.email;
        }
      }

      if (field === 'password') {
        if (!credentials.value.password) {
          newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (credentials.value.password.length < 5) {
          newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
        } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(credentials.value.password)) {
          newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
        } else {
          delete newErrors.password;
        }
      }

      errors.value = newErrors;
    };

    const validateForm = () => {
      const newErrors = {};
      if (userType.value === 'staff' && !credentials.value.hoTenNV?.trim()) {
        newErrors.hoTenNV = 'Tên nhân viên là bắt buộc';
      }
      if (userType.value === 'reader') {
        if (!credentials.value.email?.trim()) {
          newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.value.email)) {
          newErrors.email = 'Email không đúng định dạng';
        }
      }
      if (!credentials.value.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (credentials.value.password.length < 5) {
        newErrors.password = 'Mật khẩu phải có ít nhất 5 ký tự';
      } else if (!/(?=.*[A-Za-z])(?=.*\d).+/.test(credentials.value.password)) {
        newErrors.password = 'Mật khẩu phải chứa cả chữ và số';
      }
      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      try {
        loginAttempts.value += 1;
        if (userType.value === 'staff') {
          await store.dispatch('auth/loginStaff', {
            hoTenNV: credentials.value.hoTenNV.trim(),
            password: credentials.value.password
          });
          router.push('/admin');
        } else {
          await store.dispatch('auth/loginReader', {
            email: credentials.value.email.trim(),
            password: credentials.value.password
          });
          router.push('/reader');
        }
        loginAttempts.value = 0;
        errors.value = {};
      } catch (err) {
        showError(err);
      }
    };

    const clearError = () => {
      store.commit('auth/SET_ERROR', null);
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      userType,
      credentials,
      loading,
      error,
      errors,
      loginAttempts,
      showPassword,
      switchUserType,
      togglePasswordVisibility,
      handleSubmit,
      clearError,
      validateField
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Container & Atmosphere ──────────────────────────────── */
.login-page {
  --c-primary:        #2563eb;
  --c-primary-light:  #3b82f6;
  --c-primary-dark:   #1d4ed8;
  --c-accent:         #6366f1;
  --c-bg-dark:        #090d16;
  --c-surface:        #ffffff;
  --c-border:         #e2e8f0;
  --c-text-main:      #0f172a;
  --c-text-muted:     #64748b;
  --font-display:     'Playfair Display', Georgia, serif;
  --font-body:        'Outfit', system-ui, -apple-system, sans-serif;
  --trans:            0.25s cubic-bezier(0.4, 0, 0.2, 1);

  font-family: var(--font-body);
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: radial-gradient(circle at 10% 20%, #172554 0%, #090d16 65%, #030712 100%);
  overflow-x: hidden;
  box-sizing: border-box;
  z-index: 1;
}

/* Ambient Glow Orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.55;
}
.glow-orb--1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, #2563eb, transparent 70%);
  top: -100px;
  left: -80px;
  animation: orbFloat 10s ease-in-out infinite alternate;
}
.glow-orb--2 {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, #7c3aed, transparent 70%);
  bottom: -60px;
  right: -60px;
  animation: orbFloat 12s ease-in-out infinite alternate-reverse;
}
.glow-orb--3 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, #0ea5e9, transparent 70%);
  top: 40%;
  right: 25%;
  opacity: 0.35;
}

@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, 30px) scale(1.1); }
}

/* Back to Home Button */
.btn-back-home {
  position: absolute;
  top: 1.25rem;
  left: 1.5rem;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1.05rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 999px;
  color: #e2e8f0;
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  transition: all var(--trans);
}
.btn-back-home:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  transform: translateX(-3px);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ── Main Auth Card ──────────────────────────────────────── */
.auth-card {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 1040px;
  min-height: 580px;
  background: var(--c-surface);
  border-radius: 28px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

/* ── Left Panel: Hero Showcase ───────────────────────────── */
.auth-showcase {
  flex: 1.05;
  background: linear-gradient(155deg, #0f172a 0%, #1e1b4b 60%, #172554 100%);
  color: #ffffff;
  padding: 3rem 2.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.auth-showcase::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.6;
  pointer-events: none;
}

.showcase-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.brand-icon {
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #fff;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}
.brand-info {
  display: flex;
  flex-direction: column;
}
.brand-sub {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #93c5fd;
  font-weight: 600;
}
.brand-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #ffffff;
}

.showcase-hero {
  margin: 1.8rem 0;
}
.showcase-title {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
  margin-bottom: 0.85rem;
}
.text-gradient {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.showcase-desc {
  color: #cbd5e1;
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
}

.feature-pills {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(8px);
  transition: all var(--trans);
}
.feature-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}
.feature-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}
.feature-text {
  display: flex;
  flex-direction: column;
}
.feature-text strong {
  font-size: 0.88rem;
  color: #f8fafc;
}
.feature-text span {
  font-size: 0.76rem;
  color: #94a3b8;
}

.showcase-footer {
  margin-top: auto;
}
.footer-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  color: #94a3b8;
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

/* ── Right Panel: Form Area ──────────────────────────────── */
.auth-form-panel {
  flex: 1.25;
  background: var(--c-surface);
  padding: 2.75rem 2.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-panel-header {
  margin-bottom: 1.8rem;
}
.form-title {
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--c-text-main);
  margin: 0 0 0.35rem;
}
.form-subtitle {
  color: var(--c-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

/* ── Role Switcher (Pill Control) ────────────────────────── */
.role-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 14px;
  margin-bottom: 1.4rem;
  border: 1px solid var(--c-border);
}
.role-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 11px;
  border: none;
  background: transparent;
  color: #64748b;
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--trans);
}
.role-btn:hover:not(.active) {
  color: var(--c-text-main);
}
.role-btn.active {
  background: #ffffff;
  color: var(--c-primary);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
}


/* ── Error Alert ─────────────────────────────────────────── */
.auth-alert {
  padding: 0.85rem 1.15rem;
  border-radius: 12px;
  margin-bottom: 1.35rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.auth-alert--danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}
.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}
.alert-icon {
  margin-top: 2px;
  color: #dc2626;
}
.alert-text {
  font-size: 0.88rem;
  line-height: 1.45;
}
.alert-close {
  background: none;
  border: none;
  color: #991b1b;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
}

/* ── Form Inputs ─────────────────────────────────────────── */
.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.4rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--c-border);
  border-radius: 12px;
  background: #ffffff;
  transition: all var(--trans);
}
.input-wrapper:hover {
  border-color: #cbd5e1;
}
.input-wrapper:focus-within {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.14);
}
.input-wrapper.has-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3.5px rgba(239, 68, 68, 0.12);
}

.input-icon {
  position: absolute;
  left: 1.1rem;
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
  transition: color var(--trans);
}
.input-wrapper:focus-within .input-icon {
  color: var(--c-primary);
}

.form-control-custom {
  width: 100%;
  padding: 0.82rem 1.1rem 0.82rem 2.85rem;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--c-text-main);
}
.form-control-custom::placeholder {
  color: #94a3b8;
  font-size: 0.92rem;
}

.btn-toggle-pw {
  position: absolute;
  right: 0.9rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.4rem;
  font-size: 0.95rem;
  transition: color var(--trans);
}
.btn-toggle-pw:hover {
  color: var(--c-text-main);
}

.field-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
}

.link-forgot-pw {
  font-size: 0.84rem;
  color: var(--c-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--trans);
}
.link-forgot-pw:hover {
  color: var(--c-primary-dark);
  text-decoration: underline;
}

/* ── Submit Button ───────────────────────────────────────── */
.btn-submit-login {
  width: 100%;
  padding: 0.9rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.28);
  transition: all var(--trans);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-submit-login:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.38);
  transform: translateY(-2px);
}
.btn-submit-login:active:not(:disabled) {
  transform: translateY(0);
}
.btn-submit-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Panel Footer ────────────────────────────────────────── */
.form-panel-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.25rem;
  border-top: 1px solid var(--c-border);
}
.register-hint {
  font-size: 0.92rem;
  color: var(--c-text-muted);
  margin: 0;
}
.link-register {
  color: var(--c-primary);
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  margin-left: 0.25rem;
  transition: all var(--trans);
}
.link-register:hover {
  color: var(--c-primary-dark);
  text-decoration: underline;
  transform: translateX(2px);
}

/* ── Focus Visible ───────────────────────────────────────── */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* ── Responsive Queries ──────────────────────────────────── */
@media (max-width: 960px) {
  .auth-card {
    flex-direction: column;
    max-width: 520px;
    border-radius: 24px;
  }
  .auth-showcase {
    display: none;
  }
  .auth-form-panel {
    padding: 2.5rem 2rem;
  }
  .btn-back-home {
    top: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  .auth-form-panel {
    padding: 2rem 1.25rem;
  }
  .form-title {
    font-size: 1.75rem;
  }
  .role-btn {
    font-size: 0.85rem;
    padding: 0.65rem 0.5rem;
  }
}
</style>
<template>
  <div class="reader-shell">
    <!-- ── Navbar ── -->
    <nav class="rd-navbar" aria-label="Thanh điều hướng chính của độc giả">
      <div class="rd-navbar__inner">
        <!-- Brand -->
        <a
          class="rd-navbar__brand"
          href="#"
          @click.prevent="currentComponent = 'HomePage'"
          id="nav-brand"
          aria-label="Về trang chủ Thư viện CTU"
        >
          <i class="fas fa-book-open me-2" aria-hidden="true"></i>
          <span class="brand-name">Thư viện CTU</span>
        </a>

        <!-- Desktop Nav Links -->
        <ul class="rd-navbar__links" role="menubar">
          <li v-for="item in navItems" :key="item.component" role="none">
            <a
              class="rd-navbar__link"
              :class="{ 'rd-navbar__link--active': currentComponent === item.component }"
              href="#"
              role="menuitem"
              :aria-current="currentComponent === item.component ? 'page' : undefined"
              @click.prevent="currentComponent = item.component"
              :id="`nav-${item.component.toLowerCase()}`"
            >
              <i :class="item.icon + ' me-1'" aria-hidden="true"></i>{{ item.label }}
            </a>
          </li>
        </ul>

        <!-- User Area -->
        <div class="rd-navbar__user">
          <button
            v-if="isAdmin"
            class="rd-navbar__admin-return"
            type="button"
            @click="returnToAdmin"
            aria-label="Quay lại giao diện quản trị"
          >
            <i class="fas fa-arrow-left me-2" aria-hidden="true"></i>
            Về quản trị
          </button>
          <button
            class="rd-navbar__user-btn"
            @click="currentComponent = 'UserProfile'"
            id="nav-profile"
            :aria-label="`Xem hồ sơ cá nhân của ${currentUserName}`"
          >
            <span class="user-avatar" aria-hidden="true">
              {{ userInitial }}
            </span>
            <span class="user-name">{{ currentUserName }}</span>
          </button>
          <button class="rd-navbar__logout" @click="handleLogout" id="nav-logout" aria-label="Đăng xuất khỏi hệ thống">
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
          </button>

        </div>

        <!-- Mobile Hamburger -->
        <button
          class="rd-navbar__toggle"
          @click="mobileOpen = !mobileOpen"
          :aria-expanded="mobileOpen ? 'true' : 'false'"
          aria-controls="mobile-nav-menu"
          aria-label="Mở hoặc đóng menu điều hướng"
        >
          <i :class="mobileOpen ? 'fas fa-times' : 'fas fa-bars'" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <transition name="mobile-drop">
        <div v-if="mobileOpen" class="rd-navbar__mobile" id="mobile-nav-menu">
          <!-- Mobile User Summary -->
          <div class="rd-navbar__mobile-user">
            <span class="user-avatar user-avatar--mobile" aria-hidden="true">{{ userInitial }}</span>
            <div class="rd-navbar__mobile-user-info">
              <span class="rd-navbar__mobile-user-name">{{ currentUserName }}</span>
              <span class="rd-navbar__mobile-user-role">{{ isAdmin ? 'Quản trị viên' : 'Độc giả' }}</span>
            </div>
          </div>
          <hr class="rd-navbar__mobile-sep" />

          <a
            v-for="item in navItems"
            :key="item.component + '-m'"
            class="rd-navbar__mobile-link"
            :class="{ 'rd-navbar__mobile-link--active': currentComponent === item.component }"
            href="#"
            :aria-current="currentComponent === item.component ? 'page' : undefined"
            @click.prevent="currentComponent = item.component; mobileOpen = false"
          >
            <i :class="item.icon + ' me-2'" aria-hidden="true"></i>{{ item.label }}
          </a>
          <hr class="rd-navbar__mobile-sep" />
          <a
            v-if="isAdmin"
            class="rd-navbar__mobile-link rd-navbar__mobile-link--admin"
            href="#"
            @click.prevent="returnToAdmin"
          >
            <i class="fas fa-arrow-left me-2" aria-hidden="true"></i>Về quản trị
          </a>
          <a
            class="rd-navbar__mobile-link"
            href="#"
            @click.prevent="currentComponent = 'UserProfile'; mobileOpen = false"
          >
            <i class="fas fa-user me-2" aria-hidden="true"></i>Hồ sơ cá nhân
          </a>
          <a class="rd-navbar__mobile-link rd-navbar__mobile-link--danger" href="#" @click.prevent="handleLogout">
            <i class="fas fa-sign-out-alt me-2" aria-hidden="true"></i>Đăng xuất
          </a>
        </div>
      </transition>
    </nav>

    <!-- ── Main Content ── -->
    <main class="rd-main">
      <component :is="currentComponent" />
    </main>

    <!-- ── Footer ── -->
    <footer class="rd-footer">
      <div class="rd-footer__inner">
        <div class="rd-footer__col">
          <p class="rd-footer__brand"><i class="fas fa-book-open me-2"></i>Thư viện CTU</p>
          <p class="rd-footer__desc">Hệ thống quản lý thư viện — nơi kết nối tri thức và đam mê đọc sách.</p>
        </div>
        <div class="rd-footer__col">
          <p class="rd-footer__heading">Liên kết nhanh</p>
          <ul class="rd-footer__links">
            <li v-for="item in navItems" :key="item.component + '-f'">
              <a href="#" @click.prevent="currentComponent = item.component">{{ item.label }}</a>
            </li>
          </ul>
        </div>
        <div class="rd-footer__col">
          <p class="rd-footer__heading">Liên hệ</p>
          <ul class="rd-footer__contact">
            <li><i class="fas fa-map-marker-alt me-2"></i>Đại học Cần Thơ, Ninh Kiều, Cần Thơ</li>
            <li><i class="fas fa-envelope me-2"></i>library@ctu.edu.vn</li>
            <li><i class="fas fa-phone me-2"></i>(0292) 3830 606</li>
          </ul>
        </div>
      </div>
      <div class="rd-footer__bar">
        © {{ currentYear }} Hệ thống Quản lý Thư viện — Đại học Cần Thơ
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, watch, provide } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import HomePage     from '@/components/reader/HomePage.vue';
import BookList     from '@/components/reader/BookList.vue';
import PublisherList from '@/components/reader/PublisherList.vue';
import AuthorList   from '@/components/reader/AuthorList.vue';
import BorrowHistory from '@/components/reader/BorrowHistory.vue';
import UserProfile  from '@/components/reader/UserProfile.vue';
import CategoryList from '@/components/reader/CategoryList.vue';

const NAV_ITEMS = [
  { component: 'BookList',      label: 'Sách',              icon: 'fas fa-book' },
  { component: 'PublisherList', label: 'Nhà xuất bản',      icon: 'fas fa-building' },
  { component: 'AuthorList',    label: 'Tác giả',           icon: 'fas fa-pen-nib' },
  { component: 'CategoryList',  label: 'Thể loại',          icon: 'fas fa-tags' },
  { component: 'BorrowHistory', label: 'Lịch sử mượn sách', icon: 'fas fa-history' },
];

export default {
  name: 'ReaderDashboard',
  components: { HomePage, BookList, PublisherList, AuthorList, BorrowHistory, CategoryList, UserProfile },
  setup() {
    const store  = useStore();
    const router = useRouter();

    const currentComponent = ref(localStorage.getItem('readerCurrentComponent') || 'HomePage');
    const mobileOpen = ref(false);
    const currentYear = computed(() => new Date().getFullYear());

    watch(currentComponent, (v) => {
      localStorage.setItem('readerCurrentComponent', v);
      mobileOpen.value = false;
    });

    const currentUser = computed(() => store.getters['auth/currentUser']);
    const isAdmin = computed(() => store.getters['auth/isAdmin']);
    const currentUserName = computed(() => (
      currentUser.value?.fullName || currentUser.value?.hoTenNV || 'Độc giả'
    ));
    const userInitial = computed(() => {
      const name = currentUserName.value || 'D';
      return name.trim().split(' ').pop()?.[0]?.toUpperCase() ?? 'D';
    });

    const returnToAdmin = () => router.push('/admin');

    const handleLogout = async () => {
      await store.dispatch('auth/logout');
      localStorage.removeItem('readerCurrentComponent');
      router.push('/login');
    };

    const navigateTo = (c) => { currentComponent.value = c; };
    provide('navigateToTab', navigateTo);

    return {
      currentComponent, mobileOpen, currentYear,
      currentUser, currentUserName, userInitial, isAdmin, returnToAdmin,
      navItems: NAV_ITEMS,
      handleLogout, navigateTo,
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Variables ───────────────────────────────────────────── */
.reader-shell {
  --c-primary:    #2563eb;
  --c-primary-dk: #1d4ed8;
  --c-bg:         #f8fafc;
  --c-surface:    #ffffff;
  --c-border:     #e2e8f0;
  --c-text:       #0f172a;
  --c-muted:      #64748b;
  --c-danger:     #dc2626;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Outfit', system-ui, sans-serif;
  --nav-h:        64px;

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  background: var(--c-bg);
  color: var(--c-text);
}

/* ── Navbar ──────────────────────────────────────────────── */
.rd-navbar {
  position: sticky;
  top: 0;
  z-index: 900;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  box-shadow: 0 1px 12px rgba(15, 23, 42, 0.07);
}
.rd-navbar__inner {
  max-width: 1300px;
  margin: 0 auto;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
}

/* Brand */
.rd-navbar__brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--c-primary);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.rd-navbar__brand:hover { opacity: 0.8; }

/* Nav Links */
.rd-navbar__links {
  display: flex;
  list-style: none;
  margin: 0 0 0 1.5rem;
  padding: 0;
  gap: 0.25rem;
  flex: 1;
}
.rd-navbar__link {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-muted);
  text-decoration: none;
  transition: all 0.18s;
  white-space: nowrap;
}
.rd-navbar__link:hover { color: var(--c-primary); background: #eff6ff; }
.rd-navbar__link--active {
  color: var(--c-primary);
  background: #eff6ff;
  font-weight: 600;
}

/* User Area */
.rd-navbar__user {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-left: auto;
}
.rd-navbar__admin-return {
  align-items: center;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: var(--c-primary-dk);
  cursor: pointer;
  display: inline-flex;
  font: 500 0.8rem var(--font-body);
  min-height: 36px;
  padding: 0.4rem 0.75rem;
  white-space: nowrap;
}
.rd-navbar__admin-return:hover,
.rd-navbar__admin-return:focus-visible {
  background: #dbeafe;
  color: #1e40af;
}
.rd-navbar__user-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f1f5f9;
  border: none;
  border-radius: 999px;
  padding: 0.3rem 0.9rem 0.3rem 0.3rem;
  cursor: pointer;
  transition: background 0.18s;
  font-family: var(--font-body);
}
.rd-navbar__user-btn:hover { background: #e2e8f0; }
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--c-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}
.user-name { font-size: 0.85rem; font-weight: 500; color: var(--c-text); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rd-navbar__logout {
  background: none;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  color: var(--c-muted);
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
.rd-navbar__logout:hover { color: var(--c-danger); border-color: var(--c-danger); background: #fef2f2; }

/* Mobile Toggle */
.rd-navbar__toggle {
  display: none;
  background: none;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-text);
  margin-left: auto;
}

/* Mobile Dropdown */
.rd-navbar__mobile {
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
  padding: 0.75rem 1rem 1rem;
}
.rd-navbar__mobile-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--c-border);
}
.user-avatar--mobile {
  width: 38px;
  height: 38px;
  font-size: 1rem;
}
.rd-navbar__mobile-user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rd-navbar__mobile-user-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rd-navbar__mobile-user-role {
  font-size: 0.75rem;
  color: var(--c-muted);
}
.rd-navbar__mobile-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.75rem;
  min-height: 44px;
  border-radius: 10px;
  color: var(--c-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.18s;
}
.rd-navbar__mobile-link:hover { color: var(--c-primary); background: #eff6ff; }
.rd-navbar__mobile-link--active { color: var(--c-primary); font-weight: 600; background: #eff6ff; }
.rd-navbar__mobile-link--admin { color: var(--c-primary-dk); font-weight: 600; }
.rd-navbar__mobile-link--admin:hover { background: #eff6ff; }
.rd-navbar__mobile-link--danger { color: var(--c-danger); }
.rd-navbar__mobile-link--danger:hover { background: #fef2f2; }
.rd-navbar__mobile-sep { margin: 0.5rem 0; border-color: var(--c-border); }

.mobile-drop-enter-active,
.mobile-drop-leave-active { transition: all 0.22s ease; }
.mobile-drop-enter-from,
.mobile-drop-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Focus Visible ───────────────────────────────────────── */
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* ── Main ────────────────────────────────────────────────── */
.rd-main { flex: 1; }

/* ── Footer ──────────────────────────────────────────────── */
.rd-footer {
  background: #0f172a;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: auto;
}
.rd-footer__inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}
.rd-footer__brand {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.6rem;
}
.rd-footer__desc { margin: 0; line-height: 1.6; }
.rd-footer__heading { font-weight: 700; color: #fff; margin: 0 0 0.75rem; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.08em; }
.rd-footer__links, .rd-footer__contact { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.45rem; }
.rd-footer__links a { color: #94a3b8; text-decoration: none; transition: color 0.18s; }
.rd-footer__links a:hover { color: #fff; }
.rd-footer__contact li { display: flex; align-items: flex-start; gap: 0.35rem; }

.rd-footer__bar {
  text-align: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 0.8rem;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .rd-navbar__links { display: none; }
  .rd-navbar__user  { display: none; }
  .rd-navbar__toggle { display: flex; }
}
@media (min-width: 901px) {
  .rd-navbar__mobile { display: none !important; }
}
</style>

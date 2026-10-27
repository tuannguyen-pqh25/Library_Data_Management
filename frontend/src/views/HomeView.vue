<template>
  <main class="home">
    <div class="home-shell">
      <header class="site-header">
        <router-link to="/" class="brand" aria-label="Thư viện sách TM - Trang chủ">
          <span class="brand-mark"><i class="fas fa-book-open" aria-hidden="true"></i></span>
          <span class="brand-name">thư viện <strong>TM</strong></span>
        </router-link>

        <nav class="header-actions" aria-label="Điều hướng chính">
          <span class="header-note"><i class="fas fa-leaf" aria-hidden="true"></i> Góc nhỏ dành cho người yêu sách</span>
          <router-link to="/login" class="header-login">Đăng nhập <i class="fas fa-arrow-right" aria-hidden="true"></i></router-link>
        </nav>
      </header>

      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> MỞ TRANG SÁCH, MỞ CHÂN TRỜI</p>
          <h1 id="hero-title">Mỗi cuốn sách,<br>một <em>thế giới</em> mới.</h1>
          <p class="hero-description">
            Tìm cuốn sách tiếp theo bạn yêu thích, khám phá kho tri thức
            và gửi yêu cầu mượn sách chỉ với vài thao tác.
          </p>

          <div class="hero-actions">
            <router-link to="/register" class="button button-primary">
              Khám phá thư viện <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </router-link>
            <router-link to="/login" class="button button-secondary">
              <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Đăng nhập
            </router-link>
          </div>

          <div class="hero-footnote">
            <span class="reader-avatars" aria-hidden="true">
              <span><i class="fas fa-user"></i></span>
              <span><i class="fas fa-user"></i></span>
              <span><i class="fas fa-user"></i></span>
            </span>
            <p><strong>Một hành trình đọc mới</strong><br>Bắt đầu từ trang sách đầu tiên</p>
          </div>
        </div>

        <div class="hero-art" aria-label="Không gian đọc sách yên bình">
          <div class="art-glow"></div>
          <div class="art-caption"><span class="caption-dot"></span> GỢI Ý HÔM NAY</div>
          <div class="featured-book">
            <div class="book-sun"></div>
            <div class="book-mountain mountain-back"></div>
            <div class="book-mountain mountain-front"></div>
            <div class="book-leaf leaf-one"></div>
            <div class="book-leaf leaf-two"></div>
            <div class="book-copy">
              <span>TỦ SÁCH VIỆT</span>
              <strong>Cho tôi xin<br>một vé đi<br>tuổi thơ</strong>
              <i></i>
              <small>NGUYỄN NHẬT ÁNH</small>
            </div>
          </div>
          <div class="floating-note note-top">
            <span class="note-icon"><i class="fas fa-bookmark" aria-hidden="true"></i></span>
            <span><strong>Chạm vào tri thức</strong><small>Cuốn sách đang chờ bạn</small></span>
          </div>
          <div class="floating-note note-bottom">
            <span class="note-stars" aria-hidden="true">✦</span>
            <span><strong>Đọc một chút mỗi ngày</strong><small>Nuôi dưỡng cảm hứng</small></span>
          </div>
          <div class="art-page page-one"></div>
          <div class="art-page page-two"></div>
        </div>
      </section>

      <section class="benefits" aria-label="Điểm nổi bật">
        <div class="benefit">
          <span class="benefit-icon"><i class="fas fa-search" aria-hidden="true"></i></span>
          <span><strong>Dễ dàng khám phá</strong><small>Tìm sách theo chủ đề yêu thích</small></span>
        </div>
        <div class="benefit">
          <span class="benefit-icon"><i class="fas fa-book-reader" aria-hidden="true"></i></span>
          <span><strong>Mượn sách thuận tiện</strong><small>Gửi yêu cầu ngay trên hệ thống</small></span>
        </div>
        <div class="benefit">
          <span class="benefit-icon"><i class="fas fa-heart" aria-hidden="true"></i></span>
          <span><strong>Lưu giữ cảm hứng</strong><small>Theo dõi hành trình đọc của bạn</small></span>
        </div>
      </section>

      <footer class="site-footer">
        <span>THƯ VIỆN SÁCH TM</span>
        <span>Một trang sách hay, một ngày thật đẹp.</span>
      </footer>
    </div>
  </main>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>

<style scoped>
.home {
  --ink: #1d332f;
  --muted: #687a72;
  --green: #1e6b53;
  --green-dark: #174b3e;
  min-height: 100vh;
  padding: 0 6.5%;
  color: var(--ink);
  font-family: 'Segoe UI', sans-serif;
}

.home-shell {
  width: min(1240px, 100%);
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.site-header {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(38, 67, 55, 0.12);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  text-decoration: none;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #f7f4e9;
  background: var(--green-dark);
  font-size: 17px;
}

.brand-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.brand-name strong {
  color: var(--green);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 30px;
}

.header-note {
  color: var(--muted);
  font-size: 13px;
}

.header-note i {
  margin-right: 7px;
  color: var(--green);
}

.header-login {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--green-dark);
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}

.header-login:hover,
.header-login:focus-visible {
  color: #b16a3b;
}

.hero {
  min-height: 570px;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 0.92fr;
  align-items: center;
  gap: 6%;
  padding: 54px 0 46px;
}

.hero-copy {
  padding: 10px 0 0 2%;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  color: var(--green);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 1.8px;
}

.eyebrow span,
.caption-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  background: #d58e56;
  box-shadow: 0 0 0 4px rgba(213, 142, 86, 0.15);
}

.hero h1 {
  margin: 0;
  color: #20352f;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 5.2vw, 68px);
  font-weight: 500;
  letter-spacing: -2.7px;
  line-height: 1.1;
}

.hero h1 em {
  color: var(--green);
  font-weight: 500;
}

.hero-description {
  max-width: 470px;
  margin: 22px 0 0;
  color: #66776f;
  font-size: 16px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.button {
  min-height: 49px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 21px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  color: #fff;
  background: var(--green-dark);
  box-shadow: 0 9px 22px rgba(23, 75, 62, 0.18);
}

.button-primary:hover,
.button-primary:focus-visible {
  color: #fff;
  background: #236d55;
  box-shadow: 0 12px 26px rgba(23, 75, 62, 0.24);
}

.button-secondary {
  color: var(--green-dark);
  border-color: rgba(31, 82, 66, 0.24);
  background: rgba(255, 255, 255, 0.32);
}

.button-secondary:hover,
.button-secondary:focus-visible {
  color: var(--green-dark);
  background: rgba(255, 255, 255, 0.72);
}

.hero-footnote {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 39px;
}

.reader-avatars {
  display: flex;
  padding-left: 4px;
}

.reader-avatars span {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  margin-left: -5px;
  border: 2px solid #f5f3e9;
  border-radius: 50%;
  color: #fff;
  background: #bb825c;
  font-size: 10px;
}

.reader-avatars span:nth-child(2) {
  background: #78927d;
}

.reader-avatars span:nth-child(3) {
  background: #526e64;
}

.hero-footnote p {
  margin: 0;
  color: #7b8982;
  font-size: 11px;
  line-height: 1.55;
}

.hero-footnote strong {
  color: #41564d;
  font-size: 12px;
}

.hero-art {
  position: relative;
  width: 100%;
  max-width: 490px;
  height: 430px;
  justify-self: end;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 34px;
  background:
    radial-gradient(ellipse at 74% 18%, rgba(201, 168, 111, 0.22), transparent 34%),
    linear-gradient(145deg, #244f43 0%, #173c34 58%, #1b342e 100%);
  box-shadow: 0 28px 70px rgba(35, 57, 46, 0.2);
}

.hero-art::before,
.hero-art::after {
  position: absolute;
  content: '';
  border: 1px solid rgba(237, 220, 178, 0.11);
  border-radius: 50%;
}

.hero-art::before {
  width: 410px;
  height: 410px;
  right: -180px;
  top: -190px;
}

.hero-art::after {
  width: 300px;
  height: 300px;
  left: -175px;
  bottom: -180px;
}

.art-glow {
  position: absolute;
  width: 290px;
  height: 290px;
  top: 62px;
  right: 52px;
  border-radius: 50%;
  background: rgba(214, 174, 111, 0.12);
  filter: blur(2px);
}

.art-caption {
  position: absolute;
  top: 28px;
  left: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(247, 241, 220, 0.78);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.caption-dot {
  width: 6px;
  height: 6px;
  box-shadow: none;
}

.featured-book {
  position: relative;
  z-index: 1;
  width: 210px;
  height: 300px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px 11px 11px 4px;
  background: linear-gradient(155deg, #dda86a 0%, #bd8054 47%, #776046 100%);
  box-shadow: 15px 20px 35px rgba(4, 20, 17, 0.4), inset 5px 0 8px rgba(68, 38, 24, 0.22);
  transform: rotate(-5deg) translate(5px, 6px);
}

.featured-book::before {
  position: absolute;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 10px;
  width: 1px;
  content: '';
  background: rgba(255, 237, 197, 0.34);
}

.book-sun {
  position: absolute;
  top: 76px;
  right: 31px;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: #f0cb8b;
  box-shadow: 0 0 36px rgba(255, 215, 141, 0.38);
}

.book-mountain {
  position: absolute;
  bottom: 64px;
  width: 0;
  height: 0;
  border-right: 125px solid transparent;
  border-bottom: 110px solid #5e7258;
  border-left: 125px solid transparent;
}

.mountain-back {
  right: -40px;
  bottom: 57px;
  border-bottom-color: #94785a;
}

.mountain-front {
  left: -72px;
  bottom: 45px;
  border-bottom-color: #425f4e;
}

.book-leaf {
  position: absolute;
  z-index: 1;
  bottom: 75px;
  width: 30px;
  height: 57px;
  border: 1px solid rgba(242, 219, 166, 0.52);
  border-radius: 100% 0 100% 0;
  transform: rotate(30deg);
}

.leaf-one {
  right: 28px;
}

.leaf-two {
  right: 48px;
  bottom: 62px;
  transform: rotate(-4deg) scale(0.75);
}

.book-copy {
  position: absolute;
  z-index: 3;
  inset: 25px 20px auto 24px;
  display: flex;
  flex-direction: column;
  color: #fff7df;
}

.book-copy > span {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 2px;
}

.book-copy strong {
  margin-top: 25px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.08;
  text-shadow: 0 2px 6px rgba(61, 43, 28, 0.2);
}

.book-copy i {
  width: 25px;
  height: 1px;
  margin-top: 12px;
  background: #f4d392;
}

.book-copy small {
  margin-top: 8px;
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 1.3px;
}

.floating-note {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.64);
  border-radius: 12px;
  background: rgba(250, 248, 238, 0.94);
  box-shadow: 0 12px 28px rgba(5, 23, 19, 0.2);
}

.note-top {
  top: 101px;
  right: 17px;
}

.note-bottom {
  bottom: 43px;
  left: 18px;
}

.note-icon,
.note-stars {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: var(--green);
  background: #e7eee3;
  font-size: 13px;
}

.note-stars {
  color: #b67945;
  background: #f5ead7;
  font-size: 19px;
}

.floating-note strong,
.floating-note small {
  display: block;
  white-space: nowrap;
}

.floating-note strong {
  color: #31483e;
  font-size: 11px;
}

.floating-note small {
  margin-top: 4px;
  color: #7d8981;
  font-size: 9px;
}

.art-page {
  position: absolute;
  z-index: 0;
  width: 172px;
  height: 244px;
  border: 1px solid rgba(248, 239, 209, 0.24);
  border-radius: 4px 9px 9px 4px;
  background: linear-gradient(145deg, #c89767, #7d6953);
  box-shadow: 8px 14px 28px rgba(0, 0, 0, 0.17);
}

.page-one {
  transform: rotate(8deg) translate(44px, 9px);
}

.page-two {
  transform: rotate(14deg) translate(61px, 12px);
  opacity: 0.55;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 22px 28px;
  border: 1px solid rgba(45, 70, 56, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.54);
  box-shadow: 0 10px 30px rgba(43, 62, 50, 0.045);
  backdrop-filter: blur(9px);
}

.benefit {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.benefit-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--green);
  background: #e9eee4;
  font-size: 15px;
}

.benefit:nth-child(2) .benefit-icon {
  color: #ad7548;
  background: #f4ebdf;
}

.benefit:nth-child(3) .benefit-icon {
  color: #718268;
  background: #edf0e7;
}

.benefit strong,
.benefit small {
  display: block;
}

.benefit strong {
  color: #344a40;
  font-size: 13px;
}

.benefit small {
  margin-top: 5px;
  color: #7c8981;
  font-size: 11px;
}

.site-footer {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #89938b;
  font-size: 10px;
}

.site-footer span:first-child {
  color: #66776d;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.4px;
}

@media (max-width: 900px) {
  .home {
    padding: 0 5%;
  }

  .hero {
    grid-template-columns: 1fr 0.85fr;
    gap: 3%;
  }

  .hero-art {
    height: 390px;
    transform: scale(0.94);
    transform-origin: center right;
  }

  .note-top {
    right: 7px;
  }

  .benefits {
    gap: 12px;
    padding: 20px;
  }

  .benefit {
    gap: 9px;
  }
}

@media (max-width: 680px) {
  .home {
    padding: 0 20px;
  }

  .site-header {
    min-height: 72px;
  }

  .brand-mark {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .brand-name {
    font-size: 18px;
  }

  .header-note {
    display: none;
  }

  .hero {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 48px 0 30px;
  }

  .hero-copy {
    padding: 0;
  }

  .eyebrow {
    margin-bottom: 17px;
    font-size: 9px;
    letter-spacing: 1.4px;
  }

  .hero h1 {
    font-size: clamp(43px, 12vw, 60px);
    letter-spacing: -2px;
  }

  .hero-description {
    margin-top: 17px;
    font-size: 14px;
    line-height: 1.75;
  }

  .hero-actions {
    margin-top: 23px;
  }

  .button {
    min-height: 46px;
    padding: 0 16px;
    font-size: 13px;
  }

  .hero-footnote {
    margin-top: 26px;
  }

  .hero-art {
    width: 100%;
    max-width: none;
    height: 350px;
    justify-self: center;
    transform: none;
    border-radius: 27px;
  }

  .featured-book {
    transform: rotate(-5deg) translate(0, 8px) scale(0.86);
  }

  .note-top {
    top: 78px;
    right: 8px;
    transform: scale(0.86);
    transform-origin: right center;
  }

  .note-bottom {
    bottom: 27px;
    left: 7px;
    transform: scale(0.86);
    transform-origin: left center;
  }

  .art-caption {
    top: 22px;
    left: 22px;
  }

  .benefits {
    grid-template-columns: 1fr;
    gap: 17px;
    padding: 20px;
  }

  .benefit small {
    font-size: 10px;
  }

  .site-footer {
    min-height: 60px;
    gap: 12px;
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

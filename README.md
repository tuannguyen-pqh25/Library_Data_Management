# Library Management System

Đây là dự án Quản lý Thư viện được phát triển với **CSDL (MySQL)**,**Backend (Node.js/Express)** và **Frontend (Vue.js)**.

Đây là mã nguồn có sẵn đang được sửa và tùy biến cho đồ án CT467. Mục tiêu hiện tại gồm hoàn thiện nghiệp vụ theo [`Cores/Tieuchiduan.md`](Cores/Tieuchiduan.md) và cải thiện giao diện. Xem [`Cores/checkpoint.md`](Cores/checkpoint.md) để biết trạng thái mới nhất, [`Cores/Chienluoc.md`](Cores/Chienluoc.md) để biết ưu tiên và [`Cores/next_step_guide.md`](Cores/next_step_guide.md) để lấy prompt triển khai tiếp theo. Ghi chép môi trường trong checkpoint có thể đã cũ; kiểm tra lại trước khi chạy migration hoặc demo.

---

## Cài đặt Dự án

Làm theo các bước sau để thiết lập và chạy dự án trên máy cá nhân của bạn.

### 1. Yêu cầu Tiên quyết

Bạn cần cài đặt các công cụ sau trước khi bắt đầu:

- **Node.js** (Phiên bản đề xuất: 16.x trở lên)
- **MySQL Server**
- **Git**

### 2. Clone Dự án

Sử dụng Git để sao chép kho lưu trữ về máy cá nhân:

```bash
git clone <URL_GitHub_Của_Bạn> LibraryManagement
cd LibraryManagement
```

## Cấu hình Backend & Frontend

### 3. Cài đặt Thư viện Phụ thuộc

Dự án có hai thư mục con (backend và frontend). Bạn cần cài đặt các gói phụ thuộc cho cả hai:

```bash
# Cài đặt cho Backend
cd backend
npm install

# Quay lại thư mục gốc và cài đặt cho Frontend
cd ..
cd frontend
npm install
```

### 4. Thiết lập File Môi trường (.env)

Tạo các file cấu hình môi trường cần thiết để ứng dụng hoạt động.

#### a. Backend (backend/.env)

Tạo file có tên .env trong thư mục backend với nội dung sau và điền thông tin email của bạn:

```bash
# Cấu hình Bảo mật và Server
JWT_SECRET=your_jwt_secret_key
PORT=5000

# Cấu hình Email (Sử dụng cho các chức năng như đặt lại mật khẩu)
EMAIL_USER=<Địa chỉ Email của bạn>
EMAIL_PASS=<Mật khẩu ứng dụng/App Password của Email>
EMAIL_SERVICE=gmail
EMAIL_PORT=587
EMAIL_HOST=smtp.gmail.com

# Cấu hình Database
DB_NAME=library_db
DB_USER=librarymanagement
DB_PASS=librarymanagement
DB_HOST=127.0.0.1
DB_PORT=3306
```

#### b. Frontend (frontend/.env)

Tạo file có tên .env trong thư mục frontend với nội dung sau:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_API_IMAGE_URL=http://localhost:5000
```

## Cấu hình Database (MySQL)

Dự án sử dụng MySQL và Sequelize để quản lý cơ sở dữ liệu.

### 5. Tạo Người dùng và Database MySQL

Sử dụng MySQL client (hoặc công cụ như phpMyAdmin/MySQL Workbench) để tạo người dùng và database theo thông số trong file .env:

#### 1. Tạo người dùng:

```bash
-- Tạo người dùng mới với mật khẩu
CREATE USER 'librarymanagement'@'127.0.0.1' IDENTIFIED BY 'librarymanagement';
```

#### 2. Tạo database:

```bash
-- Tạo database
CREATE DATABASE library_db;
```

#### 3. Cấp quyền:

```bash
-- Cấp toàn bộ quyền cho người dùng trên database này
GRANT ALL PRIVILEGES ON library_db.* TO 'librarymanagement'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### 6. Khởi tạo Bảng và Dữ liệu

Tùy theo mục đích sử dụng, bạn hãy chọn 1 trong 2 cách sau:

**Cách 1: Khởi tạo nhanh kèm Dữ liệu Demo (Khuyên dùng cho Test/Dev)**
Lệnh này sẽ tự động tạo cấu trúc CSDL, tạo tài khoản Admin và nạp sẵn một số sách/độc giả mẫu để bạn dễ dàng test tính năng.

```bash
# Trở lại thư mục backend
cd ../backend

npm run demo:setup
```

**Cách 2: Khởi tạo CSDL Trắng (Dành cho Deploy thực tế)**
Chỉ tạo cấu trúc CSDL và 1 tài khoản Admin duy nhất (không có dữ liệu mẫu).

```bash
# Trở lại thư mục backend
cd ../backend

# a. Chạy Migrations (Tạo tất cả các bảng, func, procedure)
npx sequelize-cli db:migrate

# b. Khởi tạo tài khoản Admin mặc định (Email: Admin, Pass: admin123)
npm run seed-admin
```
**Trường hợp gặp lỗi**
`ERROR: You do not have the SUPER privilege and binary logging is enabled (you *might* want to use the less safe log_bin_trust_function_creators variable)` 
Thì quay lại mySQL 26.7 Command Line Client, sau đó nhập lệnh `SET GLOBAL log_bin_trust_function_creators = 1;`
Sau dó quay lại bước 6.

## Chạy Dự án

Sau khi hoàn tất cấu hình, bạn có thể khởi động Backend và Frontend.

### 7. Khởi động Backend

Chạy từ thư mục backend (Backend sẽ chạy ở cổng 5000):

```bash
# Chế độ phát triển (Sử dụng nodemon để tự động tải lại)
npm run dev
# HOẶC
# Chế độ thông thường
# npm start
```

### 8. Khởi động Frontend

Mở một Terminal mới, chuyển đến thư mục frontend và khởi động giao diện người dùng (Frontend sẽ chạy ở cổng 5173):

```bash
cd ../frontend
npm run dev:reader # demo.reader@example.test DemoReader123!
npm run dev:admin # Admin admin123
```

Ứng dụng sẽ tự động mở trong trình duyệt của bạn (thường là http://localhost:5173).

---

## Hướng dẫn Public Link Demo với Cloudflare Tunnel (Cho Buổi Báo Cáo)

Để giảng viên và bạn bè trong buổi báo cáo có thể dùng điện thoại hoặc laptop cá nhân truy cập và test thử trực tiếp mà không cần dùng chung mạng Wi-Fi, bạn có thể dùng tính năng **Cloudflare Quick Tunnel** (hoàn toàn **miễn phí**, **không cần đăng ký tài khoản Cloudflare**, không cần mua domain và tự động hỗ trợ HTTPS).

> [!NOTE]
> Do dự án chạy mô hình Client-Server riêng biệt (**Backend: port 5000**, **Frontend: port 5173 / 5174**), để người ngoài dùng được đầy đủ tính năng (gọi API, xem ảnh bìa sách), bạn cần mở tunnel cho **cả Backend và Frontend**.

---

### Bước 1: Cài đặt công cụ `cloudflared`

Chọn 1 trong các cách sau:
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
  *(Sau khi cài xong, tắt và mở lại PowerShell/CMD để lệnh có hiệu lực).*

Kiểm tra cài đặt:
```bash
cloudflared --version
```

---

### Bước 2: Cấu hình `allowedHosts` trong Vite (Đã cấu hình sẵn)

Mặc định Vite 6 chặn các hostname bên ngoài `localhost`. File `frontend/vite.config.js` đã được thêm cấu hình `server: { allowedHosts: true }` để cho phép truy cập qua domain `.trycloudflare.com`:

```javascript
server: {
  allowedHosts: true, // Cho phép truy cập qua Cloudflare Quick Tunnel
}
```

---

### Bước 3: Mở Quick Tunnel cho Backend (Port 5000)

1. Mở một **Terminal mới**, chạy lệnh:
   ```bash
   cloudflared tunnel --url http://localhost:5000
   ```
2. Chờ 3–5 giây, quan sát terminal tìm dòng có định dạng:
   ```text
   Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
   https://xxxx-xxxx-xxxx.trycloudflare.com
   ```
3. **Sao chép URL HTTPS này** (đây là URL Backend public tạm thời). **Giữ nguyên terminal này chạy, không tắt.**

---

### Bước 4: Cập nhật Frontend trỏ về URL Backend public

Mở file `frontend/.env` và thay thế `http://localhost:5000` bằng URL vừa copy ở Bước 3:

```env
VITE_API_URL=https://xxxx-xxxx-xxxx.trycloudflare.com/api
VITE_API_IMAGE_URL=https://xxxx-xxxx-xxxx.trycloudflare.com
```

> [!IMPORTANT]
> Sau khi sửa file `.env`, bạn phải **khởi động lại** Frontend dev server:
> Nhấn `Ctrl + C` tại terminal frontend đang chạy, rồi chạy lại:
> - Giao diện Độc giả: `npm run dev:reader` (Port 5173)
> - Giao diện Quản trị: `npm run dev:admin` (Port 5174)

---

### Bước 5: Mở Quick Tunnel cho Frontend

Mở thêm một **Terminal mới** khác và chạy tunnel cho port Frontend muốn demo:

```bash
# Nếu demo giao diện Độc giả (Port 5173):
cloudflared tunnel --url http://localhost:5173

# HOẶC nếu demo giao diện Quản trị (Port 5174):
cloudflared tunnel --url http://localhost:5174
```

Terminal sẽ in ra đường link public của Frontend, ví dụ:
```text
https://yyyy-yyyy-yyyy.trycloudflare.com
```

---

### Bước 6: Trình chiếu & Chia sẻ cho buổi báo cáo

- **Gửi link:** Copy link Frontend gửi lên nhóm chat/Zalo.
- **Tạo mã QR chiếu lên slide:** Dán link frontend vào các trang tạo QR miễn phí (ví dụ: [qr-code-generator.com](https://www.qr-code-generator.com/) hoặc [me-qr.com](https://me-qr.com/)) rồi chèn ảnh QR vào slide báo cáo. Mọi người chỉ cần dùng camera điện thoại quét là vào test trực tiếp được ngay!



## Hoàn tất

Bạn đã cài đặt và chạy thành công dự án Library Management System!

Nếu gặp lỗi hãy liên hệ với chủ source.

# Library Management System

Đây là dự án Quản lý Thư viện được phát triển với **CSDL (MySQL)**,**Backend (Node.js/Express)** và **Frontend (Vue.js)**.

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

### 6. Khởi tạo Bảng và Dữ liệu Mặc định

Sử dụng Sequelize-CLI để chạy các migrations (tạo bảng, func, procedure) và thêm dữ liệu người dùng Admin mặc định.

**Lưu ý:** Chạy các lệnh này từ thư mục backend.

```bash
# Trở lại thư mục backend
cd ../backend

# a. Chạy Migrations (Tạo tất cả các bảng, func, procedure)
npx sequelize-cli db:migrate

# b. Khởi tạo tài khoản Admin mặc định (Email: admin, Pass: Amin123)
npm run seed-admin
```

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
npm run dev
```

Ứng dụng sẽ tự động mở trong trình duyệt của bạn (thường là http://localhost:5173).

## Hoàn tất

Bạn đã cài đặt và chạy thành công dự án Library Management System!

Nếu gặp lỗi hãy liên hệ với chủ source.

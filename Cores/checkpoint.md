# Checkpoint — Trạng thái dự án LibraryManagement

> Cập nhật lần cuối: 2026-09-28

---

## Môi trường đã được cài đặt và xác nhận

| Thành phần | Trạng thái | Ghi chú |
|---|---|---|
| Node.js | ✅ v26.1.0 | Cài sẵn trên máy |
| npm | ✅ 11.13.0 | Cài sẵn trên máy |
| MySQL Server | ✅ 8.0.46 | Đã cài vào `D:\MySQL\MySQL Server 8.0` |
| MySQL Port | ✅ **3306** | Đã sửa từ 3307 → 3306 trong `config/config.json` |
| `backend/node_modules` | ✅ | Đã `npm install` thành công |
| `frontend/node_modules` | ✅ | Đã `npm install` thành công (Node v26 có warn EBADENGINE nhưng không ảnh hưởng) |

---

## Cấu hình Database đã xác nhận

- **Database:** `library_db`
- **MySQL User:** `librarymanagement` (host: `127.0.0.1`, password: `librarymanagement`)
- **MySQL User quyền:** `GRANT ALL PRIVILEGES ON library_db.*` ✅
- **File cấu hình:** `backend/.env` và `backend/config/config.json` đều dùng port **3306**

> **Lưu ý quan trọng:** `sequelize-cli` đọc cấu hình từ `backend/config/config.json` (KHÔNG phải từ `.env`). File này đã được sửa port từ 3307 → 3306.

---

## Trạng thái Migration & Seed

| Lệnh | Trạng thái | Ghi chú |
|---|---|---|
| `npx sequelize-cli db:migrate` | ✅ DONE | Tất cả bảng và function/trigger/procedure đã được tạo |
| `npm run seed-admin` | ✅ DONE | Tài khoản admin mặc định đã tạo |
| `SET GLOBAL log_bin_trust_function_creators = 1` | ✅ DONE | Cần chạy lại trong MySQL mỗi khi server MySQL khởi động lại (nếu cần migrate lại) |

---

## Tài khoản mặc định

| Loại | Tên đăng nhập | Mật khẩu | Ghi chú |
|---|---|---|---|
| Nhân viên Admin | `Admin` (chữ A hoa) | `admin123` | Tạo bởi `npm run seed-admin` |
| MySQL root | `root` | *(mật khẩu bạn tự đặt khi cài)* | Dùng để quản trị MySQL |

---

## Lỗi đã gặp và đã giải quyết

| Lỗi | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:3307` | `config/config.json` gán cứng port 3307, MySQL mới cài dùng port 3306 | Sửa port trong `backend/config/config.json` về `3306` |
| `SUPER privilege... log_bin_trust_function_creators` | User `librarymanagement` không có quyền SUPER để tạo function/trigger | Chạy `SET GLOBAL log_bin_trust_function_creators = 1;` bằng tài khoản root trong MySQL CLI |
| `Cannot find module './logger'` (winston) | Thư viện winston bị cài thiếu/hỏng file nội bộ | Chạy `npm install winston` trong thư mục `backend` |

---

## Trạng thái chạy hiện tại

- **Backend:** đang chạy ở `http://localhost:5000` (lệnh `npm run dev` tại `backend`)
- **Frontend:** đang chạy ở `http://localhost:5173` (lệnh `npm run dev` tại `frontend`)
- **Đăng nhập:** vào tab **Nhân viên**, dùng tên `Admin` / mật khẩu `admin123`

---

## Việc cần làm tiếp theo (theo Chiến lược)

Dự án đang ở **bước cài đặt đã hoàn tất**. Bước tiếp theo là bắt đầu **Giai đoạn 1 — Khóa lỗi dữ liệu lõi** theo file `next_step_guide.md`.

Các vấn đề nghiệp vụ cần ưu tiên sửa ngay (theo `Chienluoc.md`):
1. **[Ưu tiên cao - A]** Sửa lỗi tồn kho bị cập nhật 2 lần (trigger + controller cùng tăng/giảm).
2. **[Ưu tiên cao - A]** State machine trạng thái phiếu mượn: `Chờ duyệt → Đã duyệt/Từ chối → Đã trả`.
3. **[Ưu tiên cao - A]** Sửa procedure "phiếu chưa trả" (đang lọc trạng thái `Dang muon` không tồn tại).
4. **[Ưu tiên cao - A]** Thống kê độc giả mượn năm phải dùng `COUNT(DISTINCT maDocGia)`.

---

## Ghi chú môi trường Windows

- Để **bật MySQL thủ công** (nếu tắt tự khởi động): Phím Windows → tìm "Services" → Tìm dòng `MySQL80` → Chuột phải → Start.
- Mỗi lần mở terminal mới để code, cần mở 2 terminal:
  - Terminal 1: `cd backend` rồi `npm run dev`
  - Terminal 2: `cd frontend` rồi `npm run dev`

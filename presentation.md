# KỊCH BẢN THUYẾT TRÌNH & DEMO
## Hệ thống Quản lý Thư viện — Đồ án CT467

> **Mục đích:** Đây là “bản đạo diễn” cho buổi báo cáo trước hội đồng. Mỗi đoạn đều chỉ rõ: nói gì, chiếu gì, mở file nào, bấm vào đâu, kết quả mong đợi và câu chốt.
>
> **Thời lượng dự kiến:** 24 phút trình bày + 8–12 phút hỏi đáp.
>
> **Cách dùng nhanh:** In hoặc mở file này trên màn hình phụ. Người nói chỉ cần đọc phần **[NÓI]**, người thao tác máy chiếu làm theo **[HIỂN THỊ] / [MỞ FILE] / [THAO TÁC]**.
>
> **Quy ước:**
> - **[HIỂN THỊ]** — cửa sổ/tab/màn hình cần chiếu.
> - **[MỞ FILE]** — file và khoảng dòng cần mở sẵn (số dòng theo mã nguồn hiện tại).
> - **[THAO TÁC]** — thao tác chuột/bàn phím chính xác.
> - **[NÓI]** — lời thoại gợi ý, có thể nói tự nhiên hơn nhưng giữ nguyên ý và số liệu.
> - **[KẾT QUẢ MONG ĐỢI]** — dấu hiệu để biết demo đang đúng.
> - **[CÂU CHỐT]** — một câu để kết thúc ý, giúp người nghe nhớ.
> - **[NẾU BỊ HỎI]** — câu trả lời ngắn, dùng khi bị cắt ngang hoặc trong Q&A.
>
> **Nguyên tắc phối hợp:** Mỗi thời điểm chỉ **một người nói**. Người thao tác không giải thích dài; người nói không tự bấm máy. D là người giữ đồng hồ và ra hiệu chuyển đoạn.

---

## 0. TỔNG QUAN BUỔI BÁO CÁO

### 0.1. Mục tiêu của buổi trình bày

Sau 24 phút, hội đồng cần thấy được 4 điều:

1. **CSDL đúng chuẩn:** đủ 7 bảng trọng tâm, khóa chính phức hợp, khóa ngoại, 17 migrations, function/trigger/procedure hoạt động trên MySQL thật.
2. **Nghiệp vụ có chiều sâu:** transaction duyệt mượn/trả, `SELECT ... FOR UPDATE`, chống race condition, lock ordering chống deadlock.
3. **Sản phẩm chạy được:** dashboard KPI, theo dõi quá hạn, luồng độc giả mượn/trả, PDF phiếu mượn/trả/phạt, Admin CRUD và chặn xóa bằng `409`.
4. **Kiểm thử và bàn giao:** 49 test backend, 47 pass + 2 skip khi thiếu DB tích hợp; trên MySQL thật đạt 49/49; cài đặt từ DB sạch bằng migration.

### 0.2. Phân vai và thời lượng

| Thứ tự | Thời gian | Phút | Người | Nội dung | Slide |
|---|---|---:|---|---|---|
| 1 | 00:00–02:00 | 2 | **D — Vũ** | Mở đầu, giới thiệu nhóm, đề tài, kiến trúc, roadmap demo | 01–05 |
| 2 | 02:00–09:00 | 7 | **A — Minh** | CSDL, 7 bảng, function, trigger, 3 procedure, transaction/locking | 06–17 |
| 3 | 09:00–14:00 | 5 | **B — Thắng** | Dashboard, 3 KPI, phiếu quá hạn, F5, luồng dữ liệu | 18–22 |
| 4 | 14:00–20:00 | 6 | **C — Tuấn** | Catalogue, giỏ mượn, quota 5, gửi yêu cầu, lịch sử, PDF | 23–27 |
| 5 | 20:00–24:00 | 4 | **D — Vũ** | Duyệt phiếu, xác nhận trả + phạt, PATCH, xóa 409, kiểm thử, kết luận | 28–32 |
| 6 | 24:00–35:00 | 8–12 | **Cả nhóm** | Q&A theo ma trận phân công | Backup 33–37 |

> **Mẹo giữ giờ:** A có 7 phút nhưng phần SQL demo dễ “sa đà”. Chỉ chạy 4 mục chính: schema → function → trigger → 3 procedure. Phần `FOR UPDATE` dùng sơ đồ + test, không mở 2 session MySQL trừ khi còn thời gian.

### 0.3. Sơ đồ chuyển đoạn

```text
D mở đầu (2')
   ↓ “Để thấy dữ liệu này được bảo vệ như thế nào, mời anh Minh.”
A — CSDL & transaction (7')
   ↓ “CSDL đúng là nền; giờ xem người quản trị thấy gì.”
B — Dashboard (5')
   ↓ “Từ màn hình quản trị, chuyển sang trải nghiệm độc giả.”
C — Độc giả (6')
   ↓ “Độc giả đã gửi yêu cầu; quay lại quản trị để duyệt và kiểm tra ràng buộc.”
D — Duyệt, xóa, kiểm thử, kết luận (4')
   ↓ Q&A
```

---

## 1. CHECKLIST TRƯỚC GIỜ G

> **Nguyên tắc:** Không thao tác gì lần đầu tiên trước hội đồng. Mọi thứ dưới đây phải được chạy thử trên **đúng máy sẽ demo**, cùng độ phân giải máy chiếu.

### 1.1. Trước 1 ngày

- [ ] Backup CSDL demo:
  ```powershell
  mysqldump -u root -p library_db > backup_library_db.sql
  ```
- [ ] Chạy lại toàn bộ luồng demo ít nhất 2 lần trên máy demo.
- [ ] Kiểm tra xuất 3 PDF: phiếu mượn, phiếu trả, form phạt. Mở bằng trình đọc PDF để chắc chắn font tiếng Việt không lỗi.
- [ ] Chuẩn bị **bộ ảnh dự phòng** cho: dashboard, giỏ mượn, lịch sử, màn hình duyệt, lỗi 409, kết quả test, kết quả SQL. Lưu trong `assets/backup/`.
- [ ] Sạc laptop, mang theo HDMI/Type-C, chuột, bút trình chiếu, USB dự phòng.
- [ ] Gửi trước slide PDF cho nhóm để tập; chốt người trả lời từng nhóm câu hỏi.

### 1.2. Trước 60 phút

- [ ] Khởi động MySQL:
  ```powershell
  net start MySQL80
  ```
  Nếu dùng XAMPP/WAMP, bật MySQL trong Control Panel.
- [ ] Kiểm tra migration:
  ```powershell
  cd backend
  npx sequelize-cli db:migrate
  ```
  Kỳ vọng: chạy hết 17 migration hoặc báo “No migrations were executed”. **Không** thấy lỗi `ER_...`.
- [ ] Nếu cần dữ liệu mẫu:
  ```powershell
  npm run demo:setup
  ```
  Lệnh này chạy migration + tạo admin + seed dữ liệu demo.
- [ ] Chạy backend:
  ```powershell
  npm run dev
  ```
  Kỳ vọng: `✅ Kết nối MySQL thành công!` và `🚀 Server đang chạy tại cổng 5000`.
- [ ] Chạy frontend:
  ```powershell
  cd ..\frontend
  npm run dev
  ```
  Kỳ vọng: `http://localhost:5173`.
- [ ] Mở **2 profile trình duyệt tách biệt**:
  - Profile 1: Admin.
  - Profile 2: Độc giả.
  - Không dùng chung profile vì `localStorage.token` sẽ ghi đè nhau.
- [ ] Đăng nhập thử:
  - Admin: tên đăng nhập `Admin`, mật khẩu `admin123`.
  - Độc giả: `demo.reader@example.test`, mật khẩu `DemoReader123!`.
- [ ] Xóa giỏ mượn cũ của độc giả. Trong DevTools Console:
  ```js
  localStorage.removeItem('readerBorrowCart');
  localStorage.removeItem('readerCurrentComponent');
  ```
- [ ] Chạy SQL chuẩn bị dữ liệu demo ở mục 1.4.
- [ ] Ghi lại **số liệu ban đầu** ra giấy nháp: 3 KPI, số phiếu chưa trả, tồn kho sách demo.
- [ ] Thử F5 dashboard 2 lần; xác nhận KPI và số sách/tác giả/NXB không về 0.
- [ ] Mở sẵn 5 cửa sổ theo thứ tự:
  1. Slide.
  2. Browser Admin (tab Dashboard).
  3. Browser Độc giả (tab Sách).
  4. MySQL Workbench + file `backend/scripts/demo_tuan4_nguoi_a.sql`.
  5. VS Code + terminal.

### 1.3. Trước 10 phút

- [ ] Tắt thông báo Windows, Teams, Zalo, email.
- [ ] Đặt chế độ “Không làm phiền”; tắt auto-update.
- [ ] Đặt zoom trình duyệt **100%** (hoặc 110% nếu máy chiếu yếu); ẩn bookmark bar.
- [ ] Đóng các tab không liên quan.
- [ ] Mở sẵn file slide ở chế độ trình chiếu; kiểm tra tỉ lệ 16:9.
- [ ] Để sẵn một chai nước; không uống khi đang nói.
- [ ] Nhóm trưởng D xác nhận lại: ai bấm máy, ai nói, ai trả lời Q&A.

### 1.4. Dữ liệu demo cần chuẩn bị

Mục tiêu của bộ dữ liệu:

| Ký hiệu | Vai trò | Trạng thái | Mục đích |
|---|---|---|---|
| **S** | Sách “Clean Code – Mã Sạch” | Tồn kho = **2** | Chứng minh tồn kho `2 → 1 → 2` |
| **P** | Phiếu mượn của `demo.reader@example.test` | `Đang mượn`, quá hạn **2 ngày**, 1 cuốn S | Độc giả gửi yêu cầu trả; admin xác nhận; phạt 2.000đ |
| **Q** | Phiếu mượn của tài khoản phụ | `Chờ duyệt`, 1 cuốn S | A duyệt Q để chứng minh `FOR UPDATE` + trừ kho `2 → 1` |
| **H** | Sách “Kính vạn hoa” | Tồn kho = **0**, có 1 phiếu `Đã trả` | D thử xóa → `409` vì còn lịch sử mượn/trả |

> **Cảnh báo:** Đoạn SQL dưới đây **xóa toàn bộ phiếu mượn của 2 tài khoản demo** để chạy lại được nhiều lần. Chỉ chạy trên CSDL demo đã backup. Không chạy trên dữ liệu thật.

```sql
-- =====================================================================
-- CHUẨN BỊ DỮ LIỆU DEMO
-- Chạy trong MySQL Workbench, sau khi đã backup library_db
-- =====================================================================
USE library_db;
SET NAMES utf8mb4;

-- 0. Hai độc giả demo -------------------------------------------------
SET @readerP = (SELECT maDocGia FROM DocGia
                WHERE email = 'demo.reader@example.test' LIMIT 1);

INSERT INTO DocGia
  (fullName, ngaySinh, phai, diaChi, dienThoai, email, password, createdAt, updatedAt)
SELECT 'Bạn Demo', '2000-01-01', 'Nam', 'Cần Thơ', '0900000004',
       'demo.friend@example.test', password, NOW(), NOW()
FROM DocGia
WHERE maDocGia = @readerP
  AND NOT EXISTS (
    SELECT 1 FROM DocGia WHERE email = 'demo.friend@example.test'
  );

SET @readerQ = (SELECT maDocGia FROM DocGia
                WHERE email = 'demo.friend@example.test' LIMIT 1);

-- 1. Sách S: tồn kho = 2 ---------------------------------------------
SET @maSachS = (SELECT maSach FROM Sach
                WHERE tenSach = 'Clean Code - Mã Sạch' LIMIT 1);
SET @tgS = (SELECT maTacGia FROM Sach WHERE maSach = @maSachS LIMIT 1);
SET @tlS = (SELECT maTheLoai FROM Sach WHERE maSach = @maSachS LIMIT 1);

UPDATE Sach
SET soLuongHienCo = 2
WHERE maSach = @maSachS AND maTacGia = @tgS AND maTheLoai = @tlS;

-- 2. Sách H: tồn kho = 0 ---------------------------------------------
SET @maSachH = (SELECT maSach FROM Sach
                WHERE tenSach = 'Kính vạn hoa' LIMIT 1);
SET @tgH = (SELECT maTacGia FROM Sach WHERE maSach = @maSachH LIMIT 1);
SET @tlH = (SELECT maTheLoai FROM Sach WHERE maSach = @maSachH LIMIT 1);

UPDATE Sach
SET soLuongHienCo = 0
WHERE maSach = @maSachH AND maTacGia = @tgH AND maTheLoai = @tlH;

-- 3. Dọn phiếu demo cũ của 2 độc giả --------------------------------
DELETE pt
FROM PhieuTra pt
JOIN ChiTietPhieuMuon ct
  ON ct.maChiTietPM = pt.maChiTietPM
 AND ct.maPhieuMuon = pt.maPhieuMuon
 AND ct.maSach = pt.maSach
JOIN PhieuMuon pm
  ON pm.maPhieuMuon = ct.maPhieuMuon
 AND pm.maDocGia = ct.maDocGia
WHERE pm.maDocGia IN (@readerP, @readerQ);

DELETE ct
FROM ChiTietPhieuMuon ct
JOIN PhieuMuon pm
  ON pm.maPhieuMuon = ct.maPhieuMuon
 AND pm.maDocGia = ct.maDocGia
WHERE pm.maDocGia IN (@readerP, @readerQ);

DELETE FROM PhieuMuon
WHERE maDocGia IN (@readerP, @readerQ);

-- 4. Phiếu P: đang mượn, quá hạn 2 ngày, 1 cuốn S --------------------
INSERT INTO PhieuMuon
  (maDocGia, ngayMuon, ngayTra, trangThai, createdAt, updatedAt)
VALUES
  (@readerP,
   DATE_SUB(CURDATE(), INTERVAL 16 DAY),
   DATE_SUB(CURDATE(), INTERVAL 2 DAY),
   'Đang mượn', NOW(), NOW());
SET @pmP = LAST_INSERT_ID();

INSERT INTO ChiTietPhieuMuon
  (maPhieuMuon, maDocGia, maSach, maTacGia, maTheLoai,
   soLuongSachMuon, createdAt, updatedAt)
VALUES
  (@pmP, @readerP, @maSachS, @tgS, @tlS, 1, NOW(), NOW());

-- 5. Phiếu Q: chờ duyệt, 1 cuốn S -----------------------------------
INSERT INTO PhieuMuon
  (maDocGia, ngayMuon, ngayTra, trangThai, createdAt, updatedAt)
VALUES
  (@readerQ, NOW(), DATE_ADD(CURDATE(), INTERVAL 14 DAY),
   'Chờ duyệt', NOW(), NOW());
SET @pmQ = LAST_INSERT_ID();

INSERT INTO ChiTietPhieuMuon
  (maPhieuMuon, maDocGia, maSach, maTacGia, maTheLoai,
   soLuongSachMuon, createdAt, updatedAt)
VALUES
  (@pmQ, @readerQ, @maSachS, @tgS, @tlS, 1, NOW(), NOW());

-- 6. Sách H: một phiếu đã trả, để thử xóa sách ----------------------
INSERT INTO PhieuMuon
  (maDocGia, ngayMuon, ngayTra, trangThai, createdAt, updatedAt)
VALUES
  (@readerP,
   DATE_SUB(CURDATE(), INTERVAL 20 DAY),
   DATE_SUB(CURDATE(), INTERVAL 10 DAY),
   'Đã trả', NOW(), NOW());
SET @pmH = LAST_INSERT_ID();

INSERT INTO ChiTietPhieuMuon
  (maPhieuMuon, maDocGia, maSach, maTacGia, maTheLoai,
   soLuongSachMuon, createdAt, updatedAt)
VALUES
  (@pmH, @readerP, @maSachH, @tgH, @tlH, 1, NOW(), NOW());
SET @ctH = LAST_INSERT_ID();

-- Trả sớm 1 ngày để tiền phạt = 0; trigger vẫn chạy
INSERT INTO PhieuTra
  (maChiTietPM, maPhieuMuon, maSach, ngayTraSach, createdAt, updatedAt)
VALUES
  (@ctH, @pmH, @maSachH,
   DATE_SUB(CURDATE(), INTERVAL 11 DAY), NOW(), NOW());

-- 7. Kiểm tra lại ----------------------------------------------------
SELECT 'readerP' AS loai, @readerP AS maDocGia
UNION ALL SELECT 'readerQ', @readerQ;

SELECT maSach, tenSach, maTacGia, maTheLoai, soLuongHienCo
FROM Sach
WHERE maSach IN (@maSachS, @maSachH);

SELECT pm.maPhieuMuon, dg.fullName, pm.trangThai, pm.ngayMuon, pm.ngayTra,
       ct.maSach, ct.soLuongSachMuon
FROM PhieuMuon pm
JOIN DocGia dg ON dg.maDocGia = pm.maDocGia
JOIN ChiTietPhieuMuon ct
  ON ct.maPhieuMuon = pm.maPhieuMuon
 AND ct.maDocGia = pm.maDocGia
WHERE pm.maDocGia IN (@readerP, @readerQ)
ORDER BY pm.maPhieuMuon;
```

**Kết quả mong đợi:**

- `S` có `soLuongHienCo = 2`.
- `H` có `soLuongHienCo = 0` và có 1 dòng `PhieuTra`.
- `P`: `Đang mượn`, `ngayTra` cách hôm nay 2 ngày.
- `Q`: `Chờ duyệt`.
- Tài khoản `demo.reader@example.test` có 2 phiếu: 1 đang mượn, 1 đã trả.

> **Nếu không muốn chạy SQL:** Có thể chuẩn bị thủ công bằng Admin UI, nhưng sẽ mất 10–15 phút và dễ lệch số. SQL là phương án chính; UI chỉ là phương án dự phòng.

### 1.5. Phương án dự phòng

| Sự cố | Xử lý nhanh | Dự phòng |
|---|---|---|
| MySQL không start | `net start MySQL80`; kiểm tra port 3306; mở Services | Chiếu ảnh/ video demo đã quay |
| Backend không kết nối DB | Kiểm tra `backend/.env`; restart `npm run dev` | Chiếu log + ảnh API |
| Frontend trắng trang | Kiểm tra Vite port 5173; `Ctrl+F5`; kiểm tra `VITE_API_URL` | Mở bản build tĩnh nếu có |
| PDF lỗi font | Kiểm tra `backend/fonts/Roboto-Regular.ttf`; restart backend | Mở PDF đã xuất sẵn |
| Dữ liệu demo sai | Chạy lại SQL mục 1.4 | Dùng backup `backup_library_db.sql` |
| Login sai | Admin `Admin/admin123`; reader đúng email; kiểm tra seed | Tạo admin bằng `npm run seed-admin` |
| Hết giờ | Bỏ demo PATCH live; chiếu ảnh; rút gọn Q&A | Dùng slide backup |

---

## 2. PHẦN D — MỞ ĐẦU (2 PHÚT)

### Slide 01 — Tiêu đề

**[HIỂN THỊ]** Slide 01: tên đề tài, logo trường/khoa, tên 4 thành viên, giảng viên hướng dẫn, ngày báo cáo.

**[NÓI]**

> “Kính thưa cô và các bạn. Em là Vũ, đại diện nhóm. Hôm nay nhóm em báo cáo đồ án **Hệ thống Quản lý Thư viện** — một ứng dụng web quản lý sách, độc giả và nghiệp vụ mượn trả, được xây dựng trên MySQL, Node.js/Express và Vue.js.
>
> Nhóm gồm bốn thành viên: bạn Minh phụ trách CSDL và transaction; bạn Thắng phụ trách dashboard thống kê; bạn Tuấn phụ trách nghiệp vụ và trải nghiệm độc giả; em phụ trách quản trị dữ liệu, kiểm thử và điều phối.
>
> Trong 24 phút tới, nhóm em sẽ không chỉ trình bày giao diện, mà sẽ chứng minh ba điều: **dữ liệu được thiết kế đúng**, **giao dịch được bảo vệ khi có cạnh tranh**, và **hệ thống chạy được từ CSDL sạch**.”

**[CÂU CHỐT]** “Điểm khác biệt của đồ án là nghiệp vụ mượn trả được bảo vệ ở tầng CSDL, không chỉ ở giao diện.”

---

### Slide 02 — Nhóm và phân công

**[HIỂN THỊ]** Slide 02: 4 cột A/B/C/D, mỗi cột 1 dòng trách nhiệm và 1 sản phẩm bàn giao.

**[NÓI]**

> “Cách nhóm em chia việc theo đúng bốn trục của đồ án.
>
> **A — Minh:** thiết kế 7 bảng, 17 migrations, function, trigger, stored procedure và transaction locking.
>
> **B — Thắng:** dashboard quản trị, 3 chỉ số KPI, theo dõi phiếu quá hạn và xử lý lỗi F5.
>
> **C — Tuấn:** catalogue sách, giỏ mượn, hạn mức 5 quyển, vòng đời phiếu mượn và trải nghiệm độc giả.
>
> **D — em:** Admin CRUD, ràng buộc khóa ngoại, kiểm thử, đóng gói và điều phối buổi báo cáo.
>
> Mỗi phần đều có người chịu trách nhiệm chính, nhưng cả nhóm cùng kiểm thử tích hợp.”

**[CÂU CHỐT]** “Phân công theo trục kỹ thuật, nhưng sản phẩm cuối là một hệ thống liền mạch.”

---

### Slide 03 — Bài toán và mục tiêu

**[HIỂN THỊ]** Slide 03: bên trái “Vấn đề”, bên phải “Mục tiêu”; 3 số liệu: 7 bảng, 17 migrations, 49 test.

**[NÓI]**

> “Bài toán của một thư viện không chỉ là ‘hiển thị danh sách sách’. Có ba khó khăn thật sự.
>
> Thứ nhất, **dữ liệu có quan hệ phức tạp**: một sách gắn với tác giả, thể loại, nhà xuất bản; một phiếu mượn có nhiều chi tiết; một chi tiết chỉ được trả một lần.
>
> Thứ hai, **nghiệp vụ có cạnh tranh**: hai thủ thư cùng duyệt hai phiếu cho một cuốn sách cuối cùng. Nếu chỉ kiểm tra ở giao diện, tồn kho có thể âm.
>
> Thứ ba, **báo cáo phải nhất quán**: cùng một con số phải khớp giữa stored procedure, API và dashboard.
>
> Mục tiêu của nhóm là xây một hệ thống mà ở đó **CSDL là nguồn sự thật**, backend giữ toàn vẹn giao dịch, frontend chỉ hiển thị và kiểm tra sớm.”

**[CÂU CHỐT]** “Giao diện có thể đẹp, nhưng nếu transaction sai thì hệ thống vẫn mất dữ liệu.”

---

### Slide 04 — Kiến trúc 3 lớp và công nghệ

**[HIỂN THỊ]** Slide 04: sơ đồ 3 lớp — Vue 3 → Express REST API → MySQL InnoDB; chú thích JWT, Sequelize, PDFKit.

**[NÓI]**

> “Hệ thống theo kiến trúc 3 lớp.
>
> **Tầng trình bày:** Vue 3, Vuex, Vue Router, Bootstrap. Giao diện quản trị và giao diện độc giả tách vai trò bằng JWT.
>
> **Tầng ứng dụng:** Node.js/Express, Sequelize ORM. Toàn bộ nghiệp vụ mượn trả nằm trong `borrowController.js`; báo cáo nằm trong `reportController.js`.
>
> **Tầng dữ liệu:** MySQL InnoDB. Schema do 17 migration quản lý; không dùng `sync({ alter: true })` khi chạy thật. Function, trigger và procedure được tạo bằng migration.
>
> Ngoài ra có PDFKit để xuất phiếu mượn, phiếu trả và form phạt; Multer để upload ảnh bìa.”

**[MỞ FILE]** `backend/server.js` dòng 27–36 (mount routes) và dòng 47–53 (chỉ `sequelize.authenticate()`, không tự sửa schema).

**[CÂU CHỐT]** “Migration là nguồn thay đổi schema duy nhất; server khởi động chỉ kiểm tra kết nối.”

---

### Slide 05 — Roadmap demo

**[HIỂN THỊ]** Slide 05: 4 bước: CSDL → Dashboard → Độc giả → Quản trị; có mũi tên “một câu chuyện dữ liệu”.

**[NÓI]**

> “Buổi demo là một câu chuyện dữ liệu liên tục.
>
> Bắt đầu từ CSDL: 7 bảng, function, trigger, procedure.
>
> Sau đó lên dashboard để thấy dữ liệu thành KPI và danh sách quá hạn.
>
> Tiếp theo, chuyển sang vai độc giả: tìm sách, thêm giỏ, gửi yêu cầu, yêu cầu trả.
>
> Cuối cùng quay lại quản trị: duyệt phiếu, xác nhận trả, xuất PDF, sửa sách bằng PATCH và thử xóa để thấy ràng buộc khóa ngoại.
>
> Mời anh Minh bắt đầu với tầng CSDL.”

**[CÂU CHỐT]** “Mỗi thao tác trên giao diện sẽ được đối chiếu ngược lại với dữ liệu trong MySQL.”

---

## 3. PHẦN A — CSDL, STORED ROUTINES VÀ TRANSACTION (7 PHÚT)

> **Người nói:** A — Minh. **Người bấm máy:** A tự bấm; D giữ đồng hồ.
>
> **Chuẩn bị:** MySQL Workbench mở `library_db`; file `backend/scripts/demo_tuan4_nguoi_a.sql` mở sẵn; VS Code mở `borrowController.js`.

### 3.1. Schema: 7 bảng và khóa chính phức hợp (1 phút 30)

**[HIỂN THỊ]** Slide 06 — ERD; Slide 07 — bảng khóa chính.

**[MỞ FILE]** `backend/scripts/demo_tuan4_nguoi_a.sql` dòng 17–40; hoặc Workbench.

**[THAO TÁC]** Chạy:

```sql
USE library_db;
SHOW TABLES;
DESCRIBE Sach;
DESCRIBE PhieuMuon;
DESCRIBE ChiTietPhieuMuon;
DESCRIBE PhieuTra;
```

**[NÓI]**

> “Hệ thống có 9 bảng, trong đó 7 bảng trọng tâm theo yêu cầu: `Sach`, `TacGia`, `TheLoai`, `DocGia`, `PhieuMuon`, `ChiTietPhieuMuon`, `PhieuTra`. Hai bảng hỗ trợ là `NhaXuatBan` và `NhanVien`.
>
> Điểm cần chú ý là **khóa chính phức hợp**:
>
> - `Sach(maSach, maTacGia, maTheLoai)`
> - `PhieuMuon(maPhieuMuon, maDocGia)`
> - `ChiTietPhieuMuon(maChiTietPM, maPhieuMuon, maSach)`
> - `PhieuTra(maPhieuTra, maChiTietPM)`
>
> Khóa phức hợp ở đây không phải để ‘cho khó’. Nó phản ánh đúng định danh nghiệp vụ: một dòng sách được xác định bởi mã sách **và** tác giả **và** thể loại; một chi tiết phiếu mượn chỉ tồn tại khi biết phiếu mượn và sách tương ứng.
>
> Nhờ vậy, khóa ngoại từ `ChiTietPhieuMuon` sang `Sach` phải mang đủ 3 cột, không thể trỏ đến một nửa khóa. Đây là điều test `database-features.integration.test.js` kiểm tra trực tiếp trên MySQL.”

**[MỞ FILE]** `backend/test/database-features.integration.test.js` dòng 19–45.

**[KẾT QUẢ MONG ĐỢI]** `DESCRIBE` hiển thị đúng thứ tự cột; `SHOW TABLES` có 9 bảng.

**[NẾU BỊ HỎI] “Tại sao không dùng khóa chính đơn giản là ID tự tăng?”**
> “Vẫn có `maSach`/`maPhieuMuon` tự tăng, nhưng chúng chỉ là một phần của khóa. Khóa phức hợp ngăn dữ liệu mồ côi và ngăn một chi tiết mượn trỏ đến sách không khớp tác giả/thể loại. Cái giá là JOIN dài hơn và ORM phức tạp hơn; nhóm đã xử lý bằng các helper khóa phức hợp và test schema.”

**[CÂU CHỐT]** “Khóa phức hợp là cách CSDL tự bảo vệ định danh nghiệp vụ, không phụ thuộc vào code.”

---

### 3.2. Function kiểm tra tồn kho (45 giây)

**[HIỂN THỊ]** Slide 10.

**[MỞ FILE]** `backend/migrations/20261026140000-align-stock-function.js` dòng 9–20.

**[THAO TÁC]** Chạy:

```sql
SHOW CREATE FUNCTION fn_kiem_tra_so_luong_sach;
SELECT fn_kiem_tra_so_luong_sach(1) AS soLuongSach_MaSach_1;
```

Nếu Workbench không nhận `\G`, bỏ `\G` và xem kết quả dạng bảng.

**[NÓI]**

> “Function `fn_kiem_tra_so_luong_sach` nhận đúng **một tham số** `maSach_in INT`, trả về tổng `soLuongHienCo` của các dòng sách có cùng mã sách.
>
> Điểm tinh tế: vì khóa chính của `Sach` là phức hợp, về lý thuyết một `maSach` có thể xuất hiện ở nhiều dòng với tác giả/thể loại khác nhau. Function dùng `SUM` và `COALESCE(..., 0)`, nên nếu không có dòng nào thì trả `0`, chứ không trả `NULL`.
>
> Đây là function **đọc dữ liệu**, khai báo `READS SQL DATA`, không ghi gì vào bảng.”

**[MỞ FILE]** `backend/scripts/demo_tuan4_nguoi_a.sql` dòng 48–60 (phần đối chiếu function với `SUM` thực tế).

**[KẾT QUẢ MONG ĐỢI]** Kết quả function khớp với:

```sql
SELECT SUM(soLuongHienCo) FROM Sach WHERE maSach = 1;
```

**[NẾU BỊ HỎI] “Vì sao function chỉ nhận `maSach` mà không nhận đủ 3 cột khóa?”**
> “Vì yêu cầu của đề bài quy định đúng một tham số `maSach_in`. Nhóm dùng `SUM` để function vẫn đúng nếu có nhiều dòng cùng mã sách. Nếu cần kiểm tra chính xác một dòng inventory, backend dùng đủ bộ ba khóa trong `WHERE`.”

**[CÂU CHỐT]** “Function là một điểm truy vấn chuẩn hóa, có thể gọi từ SQL hoặc từ ứng dụng.”

---

### 3.3. Trigger tính tiền phạt (1 phút 30)

**[HIỂN THỊ]** Slide 11.

**[MỞ FILE]** `backend/migrations/20261021120000-align-routines-and-triggers.js` dòng 46–65.

**[THAO TÁC]** Chạy phần 3 của file demo (dòng 69–114):

```sql
SHOW CREATE TRIGGER trg_tinh_tien_phat;

START TRANSACTION;
-- Tạo phiếu mượn trễ 2 ngày, mượn 2 cuốn
-- ... (chạy nguyên khối trong file demo) ...
-- Kiểm tra tienPhat
ROLLBACK;
```

**[NÓI]**

> “Trigger `trg_tinh_tien_phat` là `BEFORE INSERT` trên `PhieuTra`. Khi một dòng trả sách được tạo, trigger đọc `ngayTra` dự kiến từ `PhieuMuon` và `soLuongSachMuon` từ `ChiTietPhieuMuon`, rồi tính:
>
> `tienPhat = GREATEST(0, DATEDIFF(ngayTraSach, ngayTraDuKien)) * 1000 * soLuongSachMuon`.
>
> `GREATEST(0, ...)` đảm bảo trả sớm không bị phạt âm. Hệ số 1.000 đồng/ngày/cuốn là quy tắc của đề bài.
>
> Trong demo, phiếu mượn trễ 2 ngày và mượn 2 cuốn, nên kỳ vọng là `2 * 1000 * 2 = 4.000 đồng`. Nhóm cố tình **không truyền `tienPhat`** khi insert, để chứng minh trigger tự sinh.
>
> Sau khi kiểm tra, nhóm `ROLLBACK` để không để lại dữ liệu rác.”

**[KẾT QUẢ MONG ĐỢI]** Cột `tienPhatDoTriggerTinh = 4000`; `soNgayTre = 2`; sau `ROLLBACK`, bảng `PhieuTra` không tăng thêm dòng.

**[NẾU BỊ HỎI] “Tại sao dùng trigger thay vì tính trong backend?”**
> “Tiền phạt là cột dẫn xuất từ dữ liệu ngay trên cùng dòng `PhieuTra`. Trigger đảm bảo mọi đường ghi — kể cả script SQL — đều tính đúng, không phụ thuộc vào việc lập trình viên nhớ gán giá trị. Với tồn kho thì ngược lại, nhóm bỏ trigger vì tồn kho phụ thuộc trạng thái nghiệp vụ và cần nằm trong transaction.”

**[CÂU CHỐT]** “Trigger phù hợp với ràng buộc dẫn xuất đơn giản; transaction phù hợp với nghiệp vụ nhiều bước.”

---

### 3.4. Ba stored procedures thống kê (1 phút 20)

**[HIỂN THỊ]** Slide 12.

**[MỞ FILE]** `backend/migrations/20261021120000-align-routines-and-triggers.js` dòng 10–43.

**[THAO TÁC]** Chạy lần lượt:

```sql
CALL sp_thong_ke_sach_muon_thang();
CALL sp_thong_ke_doc_gia_muon_sach_nam();
CALL sp_danh_sach_phieu_muon_chua_tra();
```

Sau đó chạy 3 câu đối chiếu trong file demo (dòng 151–186).

**[NÓI]**

> “Có ba procedure.
>
> **Một:** `sp_thong_ke_sach_muon_thang` — tính tổng **số quyển** đã mượn trong tháng hiện tại. Điều kiện trạng thái là `'Đang mượn'` hoặc `'Đã trả'`; phiếu `'Chờ duyệt'` và `'Từ chối'` không được tính. Đây là lý do phải `SUM(soLuongSachMuon)`, không phải `COUNT(*)`.
>
> **Hai:** `sp_thong_ke_doc_gia_muon_sach_nam` — đếm **độc giả duy nhất** đã mượn trong năm, nên dùng `COUNT(DISTINCT maDocGia)`. Một độc giả mượn 10 phiếu vẫn là 1 độc giả.
>
> **Ba:** `sp_danh_sach_phieu_muon_chua_tra` — lọc `trangThai = 'Đang mượn'`.
>
> Nhóm luôn chạy thêm câu SQL đối chiếu độc lập để chứng minh procedure không ‘tự bịa’ số.”

**[MỞ FILE]** `backend/controllers/reportController.js` dòng 5–13 (hàm `procedureRows` bóc kết quả `CALL`), dòng 23–38, 49–63, 65–88.

**[KẾT QUẢ MONG ĐỢI]** Số của `CALL` khớp với câu `SELECT` đối chiếu. Ví dụ dữ liệu test: tháng = 10 quyển, năm = 2 độc giả.

**[NẾU BỊ HỎI] “Vì sao dùng procedure thay vì query trực tiếp?”**
> “Procedure gom logic thống kê vào một chỗ, giảm lặp lại và giúp quyền truy cập nhất quán. Nhưng nhóm không xem procedure là ‘thuốc tăng tốc’ thần kỳ: hiệu năng đến từ index, kiến trúc truy vấn và pagination. Với danh sách lớn, nhóm sẽ cân nhắc view hoặc query có phân trang thay vì `SELECT *`.”

**[CÂU CHỐT]** “Procedure đảm bảo định nghĩa KPI thống nhất; SQL đối chiếu đảm bảo niềm tin.”

---

### 3.5. Transaction duyệt mượn, FOR UPDATE và chống race condition (1 phút 50)

**[HIỂN THỊ]** Slide 14, 15, 16.

**[MỞ FILE]** `backend/controllers/borrowController.js` dòng 264–344.

**[THAO TÁC]** Trước tiên, chạy:

```sql
SELECT maSach, tenSach, soLuongHienCo
FROM Sach
WHERE tenSach = 'Clean Code - Mã Sạch';
```

Kỳ vọng: `2`.

Sau đó chuyển sang browser Admin → **Quản lý mượn sách** → tab **Chờ duyệt** → phiếu Q của “Bạn Demo” → **Duyệt** → xác nhận. Quay lại Workbench, chạy lại câu `SELECT`. Kỳ vọng: `1`.

**[NÓI]**

> “Đây là phần quan trọng nhất của đồ án.
>
> Khi thủ thư bấm Duyệt, backend mở một transaction. Trước khi làm bất cứ điều gì, nó khóa dòng độc giả bằng `SELECT ... FOR UPDATE` để kiểm tra hạn mức 5 quyển. Sau đó khóa dòng phiếu mượn, rồi khóa từng dòng sách cũng bằng `FOR UPDATE`.
>
> Vì sao phải khóa? Hãy tưởng tượng hai thủ thư cùng duyệt hai phiếu cho cùng một cuốn sách cuối cùng. Nếu cả hai cùng đọc `soLuongHienCo = 1` rồi cùng trừ, tồn kho thành `-1`. Với `FOR UPDATE`, transaction thứ hai phải **chờ** transaction thứ nhất commit. Khi được cấp khóa, nó đọc lại giá trị mới nhất — lúc này là `0` — và trả lỗi `400` ‘không đủ số lượng’, rollback. Tồn kho không bao giờ âm.
>
> Điểm thứ hai là **thứ tự khóa**. Nếu phiếu có nhiều sách, mỗi transaction có thể khóa sách theo thứ tự khác nhau, dẫn đến deadlock: transaction 1 giữ sách A chờ B, transaction 2 giữ B chờ A. Nhóm giải quyết bằng **lock ordering**: sắp xếp chi tiết theo `maSach ASC, maTacGia ASC, maTheLoai ASC` trước khi khóa. Mọi transaction đi cùng một thứ tự, nên không thể tạo chu trình chờ.
>
> Nhóm cũng bỏ hoàn toàn trigger tăng/giảm tồn kho. Tồn kho chỉ được cập nhật **một lần** trong transaction, cùng lúc với trạng thái phiếu. Nếu một bước lỗi, toàn bộ rollback.”

**[MỞ FILE]** `backend/migrations/20261013120000-approval-stock-and-reporting.js` dòng 33–37 (drop 2 trigger tồn kho).

**[MỞ FILE]** `backend/test/borrow-flow.integration.test.js` dòng 79–106.

**[KẾT QUẢ MONG ĐỢI]**

- Trước duyệt Q: tồn S = 2.
- Sau duyệt Q: tồn S = 1.
- Test tích hợp: hai approval cạnh tranh cho 1 cuốn trả về `[200, 400]`, tồn cuối = 0.
- Test unit: duyệt sách không đủ số lượng thì rollback, không có cập nhật một phần.

**[NẾU BỊ HỎI] “Mức cô lập là gì? Có phải Read Committed?”**
> “Code **không đặt** mức cô lập tường minh, nên MySQL InnoDB dùng mặc định `REPEATABLE READ`. Tính đúng đắn của luồng duyệt đến từ **khóa dòng `FOR UPDATE`** và transaction, không phụ thuộc vào việc chọn Read Committed. Nếu hội đồng hỏi, nhóm nên nói rõ điều này; không nên khẳng định là Read Committed nếu code không set.”

> **Lưu ý nội bộ:** file `backend/scripts/demo_tuan4_nguoi_a.sql` dòng 203 có ghi “mức cô lập Read Committed”. Đây là **comment chưa khớp code**. Trước khi nộp, nhóm nên sửa comment này thành “transaction mặc định của InnoDB; bảo vệ bằng khóa dòng FOR UPDATE” hoặc nói rõ khi demo. Không nên để hội đồng phát hiện mâu thuẫn.

**[NẾU BỊ HỎI] “Vậy deadlock có thể xảy ra không?”**
> “Có thể, vì InnoDB vẫn có thể phát hiện deadlock trong các tình huống phức tạp. Nhóm **giảm xác suất** bằng lock ordering nhất quán và khóa độc giả trước. Hiện code chưa có retry tự động; nếu triển khai thật, nên bắt lỗi `ER_LOCK_DEADLOCK` và retry có giới hạn.”

**[NẾU BỊ HỎI] “Tại sao không trừ kho ngay khi độc giả gửi yêu cầu?”**
> “Vì lúc gửi mới là ‘ý định mượn’, chưa phải cam kết. Nếu trừ ngay, sách có thể bị giữ bởi phiếu không bao giờ được duyệt. Nhóm chọn trừ tại thời điểm duyệt — điểm cam kết — và kiểm tra lại tồn kho trong transaction. Đánh đổi là có thể có nhiều phiếu chờ cùng một cuốn; thủ thư duyệt trước sẽ thắng, người sau nhận `400`.”

**[CÂU CHỐT]** “Không có phép màu: tồn kho đúng vì mọi thay đổi đi qua một transaction có khóa dòng và thứ tự khóa nhất quán.”

---

## 4. PHẦN B — DASHBOARD THỐNG KÊ (5 PHÚT)

> **Người nói:** B — Thắng. **Người bấm máy:** B.
>
> **Chuẩn bị:** Browser Admin đang ở `http://localhost:5173/admin`; dashboard đã tải; DevTools mở tab Network; slide 18–22.

### 4.1. Kiến trúc dữ liệu từ procedure lên dashboard (1 phút)

**[HIỂN THỊ]** Slide 18.

**[MỞ FILE]** `frontend/src/services/dashboardReportService.js` dòng 33–62; `backend/controllers/reportController.js` dòng 65–88 và 90–137.

**[NÓI]**

> “Dashboard không đọc trực tiếp bảng rồi tự tính. Nó đi qua hai API báo cáo.
>
> API thứ nhất, `GET /api/thong-ke/tong-quan`, trả ba con số: sách mượn tháng này, độc giả mượn năm nay, phiếu chưa trả. Hai số đầu gọi stored procedure; số thứ ba là một câu `COUNT` trên `PhieuMuon` trạng thái `'Đang mượn'`.
>
> API thứ hai, `GET /api/thong-ke/phieu-chua-tra`, trả danh sách phiếu chưa trả kèm chi tiết sách. API này dùng một query `JOIN` bốn bảng rồi gom các dòng theo phiếu ở backend. Vì sao không dùng procedure? Vì procedure `sp_danh_sach_phieu_muon_chua_tra` chỉ trả về bảng `PhieuMuon`, không có tên sách và số lượng; để hiển thị bảng cần dữ liệu chi tiết hơn.
>
> Service `dashboardReportService` gọi **song song** hai API bằng `Promise.all`, chuẩn hóa dữ liệu, kiểm tra kiểu số, rồi trả về một object thống nhất cho component.”

**[MỞ FILE]** `frontend/src/components/admin/AdminHomePage.vue` dòng 430–448.

**[CÂU CHỐT]** “KPI đi qua procedure; danh sách chi tiết đi qua query JOIN tối ưu — đúng loại dữ liệu, đúng tầng.”

---

### 4.2. Ba chỉ số KPI (1 phút 20)

**[HIỂN THỊ]** Slide 19; browser dashboard phần “Chỉ số mượn trả”.

**[THAO TÁC]** Chỉ vào 3 thẻ; đọc số liệu; sau đó cuộn xuống “Danh mục thư viện” và bảng “Phiếu chưa trả”.

**[NÓI]**

> “Ba chỉ số bắt buộc:
>
> **Một — Sách mượn tháng này:** tổng số **quyển** trong các phiếu `'Đang mượn'` hoặc `'Đã trả'` có `ngayMuon` trong tháng hiện tại. Đây là `SUM(soLuongSachMuon)`, không phải đếm số phiếu.
>
> **Hai — Độc giả đã mượn năm nay:** số độc giả **duy nhất** có phiếu `'Đang mượn'` hoặc `'Đã trả'` trong năm. Dùng `COUNT(DISTINCT maDocGia)`.
>
> **Ba — Phiếu chưa trả:** số phiếu đang ở trạng thái `'Đang mượn'`.
>
> Ba con số này khớp trực tiếp với ba procedure mà anh Minh vừa trình bày. Nhóm không hard-code, không lấy từ fixture.
>
> Bên dưới là “Danh mục thư viện”: tổng số sách, tác giả, nhà xuất bản — lấy từ Vuex store, không phải từ API báo cáo. Đây chính là phần từng bị mất số liệu khi F5, lát nữa em sẽ giải thích.”

**[KẾT QUẢ MONG ĐỢI]** Các số hiển thị có định dạng `vi-VN` (dấu chấm phân cách nghìn). Không có `NaN`, không có `0` bất thường.

**[NẾU BỊ HỎI] “Vì sao ‘phiếu chưa trả’ không dùng procedure?”**
> “Procedure `sp_danh_sach_phieu_muon_chua_tra` trả danh sách, không trả đúng một con số. Để đếm, nhóm dùng `COUNT(*)` trực tiếp — đơn giản, ít dữ liệu truyền hơn và dễ kiểm thử. Nếu cần tối ưu, có thể thêm procedure đếm hoặc index `(trangThai)`.”

**[CÂU CHỐT]** “Mỗi KPI có một định nghĩa SQL rõ ràng, không phải cảm tính từ giao diện.”

---

### 4.3. Theo dõi phiếu quá hạn (1 phút)

**[HIỂN THỊ]** Slide 20; browser bảng “Phiếu chưa trả”.

**[THAO TÁC]**

1. Chỉ vào cột “Hạn trả / tình trạng”.
2. Chọn bộ lọc **“Quá hạn (n)”**.
3. Chỉ vào badge đỏ **“Quá hạn 2 ngày”**.
4. Chuyển sang **“Chưa quá hạn (n)”**.
5. Quay lại **“Tất cả phiếu (n)”**.

**[NÓI]**

> “Bảng này lấy danh sách từ API thứ hai. Mỗi dòng có mã phiếu, độc giả, sách, ngày mượn, hạn trả và tình trạng.
>
> ‘Quá hạn’ **không phải là một trạng thái lưu trong CSDL**. Nó là nhãn giao diện được tính từ `ngayTra`: nếu hạn trả nhỏ hơn ngày hôm nay, hiển thị badge đỏ kèm số ngày trễ. Còn hạn thì badge xanh ‘Còn hạn’.
>
> Bộ lọc có ba lựa chọn: tất cả, quá hạn, chưa quá hạn. Số trên nhãn được tính lại từ dữ liệu, nên luôn khớp với số dòng.
>
> Cách tính dùng `Date.UTC` theo ngày, tháng, năm để tránh lệch múi giờ và lệch giờ mùa hè — một chi tiết nhỏ nhưng quan trọng khi so sánh ngày.”

**[MỞ FILE]** `frontend/src/components/admin/AdminHomePage.vue` dòng 214–322 (bảng, bộ lọc), dòng 372–381 (đếm/lọc), dòng 383–417 (`dateParts`, `isOverdue`, `daysOverdue`).

**[KẾT QUẢ MONG ĐỢI]** Phiếu P xuất hiện trong “Quá hạn” với badge “Quá hạn 2 ngày”.

**[NẾU BỊ HỎI] “Sao không tính quá hạn bằng SQL?”**
> “Hiện tại tính ở client vì danh sách đã được tải về và cần hiển thị badge linh hoạt. Với dữ liệu lớn, nên đẩy điều kiện `ngayTra < CURDATE()` xuống SQL, thêm index và phân trang để tránh tải toàn bộ danh sách.”

**[CÂU CHỐT]** “Trạng thái lưu trong DB và trạng thái hiển thị là hai khái niệm khác nhau; nhóm tách rõ để không làm bẩn enum.”

---

### 4.4. Lỗi F5 và cách sửa bằng Promise.all (1 phút)

**[HIỂN THỊ]** Slide 21; DevTools Network.

**[THAO TÁC]**

1. Nhấn `F5`.
2. Trong Network, lọc `thong-ke` — thấy 2 request.
3. Lọc `sach`, `tacgia`, `theloai` — thấy 3 request danh mục.
4. Chỉ vào 3 thẻ “Danh mục thư viện” vẫn có số, không về 0.

**[NÓI]**

> “Đây là lỗi thực tế nhóm đã gặp. Khi người dùng nhấn F5, component được mount lại. Nếu chỉ gọi API báo cáo, ba thẻ ‘Tổng số sách’, ‘Tác giả’, ‘Nhà xuất bản’ sẽ về 0 vì Vuex store chưa được nạp lại — dù KPI vẫn đúng.
>
> Cách sửa: trong `loadDashboard`, nhóm dùng `Promise.all` gọi đồng thời:
>
> - `dashboardReportService.getDashboardReport()` — bên trong gọi 2 API báo cáo;
> - `book/fetchBooks`;
> - `author/fetchAuthors`;
> - `publisher/fetchPublishers`.
>
> Tổng cộng **5 request HTTP**, nhưng chạy song song nên thời gian gần như bằng request chậm nhất, không phải cộng dồn.
>
> Điểm tinh tế: ba lệnh `dispatch` danh mục có `.catch()` riêng. Nếu một danh mục lỗi, dashboard báo cáo vẫn hiển thị; chỉ thẻ danh mục đó trống. Còn nếu API báo cáo lỗi, component hiện thông báo đỏ và nút ‘Thử lại’.”

**[MỞ FILE]** `frontend/src/components/admin/AdminHomePage.vue` dòng 430–448.

**[KẾT QUẢ MONG ĐỢI]** Sau F5: KPI, biểu đồ, bảng và 3 thẻ danh mục đều có dữ liệu; không có `0` giả.

**[NẾU BỊ HỎI] “Tại sao không dùng `await` tuần tự?”**
> “Tuần tự sẽ cộng latency: 2 API báo cáo + 3 danh mục. Song song giảm thời gian tải và độc lập lỗi giữa các nhóm dữ liệu.”

**[CÂU CHỐT]** “F5 không làm mất số liệu vì trạng thái được nạp lại song song, có kiểm soát lỗi từng phần.”

---

### 4.5. Biểu đồ: trung thực với dữ liệu (40 giây)

**[HIỂN THỊ]** Slide 22; phần “Lượt mượn theo tháng”.

**[NÓI]**

> “Nhóm muốn nói rõ một điểm: API hiện chỉ trả **tổng sách mượn của tháng hiện tại**, chưa có lịch sử nhiều tháng. Vì vậy biểu đồ chỉ có một cột ‘Thg 11’ và ghi chú ngay trên giao diện: ‘Số liệu từ API; hiện chỉ có tổng tháng này, chưa có lịch sử so sánh.’
>
> Nhóm không tạo dữ liệu giả để vẽ sáu tháng. Nếu API mở rộng trường `monthlyLoans`, biểu đồ sẽ tự hiển thị nhiều cột. Đây là thiết kế trung thực với hợp đồng dữ liệu, và cũng là hướng phát triển tiếp theo.”

**[MỞ FILE]** `frontend/src/components/admin/AdminHomePage.vue` dòng 106–169; `dashboardReportService.js` dòng 45–60.

**[CÂU CHỐT]** “Dashboard đẹp nhưng phải trung thực: không có dữ liệu thì nói là chưa có, không vẽ khống.”

---

## 5. PHẦN C — TRẢI NGHIỆM ĐỘC GIẢ (6 PHÚT)

> **Người nói:** C — Tuấn. **Người bấm máy:** C.
>
> **Chuẩn bị:** Browser profile độc giả đã đăng nhập; đang ở `/reader` → tab **Sách**; giỏ mượn trống; slide 23–27.
>
> **Lưu ý dữ liệu:** tài khoản demo đang có phiếu P `'Đang mượn'` 1 cuốn. Vì vậy `outstandingCopies = 1`, còn được mượn tối đa 4 cuốn. Đây là chủ ý để demo quota.

### 5.1. Catalogue và bộ lọc (1 phút)

**[HIỂN THỊ]** Slide 23, 24; browser tab Sách.

**[THAO TÁC]**

1. Gõ từ khóa vào ô tìm kiếm (ví dụ `Clean`).
2. Chọn **Thể loại** = Công nghệ.
3. Chọn **Tác giả** = Robert Martin.
4. Chọn **Nhà xuất bản** = Nhà xuất bản Thông Tin.
5. Đổi sắp xếp: tên A→Z, năm mới nhất, giá tăng.
6. Xóa bộ lọc.
7. Chuyển trang 2 → 1.

**[NÓI]**

> “Đây là catalogue phía độc giả. Có bốn cách lọc độc lập: từ khóa, thể loại, tác giả, nhà xuất bản; cộng thêm sắp xếp theo tên, năm xuất bản hoặc giá.
>
> Bộ lọc chạy client-side trên danh sách sách đã tải, nên phản hồi tức thì. Phân trang **10 cuốn/trang**; khi đổi bộ lọc, trang tự reset về 1 để tránh người dùng bị ‘kẹt’ ở trang trống.
>
> Mỗi thẻ sách hiển thị tồn kho. Sách hết hàng có badge ‘Hết sách’ và nút bị vô hiệu hóa. Đây là lớp kiểm tra sớm, nhưng quyết định cuối vẫn ở backend.”

**[MỞ FILE]** `frontend/src/components/reader/BookList.vue` dòng 463–518 (lọc/sắp xếp/phân trang), dòng 300–365 (thẻ sách, badge tồn kho).

**[KẾT QUẢ MONG ĐỢI]** Danh sách thay đổi đúng; số trang cập nhật; nút “Xóa bộ lọc” xuất hiện khi có điều kiện.

**[CÂU CHỐT]** “Tìm nhanh, lọc đúng, nhưng không thay thế kiểm tra tồn kho ở server.”

---

### 5.2. Giỏ mượn, chống trùng và quota 5 quyển (1 phút 30)

**[HIỂN THỊ]** Slide 25; browser tab Sách.

**[THAO TÁC]**

1. Thêm 4 cuốn khác nhau vào giỏ (không chọn S).
2. Quan sát nút đổi thành **“Đã thêm”**.
3. Thử bấm lại cuốn đầu — nút bị vô hiệu hóa.
4. Thêm cuốn thứ 5 — toast đỏ hiện: “Bạn chỉ còn có thể mượn tối đa 4 quyển nữa (hạn mức 5 quyển).”
5. Mở giỏ mượn.
6. Chỉ vào ô quota: “Đang mượn / chờ duyệt: 1/5 quyển. Còn có thể mượn tối đa: 4 quyển.”
7. Tăng số lượng một cuốn vượt tồn kho — input tự kẹp về `soLuongHienCo`.

**[NÓI]**

> “Giỏ mượn được lưu trong `localStorage` với khóa `readerBorrowCart`, nên chuyển trang hoặc F5 không mất giỏ.
>
> Có ba lớp bảo vệ.
>
> **Một — chống trùng:** `isBookInCart` kiểm tra bộ ba khóa `maSach + maTacGia + maTheLoai`; nếu đã có, nút đổi thành ‘Đã thêm’ và bị vô hiệu hóa.
>
> **Hai — hạn mức:** `outstandingCopies` đếm số quyển trong các phiếu `'Chờ duyệt'` và `'Đang mượn'`. `remainingBorrowLimit = 5 - outstandingCopies`. Khi tổng giỏ vượt quá, `isOverLimit` bật và nút gửi bị khóa.
>
> **Ba — tồn kho:** mỗi dòng giỏ có `max = soLuongHienCo`; không thể tăng số lượng vượt tồn.
>
> Nhưng đây mới là kiểm tra phía client. Nếu độc giả mở hai tab, hoặc sửa `localStorage`, backend vẫn là nơi quyết định: khi tạo yêu cầu, backend khóa dòng `DocGia`, tính lại `outstandingCopies` trong transaction và trả `409` nếu vượt 5.”

**[MỞ FILE]** `frontend/src/components/reader/BookList.vue` dòng 416–419 (localStorage), 449–461 (quota), 529–554 (validate/add), 556–573 (số lượng); `backend/utils/borrowRules.js` dòng 1–11.

**[KẾT QUẢ MONG ĐỢI]** Giỏ có đúng 4 cuốn; cuốn thứ 5 không được thêm; toast đỏ hiện đúng số còn lại.

**[NẾU BỊ HỎI] “Nếu độc giả mở 2 tab và cùng gửi 2 yêu cầu?”**
> “Cả hai request đều vào backend. Backend khóa dòng `DocGia` bằng `FOR UPDATE`, nên request thứ hai phải chờ. Sau khi request một commit, request hai tính lại `outstandingCopies` và thấy đã vượt hạn mức, trả `409`. Client chỉ là lớp trải nghiệm, không phải lớp bảo mật.”

**[CÂU CHỐT]** “Quota được bảo vệ hai lớp: client kiểm tra sớm, backend khóa và quyết định.”

---

### 5.3. Gửi yêu cầu mượn — trạng thái Chờ duyệt (50 giây)

**[HIỂN THỊ]** Slide 26; browser giỏ mượn.

**[THAO TÁC]**

1. Bấm **“Gửi yêu cầu mượn”**.
2. Xác nhận trong drawer.
3. Toast xanh: “Yêu cầu mượn đã được gửi. Trạng thái: Chờ duyệt — vui lòng chờ quản lý xác nhận.”
4. Đóng drawer; quay lại danh sách sách; chỉ vào tồn kho của một cuốn vừa chọn — **vẫn chưa giảm**.
5. Mở **Lịch sử mượn sách** — phiếu mới ở trạng thái **“Chờ duyệt”**.

**[NÓI]**

> “Khi gửi, frontend chỉ gửi danh sách `chiTiet` gồm bộ ba khóa sách và số lượng. Backend tạo `PhieuMuon` trạng thái `'Chờ duyệt'` và các dòng `ChiTietPhieuMuon`.
>
> Điểm quan trọng: **tồn kho chưa bị trừ**. Vì đây mới là yêu cầu, chưa phải duyệt. Sách vẫn hiển thị số lượng cũ. Việc trừ kho nằm ở transaction duyệt của admin — đúng như anh Minh vừa trình bày.
>
> Nhờ vậy, nếu admin từ chối, không cần hoàn kho; nếu admin duyệt, transaction kiểm tra tồn tại thời điểm duyệt và trừ một lần.”

**[MỞ FILE]** `frontend/src/components/reader/BookList.vue` dòng 599–619; `backend/controllers/borrowController.js` dòng 126–200 (đặc biệt 178–191).

**[KẾT QUẢ MONG ĐỢI]** Có phiếu mới `'Chờ duyệt'`; tồn kho không đổi.

**[CÂU CHỐT]** “Chờ duyệt là trạng thái ‘ý định’, chưa phải ‘cam kết’ — nên chưa trừ kho.”

---

### 5.4. Lịch sử, 6 trạng thái và yêu cầu trả (1 phút 30)

**[HIỂN THỊ]** Slide 26; browser **Lịch sử mượn sách**.

**[THAO TÁC]**

1. Chỉ vào 6 tab: Tất cả, Chờ duyệt, Đang mượn, Chờ xác nhận trả, Bị từ chối, Đã trả.
2. Chuyển tab **Đang mượn** — thấy phiếu P quá hạn.
3. Bấm **“Yêu cầu trả sách”** trên phiếu P.
4. Xác nhận hộp thoại.
5. Toast xanh: “Đã gửi yêu cầu trả sách. Vui lòng chờ quản trị viên xác nhận đã nhận sách.”
6. Phiếu P chuyển sang badge **“Chờ xác nhận trả”**.
7. Chuyển tab **Chờ xác nhận trả** — phiếu P xuất hiện.

**[NÓI]**

> “Lịch sử mượn có 6 tab, tương ứng 6 trạng thái hiển thị: Chờ duyệt, Đang mượn, Chờ xác nhận trả, Đã trả, Bị từ chối và Quá hạn.
>
> Nhưng cần phân biệt: **‘Chờ xác nhận trả’ không phải giá trị lưu trong cột `trangThai`**. Khi độc giả bấm yêu cầu trả, backend chỉ set cờ `yeuCauTraAt`; trạng thái lưu vẫn là `'Đang mượn'`. Hàm `getLoanDisplayStatus` mới tính ra ‘Chờ xác nhận trả’ để hiển thị.
>
> Tương tự, **‘Quá hạn’ là nhãn giao diện**, không phải enum. Nó được tính từ `ngayTra`.
>
> Vì sao phải tách? Vì nếu nhét tất cả vào enum, CSDL sẽ có những trạng thái không bao giờ được ghi, hoặc phải thêm cột. Cách của nhóm là giữ enum lưu trữ tối giản, còn trạng thái hiển thị là hàm dẫn xuất. Điều này cũng giúp admin biết phiếu nào đã có yêu cầu trả để xử lý.”

**[MỞ FILE]** `frontend/src/components/reader/BorrowHistory.vue` dòng 52–59 (tab), 237–259 (badge/icon), 276–290 (gọi API trả); `backend/utils/borrowRules.js` dòng 19–23; `backend/controllers/borrowController.js` dòng 202–246.

**[KẾT QUẢ MONG ĐỢI]** P chuyển sang “Chờ xác nhận trả”; DB vẫn `'Đang mượn'` và `yeuCauTraAt` có giá trị.

**[NẾU BỊ HỎI] “Sau khi yêu cầu trả, tồn kho có tăng không?”**
> “Chưa. Tồn kho chỉ tăng khi admin xác nhận đã nhận sách. Lúc đó transaction tạo `PhieuTra`, trigger tính phạt, cộng kho và đổi trạng thái sang `'Đã trả'`. Nếu độc giả ‘bấm trả’ mà chưa mang sách đến, kho không bị cộng sai.”

**[CÂU CHỐT]** “Một cờ `yeuCauTraAt` tách ý định của độc giả khỏi xác nhận của thủ thư.”

---

### 5.5. PDF và accessibility (1 phút)

**[HIỂN THỊ]** Slide 27; browser lịch sử; mở file PDF phiếu mượn.

**[THAO TÁC]**

1. Bấm icon tải **phiếu mượn** trên phiếu P.
2. Mở PDF; chỉ vào tên sách, độc giả, ngày mượn, hạn trả, chữ tiếng Việt.
3. Quay lại trang; nhấn `Tab` vài lần để thấy focus ring.
4. Thu nhỏ cửa sổ để thấy bảng có gợi ý cuộn ngang.

**[NÓI]**

> “Độc giả có thể tải phiếu mượn, phiếu trả và form phạt. PDF được tạo bằng PDFKit, nhúng font Roboto để tiếng Việt không bị lỗi.
>
> Về accessibility, nhóm áp dụng WCAG 2.1 AA ở mức cơ bản: `focus-visible` cho bàn phím, nhãn ARIA cho bộ lọc và bảng, nút ‘Thử lại’ khi lỗi mạng, và gợi ý cuộn ngang trên mobile. Nhóm không tuyên bố đã audit toàn bộ; đây là lớp cải thiện thực tế, không phải chứng nhận.”

**[MỞ FILE]** `frontend/src/components/reader/BorrowHistory.vue` dòng 292–350; `backend/controllers/borrowController.js` dòng 354–515.

**[KẾT QUẢ MONG ĐỢI]** PDF mở được, không lỗi font, có đủ thông tin.

**[NẾU BỊ HỎI] “PDF có phải là ‘nguồn sự thật’ không?”**
> “Không. PDF chỉ là bản trình bày từ dữ liệu trong CSDL. Dữ liệu gốc vẫn là `PhieuMuon`, `ChiTietPhieuMuon`, `PhieuTra`.”

**[CÂU CHỐT]** “PDF là đầu ra tiện dụng, nhưng mọi con số vẫn quay về CSDL.”

---

## 6. PHẦN D — DUYỆT, XÓA, KIỂM THỬ VÀ KẾT LUẬN (4 PHÚT)

> **Người nói:** D — Vũ. **Người bấm máy:** D.
>
> **Chuẩn bị:** Browser Admin; tab **Quản lý mượn sách**; Workbench; terminal đã chạy test trước đó; slide 28–32.
>
> **Lưu ý:** C vừa gửi yêu cầu mượn 4 cuốn; P đang “Chờ xác nhận trả”. D sẽ duyệt yêu cầu của C, xác nhận trả P, sửa sách bằng PATCH, thử xóa H.

### 6.1. Duyệt yêu cầu của C — trừ kho trong transaction (50 giây)

**[HIỂN THỊ]** Slide 28; browser **Quản lý mượn sách** → tab **Chờ duyệt**.

**[THAO TÁC]**

1. Tìm phiếu của “Nguyễn Văn An” vừa gửi (4 cuốn).
2. Bấm **Duyệt** → xác nhận.
3. Toast “Cập nhật trạng thái thành công”.
4. Chuyển tab **Đang mượn** — phiếu xuất hiện.
5. (Nếu kịp) mở **Quản lý sách**, tìm một cuốn vừa duyệt — tồn kho giảm 1.

**[NÓI]**

> “Đây là thao tác duyệt thật. Khi em bấm Duyệt, backend mở transaction, khóa độc giả, khóa phiếu, khóa từng dòng sách theo thứ tự, kiểm tra tồn, trừ kho, đổi trạng thái sang `'Đang mượn'` và commit.
>
> Nếu bất kỳ cuốn nào không đủ, toàn bộ rollback — không có chuyện trừ 3 cuốn rồi báo lỗi cuốn thứ 4. Đây là tính nguyên tử (Atomicity) của ACID.
>
> Anh Minh có thể xác nhận: đây là cùng cơ chế đã chứng minh bằng test hai approval cạnh tranh.”

**[KẾT QUẢ MONG ĐỢI]** Phiếu chuyển `'Đang mượn'`; tồn các sách giảm đúng số lượng; không có lỗi.

**[CÂU CHỐT]** “Duyệt nhiều sách là một transaction: tất cả cùng thành công hoặc tất cả cùng rollback.”

---

### 6.2. Xác nhận trả P — hoàn kho và xuất form phạt (1 phút)

**[HIỂN THỊ]** Slide 27–28; browser **Quản lý mượn sách** → tab **Chờ xác nhận trả**.

**[THAO TÁC]**

1. Mở tab **Chờ xác nhận trả**.
2. Phiếu P của “Nguyễn Văn An” — bấm **“Xác nhận đã nhận sách”**.
3. Xác nhận hộp thoại.
4. Chuyển tab **Đã trả**.
5. Bấm **Phiếu trả** — mở PDF.
6. Bấm **Form phạt** — mở PDF; chỉ vào tiền phạt `2.000đ`.
7. Quay lại Workbench, chạy:
   ```sql
   SELECT soLuongHienCo FROM Sach
   WHERE tenSach = 'Clean Code - Mã Sạch';
   ```
   Kỳ vọng: `2`.

**[NÓI]**

> “Độc giả đã gửi yêu cầu trả, nên phiếu P nằm trong tab ‘Chờ xác nhận trả’. Em xác nhận đã nhận sách.
>
> Transaction này tạo một dòng `PhieuTra` cho từng chi tiết, trigger tính tiền phạt, cộng lại tồn kho, rồi đổi trạng thái phiếu sang `'Đã trả'`. Vì P trễ 2 ngày và mượn 1 cuốn, tiền phạt là `2 * 1.000 * 1 = 2.000 đồng`.
>
> Tồn kho S quay lại `2` — đúng chuỗi `2 → 1 → 2` mà nhóm đã hứa ở đầu buổi.
>
> Nếu ai đó cố xác nhận trả lần hai, hệ thống chặn: trạng thái đã là `'Đã trả'`, không còn chuyển trạng thái hợp lệ; và ở tầng CSDL, unique index `uq_phieutra_maChiTietPM` đảm bảo mỗi chi tiết chỉ có một phiếu trả.”

**[MỞ FILE]** `backend/controllers/borrowController.js` dòng 288–335; `backend/migrations/20260930120000-unique-return-detail.js` dòng 44–52.

**[KẾT QUẢ MONG ĐỢI]** P `'Đã trả'`; tồn S = 2; form phạt 2.000đ; phiếu trả PDF có thông tin.

**[NẾU BỊ HỎI] “Nếu trigger tính phạt lỗi thì sao?”**
> “Toàn bộ transaction rollback: không có `PhieuTra`, không cộng kho, phiếu vẫn `'Đang mượn'`. Đây là lợi ích của việc đặt trigger bên trong transaction.”

**[CÂU CHỐT]** “Hoàn kho, tính phạt và đổi trạng thái là một khối原子 — không thể thành công một nửa.”

---

### 6.3. PATCH — chỉ cập nhật trường thay đổi (50 giây)

**[HIỂN THỊ]** Slide 28; browser **Quản lý sách**.

**[THAO TÁC]**

1. Tìm sách **“Mắt biếc”**.
2. Bấm **Sửa**.
3. Chỉ đổi **Đơn giá** từ `100.000` thành `105.000`.
4. Mở DevTools Network, bấm **Lưu**.
5. Chọn request `PATCH /api/sach/...`; xem **Payload** — chỉ có `donGia`, không có `tenSach`, `maNXB`, `soLuongHienCo`...
6. Đóng modal; thấy giá mới.

**[NÓI]**

> “Phần sửa sách dùng `PATCH`, không phải `PUT`. Frontend so sánh form với dữ liệu gốc bằng `getChangedBookFields()` và chỉ gửi các trường thay đổi.
>
> Trong Network, payload chỉ có `donGia`. Backend cũng whitelist các trường được phép cập nhật, kiểm tra kiểu dữ liệu, kiểm tra khóa ngoại bằng procedure, rồi mới update trong transaction.
>
> Vì sao quan trọng? Với `PUT`, client phải gửi lại toàn bộ object; nếu thiếu trường, dữ liệu có thể bị ghi đè thành `null` hoặc giá trị mặc định. `PATCH` giảm payload, giảm nguy cơ ghi đè và phù hợp với form sửa từng phần. Đây là lý do nhóm tách semantics, dù backend hiện dùng chung một handler cho cả hai route.”

**[MỞ FILE]** `frontend/src/components/admin/BookManagement.vue` dòng 331–336 (so sánh trường), 599–611 (gửi FormData); `frontend/src/store/modules/book.js` dòng 64–83 (`api.patch`); `backend/controllers/bookController.js` dòng 101–108 (whitelist), 128–155 (validate số), 167–189 (FK), 191–208 (update).

**[KẾT QUẢ MONG ĐỢI]** Request `PATCH`; payload chỉ `donGia`; giá cập nhật; các trường khác giữ nguyên.

**[NẾU BỊ HỎI] “PUT và PATCH khác gì trong code?”**
> “Về HTTP, PUT là thay thế toàn bộ resource, PATCH là cập nhật một phần. Trong dự án, cả hai route cùng trỏ vào `updateBook`; handler chỉ đọc các trường có mặt trong body. Vì vậy trên thực tế cả hai đều hành xử như PATCH. Nếu muốn đúng chuẩn tuyệt đối, nên tách handler PUT yêu cầu đủ trường, hoặc bỏ route PUT.”

**[CÂU CHỐT]** “PATCH giảm payload và bảo vệ dữ liệu khỏi ghi đè ngoài ý muốn.”

---

### 6.4. Xóa sách có lịch sử — 409 Conflict (50 giây)

**[HIỂN THỊ]** Slide 29; browser **Quản lý sách**.

**[THAO TÁC]**

1. Tìm sách **“Kính vạn hoa”** (tồn kho 0, đã có lịch sử trả).
2. Bấm **Xóa** → xác nhận.
3. Modal đóng; banner đỏ hiện: **“Không thể xóa sách vì sách đã xuất hiện trong lịch sử mượn/trả”**.
4. Mở DevTools Network — request `DELETE` trả `409`.
5. Thử xóa một sách mới chưa có lịch sử (nếu có) — thành công.

**[NÓI]**

> “Đây là bài kiểm tra tính toàn vẹn tham chiếu. Sách ‘Kính vạn hoa’ tồn kho 0, nhưng đã có một phiếu trả trong quá khứ. Nếu em xóa, lịch sử mượn/trả sẽ mất hoặc mồ côi.
>
> Backend kiểm tra theo thứ tự: sách có tồn kho > 0 không; có dòng `ChiTietPhieuMuon` nào tham chiếu không. Nếu có, trả `409 Conflict` với thông báo thân thiện, không phải lỗi 500.
>
> Với tác giả, thể loại, nhà xuất bản, backend kiểm tra có sách liên kết không. Với độc giả, kiểm tra còn sách chưa trả hoặc có lịch sử mượn không. Nguyên tắc là **bảo toàn lịch sử**, không xóa dây chuyền.”

**[MỞ FILE]** `backend/controllers/bookController.js` dòng 255–278; `authorController.js` dòng 98–116; `userController.js` dòng 129–147.

**[KẾT QUẢ MONG ĐỢI]** Banner đỏ 409; sách vẫn còn trong danh sách; dữ liệu lịch sử nguyên vẹn.

**[NẾU BỊ HỎI] “Sao không dùng `ON DELETE CASCADE` cho xóa sách?”**
> “Một số khóa ngoại trong schema có `CASCADE` từ giai đoạn đầu, nhưng nghiệp vụ thư viện không được phép xóa lịch sử. Vì vậy lớp ứng dụng chặn trước bằng kiểm tra và trả `409`. Nếu muốn tuyệt đối, nên chuyển các FK liên quan sang `RESTRICT/NO ACTION` trong migration tương lai, để CSDL cũng chặn như ứng dụng. Đây là điểm nhóm ý thức được, không phải che giấu.”

**[CÂU CHỐT]** “Xóa đúng không phải là xóa được, mà là biết khi nào phải từ chối.”

---

### 6.5. Kiểm thử và kết luận (50 giây)

**[HIỂN THỊ]** Slide 30, 31, 32; terminal.

**[THAO TÁC]** Chạy:

```powershell
cd backend
npm test
```

Chỉ vào dòng cuối:

```text
ℹ tests 49
ℹ pass 47
ℹ fail 0
ℹ skipped 2
```

Sau đó mở `backend/test` — 10 file.

**[NÓI]**

> “Toàn bộ backend có **49 test trong 10 file**. Trên máy hiện tại, vì MySQL đang tắt và biến `MIGRATION_TEST_DB_URL` chưa set, hai file integration được **skip có chủ đích**; còn lại 47 test pass, 0 fail.
>
> Trên môi trường MySQL thật, theo biên bản nghiệm thu, cả 49/49 đều pass. Hai file integration kiểm tra trực tiếp: khóa chính phức hợp, khóa ngoại, unique return, function, trigger, procedure, và hai approval cạnh tranh cho một cuốn sách.
>
> Nhóm cũng có test cho:
>
> - quota 5 quyển, gồm cả phiếu chờ duyệt;
> - rollback khi một cuốn không đủ;
> - trả sách không có `yeuCauTraAt` bị `409`;
> - trả lần hai bị chặn;
> - dashboard trả đúng 3 KPI;
> - route báo cáo chỉ cho admin.
>
> Về hạn chế: biểu đồ chưa có lịch sử nhiều tháng; danh sách quá hạn chưa phân trang server-side; chưa có retry tự động khi deadlock; accessibility mới ở mức cơ bản. Đó là những hướng phát triển tiếp theo.
>
> Tóm lại, nhóm đã hoàn thành một hệ thống quản lý thư viện có CSDL đúng, giao dịch an toàn, giao diện dùng được và bộ test làm bằng chứng. Em xin kết thúc phần trình bày; nhóm em sẵn sàng nhận câu hỏi.”

**[CÂU CHỐT]** “49 test không phải con số để khoe, mà là bằng chứng rằng các tình huống xấu đã được nghĩ tới.”

---

## 7. MA TRẬN Q&A THEO NGƯỜI PHỤ TRÁCH

> **Cách dùng:** Khi hội đồng hỏi, người chính trả lời trước; người bổ sung chỉ thêm 1–2 câu, không tranh nói.

| # | Câu hỏi | Chính | Bổ sung | Ý trả lời cốt lõi |
|---:|---|---|---|---|
| 1 | Vì sao dùng khóa chính phức hợp? | A | D | Định danh nghiệp vụ, chống mồ côi, khóa ngoại đủ cột; đổi lại JOIN dài hơn |
| 2 | Vì sao bỏ trigger tồn kho? | A | D | Tồn kho phụ thuộc trạng thái duyệt; trigger gây double-update, khó rollback; transaction sở hữu |
| 3 | `FOR UPDATE` chặn race thế nào? | A | C | Khóa dòng, transaction sau chờ, đọc lại giá trị mới, kiểm tra rồi rollback |
| 4 | Chống deadlock thế nào? | A | — | Lock ordering `maSach ASC`, khóa `DocGia` trước, không tạo chu trình |
| 5 | Sao dùng `COUNT(DISTINCT)`? | A | B | Một độc giả nhiều phiếu vẫn là 1 độc giả |
| 6 | Mức cô lập là gì? | A | — | Không set; InnoDB mặc định REPEATABLE READ; bảo vệ bằng row lock |
| 7 | Vì sao function 1 tham số? | A | — | Đề bài quy định; `SUM` theo `maSach` để đúng cả khi nhiều dòng |
| 8 | Procedure có nhanh hơn query? | A | B | Không mặc định; lợi ích là đóng gói, nhất quán; hiệu năng nhờ index/pagination |
| 9 | Dashboard lấy từ procedure hay bảng? | B | A | KPI từ procedure; danh sách chi tiết từ query JOIN; `COUNT` trực tiếp cho phiếu chưa trả |
| 10 | Vì sao F5 mất số liệu? | B | D | Component remount, store danh mục chưa nạp; `Promise.all` nạp lại 3 danh mục + 2 API |
| 11 | 100k phiếu tối ưu thế nào? | B | A | Index `(trangThai, ngayTra)`, phân trang server-side, tránh `SELECT *`, covering index |
| 12 | Biểu đồ sao chỉ 1 cột? | B | — | API chỉ trả tổng tháng này; không vẽ khống; chờ `monthlyLoans` |
| 13 | Sao gửi yêu cầu chưa trừ kho? | C | A | Chờ duyệt là ý định; trừ ở điểm duyệt để tránh giữ sách ảo |
| 14 | Hai tab vượt quota thế nào? | C | A | Client kiểm tra sớm; backend khóa `DocGia`, tính lại trong transaction, 409 |
| 15 | Enum trạng thái đồng bộ ra sao? | C | A | DB 5 giá trị; model 4 giá trị dùng; hiển thị 6 trạng thái, 2 trạng thái dẫn xuất |
| 16 | `'Đã duyệt'` có dùng không? | C | A | Chỉ còn trong enum để tương thích; không code path nào ghi; có thể dọn ở migration sau |
| 17 | Vì sao dùng localStorage? | C | — | Giữ giỏ khi chuyển trang/F5; chỉ là cache, server kiểm tra lại |
| 18 | Accessibility đạt WCAG chưa? | C | — | Áp dụng cơ bản: focus, ARIA, retry, keyboard; chưa audit đầy đủ |
| 19 | Xóa sách có lịch sử thế nào? | D | A | `409`, kiểm tra tồn kho + chi tiết mượn; bảo toàn lịch sử |
| 20 | PUT khác PATCH? | D | C | PUT thay thế, PATCH một phần; code dùng chung handler, thực tế như PATCH |
| 21 | `log_bin_trust_function_creators` là gì? | D | A | Cần khi binary logging bật và user thiếu SUPER để tạo function/trigger; set global rồi migrate |
| 22 | 49/49 hay 47/49? | D | A | 49 test; local 47 pass + 2 skip do thiếu DB URL; MySQL thật 49/49 |
| 23 | Vì sao 17 migration? | A | D | Tiến hóa schema có kiểm soát, rollback, không `sync alter` |
| 24 | Nếu deadlock vẫn xảy ra? | A | D | InnoDB rollback một transaction; chưa retry tự động; hướng phát triển |

---

## 8. CÂU HỎI KHÓ VÀ CÂU TRẢ LỜI MẪU

### 8.1. “Tại sao không để CSDL tự lo tất cả bằng trigger?”

**Trả lời:**

> “Trigger rất tốt cho ràng buộc dẫn xuất đơn giản, ví dụ tiền phạt. Nhưng tồn kho không phải một phép tính cục bộ: nó phụ thuộc vào trạng thái phiếu, hạn mức độc giả, nhiều dòng sách và yêu cầu rollback toàn bộ. Nếu trigger tự trừ kho, backend cũng trừ sẽ thành double-update; nếu chỉ trigger trừ, khó kiểm soát thứ tự khóa và khó trả thông báo nghiệp vụ. Nhóm chọn transaction ở backend — nơi có đủ ngữ cảnh — và giữ trigger cho tiền phạt.”

### 8.2. “Nếu hai transaction cùng khóa nhiều sách theo thứ tự khác nhau thì sao?”

**Trả lời:**

> “Đó chính là deadlock. Nhóm chuẩn hóa thứ tự: `getDetails` sắp xếp `maSach ASC, maTacGia ASC, maTheLoai ASC`, và khi tạo yêu cầu cũng sort trước khi ghi. Mọi transaction duyệt đều khóa sách theo cùng thứ tự, nên không thể có chuyện T1 giữ A chờ B trong khi T2 giữ B chờ A. Ngoài ra, khóa `DocGia` trước để tuần tự hóa các thao tác của cùng một độc giả.”

### 8.3. “Nếu API báo cáo trả về số khác procedure thì tin ai?”

**Trả lời:**

> “Tin dữ liệu gốc và câu SQL đối chiếu. Procedure là một cách đóng gói; nếu procedure sai, dashboard sai theo. Vì vậy nhóm có test `database-features.integration.test.js` gọi procedure và so với dữ liệu insert mẫu; test `statistics-api.test.js` kiểm tra API trả đúng alias. Khi có sai lệch, ưu tiên sửa procedure/migration, không sửa số trên UI.”

### 8.4. “Nếu độc giả sửa localStorage để vượt quota thì sao?”

**Trả lời:**

> “Client chỉ là lớp kiểm tra sớm. Backend không tin `chiTiet` từ client về số lượng tồn hay quota. Khi tạo yêu cầu, backend khóa `DocGia`, tính `outstandingCopies` từ CSDL, kiểm tra `sum + requested > 5` và trả `409`. Khi duyệt, backend kiểm tra lại lần nữa. Sửa localStorage chỉ có thể làm hỏng trải nghiệm, không vượt được CSDL.”

### 8.5. “Nếu xóa tác giả đang có sách thì FK CASCADE có xóa sách không?”

**Trả lời:**

> “Trong schema hiện tại, một số FK được tạo với `CASCADE` từ giai đoạn đầu. Nhưng lớp ứng dụng chặn trước: `deleteAuthor` đếm sách liên kết và trả `409` nếu còn. Vì vậy đường xóa qua API an toàn. Nếu ai đó xóa trực tiếp bằng SQL, `CASCADE` có thể xóa sách — đây là rủi ro cần khắc phục bằng migration đổi sang `RESTRICT`. Nhóm ghi nhận đây là hạn chế và hướng hoàn thiện, không tuyên bố là đã tuyệt đối.”

### 8.6. “Tại sao `'Đã duyệt'` vẫn còn trong enum?”

**Trả lời:**

> “Đó là giá trị tương thích từ giai đoạn trước. Migration `20261026130000-align-loan-status-enum.js` giữ nó trong DB để không phá dữ liệu cũ, nhưng model Sequelize và controller chỉ dùng 4 giá trị: `'Chờ duyệt'`, `'Đang mượn'`, `'Đã trả'`, `'Từ chối'`. Không có code path nào ghi `'Đã duyệt'`. Nếu muốn sạch hoàn toàn, có thể thêm migration dọn giá trị và loại khỏi enum.”

### 8.7. “Tại sao `'Quá hạn'` không nằm trong enum?”

**Trả lời:**

> “Vì quá hạn là một **nhãn thời gian**, không phải trạng thái nghiệp vụ. Cùng một phiếu `'Đang mượn'`, hôm nay chưa quá hạn, mai quá hạn. Nếu lưu vào enum, phải có job cập nhật mỗi ngày và có nguy cơ sai. Nhóm tính từ `ngayTra` khi hiển thị; admin dashboard dùng `isOverdue`, độc giả thấy hạn trả. Tương tự, `'Chờ xác nhận trả'` là trạng thái dẫn xuất từ cờ `yeuCauTraAt`.”

### 8.8. “Nếu mất kết nối DB giữa transaction thì sao?”

**Trả lời:**

> “InnoDB sẽ rollback transaction chưa commit khi kết nối đứt. Backend bắt lỗi, kiểm tra `transaction.finished` trước khi rollback để tránh rollback hai lần. Người dùng nhận lỗi 500/400 thay vì dữ liệu nửa vời. Đây là lý do mọi thao tác ghi quan trọng đều nằm trong `try/catch` và `commit` chỉ sau khi mọi bước thành công.”

---

## 9. PHƯƠNG ÁN KHI BỊ CẮT NGANG / QUÁ GIỜ

### 9.1. Nếu mới đến phút 18 mà A vẫn đang ở procedure

- Bỏ phần chạy `SHOW CREATE`; chỉ chiếu slide.
- Bỏ đối chiếu SQL phụ; chỉ nêu “số khớp”.
- Chuyển ngay sang B; phần locking đã có slide + test, có thể nói 30 giây.

### 9.2. Nếu dashboard F5 lỗi

- Không hoảng; nói: “Đây chính là lỗi nhóm đã sửa; em sẽ chiếu ảnh trước/sau.”
- Mở ảnh backup; giải thích `Promise.all`.
- Chuyển tiếp.

### 9.3. Nếu PDF không mở

- Nói: “PDF đã được xuất trước; em mở bản backup.”
- Mở file trong `assets/backup/`.
- Nêu mã nguồn `borrowController.js` dòng 354–515.

### 9.4. Nếu hội đồng hỏi câu ngoài phạm vi

- Công thức: **“Em ghi nhận câu hỏi. Hiện nhóm em chưa có số liệu kiểm chứng cho phần này; nhóm em xin phép trả lời sau buổi báo cáo.”**
- Không đoán bừa. Không tranh luận với giảng viên.
- Ghi vào giấy; D tổng hợp.

---

## 10. CHECKLIST SAU BUỔI BÁO CÁO

- [ ] Cảm ơn hội đồng; xin nhận xét.
- [ ] Ghi lại toàn bộ câu hỏi và câu trả lời còn thiếu.
- [ ] Chụp lại màn hình kết quả test/feedback nếu được phép.
- [ ] Khôi phục dữ liệu demo nếu cần nộp lại:
  ```powershell
  mysql -u root -p library_db < backup_library_db.sql
  ```
- [ ] Cập nhật `Cores/checkpoint.md` với kết quả bảo vệ (nếu nhóm duy trì nhật ký).
- [ ] Sửa comment “Read Committed” trong `backend/scripts/demo_tuan4_nguoi_a.sql` nếu chưa sửa.
- [ ] Lưu bản slide PDF + video demo vào thư mục nhóm.

---

## PHỤ LỤC A — BẢN ĐỒ FILE & DÒNG CẦN MỞ

| Chủ đề | File | Dòng | Dùng khi |
|---|---|---|---|
| Routes | `backend/server.js` | 27–36, 47–53 | Kiến trúc |
| Borrow routes | `backend/routes/borrowRoutes.js` | 17–28 | API map |
| Report routes | `backend/routes/reportRoutes.js` | 11–15 | Dashboard |
| Khóa độc giả | `backend/controllers/borrowController.js` | 14–17 | Transaction |
| Quota | `backend/controllers/borrowController.js` | 19–34 | Quota |
| Sort khóa sách | `backend/controllers/borrowController.js` | 36–40, 153 | Deadlock |
| Tạo yêu cầu | `backend/controllers/borrowController.js` | 126–200 | C gửi |
| Yêu cầu trả | `backend/controllers/borrowController.js` | 202–246 | C trả |
| Duyệt/trả | `backend/controllers/borrowController.js` | 248–352 | A/D |
| PDF | `backend/controllers/borrowController.js` | 354–515 | C/D |
| Quy tắc mượn | `backend/utils/borrowRules.js` | 1–23 | Quota/trạng thái |
| KPI | `backend/controllers/reportController.js` | 65–88 | B |
| Danh sách chưa trả | `backend/controllers/reportController.js` | 90–137 | B |
| Dashboard UI | `frontend/src/components/admin/AdminHomePage.vue` | 60–322, 430–448 | B |
| Service | `frontend/src/services/dashboardReportService.js` | 33–62 | B |
| Giỏ/quota | `frontend/src/components/reader/BookList.vue` | 416–419, 449–461, 529–554, 599–619 | C |
| Lịch sử | `frontend/src/components/reader/BorrowHistory.vue` | 52–59, 237–290, 292–350 | C |
| PATCH | `frontend/src/components/admin/BookManagement.vue` | 331–336, 599–611 | D |
| PATCH store | `frontend/src/store/modules/book.js` | 64–83 | D |
| Xóa sách | `backend/controllers/bookController.js` | 255–278 | D |
| Xóa tác giả | `backend/controllers/authorController.js` | 98–116 | D |
| Xóa độc giả | `backend/controllers/userController.js` | 129–147 | D |
| Function | `backend/migrations/20261026140000-align-stock-function.js` | 9–20 | A |
| Trigger | `backend/migrations/20261021120000-align-routines-and-triggers.js` | 46–65 | A |
| Procedures | `backend/migrations/20261021120000-align-routines-and-triggers.js` | 10–43 | A |
| Bỏ trigger kho | `backend/migrations/20261013120000-approval-stock-and-reporting.js` | 33–37 | A |
| Unique return | `backend/migrations/20260930120000-unique-return-detail.js` | 44–52 | A/D |
| Enum | `backend/migrations/20261026130000-align-loan-status-enum.js` | 9–13 | C |
| Cờ trả | `backend/migrations/20261018130000-reader-return-requests.js` | 4–8 | C |
| Test schema | `backend/test/database-features.integration.test.js` | 19–107 | A |
| Test mượn | `backend/test/borrow-flow.integration.test.js` | 79–106 | A |
| Test race | `backend/test/week3-concurrency-and-auth.test.js` | 100–209 | A |
| Test dashboard | `backend/test/statistics-api.test.js` | toàn file | B |
| Demo SQL | `backend/scripts/demo_tuan4_nguoi_a.sql` | 17–215 | A |

---

## PHỤ LỤC B — LỆNH NHANH

```powershell
# MySQL
net start MySQL80

# Backend
cd backend
npx sequelize-cli db:migrate
npm run demo:setup          # migration + admin + seed
npm run dev                 # http://localhost:5000

# Frontend
cd ..\frontend
npm run dev                 # http://localhost:5173

# Test
cd ..\backend
npm test

# Nếu muốn chạy 2 test integration (49/49):
$env:MIGRATION_TEST_DB_URL="mysql://root:password@127.0.0.1:3306/library_migration_check"
npm test
```

> **Lưu ý:** `MIGRATION_TEST_DB_URL` phải trỏ đến database đã migrate và **sạch** (`library_migration_check` hoặc `library_db`). Hai test integration sẽ skip nếu biến này không có.

---

## PHỤ LỤC C — CÁC SỐ LIỆU ĐÃ KIỂM CHỨNG

| Số liệu | Giá trị | Nguồn |
|---|---|---|
| Số bảng trọng tâm | 7 | `Cores/Tieuchiduan.md`; migrations |
| Tổng bảng | 9 | migrations |
| Migrations | 17 | `backend/migrations/` |
| Test files | 10 | `backend/test/*.test.js` |
| Tổng test | 49 | `npm test` |
| Local pass/skip/fail | 47 / 2 / 0 | `npm test` khi MySQL tắt |
| MySQL thật | 49/49 | `Cores/checkpoint.md` |
| Hạn mức mượn | 5 quyển | `borrowRules.js` |
| Thời hạn mượn | 14 ngày | `borrowRules.js` |
| Phạt | 1.000đ/ngày/cuốn | trigger migration |
| Demo phạt P | 2.000đ | 2 ngày × 1 cuốn |
| Demo phạt A | 4.000đ | 2 ngày × 2 cuốn |

---

*Hết kịch bản. Người phụ trách: D — Vũ. Cập nhật lần cuối: 2026-11-08.*

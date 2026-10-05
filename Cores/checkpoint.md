# Checkpoint — Trạng thái dự án LibraryManagement

<<<<<<< HEAD

> # Cập nhật lần cuối: 2026-09-28 20 30 gi dai di
>
> Cập nhật lần cuối: 2026-09-30 (rà soát tài liệu và mã nguồn; chưa thay đổi chức năng)

## Bối cảnh và quyết định hiện tại

- Đây là **dự án có sẵn của bạn người dùng**. Mục tiêu là sửa, tùy biến và hoàn thiện để đáp ứng `Cores/Tieuchiduan.md`; ưu tiên tận dụng cấu trúc và chức năng đang có, tránh viết lại toàn bộ khi chưa cần.
- Người dùng đánh giá **giao diện hiện tại khá xấu** và muốn thiết kế lại cho phù hợp hơn. Chưa có bộ nhận diện, màu sắc hoặc mẫu tham chiếu được chốt. Lần triển khai UI tiếp theo cần xem các màn hình thực tế, đề xuất một hướng thị giác nhất quán, rồi chỉnh trực tiếp và kiểm tra trên desktop/mobile.
- Yêu cầu của lượt 2026-09-30 là **cập nhật ngữ cảnh trong tài liệu**, không phải đã hoàn tất redesign hoặc sửa lỗi nghiệp vụ. Các mục kỹ thuật bên dưới vẫn là việc cần làm cho đến khi có bằng chứng kiểm thử mới.
- `checkpoint.md` là nhật ký liên tục: **chỉ sửa/bổ sung file này, không xóa hay tạo lại**. Mỗi lần kết thúc một việc đáng kể, ghi thay đổi, kết quả kiểm tra, việc còn lại và ngày xác nhận.

## Cập nhật tiến độ tổng hợp (05/10/2026)

**Đánh giá tổng quan:** Các nhánh của A, C, D đã bắt đầu hội tụ tại `main`. Xung đột CSDL và giao diện đã được giải quyết thành công thông qua quá trình merge.

- **Người A (Minh - Thiết kế CSDL, Migration, Trigger, API Thống kê):**
  - Đã tái cấu trúc lại một số bảng quan trọng (VD: Gộp `hoLot` và `ten` thành cột `fullName` duy nhất trong bảng `DocGia`).
  - Đã bổ sung các khóa ngoại, thêm các cột cần thiết (`maPhieuMuon`, `maSach`) vào bảng `PhieuTra` và viết Trigger xử lý nghiệp vụ mượn/trả (`trg_tinh_tien_phat`).
  - **Trạng thái:** Hoàn thành tốt phần Core CSDL. Đã gộp code thành công vào `main`.

- **Người B (Thắng - Dashboard Quản trị & Biểu đồ):**
  - Đang phát triển giao diện Dashboard.
  - **Trạng thái:** Chờ hoàn thiện để tích hợp API thống kê từ A.

- **Người C (Tuấn - Trải nghiệm Độc giả & Frontend):**
  - Đã thiết kế lại toàn bộ UI khu vực Độc giả (BookList, Drawer Giỏ mượn, PublisherList).
  - Tích hợp bộ lọc sách và lưu giỏ mượn vào Local Storage.
  - Đã giải quyết xong xung đột (conflict) mã nguồn với A và fix bug MySQL \`fn_kiem_tra_so_luong_sach\`.
  - **Trạng thái:** Đã fix xong UI và hoàn thành gộp nhánh. Sẵn sàng tạo Pull Request.

- **Người D (Vũ - Quản lý dữ liệu, Import/Export, Kiểm thử):**
  - Đã cập nhật thành công kịch bản test nâng cao `scripts/seed-data.js` để khớp với cột `fullName`.
  - **Trạng thái:** Các dữ liệu giả lập (seeders) đều chạy trơn tru với cấu trúc DB mới.

## Cập nhật 2026-10-05 — Giao diện Độc giả (Thành viên C)

**Phạm vi:** Chỉ frontend phần độc giả. Không đổi API, schema, store, hay bất kỳ component admin nào.

### File đã thay đổi

| File                                               | Thay đổi                                                                                                                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/src/components/reader/BookList.vue`      | Viết lại hoàn toàn — thiết kế mới, bộ lọc, modal xem chi tiết sách. Đã sửa lỗi hiển thị số lượng và fix lỗi giỏ hàng bị reset khi chuyển trang (lưu local storage). Dọn dẹp conflict git. |
| `frontend/src/views/ReaderDashboard.vue`           | Viết lại hoàn toàn — navbar sticky, responsive mobile menu, footer tối                                                                                                                    |
| `frontend/src/components/reader/PublisherList.vue` | Nâng cấp UI đồng bộ với BookList (card layout, khoảng cách lề, font chữ).                                                                                                                 |
| `frontend/src/components/reader/AuthorList.vue`    | Nâng cấp UI đồng bộ với BookList (card layout, khoảng cách lề, font chữ).                                                                                                                 |
| `frontend/src/components/reader/CategoryList.vue`  | Nâng cấp UI đồng bộ với BookList (card layout, khoảng cách lề, font chữ).                                                                                                                 |
| `frontend/src/components/reader/BorrowHistory.vue` | Nâng cấp UI đồng bộ với thiết kế mới (Bảng dữ liệu phẳng, tab hiện đại, nút tải phiếu dạng icon nhỏ gọn).                                                                                 |

### Nghiệp vụ giỏ mượn đã kiểm tra

- **Giữ giỏ hàng khi chuyển trang:** Sử dụng `localStorage` để lưu state `borrowCart`, tránh reset giỏ hàng làm ảnh hưởng UX.
- **Không thêm trùng sách:** nút "Thêm vào giỏ" bị disable và đổi thành "Đã thêm" ngay sau khi sách đã có trong giỏ.
- **Số lượng nguyên dương, không vượt tồn:** `validateQuantity()` clamp về `[1, soLuongHienCo]`; nút `±` không cho vượt biên; `isValidCart` block nút gửi khi có item không hợp lệ.
- **Thông báo trạng thái "Chờ duyệt":** sau khi gửi, toast hiện rõ trạng thái Chờ duyệt. Drawer cũng có note nhắc trước khi bấm gửi.

### Thay đổi UI

- Font: Playfair Display (tiêu đề) + Outfit (body), lấy cảm hứng design system CT449.
- Giỏ mượn là **side drawer** trượt từ phải, thay vì modal giữa màn hình.
- Book grid dùng CSS Grid auto-fill, ảnh bìa với overlay stock badge (tỉ lệ chuẩn 3:4).
- Bộ lọc: Có thêm filter theo thể loại nằm cạnh ô tìm kiếm ở BookList.
- Modal xem chi tiết sách (Book Detail): Bấm vào ảnh hoặc tiêu đề sách để xem full ảnh và thông tin chi tiết. (Đã bỏ hiển thị "Tổng quyển" dư thừa).
- Các trang Tác giả, Nhà xuất bản, Thể loại đã được bo góc, thêm padding/margin để chữ không bị dính sát lề, áp dụng font và màu sắc mới đồng nhất.
- Navbar sticky, avatar chữ cái, nút logout icon, hamburger menu responsive.
- Footer tối `#0f172a`, đã xóa thông tin cá nhân/mã số sinh viên của source cũ.

### Cập nhật bổ sung (Gộp nhánh & Fix Bug)\n- **Gộp nhánh main:** Đã merge thành công nhánh main vào C-Tuấn, giải quyết toàn bộ 8 file xung đột (giữ giao diện mới của C, nhận DB models mới của A).\n- **Fix Bug SQL:** Sửa lỗi hàm n_kiem_tra_so_luong_sach trong CSDL bị dư tham số gây crash khi xóa sách. Cập nhật file ookController.js để đọc kết quả destructuring chính xác.\n\n### Rủi ro còn lại

- `VITE_API_IMAGE_URL` phải được cấu hình đúng trong `frontend/.env` để ảnh hiển thị.
- `BorrowHistory.vue` chưa được cập nhật UI (ngoài phạm vi lần này).

## Bản đồ mã nguồn và hiện trạng UI (đã đọc mã ngày 2026-09-30)

| Khu vực                   | File chính                                                                                 | Ghi nhận                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Công nghệ                 | `frontend/package.json`, `backend/package.json`                                            | Vue 3, Vite, Vuex, Bootstrap 5/Font Awesome; Express, Sequelize/MySQL.                                                                        |
| Tuyến màn hình            | `frontend/src/router/index.js`                                                             | `/`, `/login`, `/register`, `/admin`, `/reader`, quên/đặt lại mật khẩu.                                                                       |
| Kiểu chung                | `frontend/src/App.vue`                                                                     | Ảnh nền `nen.jpg` và lớp phủ trắng, card/bảng trong suốt, navbar xanh Bootstrap áp dụng toàn app.                                             |
| Khu quản trị              | `frontend/src/views/AdminDashboard.vue`, `frontend/src/components/admin/AdminHomePage.vue` | Navbar nhiều mục; dashboard hiện là ba card tổng sách/tác giả/NXB, card sách đã mượn bị comment.                                              |
| Khu độc giả               | `frontend/src/views/ReaderDashboard.vue`, `frontend/src/components/reader/HomePage.vue`    | Navbar/footer riêng; trang đầu có bốn card thống kê và hai card hướng dẫn.                                                                    |
| Mã nguồn gốc còn lộ ra UI | `frontend/src/views/ReaderDashboard.vue`, `frontend/src/components/reader/HomePage.vue`    | Có tên thư viện và thông tin liên hệ/định danh của chủ source cũ. Cần kiểm tra và thay bằng nội dung được người dùng chọn trước khi nộp/demo. |

**Hướng cải thiện giao diện:** bắt đầu từ shell chung, trang khách/đăng nhập, catalogue độc giả và dashboard quản trị; tạo màu, chữ, khoảng cách, nút, form, bảng và trạng thái tải/rỗng/lỗi thống nhất. Giữ luồng đăng nhập, phân quyền, API và nghiệp vụ khi chỉ làm giao diện. Ưu tiên responsive, tương phản chữ và điều hướng rõ ràng. Ghi nhận bằng ảnh trước/sau và `npm run build`.

**Chưa xác minh ở lượt này:** trạng thái tiến trình backend/frontend/MySQL, màn hình chạy thực tế, dữ liệu DB, tài khoản demo và các kết quả migration/seed cũ. Những mục “đã xác nhận” bên dưới là ghi chép ngày 2026-09-28, cần kiểm tra lại trước khi dựa vào chúng để sửa/chạy ứng dụng.

> > > > > > > main

---

## Môi trường theo ghi chép ngày 2026-09-28 (chưa kiểm tra lại)

| Thành phần              | Trạng thái  | Ghi chú                                                                         |
| ----------------------- | ----------- | ------------------------------------------------------------------------------- |
| Node.js                 | ✅ v26.1.0  | Cài sẵn trên máy                                                                |
| npm                     | ✅ 11.13.0  | Cài sẵn trên máy                                                                |
| MySQL Server            | ✅ 8.0.46   | Đã cài vào `D:\MySQL\MySQL Server 8.0`                                          |
| MySQL Port              | ✅ **3306** | Đã sửa từ 3307 → 3306 trong `config/config.json`                                |
| `backend/node_modules`  | ✅          | Đã `npm install` thành công                                                     |
| `frontend/node_modules` | ✅          | Đã `npm install` thành công (Node v26 có warn EBADENGINE nhưng không ảnh hưởng) |

---

## Cấu hình Database theo ghi chép ngày 2026-09-28

- **Database:** `library_db`
- **MySQL User:** `librarymanagement` (host: `127.0.0.1`, password: `librarymanagement`)
- **MySQL User quyền:** `GRANT ALL PRIVILEGES ON library_db.*` ✅
- **File cấu hình:** `backend/.env` và `backend/config/config.json` đều dùng port **3306**

> **Lưu ý quan trọng:** `sequelize-cli` đọc cấu hình từ `backend/config/config.json` (KHÔNG phải từ `.env`). File này đã được sửa port từ 3307 → 3306.

---

## Trạng thái Migration & Seed theo ghi chép ngày 2026-09-28

| Lệnh                                             | Trạng thái | Ghi chú                                                                           |
| ------------------------------------------------ | ---------- | --------------------------------------------------------------------------------- |
| `npx sequelize-cli db:migrate`                   | ✅ DONE    | Tất cả bảng và function/trigger/procedure đã được tạo                             |
| `npm run seed-admin`                             | ✅ DONE    | Tài khoản admin mặc định đã tạo                                                   |
| `SET GLOBAL log_bin_trust_function_creators = 1` | ✅ DONE    | Cần chạy lại trong MySQL mỗi khi server MySQL khởi động lại (nếu cần migrate lại) |

---

## Tài khoản mặc định

| Loại            | Tên đăng nhập       | Mật khẩu                        | Ghi chú                      |
| --------------- | ------------------- | ------------------------------- | ---------------------------- |
| Nhân viên Admin | `Admin` (chữ A hoa) | `admin123`                      | Tạo bởi `npm run seed-admin` |
| MySQL root      | `root`              | _(mật khẩu bạn tự đặt khi cài)_ | Dùng để quản trị MySQL       |

---

## Lỗi đã gặp và đã giải quyết

| Lỗi                                                  | Nguyên nhân                                                           | Cách khắc phục                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ECONNREFUSED 127.0.0.1:3307`                        | `config/config.json` gán cứng port 3307, MySQL mới cài dùng port 3306 | Sửa port trong `backend/config/config.json` về `3306`                                      |
| `SUPER privilege... log_bin_trust_function_creators` | User `librarymanagement` không có quyền SUPER để tạo function/trigger | Chạy `SET GLOBAL log_bin_trust_function_creators = 1;` bằng tài khoản root trong MySQL CLI |

<<<<<<< HEAD
| `Cannot find module './logger'` (winston) | Thư viện winston bị cài thiếu/hỏng file nội bộ | Chạy `npm install winston` trong thư mục `backend` |
=======
| `Cannot find module './logger'` (winston) | Thư viện winston bị cài thiếu/hỏng file nội bộ | Chạy `npm install winston` trong thư mục `backend` |
| `Unknown column 'maPhieuMuon' in 'NEW'` | Cấu trúc bảng `PhieuTra` cũ chưa có cột này do chạy đè migration | Dùng `npx sequelize-cli db:drop` và `db:create` để cài lại CSDL sạch |
| `notNull Violation: DocGia.fullName cannot be null` | Người D quên update `hoLot`/`ten` thành `fullName` trong `demo-data.js` | Đã tự động sửa lại file `seeders/demo-data.js` để dùng cột `fullName` |

> > > > > > > main

---

## Trạng thái chạy theo ghi chép ngày 2026-09-28 (chưa kiểm tra lại)

- **Backend:** đang chạy ở `http://localhost:5000` (lệnh `npm run dev` tại `backend`)
- **Frontend:** đang chạy ở `http://localhost:5173` (lệnh `npm run dev` tại `frontend`)
- **Đăng nhập:** vào tab **Nhân viên**, dùng tên `Admin` / mật khẩu `admin123`

---

## Việc cần làm tiếp theo

1. Theo yêu cầu hiện tại của người dùng, bắt đầu **cải thiện giao diện mã nguồn có sẵn** theo prompt ở đầu `next_step_guide.md`. Xem app nếu chạy được, chốt phong cách/nội dung hiển thị, sửa theo từng màn hình và kiểm tra build, responsive.
2. Song song hoặc tiếp theo, xác minh lại môi trường và bắt đầu **Giai đoạn 1 — Khóa lỗi dữ liệu lõi** theo `next_step_guide.md`. Ghi nhận kết quả thật, không đánh dấu hoàn thành chỉ dựa trên kế hoạch.

<<<<<<< HEAD
Các vấn đề nghiệp vụ cần ưu tiên sửa ngay (theo `Chienluoc.md`):

=======
Các vấn đề nghiệp vụ chưa có bằng chứng đã sửa (theo `Chienluoc.md`):

> > > > > > > main

1. **[Ưu tiên cao - A]** Sửa lỗi tồn kho bị cập nhật 2 lần (trigger + controller cùng tăng/giảm).
2. **[Ưu tiên cao - A]** State machine trạng thái phiếu mượn: `Chờ duyệt → Đã duyệt/Từ chối → Đã trả`.
3. **[Ưu tiên cao - A]** Sửa procedure "phiếu chưa trả" (đang lọc trạng thái `Dang muon` không tồn tại).
4. **[Ưu tiên cao - A]** Thống kê độc giả mượn năm phải dùng `COUNT(DISTINCT maDocGia)`.

**Kết quả lượt 2026-09-30:** đã cập nhật `Cores/checkpoint.md`, `Cores/next_step_guide.md`, `Cores/Chienluoc.md`, `Cores/prompt.md`, `README.md`. Đã đối chiếu cấu trúc frontend/router và các đoạn mã mượn-trả/routine; chưa sửa mã ứng dụng, chưa chạy app hay kiểm thử DB. `git diff --check` không báo lỗi nội dung diff (chỉ có cảnh báo chuẩn hóa LF/CRLF trên Windows).

---

## Ghi chú môi trường Windows

- Để **bật MySQL thủ công** (nếu tắt tự khởi động): Phím Windows → tìm "Services" → Tìm dòng `MySQL80` → Chuột phải → Start.
- Mỗi lần mở terminal mới để code, cần mở 2 terminal:
  - Terminal 1: `cd backend` rồi `npm run dev`
  - Terminal 2: `cd frontend` rồi `npm run dev`

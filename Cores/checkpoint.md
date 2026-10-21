# Checkpoint — Trạng thái dự án LibraryManagement

> Cập nhật lần cuối: 2026-10-18 (backup dữ liệu mẫu, xử lý ảnh, cập nhật hướng dẫn vận hành)

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
  - **Giai đoạn 1 đã hoàn thành:** cập nhật `frontend/src/components/admin/AdminHomePage.vue` với giao diện dashboard Bootstrap responsive, ba chỉ số bắt buộc (sách mượn tháng này, độc giả đã mượn năm nay, phiếu chưa trả), biểu đồ lượt mượn sáu tháng và bảng phiếu chưa trả.
  - Thêm `frontend/src/services/dashboardReportService.js` làm service/fixture độc lập; mặc định hiển thị dữ liệu minh họa và hỗ trợ xem trạng thái rỗng/lỗi. Dashboard có loading, error kèm nút thử lại, empty state.
  - **Trạng thái:** Giai đoạn 1 hoàn thành với fixture. Chờ A bàn giao API và payload thống nhất ở Giai đoạn 2 trước khi tích hợp dữ liệu thật; không sửa backend trong phần việc của B, Sẵn sàng tạo Pull Request.
  - Giai đoạn 2:
    Đã kết nối dashboard quản trị với API tổng quan và API danh sách phiếu chưa trả. Dashboard hiển thị ba chỉ số bắt buộc, thông tin độc giả/sách và hạn trả, bộ lọc phiếu quá hạn cùng badge số ngày trễ; giữ các trạng thái tải, lỗi và rỗng. Biểu đồ dùng số liệu mượn của tháng hiện tại từ API. API chưa cung cấp lịch sử nhiều tháng nên hiện chưa thể so sánh xu hướng.
  * trạng thái đã hoàn thành giai đoạn 2:
  - Giai đoạn 3:
    Xác nhận dashboard dùng hai API báo cáo hiện có: tổng quan và danh sách phiếu chưa trả.
    Rà soát responsive: thẻ chỉ số xếp thành một cột trên màn hình hẹp, bộ lọc chuyển sang bố cục dọc và bảng phiếu có vùng cuộn ngang.
    Đối chiếu biểu đồ với API: hiện API chỉ trả tổng sách mượn tháng này, chưa trả lịch sử nhiều tháng. Biểu đồ hiển thị một điểm tháng hiện tại và giao diện nêu rõ chưa có lịch sử so sánh. Khi API trả monthlyLoans gồm nhiều tháng, dashboard sẽ hiển thị các điểm tương ứng.
    Không phát hiện lỗi cần sửa trong phạm vi rà soát.
    * Bổ sung điều hướng admin ↔ giao diện độc giả
    Phạm vi: Chỉ cập nhật giao diện điều hướng; giữ nguyên route guard, API và quyền truy cập.
    Trong AdminDashboard.vue, thêm liên kết Giao diện độc giả để admin mở /reader.
    Trong ReaderDashboard.vue, thêm nút Về quản trị cho tài khoản admin. Tài khoản độc giả không thấy nút này.
    Khi admin vào giao diện độc giả, tên và chữ cái đại diện hiển thị theo thông tin nhân viên.
    Không chỉnh sửa router, store, backend hoặc nghiệp vụ mượn/trả.
  - Trạng thái hoàn thành giai đoạn 3: 

- **Người C (Tuấn - Trải nghiệm Độc giả & Frontend):**
  - Đã thiết kế lại toàn bộ UI khu vực Độc giả (BookList, Drawer Giỏ mượn, PublisherList, BorrowHistory).
  - Đã hoàn thành Giai đoạn 2: bổ sung bộ lọc sách (Tác giả, NXB, Thể loại), sắp xếp, phân trang client-side và hiển thị badge "Quá hạn" cho các phiếu mượn trễ hạn.
  - Tích hợp lưu giỏ mượn vào Local Storage để không mất dữ liệu khi chuyển trang.
  - Đã giải quyết xong xung đột (conflict) mã nguồn với A và fix bug MySQL `fn_kiem_tra_so_luong_sach`.
  - **Trạng thái:** Hoàn thành Giai đoạn 2 Giao diện Độc giả. Sẵn sàng gộp nhánh (Merge PR).

- **Người D (Vũ - Quản lý dữ liệu, Import/Export, Kiểm thử):**
  - Đã cập nhật thành công kịch bản test nâng cao `scripts/seed-data.js` để khớp với cột `fullName`.
  - Tạo dữ liệu demo hoàn chỉnh trong file `backend\seeders\demo-data.js` và uploads các ảnh bìa sách trong thư muc `backend/uploads`
  - **Trạng thái:** Các dữ liệu giả lập (seeders) đều chạy trơn tru với cấu trúc DB mới.
  - Hoàn thiện giao diện phía Amin
  - Chỉnh sửa các chức năng quản lý của Amin, thêm các ràng buộc khi xóa chi tiết trong file `Cores\Bao_cao_fix_chuc_nang.md`
  - **Trạng thái:** Hoàn thành Giai đoạn 2
  - Bổ sùng hoàn thiện dữ liệu demo trong file `backend\seeders\demo-data.js`
  - Xử lý ảnh đã làm xong ở giai đoạn 2
  - hướng dẫn vận hành: Bổ sung cách xử lý lỗi khi Khởi tạo Bảng và Dữ liệu trong file `README.md`
  - Thêm chức năng cho phép người đăng nhập khi đang mượn, cho phép mượn tối đa 5 quyển, 
    sửa chức năng in phiếu mượn/trả phía độc giá báo cáo chi tiết ở file `Cores\Bao_cao_fix_chuc_nang.md`
  - lưu ý: trước khi test phải phải `cd backend` => `npx sequelize-cli db:migrate`  
  - **Trạng thái:** Hoàn thành Giai đoạn 3
  
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

## Cập nhật 2026-10-09 — Giai đoạn 2 Giao diện Độc giả (Thành viên C)

**Phạm vi:** Hoàn thành các tính năng Giai đoạn 2 cho phần độc giả.

- **BookList.vue**: Đã bổ sung các bộ lọc theo Tác giả, Nhà xuất bản và tích hợp tính năng sắp xếp (Tên A-Z, Tên Z-A, Mới nhất, Giá tăng/giảm). Đã triển khai phân trang client-side (12 sách/trang). Bộ lọc thay đổi sẽ tự động đưa về trang 1.
- **BorrowHistory.vue**: Bổ sung hiển thị badge "Quá hạn" (màu đỏ) cho các phiếu mượn có trạng thái "Đã duyệt" hoặc "Đang mượn" khi ngày hiện tại vượt quá `ngayTra` (hạn trả).
- **Kết quả kiểm tra trực quan:**
  - _Bộ lọc & Phân trang_: Giao diện đã hiển thị 4 dropdown (thể loại, tác giả, nxb, sắp xếp). Khi chọn lọc, danh sách sách được cập nhật và hiển thị phân trang đúng số lượng. Nếu thay đổi điều kiện lọc, trang hiện tại lập tức reset về 1. Phân trang đã được chỉnh sửa từ 12 về 10 cuốn/trang.
  - _Lịch sử mượn trả_: Các phiếu mượn quá hạn (có ngày `ngayTra` nhỏ hơn hôm nay và trạng thái là "Đã duyệt" / "Đang mượn") sẽ hiển thị badge "Quá hạn".

### Cập nhật bổ sung (Fix Bug Giao diện - Thành viên C) 09/10/2026

- **BookList.vue**: Đã sửa lỗi `Invalid end tag` do dư thẻ `</div>` làm hỏng component. Sửa số lượng sách phân trang hiển thị từ 12 thành 10.
- **PublisherList.vue & AuthorList.vue**: Sửa lỗi đếm số lượng sách sai của Tác giả và NXB. Nguyên nhân là dùng mã định danh `_id` của MongoDB (`book.maNXB?._id`) thay vì mã thực tế của CSDL MySQL hiện tại (`book.maNXB` và `book.maTacGia`). Đã cập nhật template và computed properties dùng đúng biến tham chiếu.

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

| `Cannot find module './logger'` (winston) | Thư viện winston bị cài thiếu/hỏng file nội bộ | Chạy `npm install winston` trong thư mục `backend` |
| `Unknown column 'maPhieuMuon' in 'NEW'` | Cấu trúc bảng `PhieuTra` cũ chưa có cột này do chạy đè migration | Dùng `npx sequelize-cli db:drop` và `db:create` để cài lại CSDL sạch |
| `notNull Violation: DocGia.fullName cannot be null` | Người D quên update `hoLot`/`ten` thành `fullName` trong `demo-data.js` | Đã tự động sửa lại file `seeders/demo-data.js` để dùng cột `fullName` |

---

## Trạng thái chạy theo ghi chép ngày 2026-09-28 (chưa kiểm tra lại)

- **Backend:** đang chạy ở `http://localhost:5000` (lệnh `npm run dev` tại `backend`)
- **Frontend:** đang chạy ở `http://localhost:5173` (lệnh `npm run dev` tại `frontend`)
- **Đăng nhập:** vào tab **Nhân viên**, dùng tên `Admin` / mật khẩu `admin123`

---

## Việc cần làm tiếp theo

1. Theo yêu cầu hiện tại của người dùng, bắt đầu **cải thiện giao diện mã nguồn có sẵn** theo prompt ở đầu `next_step_guide.md`. Xem app nếu chạy được, chốt phong cách/nội dung hiển thị, sửa theo từng màn hình và kiểm tra build, responsive.
2. Song song hoặc tiếp theo, xác minh lại môi trường và bắt đầu **Giai đoạn 1 — Khóa lỗi dữ liệu lõi** theo `next_step_guide.md`. Ghi nhận kết quả thật, không đánh dấu hoàn thành chỉ dựa trên kế hoạch.

Các vấn đề nghiệp vụ cần ưu tiên sửa ngay (theo `Chienluoc.md`):

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

## Cập nhật 2026-10-13 — phần A tuần 1–2

**Kết luận kiểm tra:** Trước lượt này, tuần 1 của A chưa hoàn tất: trigger cũ trừ tồn khi tạo chi tiết, controller chưa trừ tồn lúc duyệt và chưa có API theo hợp đồng mới. Bản ghi “hoàn thành Core CSDL” trước đây không chứng minh các ca nghiệp vụ đã nghiệm thu.

### Đã triển khai

- `backend/migrations/20261013120000-approval-stock-and-reporting.js`: migration mới bỏ `trg_giam_so_luong_sach` và `trg_tang_so_luong_sach`; giữ trigger tính phạt, function tồn kho và procedure thống kê hiện có.
- `backend/controllers/borrowController.js`: gửi yêu cầu chỉ ghi phiếu/chi tiết; từ chối không chạm tồn; duyệt khóa phiếu và sách, kiểm tra tổng lượng rồi trừ tồn trong transaction; trả tạo phiếu trả, để trigger tính phạt và cộng tồn trong transaction. Khóa sách theo thứ tự khóa ghép; số lượng 0/âm/số lẻ và sách lặp trong cùng phiếu bị từ chối. Chuyển trạng thái lặp trả HTTP 400; sách không tồn tại trả 404.
- `backend/controllers/reportController.js`, `backend/routes/reportRoutes.js`, `backend/server.js`: thêm admin API `GET /api/thong-ke/tong-quan` với `{ sachMuonThang, docGiaMuonNam, phieuChuaTra }`, và `GET /api/thong-ke/phieu-chua-tra` với phiếu cùng `chiTiet` mang đầy đủ khóa ghép. Endpoint cũ `/api/reports/statistics` và `/api/reports/unreturned-loans` vẫn được giữ.
- Trạng thái lưu và trả qua API vẫn là `Đang mượn`; “Đã duyệt” trong một số tài liệu cũ là cách gọi nghiệp vụ, không phải giá trị enum.

### Bằng chứng kiểm tra ngày 2026-10-13

- Đã xác nhận kết nối cấu hình local trỏ đúng database `library_db`, drop và tạo lại đúng database này, rồi chạy thành công toàn bộ migrations từ database trống, bao gồm migration tồn kho mới. Không xóa volume hay database khác.
- MySQL integration: `database-features.integration.test.js` qua trên database sạch; xác nhận hai trigger tồn kho đã mất, function/phạt/procedure vẫn chạy, và insert chi tiết/phiếu trả trực tiếp không tự đổi tồn.
- MySQL integration `borrow-flow.integration.test.js` qua: tồn `2 → 2 → 1 → 2` qua gửi/duyệt/trả; trả lặp trả 400 và giữ tồn; từ chối không đổi tồn; hai yêu cầu đồng thời cho một bản sách chỉ có một yêu cầu được duyệt, tồn không âm; thống kê thật trả đúng và endpoint danh sách trả đủ khóa.
- Gọi controller thống kê qua Sequelize trên MySQL thật khi không có dữ liệu trả `{ sachMuonThang: 0, docGiaMuonNam: 0, phieuChuaTra: 0}` và `[]`; dạng kết quả `CALL` đã được kiểm chứng.
- Unit tests mới cho migration, transaction borrow flow, payload/thống kê và 401/403 đều qua. `npm run build` frontend qua.
- `npm test` còn lỗi đúng một file test nền `backend/test/api-identities.test.js`: test đầu tiên kỳ vọng CRUD sách có `where: key` (dòng 12), thuộc phần quản trị sách của D và đã lỗi trước khi sửa phần A. Lần chạy cuối có 8/9 file test qua; kiểm thử MySQL là opt-in và đã chạy riêng.
- `git diff --check` qua ở lần kiểm tra cuối. README có thay đổi staged độc lập xuất hiện trong lúc làm việc; tôi không sửa, stage, unstage hay commit file này. Nội dung staged vẫn còn mô tả trigger trừ/cộng tồn, cần chủ sở hữu README đối chiếu với thay đổi A trước khi phát hành. Giữ nguyên các thay đổi chưa theo dõi sẵn có trong `backend/test/`, `docs/`, `combined.log`, `error.log`; không commit.

### Bàn giao tiếp

- A đã công bố hợp đồng API trong `Cores/next_step_guide.md`. B tích hợp dashboard bằng hai endpoint, bỏ fixture và giữ trạng thái loading/error/empty. C kiểm tra copy trạng thái giỏ mượn nói rõ yêu cầu `Chờ duyệt` chưa làm đổi tồn. Không cần đổi schema hay frontend trong phần việc A.
- Database `library_db` hiện là schema sạch đã migrate; test lifecycle đã xóa các fixture đã tạo. Chưa chạy `seed-admin` hay nạp dữ liệu demo.

---

## Cập nhật 2026-10-19 — Giai đoạn 3: Hoàn thiện Trải nghiệm Độc giả, Độ tin cậy & Accessibility (Thành viên C)

**Phạm vi:** Frontend khu vực Độc giả (`frontend/src/views/ReaderDashboard.vue`, `frontend/src/components/reader/*`, `frontend/src/store/modules/borrow.js`, `frontend/src/store/modules/book.js`). Giữ nguyên API/schema của A, dashboard của B và các chức năng quản trị của D.

### 1. Công việc đã thực hiện
- **Khả năng tiếp cận (Accessibility - WCAG 2.1 AA cơ bản):**
  - **Focus visibility:** Bổ sung hiệu ứng `:focus-visible` (viền nổi bật 2px-3px, offset rõ ràng) cho toàn bộ nút bấm, ô input, dropdown select và liên kết navbar.
  - **Nhãn Form & Screen Readers:** Bổ sung `<label class="visually-hidden">`, `id`, `aria-label`, `aria-required`, `aria-invalid`, `aria-describedby` trên các thanh tìm kiếm (Sách, Tác giả, NXB, Thể loại) và biểu mẫu cập nhật thông tin cá nhân `UserProfile.vue`.
  - **Trạng thái không chỉ dựa vào màu sắc:** Trong `BorrowHistory.vue`, các trạng thái phiếu mượn được phân biệt kết hợp giữa màu sắc và icon trực quan riêng biệt:
    - *Chờ duyệt:* Icon đồng hồ cát `fa-clock` (vàng)
    - *Đang mượn:* Icon người đọc sách `fa-book-reader` (xanh dương)
    - *Chờ xác nhận trả:* Icon đồng hồ chờ `fa-hourglass-half` (cam)
    - *Đã trả:* Icon kiểm hoàn tất kép `fa-check-double` (xanh lá)
    - *Từ chối:* Icon hủy tròn `fa-times-circle` (xám)
    - *Quá hạn:* Icon cảnh báo chấm than `fa-exclamation-circle` (đỏ)
  - **Modal Dialog & Menubar:** Khai báo đầy đủ `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `role="menubar"`, `role="menuitem"`, `aria-current="page"`, `aria-expanded` trên Drawer giỏ mượn, Modal chi tiết sách, và thanh điều hướng chính.
- **Trải nghiệm màn hình hẹp (Mobile Responsiveness):**
  - **BookList Drawer & Modal:** Side drawer giỏ mượn và modal chi tiết sách co giãn linh hoạt, trên màn hình di động (<640px) chiếm trọn chiều rộng với nút đóng nổi bật, thao tác chạm mượt mà.
  - **Bảng dữ liệu:** Thêm container `.table-scroll-hint` và vùng cuộn ngang có gợi ý trực quan cho bảng phiếu mượn/trả trong `BorrowHistory.vue` và bảng sách tác giả/NXB.
  - **Card Grid & Quick Actions:** Chuyển đổi lưới sách, tác giả, NXB sang dạng 1-cột tự động co giãn (`auto-fill`) tối ưu trên mobile.
  - **User Summary Mobile:** Hiển thị thẻ người dùng (avatar + tên + vai trò) ngay trong menu dropdown di động.
- **Độ tin cậy & Xử lý lỗi (Reliability & Error Handling):**
  - **Nút "Thử lại" (Retry action):** Tích hợp nút Thử lại vào banner lỗi `role="alert"` của `BookList.vue`, `BorrowHistory.vue`, `HomePage.vue`, `AuthorList.vue`, `PublisherList.vue`, `CategoryList.vue`, `UserProfile.vue`.
  - **Ràng buộc giới hạn mượn 5 quyển (5-book quota):** `BookList.vue` tự động tính tổng số bản sách đang mượn/chờ duyệt từ lịch sử mượn (`outstandingCopies`) và giới hạn số sách trong giỏ (`remainingBorrowLimit`). Nếu vượt quá 5 quyển, giao diện hiển thị cảnh báo vàng rõ ràng và vô hiệu hóa nút gửi yêu cầu mượn, ngăn chặn lỗi 400/409 từ server.
  - **Phòng vệ lỗi crash dữ liệu (Defensive coding):** Chuẩn hóa an toàn `(request.ChiTietPhieuMuons || [])` trong `borrow.js` và `(Array.isArray(response.data) ? ...)` trong `book.js`.
  - **Sửa khóa định danh bảng sách:** Thay thế triệt để các mã `book._id` còn sót lại từ MongoDB sang khóa chính phức hợp MySQL `${book.maSach}:${book.maTacGia}:${book.maTheLoai}` trong các modal `AuthorList.vue`, `PublisherList.vue`, `CategoryList.vue`.
  - **Chuẩn hóa thương hiệu:** Cập nhật tên thư viện trong `HomePage.vue` thành "Thư viện CTU" (thay cho thông tin cá nhân cũ của source gốc) và sửa lỗi biến `loading` chưa khai báo trong `HomePage.vue`. Injected `navigateToTab` giúp chuyển tab SPA mượt mà từ các thẻ thống kê.

### 2. Danh sách file đã chỉnh sửa
| STT | Đường dẫn file | Nội dung thay đổi chính |
|---|---|---|
| 1 | `frontend/src/views/ReaderDashboard.vue` | Semantic menubar, aria attributes, user summary card trên mobile, focus-visible styling, provide `navigateToTab`. |
| 2 | `frontend/src/components/reader/BookList.vue` | Quota check 5 quyển (cart vs active loans), visually-hidden labels, dialog aria attributes, retry button, responsive drawer & grid. |
| 3 | `frontend/src/components/reader/BorrowHistory.vue` | Icon kết hợp màu cho từng trạng thái, retry button, table horizontal scroll hint, aria-label cho nút tải PDF / yêu cầu trả, tablist a11y. |
| 4 | `frontend/src/components/reader/HomePage.vue` | Cập nhật thương hiệu "Thư viện CTU", fix biến `loading`, retry button, điều hướng nhanh tab qua `navigateToTab`, thẻ thống kê có thể tương tác bàn phím. |
| 5 | `frontend/src/components/reader/AuthorList.vue` | Sửa khóa lặp hàng thành `${book.maSach}:${book.maTacGia}:${book.maTheLoai}`, dialog attributes, retry button, focus-visible. |
| 6 | `frontend/src/components/reader/PublisherList.vue` | Form search a11y label, retry button, dialog modal a11y, composite key fix, responsive CSS. |
| 7 | `frontend/src/components/reader/CategoryList.vue` | Form search a11y label, retry button, dialog modal a11y, composite key fix, responsive CSS. |
| 8 | `frontend/src/components/reader/UserProfile.vue` | WCAG form attributes (`aria-required`, `aria-invalid`, `aria-describedby`), retry button khi fetch lỗi, responsive styling. |
| 9 | `frontend/src/store/modules/borrow.js` | Safe null-check `(request.ChiTietPhieuMuons || [])` chống crash khi server trả data thiếu mảng chi tiết. |
| 10 | `frontend/src/store/modules/book.js` | Normalize response data sách và ưu tiên câu thông báo lỗi tiếng Việt thân thiện. |

### 3. Lệnh đã chạy và kết quả kiểm thử
- **Lệnh thực hiện:** `npm run build` tại thư mục `frontend`.
- **Kết quả:** **PASS (Code 0, built in 12.43s)**. Toàn bộ 142 modules Vue/JS/CSS biên dịch thành công, không có lỗi cú pháp, template hay bundle.

### 4. Bảng kiểm tra nghiệm thu (PASS/FAIL Checklist)
- [x] **[PASS] Focus Visibility:** Điều hướng bàn phím qua phím `Tab` hiển thị rõ viền nét xanh `:focus-visible` trên tất cả liên kết, nút bấm và trường nhập liệu.
- [x] **[PASS] Form Labels & Screen Readers:** Các ô tìm kiếm và form có nhãn tường minh hoặc `.visually-hidden`, hỗ trợ công nghệ trợ năng đọc tên trường.
- [x] **[PASS] Phân biệt trạng thái không chỉ bằng màu:** Bảng lịch sử mượn hiển thị rõ ràng icon biểu tượng song song với chữ và màu sắc cho 6 trạng thái (`Chờ duyệt`, `Đang mượn`, `Chờ xác nhận trả`, `Đã trả`, `Từ chối`, `Quá hạn`).
- [x] **[PASS] Dialog Accessibility:** Giỏ mượn và modal xem sách có thuộc tính `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- [x] **[PASS] Responsive Màn hình hẹp:** Drawer giỏ mượn hiển thị tối ưu trên màn hình <640px, bảng lịch sử có cuộn ngang không làm vỡ bố cục trang.
- [x] **[PASS] Nút Thử lại khi gặp sự cố:** Tất cả các màn hình danh sách và thông tin độc giả đều có nút "Thử lại" khi mạng hoặc API phản hồi lỗi.
- [x] **[PASS] Khóa giới hạn mượn 5 quyển:** Giỏ mượn tính toán trước với số sách đang mượn/chờ duyệt, ngăn chặn vượt hạn mức 5 quyển trước khi gửi lên backend.
- [x] **[PASS] Chuẩn hóa MySQL Composite Key:** Không còn tham chiếu `_id` của MongoDB trong danh sách sách theo tác giả, NXB, thể loại.
- [x] **[PASS] Build & Tương thích:** Không can thiệp API/schema của A, giữ nguyên router/guards và dashboard của B.

### 5. Rủi ro còn lại và lưu ý vận hành
- Cần đảm bảo backend server (`npm run dev` ở port 5000) và MySQL (port 3306) đang hoạt động bình thường khi demo.
- File `frontend/.env` cần có `VITE_API_IMAGE_URL=http://localhost:5000` để các bìa sách hiển thị đầy đủ ảnh upload từ backend.

### 7. Cập nhật sửa lỗi Dashboard 500 & Tràn thanh điều hướng Admin (AdminDashboard.vue)
- **Vấn đề 1: Lỗi 500 trên trang Tổng quan quản trị (`/admin`):**
  - *Nguyên nhân:*
    1. Trong MySQL, bảng `ChiTietPhieuMuon` thực tế chỉ có các cột: `maChiTietPM`, `maPhieuMuon`, `maSach`, `soLuongSachMuon`, `createdAt`, `updatedAt` (không có cột `maDocGia` vì `maDocGia` nằm ở bảng `PhieuMuon`).
    2. Trong stored procedure `sp_thong_ke_sach_muon_thang`, câu lệnh SQL cũ join `ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon AND ChiTietPhieuMuon.maDocGia = PhieuMuon.maDocGia`, dẫn đến lỗi MySQL: `Unknown column 'ChiTietPhieuMuon.maDocGia' in 'on clause'`.
    3. Trong `reportController.js`, API `getDetailedUnreturnedLoans` truy vấn `ct.maDocGia`, `ct.maTacGia`, `ct.maTheLoai` và join bằng `ct.maDocGia = pm.maDocGia`, dẫn đến lỗi `Unknown column 'ct.maDocGia' in 'field list'`.
  - *Giải pháp đã xử lý:*
    1. Đã chuẩn hóa lại `sp_thong_ke_sach_muon_thang` trong MySQL: loại bỏ điều kiện join thừa trên `maDocGia`. Đồng thời thêm cơ chế tự động đồng bộ stored procedure và fallback truy vấn SQL trực tiếp trong `backend/controllers/reportController.js`.
    2. Sửa câu lệnh SQL trong `getDetailedUnreturnedLoans`: lấy `pm.maDocGia`, `s.maTacGia`, `s.maTheLoai` thông qua bảng `PhieuMuon` và `Sach`, join `ChiTietPhieuMuon` qua `maPhieuMuon`.
    3. Cập nhật model `ChiTietPhieuMuon.js` và `borrowController.js`: loại bỏ các trường không tồn tại trong bảng để đảm bảo tính nhất quán tuyệt đối.
- **Vấn đề 2: Nút "Đăng xuất" bị tràn ra ngoài màn hình:**
  - *Nguyên nhân:* Khung navbar sử dụng thẻ Bootstrap `<div class="container">` cố định max-width (1140px/1320px). Với 7 tab quản lý cùng cụm thông tin user + link độc giả + nút đăng xuất dài với `white-space: nowrap`, tổng chiều rộng vượt quá chiều rộng của container, khiến phần tử cuối cùng ("Đăng xuất") bị đẩy tràn ra khỏi lề phải màn hình.
  - *Giải pháp đã xử lý:*
    1. Thay thế `<div class="container">` bằng `<div class="container-fluid px-3 px-xl-4">` giúp navbar tận dụng toàn bộ chiều rộng màn hình.
    2. Tinh chỉnh padding, font-size và gap của 7 tab quản trị (`padding: 6px 9px; font-size: 0.84rem;`).
    3. Thêm media query linh hoạt cho các khoảng màn hình 992px–1240px và 1241px–1400px, đảm bảo tất cả các nút luôn hiển thị trọn vẹn, không bao giờ bị cắt viền hay tràn trang.
- **Kết quả kiểm thử:**
  - Đã xác thực trực tiếp qua browser subagent: Thông báo lỗi 500 biến mất 100%, các thẻ thống kê thư viện tải mượt mà, và nút "Đăng xuất" hiển thị rõ ràng, cân đối ở góc trên bên phải.

### 8. Cập nhật sửa lỗi mất số liệu "Danh mục thư viện" khi Refresh (F5) trang quản trị
- **Vấn đề:** Khi người dùng bấm F5 (Refresh) tại trang Tổng quan quản trị (`/admin`), các thẻ trong mục "Danh mục thư viện" (Tổng số sách, Tác giả, Nhà xuất bản) bị trở về 0.
- **Nguyên nhân:**
  1. Các số liệu `totalBooks`, `totalAuthors`, `totalPublishers` được tính toán thông qua getter của Vuex store (`store.getters['book/allBooks'].length`, ...).
  2. Vuex lưu trạng thái trong RAM của trình duyệt. Khi người dùng bấm F5 tải lại trang web, Vuex bị reset hoàn toàn về mảng rỗng ban đầu `[]`.
  3. Hàm khởi tạo `loadDashboard()` của `AdminHomePage.vue` trước đó chỉ gọi API thống kê báo cáo (`dashboardReportService.getDashboardReport()`) mà không kích hoạt gọi tải danh sách Sách, Tác giả, Nhà xuất bản. Do đó, nếu người dùng chưa click chuyển qua các tab quản lý khác để trigger fetch dữ liệu, Vuex store sẽ giữ mảng rỗng, khiến 3 thẻ hiển thị số 0.
- **Giải pháp đã xử lý:**
  1. Trong `frontend/src/components/admin/AdminHomePage.vue`: Bổ sung gọi song song các action Vuex `book/fetchBooks`, `author/fetchAuthors`, `publisher/fetchPublishers` cùng lúc với `getDashboardReport()` thông qua `Promise.all` trong hàm `loadDashboard()`.
  2. Trong `frontend/src/store/modules/author.js` và `publisher.js`: Thêm kiểm tra phòng vệ `Array.isArray(data) ? data : (data?.data || [])` tại mutations `SET_AUTHORS` và `SET_PUBLISHERS` để đảm bảo state luôn là mảng chuẩn.
- **Kết quả:** Khi mở trang lần đầu hoặc khi bấm F5 refresh trang, hệ thống tự động tải ngay dữ liệu thực tế từ cơ sở dữ liệu vào Vuex; các thẻ "Tổng số sách", "Tác giả", "Nhà xuất bản" luôn giữ đúng số lượng chính xác.

### 9. Ghi chú Commit & Pull Request cho đợt cập nhật (19/10/2026)
- **Tiêu đề Commit / PR:** `fix(admin): Khắc phục lỗi 500 Dashboard, tràn nút đăng xuất navbar và mất số liệu thống kê khi F5`
- Xem chi tiết mẫu commit, nội dung PR và lệnh git tại [next_step_guide.md](file:///d:/Project/CT467/LibraryManagement/Cores/next_step_guide.md).

---

## Cập nhật 2026-10-21 — Giai đoạn 3 (Tuần 3): Chất lượng, Bảo mật và Concurrency Backend (Thành viên A - Minh)

**Phạm vi:** Backend CSDL, Migration, Authorization Middleware, Race Conditions & Transaction Locking, đồng bộ Stored Procedures/Triggers. Giữ nguyên dashboard của B, UX độc giả của C và CRUD quản trị của D.

### 1. Nội dung công việc đã hoàn thành
1. **Xác thực quyền ở endpoint nhạy cảm (Security & Authorization):**
   - Đã bảo vệ endpoint `GET /api/auth/check-reader-status/:maDocGia` bằng middleware `auth`:
     - Yêu cầu token hợp lệ (chặn truy cập ẩn danh với HTTP 401).
     - Phân quyền theo vai trò: Độc giả chỉ được kiểm tra trạng thái mượn của chính mình (đối chiếu `req.user.maDocGia === maDocGia`). Mọi nỗ lực thăm dò mã độc giả khác bị từ chối với HTTP 403 Forbidden.
     - Nhân viên / Admin (`staff`) được phép tra cứu trạng thái mượn của bất kỳ độc giả nào để phục vụ công tác quản trị.
   - Xác nhận tất cả route thống kê `/api/thong-ke/*` và `/api/reports/*` được bảo vệ nghiêm ngặt bằng `auth` và `adminAuth`.

2. **Chặn triệt để Race Condition tồn kho bằng Transaction & Lock (ACID Concurrency):**
   - Khóa dòng bi-level: Duyệt mượn (`updateBorrowRequest`) sử dụng `lock: transaction.LOCK.UPDATE` cho bản ghi `DocGia`, `PhieuMuon` và toàn bộ các dòng `Sach` theo thứ tự khóa ghép tăng dần (`maSach ASC, maTacGia ASC, maTheLoai ASC`) nhằm triệt tiêu hoàn toàn nguy cơ Deadlock.
   - Concurrency Stock Check: Khi hai phiên quản trị cùng duyệt hai phiếu mượn cạnh tranh bản sách cuối cùng (`soLuongHienCo = 1`), giao dịch thứ nhất thành công và trừ tồn về 0; giao dịch thứ hai đọc trạng thái tồn mới nhất dưới khóa UPDATE, phát hiện không đủ số lượng, ném lỗi HTTP 400 rõ ràng và rollback sạch sẽ, số tồn không bao giờ bị âm.
   - Concurrency Reader Quota Check: Chặn độc giả gửi đồng thời nhiều yêu cầu mượn để vượt quá hạn mức 5 cuốn bằng cơ chế khóa độc giả trong transaction trước khi tính tổng số bản đang mượn/chờ duyệt.
   - Xác nhận trả sách: Bắt buộc phiếu mượn phải có yêu cầu trả từ độc giả (`yeuCauTraAt`), khóa bản ghi chi tiết và sách, tăng tồn kho và tạo phiếu trả trong cùng transaction (kích hoạt trigger phạt). Ngăn chặn hoàn toàn việc xác nhận trả lặp lại (HTTP 400).

3. **Khắc phục lỗi lệch Schema Models & Khôi phục Composite Keys:**
   - Khắc phục sự cố từ PR trước (loại bỏ nhầm các trường khóa ngoại ghép trên `ChiTietPhieuMuon` và `PhieuTra` trong Sequelize model khiến `ChiTietPhieuMuon.create` bị MySQL từ chối vì `Field 'maDocGia' doesn't have a default value`).
   - Khôi phục đầy đủ các trường khóa ngoại ghép trên:
     - `ChiTietPhieuMuon`: `maDocGia`, `maTacGia`, `maTheLoai`.
     - `PhieuTra`: `maPhieuMuon`, `maSach`.
     - `compositeRelations.js`: Khôi phục vị từ `loanDetailWhere`, `bookDetailWhere`, `detailReturnWhere`.
     - `borrowController.js`: Điền đầy đủ bộ khóa ngoại ghép khi tạo chi tiết phiếu mượn và phiếu trả.
   - Thêm kiểm tra phòng vệ: `createBorrowRequest` kiểm tra tồn tại của sách trong CSDL trước khi tạo chi tiết, trả về HTTP 404 nếu mã sách không tồn tại.

4. **Chuẩn hóa CSDL bằng Migration mới (No DDL at runtime):**
   - Tạo migration chính quy `backend/migrations/20261021120000-align-routines-and-triggers.js`:
     - Cập nhật Stored Procedure `sp_thong_ke_sach_muon_thang`: Loại bỏ điều kiện join sai trên `maDocGia`, gom nhóm số lượng sách mượn trong tháng theo chuẩn.
     - Cập nhật Trigger `trg_tinh_tien_phat`: Tính tiền phạt tự động dựa trên ngày trả thực tế và ngày trả dự kiến với join chính xác trên `maChiTietPM`.
     - Cập nhật Stored Procedure `sp_thong_ke_doc_gia_muon_sach_nam`: Sử dụng `COUNT(DISTINCT maDocGia)` trong năm hiện tại theo đúng `Tieuchiduan.md`.
     - Cập nhật Stored Procedure `sp_danh_sach_phieu_muon_chua_tra`: Lọc chính xác phiếu có trạng thái `'Đang mượn'`.
   - Gỡ bỏ hoàn toàn hàm tự chạy DDL `ensureDatabaseObjects()` trong `reportController.js`, tuân thủ nguyên tắc quản lý schema độc quyền qua Sequelize Migration.
   - Bảo vệ kết nối trong `models/index.js`: Chỉ gọi `sequelize.authenticate()` ngoài môi trường test (`process.env.NODE_ENV !== 'test'`).

### 2. Danh sách file đã chỉnh sửa
| STT | Đường dẫn file | Thay đổi chính |
|---|---|---|
| 1 | `backend/routes/authRoutes.js` | Thêm middleware `auth` cho route `GET /check-reader-status/:maDocGia`. |
| 2 | `backend/controllers/authController.js` | Kiểm tra quyền sở hữu độc giả (độc giả chỉ xem chính mình, staff được xem tất cả), trả 403 nếu vi phạm. |
| 3 | `backend/controllers/borrowController.js` | Khóa sách theo thứ tự khóa ghép, kiểm tra tồn tại sách trước khi mượn, điền đủ khóa ghép `ChiTietPhieuMuon` và `PhieuTra`, bảo vệ transaction duyệt/trả. |
| 4 | `backend/controllers/reportController.js` | Gỡ bỏ `ensureDatabaseObjects()`, chuyển hoàn toàn quản lý routine sang migration. |
| 5 | `backend/models/ChiTietPhieuMuon.js` | Khôi phục thuộc tính `maDocGia`, `maTacGia`, `maTheLoai` khớp với schema MySQL. |
| 6 | `backend/models/PhieuTra.js` | Khôi phục thuộc tính `maPhieuMuon`, `maSach` khớp với schema MySQL. |
| 7 | `backend/models/compositeRelations.js` | Khôi phục đầy đủ khóa ngoại ghép cho `loanDetailWhere`, `bookDetailWhere`, `detailReturnWhere`. |
| 8 | `backend/models/index.js` | Bọc `sequelize.authenticate()` trong điều kiện `NODE_ENV !== 'test'`. |
| 9 | `backend/migrations/20261021120000-align-routines-and-triggers.js` | Migration mới chuẩn hóa các Stored Procedures và Trigger tính phạt. |
| 10 | `backend/test/week3-concurrency-and-auth.test.js` | Bộ kiểm thử Tuần 3 kiểm chứng concurrency/race condition, quota limit và phân quyền 401/403. |
| 11 | `backend/test/borrow-flow.test.js` | Cập nhật mocks cho quota query, userType và trạng thái `yeuCauTraAt`. |
| 12 | `backend/test/borrow-flow.integration.test.js` | Bổ sung luồng `requestBorrowReturn` và `userType` trong integration test trên MySQL thật. |

### 3. Kết quả kiểm thử (Verification Evidence)
1. **Kiểm thử đơn vị Backend (Unit Tests):**
   - Chạy 28 ca kiểm thử trên `borrowRules`, `borrow-flow`, `statistics-api`, `core-schema`, `approval-stock-migration`, `week3-concurrency-and-auth`.
   - Kết quả: **PASS 28/28 tests (100%)** trong 780ms.
2. **Kiểm thử tích hợp MySQL thật (MySQL Integration Tests):**
   - `MIGRATION_TEST_DB_URL=... node --test test/database-features.integration.test.js`: **PASS 1/1**.
   - `MIGRATION_TEST_DB_URL=... node --test test/borrow-flow.integration.test.js`: **PASS 1/1** (chu kỳ mượn/duyệt/trả/trả lặp, concurrency 2 approvals cạnh tranh 1 sách: 1 đạt [200], 1 từ chối [400], tồn không âm).
3. **Frontend Production Build:**
   - `npm run build` tại `frontend`: **PASS (built in 4.04s, 142 modules transformed, 0 errors)**.
4. **Kiểm tra chuẩn định dạng Git:**
   - `git diff --check`: **PASS (0 whitespace errors)**.

### 4. Đánh giá trạng thái
- **Người A (Minh):** Đã hoàn thành toàn bộ mục tiêu Tuần 3 (CSDL, Migration, Transaction Concurrency, Phân quyền Bảo mật Endpoint nhạy cảm, Test Suite).

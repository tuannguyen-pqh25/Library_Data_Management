# OUTLINE CHI TIẾT PHÂN CÔNG NHIỆM VỤ NHÓM

---

## I. Thành viên A (Minh) — Phụ trách CSDL & Cơ chế Giao dịch (Transaction Core)
> **Vai trò:** Vị trí "xương sống" về mặt kỹ thuật quản trị CSDL, phụ trách giải trình các câu hỏi lý thuyết sâu của cô Yến.

### 1. Nội dung viết Báo cáo (Word)
* **Chương 2 (Thiết kế CSDL):**
  * Lược đồ quan hệ ERD.
  * Mô tả chi tiết 7 bảng dữ liệu.
  * Phân tích lý do sử dụng khóa chính phức hợp (Composite Key).
  * Quy trình quản lý schema qua 17 Migrations.
* **Chương 3 (Các đối tượng CSDL nâng cao):**
  * Viết chi tiết mã SQL và giải thuật cho Function kiểm tra tồn kho.
  * Viết chi tiết mã SQL và giải thuật cho Trigger tính phạt trễ hạn.
  * Viết chi tiết mã SQL và giải thuật cho 3 Stored Procedures thống kê.
* **Chương 4 (Quản lý Giao dịch & Điều khiển cạnh tranh):**
  * Phân tích luồng Transaction duyệt mượn/trả.
  * Cơ chế khóa dòng (`SELECT ... FOR UPDATE`).
  * Phân tích cách phòng ngừa Race Condition.
  * Ngăn ngừa Deadlock bằng Lock Ordering (`maSach ASC`).

### 2. Nội dung làm Slide
* Slide Mô hình CSDL (ERD, 7 bảng).
* Slide Cài đặt Function, Trigger, Stored Procedure.
* Slide Kỹ thuật ACID Transaction & Khóa cạnh tranh (kèm sơ đồ luồng 2 transactions cạnh tranh 1 cuốn sách).

### 3. Nhiệm vụ Thuyết trình & Demo
* **Thuyết trình:** Phần CSDL, Stored Routines và cơ chế Transaction Locking.
* **Demo trực tiếp file SQL (`demo_tuan4_nguoi_a.sql`):**
  * Chạy Function kiểm tra tồn kho.
  * Chạy Trigger tính phạt.
  * Chạy các Stored Procedures.
  * Giải thích cơ chế khóa `FOR UPDATE`.

### 4. Trọng tâm Vấn đáp cần chuẩn bị
* Tại sao bỏ trigger tăng/giảm tồn kho tự động để chuyển sang Transaction ở backend?
* Cơ chế `SELECT ... FOR UPDATE` chặn Race Condition như thế nào?
* Làm sao để hệ thống không bị Deadlock khi 1 phiếu mượn nhiều cuốn sách cùng lúc?
* Tại sao Stored Procedure đếm độc giả trong năm phải dùng `COUNT(DISTINCT maDocGia)`? *(Tham khảo trọn bộ 10 câu trả lời mẫu tại `docs/kich_ban_demo_va_van_dap_nguoi_a.md`)*.

---

## II. Thành viên B (Thắng) — Phụ trách Dashboard Thống kê & Phân tích Dữ liệu
> **Vai trò:** Vị trí thể hiện tính trực quan của dữ liệu và ứng dụng của các Stored Procedure vào thực tế.

### 1. Nội dung viết Báo cáo (Word)
* **Mục Báo cáo & Thống kê Quản trị:**
  * Mô tả kiến trúc tích hợp giữa Frontend Dashboard (`AdminHomePage.vue`) và 2 API báo cáo (`/api/thong-ke/tong-quan`, `/api/thong-ke/phieu-chua-tra`).
* **Giải pháp xử lý bất đồng bộ & Tính toàn vẹn UI:**
  * Giải thích kỹ thuật gọi song song `Promise.all` với Vuex store để khắc phục lỗi mất số liệu thống kê danh mục khi người dùng F5 (Refresh).
* **Theo dõi phiếu quá hạn:**
  * Phân tích luồng theo dõi các phiếu mượn trễ hạn và các bộ lọc phiếu quá hạn trên giao diện.

### 2. Nội dung làm Slide
* Slide Kiến trúc Dashboard & Mô hình luồng dữ liệu từ Stored Procedure lên Dashboard UI.
* Slide 3 chỉ số KPI bắt buộc và bảng theo dõi phiếu mượn quá hạn.
* Slide Giải pháp kỹ thuật xử lý F5 giữ dữ liệu (Vuex parallel state management).

### 3. Nhiệm vụ Thuyết trình & Demo
* Trình bày giao diện Dashboard Admin trên web browser.
* Demo hiển thị 3 chỉ số KPI (khớp với kết quả Stored Procedure của A).
* Demo bảng danh sách phiếu mượn chưa trả, bộ lọc phiếu quá hạn, badge số ngày trễ.
* Thao tác F5 trực tiếp để chứng minh số liệu không bị reset về 0.

### 4. Trọng tâm Vấn đáp cần chuẩn bị
* Dữ liệu hiển thị trên Dashboard được lấy trực tiếp từ bảng hay qua Stored Procedure? Tại sao dùng Stored Procedure lại tối ưu hơn trong thống kê?
* Khi số lượng phiếu mượn lên tới hàng trăm nghìn bản ghi, bảng theo dõi phiếu chưa trả nên được tối ưu truy vấn như thế nào?

---

## III. Thành viên C (Tuấn) — Phụ trách Nghiệp vụ Mượn/Trả, Catalogue & Trải nghiệm Độc giả
> **Vai trò:** Vị trí làm nổi bật nghiệp vụ cốt lõi từ góc nhìn người dùng cuối (Độc giả), đảm bảo tính toàn vẹn dữ liệu từ client.

### 1. Nội dung viết Báo cáo (Word)
* **Chương Phân tích Chức năng Phía Độc giả:**
  * Đặc tả chi tiết catalogue sách (bộ lọc đa tiêu chí theo Tác giả, Thể loại, NXB, phân trang 10 cuốn/trang, sắp xếp).
* **Nghiệp vụ Giỏ mượn & Ràng buộc toàn vẹn:**
  * Cơ chế lưu trữ giỏ mượn qua `localStorage`.
  * Ràng buộc hạn mức mượn tối đa 5 quyển (`outstandingCopies + cart <= 5`).
  * Kiểm tra tồn kho tại client trước khi gửi yêu cầu.
* **Quản lý Vòng đời Phiếu mượn:**
  * Trực quan hóa 6 trạng thái phiếu mượn (Chờ duyệt, Đang mượn, Chờ xác nhận trả, Đã trả, Từ chối, Quá hạn) bằng bộ biểu tượng (icon) và màu sắc.
  * Quy trình kích hoạt cờ `yeuCauTraAt`.
* **Chuẩn tiếp cận Web (Accessibility):**
  * Áp dụng WCAG 2.1 AA cơ bản (`focus-visible` cho bàn phím, nhãn ARIA, nút "Thử lại" khi lỗi mạng).

### 2. Nội dung làm Slide
* Slide Luồng nghiệp vụ của Độc giả (Đăng ký → Xem sách → Thêm giỏ → Gửi yêu cầu → Yêu cầu trả).
* Slide Các ràng buộc nghiệp vụ ở Client (Quota 5 cuốn, kiểm tra tồn kho, chống gửi trùng).
* Slide Thiết kế UI/UX & Chuẩn tiếp cận (Accessibility WCAG).

### 3. Nhiệm vụ Thuyết trình & Demo
* **Đóng vai Độc giả thao tác trên website:**
  * Tìm kiếm sách, lọc theo Thể loại / Tác giả / NXB.
  * Thêm sách vào giỏ (chứng minh nút đổi thành "Đã thêm" chống trùng, kiểm tra hạn mức 5 cuốn).
  * Gửi yêu cầu mượn → Trạng thái chuyển thành "Chờ duyệt" (chứng minh tồn kho chưa bị trừ).
  * Vào lịch sử mượn, bấm "Yêu cầu trả sách" và xuất file phiếu mượn/trả.

### 4. Trọng tâm Vấn đáp cần chuẩn bị
* Tại sao khi độc giả gửi yêu cầu mượn thì hệ thống chưa trừ số lượng sách hiện có ngay?
* Hệ thống làm thế nào để ngăn chặn một độc giả mở 2 tab trình duyệt cùng mượn để vượt quá quota 5 cuốn sách? (Client check + Backend Lock bản ghi DocGia).
* Các trạng thái phiếu mượn được đồng bộ với Enum trong CSDL như thế nào?

---

## IV. Thành viên D (Vũ) — Phụ trách Quản trị Dữ liệu (Admin CRUD), Ràng buộc Khóa ngoại, Kiểm thử & Đóng gói
> **Vai trò:** Vị trí trưởng nhóm/điều phối: Đảm bảo tính toàn vẹn tham chiếu, chuẩn bị dữ liệu demo, kiểm thử hệ thống và biên tập tài liệu tổng thể.

### 1. Nội dung viết Báo cáo (Word)
* **Chương 1 (Tổng quan & Giới thiệu Đề tài):**
  * Mục tiêu đề tài, công nghệ sử dụng, cấu trúc tổng thể hệ thống theo kiến trúc 3 lớp.
* **Chương Quản trị Dữ liệu Danh mục (Admin CRUD):**
  * Đặc tả các chức năng CRUD (Sách, Tác giả, Thể loại, NXB, Độc giả).
  * Phân tích giải thuật kiểm tra ràng buộc khóa ngoại trước khi xóa (bảo toàn lịch sử mượn trả, ngăn chặn mồ côi khóa ngoại).
* **Tối ưu hóa Cập nhật Dữ liệu:**
  * Kỹ thuật cập nhật một phần dữ liệu sách qua `PATCH` thay vì `PUT`.
* **Chương Kiểm thử & Đóng gói:**
  * Tổng hợp các ca kiểm thử tự động (Unit & Integration tests đạt 49/49 PASS, Frontend build PASS).
  * Hướng dẫn cài đặt và vận hành hệ thống từ database sạch.
* **Tổng hợp & Định dạng Báo cáo:**
  * Ghép nối các chương từ A, B, C; chuẩn hóa mục lục, bảng biểu, hình ảnh và format chung.

### 2. Nội dung làm Slide & Điều phối chung
* Thiết kế master slide (template chung đồng bộ màu sắc, typography).
* Slide Mở đầu (Giới thiệu nhóm, đề tài, công nghệ).
* Slide Quản trị Dữ liệu & Ràng buộc Khóa ngoại (Bảo toàn tính toàn vẹn khi xóa).
* Slide Tổng kết kết quả kiểm thử (49/49 tests pass) & Hướng phát triển.

### 3. Nhiệm vụ Thuyết trình & Demo
* **Mở đầu:** Giới thiệu thành viên, mục tiêu đề tài và cấu trúc bài báo cáo.
* **Demo khu vực Quản trị Admin:**
  * Thêm/sửa sách (demo `PATCH` chỉ đổi giá hoặc số lượng).
  * Thử xóa một cuốn sách đang có trong phiếu mượn → Chứng minh hệ thống bắt lỗi ràng buộc khóa ngoại và trả về thông báo `409 Conflict` thân thiện.
  * Duyệt phiếu mượn của bạn C vừa gửi (phối hợp với A để chỉ ra tồn kho bị trừ trong transaction).
* **Kết luận:** Tổng kết buổi bảo vệ.

### 4. Trọng tâm Vấn đáp cần chuẩn bị
* Khi xóa một Tác giả hoặc Sách đã có dữ liệu mượn trả trong quá khứ, hệ thống xử lý thế nào để không làm vi phạm tính toàn vẹn tham chiếu (Referential Integrity)?
* Tại sao trong dự án lại tách biệt giữa `PUT` (thay thế toàn bộ) và `PATCH` (cập nhật một phần)?
* Cần thực hiện các bước cấu hình gì trên MySQL để các Function và Trigger có thể hoạt động trơn tru (`log_bin_trust_function_creators`)?
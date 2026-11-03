# Chiến lược hoàn thiện đồ án trong 4 tuần

## Mục tiêu và nguyên tắc

Mục tiêu là đưa hệ thống quản lý thư viện về trạng thái đúng nghiệp vụ, trình bày được các yêu cầu CSDL trong `Tieuchiduan.md`, rồi bổ sung một số tính năng có giá trị nhưng vừa sức trong bốn tuần. Không phát triển thêm chức năng trên luồng mượn/trả trước khi đã sửa tính nhất quán tồn kho.

### Định hướng tùy biến mã nguồn có sẵn (bổ sung 2026-09-30)

Dự án này do bạn của người dùng xây dựng trước. Công việc hiện tại là kế thừa, sửa và tùy biến cho đồ án; chỉ thay cấu trúc khi có lý do rõ ràng. Các mốc “tuần/ngày” bên dưới là kế hoạch tham khảo, **không phải bằng chứng đã hoàn thành**; đối chiếu `checkpoint.md` và mã nguồn trước khi chọn việc.

Giao diện hiện tại cần cải thiện đáng kể. Thực hiện theo từng màn hình: kiểm tra bản chạy và chụp hiện trạng; chốt hướng thiết kế đủ cụ thể (tên thư viện/nội dung, màu, typography, bố cục); xây bộ quy tắc UI dùng chung; chỉnh trang khách/đăng nhập, khu độc giả, khu quản trị; kiểm tra desktop/mobile, trạng thái dữ liệu, bàn phím và độ tương phản. Tận dụng Vue/Bootstrap đang có và giữ nguyên hợp đồng API, phân quyền, hành vi mượn/trả khi chỉ sửa UI. Không giữ tên, thông tin liên hệ hoặc dấu vết của chủ source cũ trong bản hoàn thiện nếu người dùng không chọn dùng.

Việc cải thiện phần nhìn có thể tiến hành độc lập với sửa logic tồn kho ở các file frontend phù hợp; **không mở rộng nghiệp vụ mượn/trả** cho đến khi lỗi dữ liệu lõi được xử lý và kiểm chứng. Chỉ nhận thêm tính năng có liên quan trực tiếp đến tiêu chí môn học hoặc trải nghiệm demo sau khi các luồng chính ổn định.

Nguyên tắc phối hợp:

- Mỗi thành viên sở hữu một nhóm route, component và migration riêng; không sửa trực tiếp phần của người khác.
- Mọi thay đổi cấu trúc CSDL là migration mới; không sửa migration đã chạy và không dùng `sequelize.sync({ alter: true })` ở môi trường nộp bài.
- Pull request phải có ca kiểm thử tối thiểu cho chức năng thay đổi và dữ liệu mẫu để demo.
- Trạng thái lưu trong enum hiện hành: `Chờ duyệt`, `Đang mượn`, `Đã trả`, `Từ chối`. Trong tài liệu kế hoạch, `Đã duyệt` nghĩa là phiếu đã được duyệt và tương ứng với `Đang mượn`; code, DB và API tiếp tục dùng `Đang mượn`.

## Các việc bắt buộc trước khi bổ sung (Trạng thái: ĐÃ HOÀN THÀNH 100% — Nghiệm thu 26/10/2026)

1. **[ĐÃ HOÀN THÀNH]** Luồng tồn kho được giao cho transaction ở backend khi chuyển `Chờ duyệt → Đang mượn` và `Đang mượn → Đã trả`; migration mới gỡ trigger tăng/giảm tồn. Xác nhận trạng thái triển khai và MySQL runtime trong `checkpoint.md` đã nghiệm thu.
2. **[ĐÃ HOÀN THÀNH]** Đã áp dụng state machine: `Chờ duyệt → Đang mượn | Từ chối`; `Đang mượn → Đã trả`. Trạng thái lặp và chuyển thẳng sang đã trả bị từ chối.
3. **[ĐÃ HOÀN THÀNH]** Procedure “phiếu mượn chưa trả” lọc `Đang mượn`, đúng với enum hiện tại; đã kiểm tra bằng MySQL integration PASS.
4. **[ĐÃ HOÀN THÀNH]** Procedure năm dùng `COUNT(DISTINCT maDocGia)` theo năm mượn và loại phiếu chờ/từ chối; đã kiểm tra bằng MySQL integration PASS.
5. **[ĐÃ HOÀN THÀNH]** Hai API admin `/api/thong-ke/tong-quan` và `/api/thong-ke/phieu-chua-tra` đã được triển khai. B đã tích hợp dashboard với API thật, có cơ chế nạp song song tránh reset số liệu khi F5.

## Phân công độc lập

| Thành viên | Sở hữu chính | Không chạm vào |
|---|---|---|
| A | CSDL, migration, transaction mượn/trả, API `/api/thong-ke` | Giao diện dashboard và catalogue | (Minh)
| B | Dashboard quản trị, biểu đồ/bộ lọc, hiển thị số liệu từ API | Controller/migration mượn-trả |(Thắng)
| C | Trải nghiệm độc giả: tìm kiếm/lọc/phân trang, yêu cầu mượn và lịch sử | Dashboard quản trị, schema lõi |(Tuấn)
| D | Quản trị dữ liệu (sách/tác giả/thể loại/NXB/độc giả), import/export CSV và kiểm thử/tài liệu | Luồng transaction mượn/trả của A |(Vũ)

Giao kèo API: A công bố trước tuần 2 payload cho `GET /api/thong-ke/tong-quan` và `GET /api/thong-ke/phieu-chua-tra`; B chỉ dùng các endpoint này. D đặt endpoint import/export dưới `/api/sach`, không sửa endpoint của A. C chỉ gọi các endpoint mượn đã có/được A công bố.

## Kế hoạch theo tuần

### Tuần 1 — ổn định lõi và chốt hợp đồng

- **A:** migration hiệu chỉnh procedure/function/trigger; transaction và state machine mượn–trả; API thống kê; kiểm thử tồn kho với duyệt, từ chối, trả và gọi lặp.
- **B:** wireframe dashboard, module gọi API thống kê, layout biểu đồ và trạng thái tải/lỗi; dùng fixture tạm thời cho đến khi A bàn giao endpoint.
- **C:** đặc tả UX catalogue, lọc theo tên/tác giả/NXB/thể loại và phân trang ở frontend; kiểm tra validation giỏ mượn (trùng sách, số lượng dương).
- **D:** rà soát CRUD quản trị, viết checklist smoke test và mẫu CSV sách; chuẩn hóa README chạy dự án/migration/dữ liệu demo.
- **Mốc chung:** chốt enum trạng thái, hợp đồng API và dữ liệu seed trước cuối tuần.

### Tuần 2 — hoàn thành các mô-đun độc lập

- **A:** hoàn tất endpoint thống kê và danh sách phiếu chưa trả; thêm phân trang/lọc server-side cho danh sách phiếu mượn nếu cần; review migration của cả nhóm.
- **B:** hoàn thiện dashboard: ba chỉ số bắt buộc, biểu đồ mượn theo tháng, bảng phiếu chưa trả có lọc quá hạn; tích hợp API thật.
- **C:** hoàn thiện catalogue: lọc đa tiêu chí, sắp xếp, phân trang; lịch sử mượn hiển thị hạn trả/trễ hạn và tải phiếu PDF.
- **D:** import CSV có validate từng dòng và báo cáo lỗi; export danh mục sách; sửa validation CRUD phát hiện lỗi qua smoke test.
- **Mốc chung:** demo end-to-end đăng ký → gửi yêu cầu → duyệt → trả → dashboard đổi số liệu.

### Tuần 3 — chất lượng, bảo mật và hoàn thiện demo

- **A:** chặn race condition tồn kho bằng transaction/lock; xác thực quyền ở endpoint nhạy cảm (đặc biệt endpoint kiểm tra độc giả); test procedure trên MySQL.
- **B:** responsive dashboard, empty/error states, kiểm tra tính đúng đắn giữa biểu đồ và dữ liệu API.
- **C:** accessibility cơ bản, thông báo rõ khi hết sách/yêu cầu đã xử lý, test UI luồng độc giả.
- **D:** import/export hoàn thiện, backup dữ liệu mẫu, kiểm thử CRUD và xử lý ảnh sách; cập nhật hướng dẫn vận hành.
- **Mốc chung:** chạy regression checklist; không nhận tính năng mới sau giữa tuần 3.

### Tuần 4 — đóng gói và bảo vệ đồ án (Trạng thái: HOÀN THÀNH 100% — Nghiệm thu 28/10/2026)

- **A:** Đã rà soát 17 migration từ database trống, dữ liệu demo và chuẩn hóa Function nhận 1 tham số theo Mã sách, Trigger phạt trễ, các Stored Procedure thống kê; bổ sung kịch bản demo SQL (`backend/scripts/demo_tuan4_nguoi_a.sql`) và bộ tài liệu kịch bản demo, câu hỏi vấn đáp bảo vệ đồ án (`docs/kich_ban_demo_va_van_dap_nguoi_a.md`).
- **B:** Đã chốt giao diện dashboard quản trị, biểu đồ thống kê từ API thật, xử lý F5 giữ số liệu và thanh navbar responsive.
- **C:** Đã hoàn thiện toàn diện UX độc giả: catalogue, lọc, sắp xếp, phân trang 10 cuốn, giỏ mượn lưu LocalStorage, giới hạn mượn 5 quyển, badge/icon quá hạn và kiểm tra frontend production build đạt PASS.
- **D:** Đã hoàn thiện dữ liệu demo, tài khoản admin `Admin`/`admin123`, sửa tài liệu README, chạy trọn vẹn bộ kiểm thử tự động trên MySQL thật.
- **Cả nhóm:** Đã review chéo, chuẩn hóa toàn diện theo `Tieuchiduan.md`, chuẩn bị kịch bản trình bày và vấn đáp đồ án.

## Tiêu chí nghiệm thu (Trạng thái: TẤT CẢ ĐÃ ĐẠT PASS)

- [x] **[PASS]** Từ database trống, 17/17 migration chạy thành công và tạo đủ bảng/khóa ngoại/routine.
- [x] **[PASS]** Không có ca nào làm `soLuongHienCo` âm hoặc tăng/giảm hai lần (được bảo vệ bằng Transaction ACID & Lock).
- [x] **[PASS]** Đã chứng minh bằng API/UI/SQL: function kiểm tra tồn theo mã sách, trigger tính phạt, procedure phiếu chưa trả, hai thống kê bắt buộc (tháng & DISTINCT năm).
- [x] **[PASS]** Người đọc không truy cập API quản trị; dữ liệu nhạy cảm không xuất hiện trong response đăng nhập/danh sách; độc giả chỉ xem trạng thái của chính mình.
- [x] **[PASS]** `npm run build` frontend đạt PASS (0 lỗi); kiểm tra cú pháp và test suite backend đạt 49/49 PASS; README chuẩn xác đủ để người khác cài đặt chạy lại.
- [x] **[PASS]** Các màn hình khách, độc giả, quản trị dùng cùng ngôn ngữ thiết kế, hiển thị tốt trên mọi kích thước màn hình; không còn sót thông tin nhận diện cũ của source gốc; có đầy đủ trạng thái tải/rỗng/lỗi và nút Thử lại.

# Chiến lược hoàn thiện đồ án trong 4 tuần

## Mục tiêu và nguyên tắc

Mục tiêu là đưa hệ thống quản lý thư viện về trạng thái đúng nghiệp vụ, trình bày được các yêu cầu CSDL trong `Tieuchiduan.md`, rồi bổ sung một số tính năng có giá trị nhưng vừa sức trong bốn tuần. Không phát triển thêm chức năng trên luồng mượn/trả trước khi đã sửa tính nhất quán tồn kho.

Nguyên tắc phối hợp:

- Mỗi thành viên sở hữu một nhóm route, component và migration riêng; không sửa trực tiếp phần của người khác.
- Mọi thay đổi cấu trúc CSDL là migration mới; không sửa migration đã chạy và không dùng `sequelize.sync({ alter: true })` ở môi trường nộp bài.
- Pull request phải có ca kiểm thử tối thiểu cho chức năng thay đổi và dữ liệu mẫu để demo.
- Trạng thái chuẩn dùng xuyên suốt: `Chờ duyệt`, `Đã duyệt`, `Đã trả`, `Từ chối`. Không dùng thêm biến thể như `Đang mượn` nếu chưa định nghĩa ánh xạ rõ ràng.

## Các việc bắt buộc trước khi bổ sung

1. Sửa luồng tồn kho: hiện trigger giảm tồn khi tạo `ChiTietPhieuMuon`, nhưng controller lại giảm lần nữa khi duyệt; khi trả, trigger và controller lại cùng tăng. Một yêu cầu có thể làm tồn kho sai gấp đôi. Chọn **một** nơi chịu trách nhiệm: khuyến nghị transaction ở service/controller khi chuyển `Chờ duyệt → Đã duyệt` và `Đã duyệt → Đã trả`; bỏ hai trigger tăng/giảm tồn.
2. Bảo đảm chuyển trạng thái hợp lệ, không được duyệt/trả/từ chối lặp hay chuyển thẳng từ `Chờ duyệt` sang `Đã trả`.
3. Sửa procedure “phiếu mượn chưa trả” để lọc `Đã duyệt` (hoặc trạng thái chuẩn được chốt), thay vì `Dang muon` không tồn tại trong ENUM hiện tại.
4. Sửa thống kê năm thành `COUNT(DISTINCT maDocGia)` theo năm mượn. Procedure hiện tại đếm số lượng sách và lọc trạng thái không tồn tại, nên không đáp ứng yêu cầu.
5. Bổ sung API thống kê; dashboard phải gọi API/procedure thay vì suy diễn từ danh sách đã tải. Có số liệu cho: sách mượn trong tháng, độc giả mượn trong năm và phiếu chưa trả.

## Phân công độc lập

| Thành viên | Sở hữu chính | Không chạm vào |
|---|---|---|
| A | CSDL, migration, transaction mượn/trả, API `/api/thong-ke` | Giao diện dashboard và catalogue |
| B | Dashboard quản trị, biểu đồ/bộ lọc, hiển thị số liệu từ API | Controller/migration mượn-trả |
| C | Trải nghiệm độc giả: tìm kiếm/lọc/phân trang, yêu cầu mượn và lịch sử | Dashboard quản trị, schema lõi |
| D | Quản trị dữ liệu (sách/tác giả/thể loại/NXB/độc giả), import/export CSV và kiểm thử/tài liệu | Luồng transaction mượn/trả của A |

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

### Tuần 4 — đóng gói và bảo vệ đồ án

- **A:** rà soát migration từ database trống, dữ liệu demo và truy vấn CSDL để trình bày function/trigger/procedure.
- **B:** chốt ảnh chụp dashboard, kịch bản demo thống kê.
- **C:** chốt kịch bản demo độc giả và kiểm tra frontend production build.
- **D:** tổng hợp README, ERD, tài khoản demo, test report và checklist nộp bài.
- **Cả nhóm:** chạy demo trên máy sạch, review chéo, gắn tag bản nộp và chuẩn bị kịch bản trình bày 5–7 phút.

## Tiêu chí nghiệm thu

- Từ database trống, migration chạy thành công và tạo đủ bảng/khóa ngoại/routine.
- Không có ca nào làm `soLuongHienCo` âm hoặc tăng/giảm hai lần.
- Có thể chứng minh bằng API/UI: function kiểm tra tồn, trigger tính phạt, procedure phiếu chưa trả, hai thống kê bắt buộc.
- Người đọc không truy cập API quản trị; dữ liệu nhạy cảm không xuất hiện trong response đăng nhập/danh sách.
- `npm run build` frontend và kiểm tra cú pháp backend thành công; README đủ để người khác chạy lại.

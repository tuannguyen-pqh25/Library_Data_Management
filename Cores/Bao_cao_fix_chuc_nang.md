# Báo cáo sửa chức năng xóa sách

## Phạm vi

Đã cập nhật xử lý xóa sách và cách hiển thị lỗi tương ứng. Giữ nguyên models, migrations, schema database, route và các ràng buộc khóa ngoại.

### File đã chỉnh sửa

- [`backend/controllers/bookController.js`](../backend/controllers/bookController.js): kiểm tra điều kiện và thực hiện xóa sách.
- [`frontend/src/components/admin/BookManagement.vue`](../frontend/src/components/admin/BookManagement.vue): hiển thị thông báo lỗi chi tiết từ API.
- [`frontend/src/store/modules/book.js`](../frontend/src/store/modules/book.js): sửa thông báo fallback của action xóa sách.

API đang sử dụng: `DELETE /sach/:maSach/:maTacGia/:maTheLoai`.

## Nguyên nhân ban đầu

1. Controller gọi `fn_kiem_tra_so_luong_sach` với một tham số, trong khi function hiện có yêu cầu ba tham số: `maSach`, `maTacGia`, `maTheLoai`. Đây là nguyên nhân của lỗi `expected 3, got 1`.
2. Route cung cấp các tham số `maSach`, `maTacGia`, `maTheLoai`, nhưng controller cũ đọc `req.params.id`, nên không lấy đúng khóa sách.
3. `ChiTietPhieuMuon` tham chiếu `Sach`, và `PhieuTra` tham chiếu `ChiTietPhieuMuon`. Sách đã được ghi nhận trong lịch sử mượn/trả không thể xóa an toàn nếu muốn giữ nguyên dữ liệu lịch sử.
4. Code cũ xóa ảnh trước khi xác nhận xóa bản ghi sách thành công. Nếu database từ chối xóa, file ảnh có thể bị mất dù bản ghi còn tồn tại.
5. Log database trước đây đã ghi nhận lỗi khóa ngoại thực tế khi xóa sách. Cấu hình constraint trong database đang chạy có thể khác với migration trong repository; do đó không nên dựa riêng vào migration để kết luận xóa vật lý sẽ được phép.

## Cách xử lý hiện tại

Controller thực hiện các bước:

1. Đọc và xác thực ba mã sách. Khóa không phải số nguyên dương trả `400`.
2. Mở transaction và tìm sách bằng cả ba mã. Không tìm thấy trả `404`.
3. Từ chối xóa bằng `409` nếu `soLuongHienCo > 0`.
4. Kiểm tra `ChiTietPhieuMuon` theo `maSach`. Có chi tiết mượn thì trả `409`, không xóa sách và không tác động đến phiếu mượn/trả.
5. Chỉ khi sách hết tồn và không có chi tiết mượn, mới xóa bản ghi trong transaction.
6. Chỉ sau khi xóa database thành công mới thử xóa ảnh riêng của sách. Không xóa file mặc định dùng chung.
7. Nếu database vẫn từ chối do khóa ngoại tham chiếu, rollback và trả `409`; không gỡ hoặc vô hiệu hóa khóa ngoại.

Trang quản trị hiện ưu tiên hiển thị `message` do API trả về. Vì vậy khi xóa không thành công, người dùng có thể biết nguyên nhân cụ thể, ví dụ sách còn trong kho, đã có lịch sử mượn/trả, hoặc đang bị dữ liệu tham chiếu.

## Bổ sung: cập nhật một phần thông tin sách

### Nguyên nhân

Trước đây form quản trị kiểm tra bắt buộc toàn bộ thông tin sách và gửi lại mọi trường khi cập nhật. Backend cũng yêu cầu đủ mã tác giả, nhà xuất bản và thể loại mỗi lần sửa, dù quản trị viên chỉ cần thay đổi một trường như tên sách hoặc đơn giá.

### Cách xử lý

- Thêm API `PATCH /sach/:maSach/:maTacGia/:maTheLoai` bên cạnh `PUT` hiện tại; giữ `PUT` để không làm hỏng client cũ.
- Form sửa hiển thị hướng dẫn chỉ cần thay đổi trường cần sửa. Các trường còn lại được giữ nguyên.
- Frontend so sánh dữ liệu form với bản ghi ban đầu và chỉ gửi những trường thực sự thay đổi; nếu không có thay đổi nào và không chọn ảnh mới, hiển thị thông báo thay vì gửi request rỗng.
- Backend tìm đúng sách bằng bộ khóa route, chỉ cập nhật các thuộc tính được gửi lên và giữ các thuộc tính không có trong request.
- Backend chỉ kiểm tra khóa ngoại khi một trong các trường tác giả, nhà xuất bản hoặc thể loại được gửi. Khi kiểm tra, dùng giá trị mới kết hợp với các giá trị hiện tại của sách.
- Backend xác thực giá trị được cập nhật và trả thông báo lỗi phù hợp; models và cấu trúc khóa ngoại không thay đổi.

### File bổ sung đã chỉnh sửa

- [`backend/routes/bookRoutes.js`](../backend/routes/bookRoutes.js): khai báo route `PATCH`, giữ route `PUT`.
- [`backend/controllers/bookController.js`](../backend/controllers/bookController.js): hỗ trợ cập nhật một phần, kiểm tra dữ liệu và khóa ngoại.
- [`frontend/src/store/modules/book.js`](../frontend/src/store/modules/book.js): gửi cập nhật bằng HTTP `PATCH`.
- [`frontend/src/components/admin/BookManagement.vue`](../frontend/src/components/admin/BookManagement.vue): chỉ validate và gửi những trường đã thay đổi.

### Kiểm thử cần thực hiện

- Chỉ đổi tên sách: các trường giá, số lượng, năm, nguồn gốc và khóa ngoại phải giữ nguyên.
- Chỉ đổi đơn giá hoặc số lượng: trường được sửa cập nhật, các trường khác không đổi.
- Chỉ đổi ảnh bìa: ảnh mới được cập nhật mà không gửi lại các trường còn lại.
- Gửi khóa ngoại không tồn tại hoặc giá trị số không hợp lệ: API từ chối cập nhật và giữ dữ liệu cũ.
- Gửi request rỗng: API trả lỗi hợp lệ, không ghi đè trường hiện có bằng `NULL`.

### Kết quả kiểm tra

- `node --check backend\controllers\bookController.js`: đạt.
- `npm.cmd test --prefix backend`: lệnh chạy thành công; hiện chưa có test tự động (`0 tests`).
- `npm.cmd run build --prefix frontend`: build production thành công.
- Problems không báo lỗi ở controller, route, Vue component hoặc Vuex module.
- Chưa kiểm thử tích hợp với database thực tế; cần thử các trường hợp ở checklist trên môi trường demo.

## Bổ sung: hiển thị lý do khi xóa sách thất bại

- Khi xác nhận xóa, xóa thông báo lỗi cũ trước khi gửi request.
- Nếu xóa thất bại, đóng hộp thoại xác nhận và bỏ sách đang chọn để quay lại trang quản lý sách.
- Đưa nội dung lỗi chi tiết từ API vào thông báo lỗi trên trang quản lý; không để hộp thoại che thông báo.
- Thay đổi chỉ ảnh hưởng giao diện quản trị sách, không đổi quy trình mượn/trả hoặc các phần việc A, B, C.

## Phát hiện: ô tìm kiếm quản trị sách không nhập được khoảng trắng

- Nguyên nhân: sự kiện `input` gọi `searchBooks` mỗi lần gõ; hàm `searchBooks` cắt chuỗi bằng `.trim()` rồi gán ngược vào `searchTerm.value`. Khi người dùng gõ dấu cách để phân tách từ, dấu cách cuối bị xóa ngay.
- Vị trí liên quan: `frontend/src/components/admin/BookManagement.vue`, hàm `searchBooks` và phần lọc `filteredBooks`.
- Hướng sửa: không thay đổi `searchTerm.value` trong lúc nhập; chỉ dùng `searchTerm.value.trim().toLowerCase()` trên bản sao trong `filteredBooks` để bỏ khoảng trắng thừa ở hai đầu khi so khớp. Khoảng trắng giữa các từ vẫn được giữ.
- Trạng thái: nguyên nhân và vị trí sửa đã xác định; chưa chỉnh sửa code tìm kiếm và chưa kiểm thử hành vi sau sửa.

## Sửa tìm kiếm tác giả không nhập được khoảng trắng

- Bỏ xử lý gán `.trim()` vào ô tìm kiếm khi gõ; giữ nguyên từ khóa nhập và chỉ chuẩn hóa trong bước lọc.
- Phạm vi: giao diện quản trị tác giả; không ảnh hưởng A, B, C.

## Sửa form thêm/cập nhật nhà xuất bản

- Nguyên nhân: nút gửi bị vô hiệu hóa khi còn lỗi validation; thông báo/lỗi cũ có thể khiến form không cho thử gửi lại sau khi sửa dữ liệu.
- Chỉnh sửa: nút chỉ khóa khi đang xử lý; mỗi lần gửi validate lại toàn bộ, lỗi thì giữ form và dữ liệu để người dùng sửa tiếp.
- Chuẩn hóa khoảng trắng và kiểm tra tên, địa chỉ ở frontend lẫn backend; API trả lỗi theo trường để hiển thị nguyên nhân cụ thể.
- Phạm vi: CRUD quản trị nhà xuất bản; không thay đổi models, schema hoặc các luồng A, B, C.

## Bảo vệ khi xóa nhà xuất bản có sách liên kết

- Hộp thoại xác nhận liệt kê sách đang thuộc nhà xuất bản và khóa thao tác xóa cho đến khi chuyển sách sang NXB khác.
- Backend kiểm tra trực tiếp bảng sách, trả `409` cùng danh sách sách liên quan; không dựa vào function kiểm tra cũ hoặc để xóa cascade.
- Giữ nguyên model và khóa ngoại.

## Sửa form thêm/cập nhật tác giả

- Nguyên nhân: nút gửi bị khóa theo lỗi validation cũ, dù người dùng đã sửa dữ liệu.
- Chỉnh sửa: chỉ khóa nút khi đang gửi; validate lại toàn bộ mỗi lần submit và giữ nguyên form khi dữ liệu chưa hợp lệ.
- Chuẩn hóa khoảng trắng, kiểm tra tên/số điện thoại/địa chỉ ở frontend và backend; lỗi từ API được giữ lại theo trường.
- Phạm vi: CRUD quản trị tác giả; không thay đổi models, schema hoặc chức năng của A, B, C.

## Bảo vệ khi xóa tác giả có sách liên kết

- Hộp thoại xác nhận liệt kê sách của tác giả và khóa nút xóa khi còn sách liên kết.
- Backend kiểm tra trực tiếp bảng sách, trả `409` cùng danh sách sách liên quan; không dựa vào function cũ hoặc cho phép xóa dây chuyền.
- Giữ nguyên models và khóa ngoại.

## Sửa form thêm/cập nhật thể loại

- Nút gửi chỉ khóa khi đang xử lý; mỗi lần submit kiểm tra lại dữ liệu và giữ form mở để sửa tiếp khi chưa hợp lệ.
- Chuẩn hóa tên thể loại và kiểm tra dữ liệu ở frontend/backend; lỗi API hiển thị lại trên form.
- Phạm vi CRUD quản trị thể loại; không đổi models, schema hoặc phần việc A, B, C.

## Bảo vệ khi xóa thể loại có sách liên kết

- Hộp thoại xác nhận liệt kê các sách thuộc thể loại; khóa nút xóa khi còn sách và hướng dẫn chuyển sách sang thể loại khác.
- Backend kiểm tra trực tiếp bảng sách, trả `409` cùng danh sách sách liên quan; chỉ xóa thể loại khi không còn sách tham chiếu.
- Giữ nguyên models, khóa ngoại và dữ liệu mượn/trả; phạm vi chỉ thuộc CRUD quản trị thể loại.

## Sửa giao diện chưa cập nhật sau khi thêm nhân viên

- Nguyên nhân: sau khi API thêm thành công, component gọi `proxy.$toast` nhưng `proxy` chưa được khai báo. Lỗi JavaScript xảy ra trước khi làm mới danh sách, nên nhân viên đã lưu trong database nhưng bảng không đổi.
- Chỉnh sửa: cập nhật danh sách ngay từ bản ghi API trả về sau khi thêm/sửa; dùng helper thông báo hiện có và sửa xử lý lỗi để cập nhật đúng trạng thái reactive.
- Phạm vi: CRUD quản trị nhân viên; không đổi API, models, schema hoặc phần việc A, B, C.

## Bảo vệ khi xóa độc giả đang mượn sách

- Hộp thoại xác nhận kiểm tra sách thuộc các phiếu đang mượn, liệt kê sách chưa có phiếu trả và khóa nút xóa cho đến khi độc giả trả sách.
- Backend kiểm tra lại điều kiện ngay trước khi xóa và trả `409` cùng danh sách sách còn mượn; không xóa phiếu mượn/trả.
- Nếu độc giả có lịch sử mượn, vẫn chặn xóa vật lý để bảo toàn dữ liệu và khóa ngoại. Chỉ bổ sung kiểm tra đọc cho CRUD độc giả, không thay đổi nghiệp vụ mượn/trả của A.

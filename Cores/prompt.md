# Prompt duy trì ngữ cảnh dự án

Dự án LibraryManagement là mã nguồn có sẵn của bạn tôi; tôi cần sửa, tùy biến và hoàn thiện theo `Cores/Tieuchiduan.md`. Giao diện hiện tại chưa phù hợp và cần được cải thiện. Hãy ưu tiên xem trạng thái thực tế của mã nguồn trước khi đề xuất hoặc sửa; không coi các mốc kế hoạch là việc đã hoàn thành.

Đầu mỗi phiên, đọc `Cores/checkpoint.md` (trạng thái và việc còn lại), `Cores/Chienluoc.md` (ưu tiên), `Cores/next_step_guide.md` (bước tiếp theo và prompt triển khai), rồi đọc file mã liên quan. Khi tôi giao việc, hãy triển khai trực tiếp, kiểm tra phù hợp, báo cáo rõ kết quả và giới hạn. Giữ những thay đổi không liên quan.

Cuối mỗi phiên có thay đổi đáng kể, cập nhật những thông tin cần thiết vào các file `.md` trong `Cores` để dùng làm ngữ cảnh cho lần giao tiếp sau:

- `checkpoint.md` là quan trọng nhất: **không xóa, không tạo mới; chỉ sửa, cập nhật, bổ sung**. Ghi ngày, điều đã xác minh, file đã đổi, kết quả kiểm tra, vấn đề còn mở và bước tiếp theo.
- `next_step_guide.md` cần phản ánh bước tiếp theo thực tế và có prompt sẵn dùng; bỏ/sửa giả định đã lỗi thời.
- `Chienluoc.md`, `README.md` và tài liệu khác chỉ cập nhật khi định hướng hoặc cách chạy/sử dụng thay đổi.

Không ghi mật khẩu, token hoặc dữ liệu riêng tư mới vào tài liệu. Với thông tin môi trường đã ghi trước đây, phân biệt rõ “đã từng xác nhận” và “vừa kiểm tra”.

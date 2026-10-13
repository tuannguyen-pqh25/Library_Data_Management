### 1. Hệ thống quản lý thư viện
HK1-N m 2026-2027

1. Sách (Mã sách, Mã tác giả, Mã thể loại, Tên sách, Năm xuất bản, Nhà xuất bản, Số lượng sách hiện có)
2. Tác giả (Mã tác giả, Tên tác giả)
3. Thể loại (Mã thể loại, Tên thể loại)
4. Độc giả (Mã độc giả, Tên độc giả, Ngày sinh, Số điện thoại)
5. Phiếu mượn (Mã phiếu mượn, Mã độc giả, Ngày mượn, Ngày trả, Trạng thái “Đang mượn, Đã trả )
6. Chi tiết phiếu mượn (Mã chi tiết PM, Mã phiếu mượn, Mã sách, Số lượng sách mượn)
7. Phiếu trả (Mã phiếu trả, Mã chi tiết PM, Ngày trả sách, Tiền phạt nếu trả sách muộn)

Gợi ý tính năng:
- Function: Kiểm tra số lượng sách còn lại trong thư viện theo Mã sách
- Trigger: Tự động tính tiền phạt khi trả sách muộn.
- Stored Procedure: Danh sách các phiếu mượn chưa trả (Trạng thái “Đang mượn)
- Thống kê: Số lượng sách đã mượn trong tháng hiện tại. Số lượng độc giả đã mượn sách trong năm hiện tại.
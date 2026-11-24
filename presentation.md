# KỊCH BẢN THUYẾT TRÌNH & DEMO (DÀNH CHO BẠN)

> **Luồng trình bày:** Slide chức năng User ➔ Demo thực tế (Cổng 5173 & 5174) ➔ Kết luận & Hướng phát triển ➔ Chào & Cảm ơn
> **Thời lượng:** 5 – 10 phút
> **Môi trường demo:** Cổng Độc giả `http://localhost:5173` | Cổng Quản trị `http://localhost:5174`

---

## PHẦN 1: THUYẾT TRÌNH SLIDE (CHỨC NĂNG CỦA USER)

### Ý 1: Tổng quan Chức năng Độc giả & Kiến trúc 2 Cổng mạng
* **Slide:** Slide 23 — Phân quyền & Hành trình Độc giả
* **Nội dung:** 
  > *"Dạ thưa cô, tiếp nối phần trình bày của bạn Minh, em xin phép tiếp tục chia sẻ về các chức năng của Độc giả. Để đảm bảo an toàn, hệ thống tách riêng 2 cổng mạng: Cổng dành cho Độc giả và Cổng cho Quản trị viên. Độc giả chỉ thực hiện các nghiệp vụ tra cứu và mượn/trả sách, hoàn toàn không thể thấy hay can thiệp vào trang Quản trị."*

---

### Ý 2: Catalogue Sách — Tìm kiếm & Lọc Đa Tiêu Chí
* **Slide:** Slide 24 — Catalogue: tìm, lọc, sắp xếp, phân trang
* **Nội dung:** 
  > *"Dạ thưa cô, tại Catalogue, độc giả có thể tìm sách nhanh chóng theo từ khóa với cơ chế phản hồi tức thì, lọc kết hợp theo Thể loại, Tác giả, Nhà xuất bản và phân trang linh hoạt để dễ dàng tiếp cận nguồn tài liệu."*

---

### Ý 3: Giỏ Mượn & Quota Tối Đa 5 Cuốn
* **Slide:** Slide 25 — Giỏ mượn & quota 5 quyển
* **Nội dung:** 
  > *"Dạ thưa cô, hệ thống giới hạn mỗi độc giả chỉ được mượn tối đa 5 quyển sách cùng lúc. Độc giả được chủ động chọn ngày mượn và ngày hẹn trả ngay trong giỏ sách trước khi gửi yêu cầu."*

---

### Ý 4: Vòng Đời Phiếu Mượn (6 Trạng Thái Hiển Thị)
* **Slide:** Slide 26 — Vòng đời phiếu mượn: 6 trạng thái hiển thị
* **Nội dung:** 
  > *"Dạ thưa cô, khi độc giả gửi yêu cầu, phiếu ở trạng thái 'Chờ duyệt' và kho sách CHƯA bị trừ để tránh giữ chỗ ảo. Kho chỉ trừ khi thủ thư duyệt trao sách. Vòng đời phiếu được phân định rõ ràng qua 6 tab trạng thái để người đọc tiện theo dõi."*

---

### Ý 5: Yêu Cầu Trả Sách & Xuất Chứng Từ PDF
* **Slide:** Slide 27 — Yêu cầu trả, PDF & accessibility
* **Nội dung:** 
  > *"Dạ thưa cô, khi muốn trả sách, độc giả có thể bấm 'Yêu cầu trả' trước để thủ thư chuẩn bị. Hệ thống hỗ trợ xuất file PDF phiếu mượn/trả bằng tiếng Việt có dấu chuẩn đẹp và giao diện hỗ trợ phím bấm theo chuẩn tiếp cận WCAG."*

---

## PHẦN 2: DEMO THỰC TẾ HỆ THỐNG

### Ý 6: Demo Phía Độc Giả (Cổng 5173)
* **Giao diện:** Trình duyệt Cổng Độc giả `http://localhost:5173`
* **Thao tác:**
  1. Vào Danh mục sách: Gõ tìm kiếm `"công nghệ"`, lọc Thể loại = `"Khoa học"`.
  2. Mở Giỏ sách: Chọn ngày mượn/hẹn trả -> Thử thêm vượt quá 5 cuốn để thấy hệ thống báo đỏ chặn lại.
  3. Bấm **"Gửi yêu cầu mượn"** -> Vào tab **Lịch sử mượn**: Phiếu xuất hiện ở tab *"Chờ duyệt"*, chỉ vào tồn kho ngoài trang chủ vẫn giữ nguyên.
  4. Sang tab *"Đang mượn"*: Bấm **"Yêu cầu trả sách"** và bấm nút **"Xuất PDF"** tải file về máy.
* **Nội dung cần nói:** 
  > *"Dạ thưa cô, em xin phép demo trực tiếp phía Độc giả tại cổng 5173: Độc giả tìm sách, thêm vào giỏ. Hệ thống tự động chặn nếu chọn quá quota 5 cuốn. Khi em gửi yêu cầu mượn, phiếu chuyển sang 'Chờ duyệt' và tồn kho ngoài hệ thống vẫn chưa bị trừ. Độc giả cũng có thể bấm yêu cầu trả và xuất phiếu PDF tiếng Việt rất sắc nét."*

---

### Ý 7: Demo Phía Quản Trị Viên (Cổng 5174)
* **Giao diện:** Chuyển sang Cổng Quản trị `http://localhost:5174/admin`
* **Thao tác:**
  1. Vào **Quản lý mượn sách** -> Tab *"Chờ duyệt"*: Bấm nút **"Duyệt"** -> Tồn kho sách lúc này mới trừ đúng 1 lần.
  2. Tab *"Chờ xác nhận trả"*: Bấm **"Xác nhận đã nhận sách"** -> Chỉ vào tiền phạt tự động tính nếu có trễ hạn.
  3. Vào **Quản lý sách**: Bấm nút **"Xóa"** một cuốn sách đang có người mượn -> Modal đỏ cảnh báo chặn xóa 409 hiện lên.
* **Nội dung cần nói:** 
  > *"Dạ thưa cô, chuyển sang Cổng Quản trị 5174 của thủ thư: Khi em bấm 'Duyệt', hệ thống dùng khóa hàng để trừ kho an toàn tuyệt đối. Khi nhận sách trả, hệ thống tự động tính tiền phạt trễ hạn qua Trigger CSDL. Đặc biệt, nếu thủ thư lỡ bấm xóa một cuốn sách đang có người mượn, hệ thống lập tức chặn lại với mã lỗi 409 để bảo vệ toàn vẹn dữ liệu."*

---

## PHẦN 3: KẾT LUẬN & HƯỚNG PHÁT TRIỂN

### Ý 8: Bằng Chứng Kiểm Thử & Nghiệm Thu
* **Slide:** Slide 30 — Kiểm thử: 49 test, 10 file
* **Nội dung:** 
  > *"Dạ thưa cô, toàn bộ các quy tắc nghiệp vụ từ kiểm soát quota 5 cuốn đến trừ kho đồng thời và khóa dữ liệu đều đã được nhóm kiểm thử tự động với 47/47 kịch bản test tích hợp đều PASS 100%."*

---

### Ý 9: Hạn Chế & Hướng Phát Triển
* **Slide:** Slide 31 — Hạn chế & hướng phát triển
* **Nội dung:** 
  > *"Dạ thưa cô, về mặt hạn chế, hiện tại sách vẫn cần nhập liệu thủ công. Hướng phát triển tiếp theo của nhóm là tích hợp quét mã vạch ISBN tự động khi nhập sách và liên kết cổng thanh toán VNPAY để độc giả nộp phạt trực tuyến."*

---

### Ý 10: Chào & Cảm Ơn
* **Slide:** Slide 32 — Kết luận & Q&A
* **Nội dung:** 
  > *"Dạ thưa quý thầy cô, phần thuyết trình và demo hệ thống của em đến đây là hoàn thành. Em xin chân thành cảm ơn thầy cô đã chú ý lắng nghe và em rất mong nhận được những góp ý, câu hỏi từ Hội đồng ạ!"*

---

## PHẦN 4: CÂU HỎI VẤN ĐÁP DỰ PHÒNG (TRẢ LỜI NHANH 1-2 CÂU)

1. **Hỏi:** *Tại sao gửi yêu cầu mượn lại chưa trừ kho ngay?*
   * **Đáp:** *"Dạ thưa cô, gửi yêu cầu mới chỉ là ý định của độc giả. Nếu trừ kho ngay sẽ gây giữ chỗ ảo. Kho chỉ trừ khi thủ thư trao sách tận tay."*
2. **Hỏi:** *Độc giả sửa code để mượn quá 5 quyển thì sao?*
   * **Đáp:** *"Dạ, Frontend chỉ chặn sớm trên giao diện. Backend luôn truy vấn lại CSDL và chặn lỗi 409 nếu tổng số sách mượn vượt quá 5."*
3. **Hỏi:** *Tại sao lại chia ra 2 cổng 5173 và 5174?*
   * **Đáp:** *"Dạ, chia 2 cổng giúp cô lập hoàn toàn giao diện độc giả với trang quản trị, bảo mật tuyệt đối cho cổng nội bộ của thủ thư."*

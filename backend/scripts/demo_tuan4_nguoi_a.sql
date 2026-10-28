-- ===================================================================================
-- KỊCH BẢN TRUY VẤN SQL DEMO BẢO VỆ ĐỒ ÁN - THÀNH VIÊN A (MINH)
-- Môn học: Quản trị CSDL / Hệ thống Quản trị Dữ liệu Thư viện
-- Học kỳ 1 - Năm học 2026-2027
-- Đối chiếu: Cores/Tieuchiduan.md & Cores/Chienluoc.md
-- Người thực hiện: Thành viên A (Minh - Thiết kế CSDL, Migrations, Procedures, Triggers)
-- ===================================================================================

USE library_db;
SET NAMES utf8mb4;

-- ===================================================================================
-- PHẦN 1: KIỂM TRA ĐỦ 7 BẢNG & RÀNG BUỘC TOÀN VẸN (SCHEMA INTEGRITY)
-- Tiêu chí: Đủ 7 bảng theo Tieuchiduan.md với khóa chính phức hợp và khóa ngoại
-- ===================================================================================

-- 1.1. Liệt kê các bảng hiện có trong hệ thống
SHOW TABLES;

-- 1.2. Kiểm tra cấu trúc 7 bảng trọng tâm theo đúng Tieuchiduan.md:
-- 1. Sach (maSach, maTacGia, maTheLoai, tenSach, namXuatBan, maNXB, soLuongHienCo)
DESCRIBE Sach;

-- 2. TacGia (maTacGia, tenTacGia, ...)
DESCRIBE TacGia;

-- 3. TheLoai (maTheLoai, tenTheLoai)
DESCRIBE TheLoai;

-- 4. DocGia (maDocGia, fullName, ngaySinh, dienThoai)
DESCRIBE DocGia;

-- 5. PhieuMuon (maPhieuMuon, maDocGia, ngayMuon, ngayTra, trangThai)
DESCRIBE PhieuMuon;

-- 6. ChiTietPhieuMuon (maChiTietPM, maPhieuMuon, maSach, soLuongSachMuon, ...)
DESCRIBE ChiTietPhieuMuon;

-- 7. PhieuTra (maPhieuTra, maChiTietPM, ngayTraSach, tienPhat, ...)
DESCRIBE PhieuTra;


-- ===================================================================================
-- PHẦN 2: FUNCTION - KIỂM TRA SỐ LƯỢNG SÁCH CÒN LẠI THEO MÃ SÁCH
-- Tiêu chí 8: Function fn_kiem_tra_so_luong_sach(maSach_in INT) chuẩn 1 tham số
-- ===================================================================================

-- 2.1. Xem định nghĩa Function đã được tạo trong MySQL
SHOW CREATE FUNCTION fn_kiem_tra_so_luong_sach\G;

-- 2.2. Kiểm tra trực tiếp số lượng tồn của sách có maSach = 1 qua Function
SELECT fn_kiem_tra_so_luong_sach(1) AS soLuongSach_MaSach_1;

-- 2.3. Lấy một cuốn sách bất kỳ đang có tồn kho > 0 để kiểm chứng Function trả về số lượng chính xác
SET @maSachKiemTra = (SELECT maSach FROM Sach WHERE soLuongHienCo > 0 ORDER BY maSach ASC LIMIT 1);
SELECT
    @maSachKiemTra AS maSach,
    (SELECT tenSach FROM Sach WHERE maSach = @maSachKiemTra LIMIT 1) AS tenSach,
    fn_kiem_tra_so_luong_sach(@maSachKiemTra) AS soLuongTonTraVeTuFunction,
    (SELECT SUM(soLuongHienCo) FROM Sach WHERE maSach = @maSachKiemTra) AS tongTonThucTeTrongBangSach;


-- ===================================================================================
-- PHẦN 3: TRIGGER - TỰ ĐỘNG TÍNH TIỀN PHẠT KHI TRẢ SÁCH MUỘN (BEFORE INSERT)
-- Tiêu chí 9: Trigger trg_tinh_tien_phat tự động tính tiền phạt trên PhieuTra
-- Công thức: GREATEST(0, DATEDIFF(ngayTraSach, ngayTraDuKien)) * 1000 * soLuongSachMuon
-- ===================================================================================

-- 3.1. Xem định nghĩa Trigger trong MySQL
SHOW CREATE TRIGGER trg_tinh_tien_phat\G;

-- 3.2. Demo thực tế Trigger:
-- Bước a: Tạo một kịch bản phiếu mượn có hạn trả là hôm qua (trễ hạn 1 ngày)
START TRANSACTION;

-- Lấy mã độc giả và sách mẫu
SET @maDocGiaDemo = (SELECT maDocGia FROM DocGia LIMIT 1);
SET @maSachDemo = (SELECT maSach FROM Sach WHERE soLuongHienCo > 0 LIMIT 1);
SET @maTacGiaDemo = (SELECT maTacGia FROM Sach WHERE maSach = @maSachDemo LIMIT 1);
SET @maTheLoaiDemo = (SELECT maTheLoai FROM Sach WHERE maSach = @maSachDemo LIMIT 1);

-- Thêm phiếu mượn với ngày trả dự kiến là 2 ngày trước (quá hạn 2 ngày)
INSERT INTO PhieuMuon (maDocGia, ngayMuon, ngayTra, trangThai, createdAt, updatedAt)
VALUES (@maDocGiaDemo, DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Đang mượn', NOW(), NOW());
SET @maPhieuMuonDemo = LAST_INSERT_ID();

-- Thêm chi tiết phiếu mượn mượn 2 cuốn sách
INSERT INTO ChiTietPhieuMuon (maPhieuMuon, maDocGia, maSach, maTacGia, maTheLoai, soLuongSachMuon, createdAt, updatedAt)
VALUES (@maPhieuMuonDemo, @maDocGiaDemo, @maSachDemo, @maTacGiaDemo, @maTheLoaiDemo, 2, NOW(), NOW());
SET @maChiTietPMDemo = LAST_INSERT_ID();

-- Bước b: Thêm phiếu trả vào ngày hôm nay (trễ 2 ngày, mượn 2 cuốn -> Phạt: 2 ngày * 1000 * 2 cuốn = 4000 VNĐ)
-- Chú ý: Ta KHÔNG truyền tienPhat vào câu lệnh INSERT để Trigger tự động tính toán!
INSERT INTO PhieuTra (maChiTietPM, maPhieuMuon, maSach, ngayTraSach, createdAt, updatedAt)
VALUES (@maChiTietPMDemo, @maPhieuMuonDemo, @maSachDemo, CURRENT_DATE(), NOW(), NOW());
SET @maPhieuTraDemo = LAST_INSERT_ID();

-- Bước c: Kiểm tra kết quả tienPhat do Trigger tự động sinh ra
SELECT
    pt.maPhieuTra,
    pt.maChiTietPM,
    pm.ngayTra AS ngayTraDuKien,
    pt.ngayTraSach AS ngayTraThucTe,
    DATEDIFF(pt.ngayTraSach, pm.ngayTra) AS soNgayTre,
    ct.soLuongSachMuon,
    pt.tienPhat AS tienPhatDoTriggerTinh,
    (DATEDIFF(pt.ngayTraSach, pm.ngayTra) * 1000 * ct.soLuongSachMuon) AS tienPhatKyVong
FROM PhieuTra pt
JOIN ChiTietPhieuMuon ct ON pt.maChiTietPM = ct.maChiTietPM
JOIN PhieuMuon pm ON ct.maPhieuMuon = pm.maPhieuMuon
WHERE pt.maPhieuTra = @maPhieuTraDemo;

-- Rollback để giữ dữ liệu demo ban đầu luôn sạch sẽ
ROLLBACK;


-- ===================================================================================
-- PHẦN 4: STORED PROCEDURE - DANH SÁCH PHIẾU MƯỢN CHƯA TRẢ
-- Tiêu chí 10: Procedure sp_danh_sach_phieu_muon_chua_tra lọc đúng trạng thái 'Đang mượn'
-- ===================================================================================

-- 4.1. Xem định nghĩa Stored Procedure
SHOW CREATE PROCEDURE sp_danh_sach_phieu_muon_chua_tra\G;

-- 4.2. Thực thi Procedure lấy danh sách phiếu chưa trả
CALL sp_danh_sach_phieu_muon_chua_tra();

-- 4.3. Xác thực độc lập bằng truy vấn SQL kiểm chứng:
SELECT
    pm.maPhieuMuon,
    pm.maDocGia,
    dg.fullName AS tenDocGia,
    pm.ngayMuon,
    pm.ngayTra AS hanTra,
    pm.trangThai,
    CASE
        WHEN CURRENT_DATE() > pm.ngayTra THEN DATEDIFF(CURRENT_DATE(), pm.ngayTra)
        ELSE 0
    END AS soNgayQuaHan
FROM PhieuMuon pm
JOIN DocGia dg ON pm.maDocGia = dg.maDocGia
WHERE pm.trangThai = 'Đang mượn'
ORDER BY pm.ngayMuon DESC;


-- ===================================================================================
-- PHẦN 5: STORED PROCEDURE - THỐNG KÊ SỐ LƯỢNG SÁCH ĐÃ MƯỢN TRONG THÁNG
-- Tiêu chí 11: Procedure sp_thong_ke_sach_muon_thang tính tổng số sách trong tháng/năm hiện tại
-- ===================================================================================

-- 5.1. Xem định nghĩa Stored Procedure
SHOW CREATE PROCEDURE sp_thong_ke_sach_muon_thang\G;

-- 5.2. Thực thi Procedure
CALL sp_thong_ke_sach_muon_thang();

-- 5.3. Xác thực bằng câu lệnh SQL độc lập:
SELECT
    MONTH(CURRENT_DATE()) AS thang,
    YEAR(CURRENT_DATE()) AS nam,
    COALESCE(SUM(ct.soLuongSachMuon), 0) AS tongSachMuonThangChuan
FROM ChiTietPhieuMuon ct
JOIN PhieuMuon pm ON ct.maPhieuMuon = pm.maPhieuMuon
WHERE pm.trangThai IN ('Đang mượn', 'Đã trả')
  AND MONTH(pm.ngayMuon) = MONTH(CURRENT_DATE())
  AND YEAR(pm.ngayMuon) = YEAR(CURRENT_DATE());


-- ===================================================================================
-- PHẦN 6: STORED PROCEDURE - THỐNG KÊ ĐỘC GIẢ DUY NHẤT ĐÃ MƯỢN TRONG NĂM
-- Tiêu chí 12: Procedure sp_thong_ke_doc_gia_muon_sach_nam dùng COUNT(DISTINCT maDocGia)
-- ===================================================================================

-- 6.1. Xem định nghĩa Stored Procedure
SHOW CREATE PROCEDURE sp_thong_ke_doc_gia_muon_sach_nam\G;

-- 6.2. Thực thi Procedure
CALL sp_thong_ke_doc_gia_muon_sach_nam();

-- 6.3. Xác thực câu lệnh COUNT DISTINCT độc lập:
SELECT
    YEAR(CURRENT_DATE()) AS nam,
    COUNT(DISTINCT pm.maDocGia) AS tongDocGiaDuyNhatTrongNam
FROM PhieuMuon pm
WHERE pm.trangThai IN ('Đang mượn', 'Đã trả')
  AND YEAR(pm.ngayMuon) = YEAR(CURRENT_DATE());


-- ===================================================================================
-- PHẦN 7: LUỒNG TỒN KHO & TRANSACTION LOCK CHỐNG RACE CONDITION
-- Tiêu chí 13: Xóa trigger tăng/giảm tồn kho, tồn kho chỉ cập nhật 1 lần trong Transaction
-- ===================================================================================

-- 7.1. Kiểm tra xác nhận: KHÔNG CÒN trigger tăng/giảm tồn kho tự động trong DB
-- Chỉ có duy nhất 1 trigger tính tiền phạt `trg_tinh_tien_phat`
SHOW TRIGGERS LIKE 'PhieuMuon';
SHOW TRIGGERS LIKE 'ChiTietPhieuMuon';
SHOW TRIGGERS LIKE 'PhieuTra';

-- 7.2. Giải thích cơ chế Transaction ACID & Pessimistic Locking trong borrowController.js:
-- - Khi độc giả gửi yêu cầu mượn: Tạo Phiếu mượn ở trạng thái 'Chờ duyệt', tồn kho CHƯA BỊ TRỪ.
-- - Khi thủ thư Duyệt ('Chờ duyệt' -> 'Đang mượn'):
--     1. Mở Transaction có mức cô lập Read Committed.
--     2. Khóa dòng bản ghi DocGia bằng `SELECT ... FOR UPDATE` để kiểm tra quota tối đa 5 cuốn.
--     3. Khóa dòng bản ghi Sach theo thứ tự maSach tăng dần (maSach ASC) bằng `SELECT ... FOR UPDATE`.
--        -> Loại bỏ hoàn toàn nguy cơ Deadlock khi nhiều tiến trình duyệt đồng thời.
--     4. Kiểm tra tồn: Nếu `soLuongHienCo < soLuongSachMuon`, ném lỗi HTTP 400 và Rollback.
--     5. Trừ tồn kho duy nhất 1 lần: `soLuongHienCo = soLuongHienCo - soLuongSachMuon`.
--     6. Đổi trạng thái 'Đang mượn' và Commit.
-- - Khi độc giả Trả sách ('Đang mượn' -> 'Đã trả'):
--     1. Độc giả gửi yêu cầu trả -> Bật cờ `yeuCauTraAt`, trạng thái DB vẫn là 'Đang mượn'.
--     2. Thủ thư duyệt trả -> Trong Transaction, tạo PhieuTra (Trigger tự tính tiền phạt),
--        cộng hoàn tồn kho duy nhất 1 lần, đổi trạng thái sang 'Đã trả' và Commit.
--     3. Nếu bấm duyệt trả lần hai -> Hệ thống kiểm tra thấy đã 'Đã trả', từ chối ngay với HTTP 409,
--        không cộng tồn kho lần hai (Triệt tiêu lỗi double-update).

-- KẾT THÚC KỊCH BẢN DEMO THÀNH VIÊN A

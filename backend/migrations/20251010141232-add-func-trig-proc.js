'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa trước nếu đã tồn tại
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_kiem_tra_so_luong_sach(maSach_in INT)
      RETURNS INT DETERMINISTIC
      BEGIN
        DECLARE soLuong INT;
        SELECT soLuongHienCo INTO soLuong FROM Sach WHERE maSach = maSach_in;
        RETURN soLuong;
      END
    `);

    // Function: Kiểm tra số sách của tác giả
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_author_books;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_check_author_books (maTacGia_in INT)
      RETURNS INT DETERMINISTIC
      BEGIN
        DECLARE bookCount INT;
        SELECT COUNT(*) INTO bookCount FROM Sach WHERE maTacGia = maTacGia_in;
        RETURN bookCount;
      END
    `);

    // Trigger tính tiền phạt khi trả sách
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_tinh_tien_phat
      BEFORE INSERT ON PhieuTra
      FOR EACH ROW
      BEGIN
        DECLARE ngayTraDuKien DATE;
        DECLARE soNgayMuon INT;
        DECLARE rate FLOAT DEFAULT 1000;

        SELECT PhieuMuon.ngayTra INTO ngayTraDuKien
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
        WHERE ChiTietPhieuMuon.maChiTietPM = NEW.maChiTietPM;

        SET soNgayMuon = GREATEST(0, DATEDIFF(NEW.ngayTraSach, ngayTraDuKien));
        SET NEW.tienPhat = soNgayMuon * rate;
      END
    `);

    // Trigger giảm số lượng sách khi mượn
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_giam_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_giam_so_luong_sach
      AFTER INSERT ON ChiTietPhieuMuon
      FOR EACH ROW
      BEGIN
        UPDATE Sach
        SET soLuongHienCo = soLuongHienCo - NEW.soLuongSachMuon
        WHERE maSach = NEW.maSach;
      END
    `);

    // Trigger tăng số lượng sách khi trả
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tang_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_tang_so_luong_sach
      AFTER INSERT ON PhieuTra
      FOR EACH ROW
      BEGIN
        DECLARE sl_muon INT;
        SELECT soLuongSachMuon INTO sl_muon
        FROM ChiTietPhieuMuon
        WHERE maChiTietPM = NEW.maChiTietPM;

        UPDATE Sach
        SET soLuongHienCo = soLuongHienCo + sl_muon
        WHERE maSach = (SELECT maSach FROM ChiTietPhieuMuon WHERE maChiTietPM = NEW.maChiTietPM);
      END
    `);

    // Procedure: danh sách phiếu mượn chưa trả
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_danh_sach_phieu_muon_chua_tra;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_danh_sach_phieu_muon_chua_tra ()
      BEGIN
        SELECT * FROM PhieuMuon WHERE trangThai = 'Dang muon';
      END
    `);

    // Procedure: thống kê sách mượn trong tháng
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_sach_muon_thang ()
      BEGIN
        SELECT SUM(ChiTietPhieuMuon.soLuongSachMuon) AS tongSachMuonThang
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
        WHERE MONTH(PhieuMuon.ngayMuon) = MONTH(CURRENT_DATE())
          AND YEAR(PhieuMuon.ngayMuon) = YEAR(CURRENT_DATE());
      END
    `);

    // Procedure: thống kê sách đang mượn trong năm
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_dang_muon_nam;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_sach_dang_muon_nam ()
      BEGIN
        SELECT SUM(ChiTietPhieuMuon.soLuongSachMuon) AS tongSachDangMuonNam
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
        WHERE YEAR(PhieuMuon.ngayMuon) = YEAR(CURRENT_DATE())
          AND PhieuMuon.trangThai = 'Dang muon';
      END
    `);

    // Procedure: kiểm tra trạng thái độc giả
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_check_reader_status;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_check_reader_status (IN maDocGia_in INT)
      BEGIN
        DECLARE hasPendingLoan INT;
        SELECT COUNT(*) INTO hasPendingLoan
        FROM PhieuMuon
        WHERE maDocGia = maDocGia_in AND trangThai = 'Dang muon';
        SELECT hasPendingLoan AS hasPendingLoan;
      END
    `);

    // Procedure: kiểm tra tính hợp lệ khóa ngoại của sách
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_validate_book_foreign_keys;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_validate_book_foreign_keys (
        IN maTacGia_in INT,
        IN maNXB_in INT,
        IN maTheLoai_in INT,
        OUT isValid INT
      )
      BEGIN
        DECLARE tacGiaExists INT;
        DECLARE nxbExists INT;
        DECLARE theLoaiExists INT;

        SELECT COUNT(*) INTO tacGiaExists FROM TacGia WHERE maTacGia = maTacGia_in;
        SELECT COUNT(*) INTO nxbExists FROM NhaXuatBan WHERE maNXB = maNXB_in;
        SELECT COUNT(*) INTO theLoaiExists FROM TheLoai WHERE maTheLoai = maTheLoai_in;

        IF tacGiaExists > 0 AND nxbExists > 0 AND theLoaiExists > 0 THEN
          SET isValid = 1;
        ELSE
          SET isValid = 0;
        END IF;

        -- Explicitly return the isValid value as a result set
        SELECT isValid AS isValid;
      END 
    `);

    // Function: kiểm tra số sách của nhà xuất bản
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_publisher_books;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_check_publisher_books (maNXB_in INT)
      RETURNS INT DETERMINISTIC
      BEGIN
        DECLARE bookCount INT;
        SELECT COUNT(*) INTO bookCount FROM Sach WHERE maNXB = maNXB_in;
        RETURN bookCount;
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_giam_so_luong_sach;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tang_so_luong_sach;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_danh_sach_phieu_muon_chua_tra;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_dang_muon_nam;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_check_reader_status;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_validate_book_foreign_keys;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_author_books;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_publisher_books;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
  }
};

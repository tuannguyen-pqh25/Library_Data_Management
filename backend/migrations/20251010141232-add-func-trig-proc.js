'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_kiem_tra_so_luong_sach(maSach_in INT, maTacGia_in INT, maTheLoai_in INT)
      RETURNS INT NOT DETERMINISTIC READS SQL DATA
      BEGIN
        DECLARE soLuong INT;
        SELECT soLuongHienCo INTO soLuong FROM Sach
        WHERE maSach = maSach_in AND maTacGia = maTacGia_in AND maTheLoai = maTheLoai_in;
        RETURN soLuong;
      END
    `);

    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_author_books;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_check_author_books (maTacGia_in INT)
      RETURNS INT NOT DETERMINISTIC READS SQL DATA
      BEGIN
        DECLARE bookCount INT;
        SELECT COUNT(*) INTO bookCount FROM Sach WHERE maTacGia = maTacGia_in;
        RETURN bookCount;
      END
    `);

    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_tinh_tien_phat
      BEFORE INSERT ON PhieuTra
      FOR EACH ROW
      BEGIN
        DECLARE ngayTraDuKien DATE;
        DECLARE soLuongSachMuon INT;

        SELECT PhieuMuon.ngayTra, ChiTietPhieuMuon.soLuongSachMuon
          INTO ngayTraDuKien, soLuongSachMuon
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon
          ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
         AND ChiTietPhieuMuon.maDocGia = PhieuMuon.maDocGia
        WHERE ChiTietPhieuMuon.maChiTietPM = NEW.maChiTietPM
          AND ChiTietPhieuMuon.maPhieuMuon = NEW.maPhieuMuon
          AND ChiTietPhieuMuon.maSach = NEW.maSach
        FOR UPDATE;

        SET NEW.tienPhat = GREATEST(0, DATEDIFF(NEW.ngayTraSach, ngayTraDuKien))
          * 1000 * soLuongSachMuon;
      END
    `);

    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_giam_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_giam_so_luong_sach
      AFTER INSERT ON ChiTietPhieuMuon
      FOR EACH ROW
      BEGIN
        UPDATE Sach
        SET soLuongHienCo = soLuongHienCo - NEW.soLuongSachMuon
        WHERE maSach = NEW.maSach
          AND maTacGia = NEW.maTacGia
          AND maTheLoai = NEW.maTheLoai;
      END
    `);

    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tang_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_tang_so_luong_sach
      AFTER INSERT ON PhieuTra
      FOR EACH ROW
      BEGIN
        UPDATE Sach
        JOIN ChiTietPhieuMuon
          ON Sach.maSach = ChiTietPhieuMuon.maSach
         AND Sach.maTacGia = ChiTietPhieuMuon.maTacGia
         AND Sach.maTheLoai = ChiTietPhieuMuon.maTheLoai
        SET Sach.soLuongHienCo = Sach.soLuongHienCo + ChiTietPhieuMuon.soLuongSachMuon
        WHERE ChiTietPhieuMuon.maChiTietPM = NEW.maChiTietPM
          AND ChiTietPhieuMuon.maPhieuMuon = NEW.maPhieuMuon
          AND ChiTietPhieuMuon.maSach = NEW.maSach;
      END
    `);

    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_danh_sach_phieu_muon_chua_tra;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_danh_sach_phieu_muon_chua_tra ()
      BEGIN
        SELECT * FROM PhieuMuon WHERE trangThai = 'Đang mượn';
      END
    `);

    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_sach_muon_thang ()
      BEGIN
        SELECT SUM(ChiTietPhieuMuon.soLuongSachMuon) AS tongSachMuonThang
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon
          ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
         AND ChiTietPhieuMuon.maDocGia = PhieuMuon.maDocGia
        WHERE MONTH(PhieuMuon.ngayMuon) = MONTH(CURRENT_DATE())
          AND YEAR(PhieuMuon.ngayMuon) = YEAR(CURRENT_DATE())
          AND PhieuMuon.trangThai IN ('Đang mượn', 'Đã trả');
      END
    `);

    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_dang_muon_nam;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_doc_gia_muon_sach_nam;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_doc_gia_muon_sach_nam ()
      BEGIN
        SELECT COUNT(DISTINCT maDocGia) AS tongDocGiaMuonSachNam
        FROM PhieuMuon
        WHERE YEAR(ngayMuon) = YEAR(CURRENT_DATE())
          AND trangThai IN ('Đang mượn', 'Đã trả');
      END
    `);

    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_check_reader_status;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_check_reader_status (IN maDocGia_in INT)
      BEGIN
        DECLARE hasPendingLoan INT;
        SELECT COUNT(*) INTO hasPendingLoan
        FROM PhieuMuon
        WHERE maDocGia = maDocGia_in AND trangThai = 'Đang mượn';
        SELECT hasPendingLoan AS hasPendingLoan;
      END
    `);

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

        SELECT isValid AS isValid;
      END 
    `);

    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_publisher_books;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_check_publisher_books (maNXB_in INT)
      RETURNS INT NOT DETERMINISTIC READS SQL DATA
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
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_doc_gia_muon_sach_nam;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_check_reader_status;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_validate_book_foreign_keys;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_author_books;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_check_publisher_books;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
  }
};

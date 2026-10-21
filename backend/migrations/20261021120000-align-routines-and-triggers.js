'use strict';

/**
 * Chuẩn hóa các Routine, Stored Procedure và Trigger phục vụ báo cáo và phạt trễ hạn.
 * Khắc phục triệt để lỗi join trên cột không tồn tại, quản lý schema chính quy bằng migration.
 */
module.exports = {
  async up(queryInterface) {
    // 1. Chuẩn hóa Stored Procedure: Thống kê số lượng sách mượn trong tháng hiện tại
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_sach_muon_thang ()
      BEGIN
        SELECT COALESCE(SUM(ChiTietPhieuMuon.soLuongSachMuon), 0) AS tongSachMuonThang
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon
          ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
        WHERE MONTH(PhieuMuon.ngayMuon) = MONTH(CURRENT_DATE())
          AND YEAR(PhieuMuon.ngayMuon) = YEAR(CURRENT_DATE())
          AND PhieuMuon.trangThai IN ('Đang mượn', 'Đã trả');
      END;
    `);

    // 2. Chuẩn hóa Stored Procedure: Thống kê số độc giả duy nhất đã mượn sách trong năm
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_doc_gia_muon_sach_nam;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_doc_gia_muon_sach_nam ()
      BEGIN
        SELECT COUNT(DISTINCT maDocGia) AS tongDocGiaMuonSachNam
        FROM PhieuMuon
        WHERE YEAR(ngayMuon) = YEAR(CURRENT_DATE())
          AND trangThai IN ('Đang mượn', 'Đã trả');
      END;
    `);

    // 3. Chuẩn hóa Stored Procedure: Danh sách phiếu mượn chưa trả
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_danh_sach_phieu_muon_chua_tra;');
    await queryInterface.sequelize.query(`
      CREATE PROCEDURE sp_danh_sach_phieu_muon_chua_tra ()
      BEGIN
        SELECT * FROM PhieuMuon WHERE trangThai = 'Đang mượn';
      END;
    `);

    // 4. Chuẩn hóa Trigger: Tự động tính tiền phạt khi trả sách muộn
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
        WHERE ChiTietPhieuMuon.maChiTietPM = NEW.maChiTietPM;

        SET NEW.tienPhat = GREATEST(0, DATEDIFF(NEW.ngayTraSach, ngayTraDuKien))
          * 1000 * soLuongSachMuon;
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_doc_gia_muon_sach_nam;');
    await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS sp_danh_sach_phieu_muon_chua_tra;');
  },
};

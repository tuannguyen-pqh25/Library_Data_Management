'use strict';

/**
 * Migration chuẩn hóa Function fn_kiem_tra_so_luong_sach theo đúng Tieuchiduan.md
 * Nhận tham số duy nhất maSach_in INT để kiểm tra số lượng sách còn lại theo Mã sách.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_kiem_tra_so_luong_sach(maSach_in INT)
      RETURNS INT NOT DETERMINISTIC READS SQL DATA
      BEGIN
        DECLARE soLuong INT;
        SELECT COALESCE(SUM(soLuongHienCo), 0) INTO soLuong
        FROM Sach
        WHERE maSach = maSach_in;
        RETURN soLuong;
      END;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS fn_kiem_tra_so_luong_sach;');
    await queryInterface.sequelize.query(`
      CREATE FUNCTION fn_kiem_tra_so_luong_sach(maSach_in INT, maTacGia_in INT, maTheLoai_in INT)
      RETURNS INT NOT DETERMINISTIC READS SQL DATA
      BEGIN
        DECLARE soLuong INT;
        SELECT soLuongHienCo INTO soLuong FROM Sach
        WHERE maSach = maSach_in AND maTacGia = maTacGia_in AND maTheLoai = maTheLoai_in;
        RETURN soLuong;
      END;
    `);
  },
};

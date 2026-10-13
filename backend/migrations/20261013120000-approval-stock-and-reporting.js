'use strict';

const decreaseStockTrigger = `
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
`;

const increaseStockTrigger = `
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
`;

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_giam_so_luong_sach;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tang_so_luong_sach;');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_giam_so_luong_sach;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tang_so_luong_sach;');
    await queryInterface.sequelize.query(decreaseStockTrigger);
    await queryInterface.sequelize.query(increaseStockTrigger);
  },
};

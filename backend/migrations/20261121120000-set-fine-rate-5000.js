'use strict';

const createFineTrigger = (rate) => `
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
      * ${rate} * soLuongSachMuon;
  END
`;

async function replaceFineTrigger(queryInterface, rate) {
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
  await queryInterface.sequelize.query(createFineTrigger(rate));
}

module.exports = {
  async up(queryInterface) {
    await replaceFineTrigger(queryInterface, 5000);
  },

  async down(queryInterface) {
    await replaceFineTrigger(queryInterface, 1000);
  },
};

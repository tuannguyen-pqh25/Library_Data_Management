'use strict';

const constraintName = 'uq_phieutra_maChiTietPM';
const constraintFields = ['maChiTietPM'];

async function findExpectedIndex(queryInterface) {
  const indexes = await queryInterface.showIndex('PhieuTra');
  const existing = indexes.find((index) => index.name === constraintName);
  if (!existing) return false;

  const fields = (existing.fields || []).map((field) => field.attribute || field.name || field.columnName);
  if (!existing.unique || fields.length !== constraintFields.length || fields.some((field, index) => field !== constraintFields[index])) {
    throw new Error(`Index ${constraintName} exists but is not UNIQUE(${constraintFields.join(', ')}).`);
  }
  return true;
}

const createFineTrigger = `
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
`;

module.exports = {
  async up(queryInterface) {
    if (!await findExpectedIndex(queryInterface)) {
      await queryInterface.addConstraint('PhieuTra', {
        fields: constraintFields,
        type: 'unique',
        name: constraintName,
      });
    }
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    await queryInterface.sequelize.query(createFineTrigger);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat;');
    if (await findExpectedIndex(queryInterface)) {
      await queryInterface.removeConstraint('PhieuTra', constraintName);
    }
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_tinh_tien_phat
      BEFORE INSERT ON PhieuTra
      FOR EACH ROW
      BEGIN
        DECLARE ngayTraDuKien DATE;
        DECLARE soLuongSachMuon INT;
        DECLARE returnedCount INT;

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

        SELECT COUNT(*) INTO returnedCount
        FROM PhieuTra
        WHERE maChiTietPM = NEW.maChiTietPM
          AND maPhieuMuon = NEW.maPhieuMuon
          AND maSach = NEW.maSach
        FOR UPDATE;

        IF returnedCount > 0 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Borrow detail already returned';
        END IF;

        SET NEW.tienPhat = GREATEST(0, DATEDIFF(NEW.ngayTraSach, ngayTraDuKien))
          * 1000 * soLuongSachMuon;
      END
    `);
  },
};

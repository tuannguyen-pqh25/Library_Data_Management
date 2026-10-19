const { sequelize } = require('../models');
const logger = require('../src/logger');
const { QueryTypes } = require('sequelize');

const ensureDatabaseObjects = async () => {
  try {
    await sequelize.query('DROP PROCEDURE IF EXISTS sp_thong_ke_sach_muon_thang');
    await sequelize.query(`
      CREATE PROCEDURE sp_thong_ke_sach_muon_thang ()
      BEGIN
        SELECT COALESCE(SUM(ChiTietPhieuMuon.soLuongSachMuon), 0) AS tongSachMuonThang
        FROM ChiTietPhieuMuon
        JOIN PhieuMuon
          ON ChiTietPhieuMuon.maPhieuMuon = PhieuMuon.maPhieuMuon
        WHERE MONTH(PhieuMuon.ngayMuon) = MONTH(CURRENT_DATE())
          AND YEAR(PhieuMuon.ngayMuon) = YEAR(CURRENT_DATE())
          AND PhieuMuon.trangThai IN ('Đang mượn', 'Đã trả');
      END
    `);
    logger.info('sp_thong_ke_sach_muon_thang procedure synced successfully');
  } catch (err) {
    logger.warn('Could not sync sp_thong_ke_sach_muon_thang', { error: err.message });
  }

  try {
    await sequelize.query('DROP TRIGGER IF EXISTS trg_tinh_tien_phat');
    await sequelize.query(`
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
      END
    `);
    logger.info('trg_tinh_tien_phat trigger synced successfully');
  } catch (err) {
    logger.warn('Could not sync trg_tinh_tien_phat', { error: err.message });
  }
};
ensureDatabaseObjects();

const procedureRows = async (name) => {
  const result = await sequelize.query(`CALL ${name}()`);
  let rows = result;
  while (Array.isArray(rows) && rows.length && Array.isArray(rows[0])) rows = rows[0];
  if (!Array.isArray(rows) || (rows.length && rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row)))) {
    throw new Error(`Unexpected result shape from ${name}`);
  }
  return rows;
};

const procedureNumber = (rows, field, name) => {
  const row = rows[0];
  if (!row || !Object.hasOwn(row, field)) throw new Error(`Unexpected result shape from ${name}`);
  const value = Number(row[field] ?? 0);
  if (!Number.isFinite(value)) throw new Error(`Invalid numeric result from ${name}`);
  return value;
};

const getMonthlyBorrowCount = async () => {
  try {
    return await procedureRows('sp_thong_ke_sach_muon_thang');
  } catch (procErr) {
    logger.warn('sp_thong_ke_sach_muon_thang failed, executing direct query fallback', { error: procErr.message });
    const directRows = await sequelize.query(`
      SELECT COALESCE(SUM(ct.soLuongSachMuon), 0) AS tongSachMuonThang
      FROM ChiTietPhieuMuon ct
      JOIN PhieuMuon pm ON ct.maPhieuMuon = pm.maPhieuMuon
      WHERE MONTH(pm.ngayMuon) = MONTH(CURRENT_DATE())
        AND YEAR(pm.ngayMuon) = YEAR(CURRENT_DATE())
        AND pm.trangThai IN ('Đang mượn', 'Đã trả')
    `, { type: QueryTypes.SELECT });
    return directRows;
  }
};

const getUnreturnedLoans = async (req, res) => {
  try {
    res.json(await procedureRows('sp_danh_sach_phieu_muon_chua_tra'));
  } catch (error) {
    logger.error('Failed to load unreturned loans', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const [books, readers] = await Promise.all([
      getMonthlyBorrowCount(),
      procedureRows('sp_thong_ke_doc_gia_muon_sach_nam'),
    ]);
    res.json({
      tongSachMuonThang: books[0]?.tongSachMuonThang ?? 0,
      tongDocGiaMuonSachNam: readers[0]?.tongDocGiaMuonSachNam ?? 0,
    });
  } catch (error) {
    logger.error('Failed to load library statistics', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const [books, readers, unreturned] = await Promise.all([
      getMonthlyBorrowCount(),
      procedureRows('sp_thong_ke_doc_gia_muon_sach_nam'),
      sequelize.query(
        "SELECT COUNT(*) AS phieuChuaTra FROM PhieuMuon WHERE trangThai = 'Đang mượn'",
        { type: QueryTypes.SELECT },
      ),
    ]);
    const counts = unreturned[0];
    if (!counts || !Object.hasOwn(counts, 'phieuChuaTra')) throw new Error('Unexpected unreturned-loan count result');
    const phieuChuaTra = Number(counts.phieuChuaTra);
    if (!Number.isFinite(phieuChuaTra)) throw new Error('Invalid unreturned-loan count result');
    res.json({
      sachMuonThang: procedureNumber(books, 'tongSachMuonThang', 'sp_thong_ke_sach_muon_thang'),
      docGiaMuonNam: procedureNumber(readers, 'tongDocGiaMuonSachNam', 'sp_thong_ke_doc_gia_muon_sach_nam'),
      phieuChuaTra,
    });
  } catch (error) {
    logger.error('Failed to load dashboard summary', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const getDetailedUnreturnedLoans = async (req, res) => {
  try {
    const rows = await sequelize.query(`
      SELECT pm.maPhieuMuon, pm.maDocGia, dg.fullName, pm.ngayMuon, pm.ngayTra, pm.trangThai,
             ct.maChiTietPM, ct.maPhieuMuon, pm.maDocGia AS maDocGia, ct.maSach, s.maTacGia, s.maTheLoai,
             s.tenSach, ct.soLuongSachMuon
      FROM PhieuMuon pm
      JOIN DocGia dg ON dg.maDocGia = pm.maDocGia
      JOIN ChiTietPhieuMuon ct ON ct.maPhieuMuon = pm.maPhieuMuon
      JOIN Sach s ON s.maSach = ct.maSach
      WHERE pm.trangThai = 'Đang mượn'
      ORDER BY pm.ngayTra ASC, pm.maPhieuMuon ASC, ct.maChiTietPM ASC
    `, { type: QueryTypes.SELECT });
    if (!Array.isArray(rows)) throw new Error('Unexpected detailed unreturned-loan result');

    const loans = new Map();
    for (const row of rows) {
      const key = `${row.maPhieuMuon}:${row.maDocGia}`;
      let loan = loans.get(key);
      if (!loan) {
        loan = {
          maPhieuMuon: row.maPhieuMuon,
          maDocGia: row.maDocGia,
          fullName: row.fullName,
          ngayMuon: row.ngayMuon,
          ngayTra: row.ngayTra,
          trangThai: row.trangThai,
          chiTiet: [],
        };
        loans.set(key, loan);
      }
      loan.chiTiet.push({
        maChiTietPM: row.maChiTietPM,
        maPhieuMuon: row.maPhieuMuon,
        maDocGia: row.maDocGia,
        maSach: row.maSach,
        maTacGia: row.maTacGia,
        maTheLoai: row.maTheLoai,
        tenSach: row.tenSach,
        soLuongSachMuon: row.soLuongSachMuon,
      });
    }
    res.json([...loans.values()]);
  } catch (error) {
    logger.error('Failed to load detailed unreturned loans', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUnreturnedLoans, getStatistics, getDashboardSummary, getDetailedUnreturnedLoans };

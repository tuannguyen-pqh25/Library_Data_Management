const { sequelize } = require('../models');
const logger = require('../src/logger');

const procedureRows = async (name) => {
  const result = await sequelize.query(`CALL ${name}()`);
  let rows = result[0];
  while (Array.isArray(rows) && rows.length === 1 && Array.isArray(rows[0])) rows = rows[0];
  return Array.isArray(rows) ? rows : [];
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
      procedureRows('sp_thong_ke_sach_muon_thang'),
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

module.exports = { getUnreturnedLoans, getStatistics };

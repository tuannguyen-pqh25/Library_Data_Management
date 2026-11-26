const { sequelize } = require('../models');
const logger = require('../src/logger');
const { QueryTypes } = require('sequelize');
const { buildLibraryReportWorkbook } = require('../utils/excelReportBuilder');

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

const loadSummaryMetrics = async () => {
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
  return {
    sachMuonThang: procedureNumber(books, 'tongSachMuonThang', 'sp_thong_ke_sach_muon_thang'),
    docGiaMuonNam: procedureNumber(readers, 'tongDocGiaMuonSachNam', 'sp_thong_ke_doc_gia_muon_sach_nam'),
    phieuChuaTra,
  };
};

const getDashboardSummary = async (req, res) => {
  try {
    res.json(await loadSummaryMetrics());
  } catch (error) {
    logger.error('Failed to load dashboard summary', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const foldUnreturnedLoanRows = (rows, { includeContact = false } = {}) => {
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
        ...(includeContact ? {
          dienThoai: row.dienThoai,
          email: row.email,
          yeuCauTraAt: row.yeuCauTraAt,
        } : {}),
        chiTiet: [],
      };
      loans.set(key, loan);
    }
    if (row.maChiTietPM !== null && row.maChiTietPM !== undefined) {
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
  }
  return [...loans.values()];
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

    res.json(foldUnreturnedLoanRows(rows));
  } catch (error) {
    logger.error('Failed to load detailed unreturned loans', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

const selectRows = (sql) => sequelize.query(sql, { type: QueryTypes.SELECT });

const exportExcelReport = async (req, res) => {
  try {
    const generatedAt = new Date();
    const [
      summary,
      monthlyLoans,
      unreturnedRows,
      loanDetails,
      books,
      readers,
      authors,
      categories,
      publishers,
      staff,
    ] = await Promise.all([
      loadSummaryMetrics(),
      selectRows(`
        SELECT MONTH(pm.ngayMuon) AS month,
               COUNT(DISTINCT CONCAT(pm.maPhieuMuon, ':', pm.maDocGia)) AS totalLoans,
               COALESCE(SUM(ct.soLuongSachMuon), 0) AS totalBooks
        FROM PhieuMuon pm
        LEFT JOIN ChiTietPhieuMuon ct
          ON ct.maPhieuMuon = pm.maPhieuMuon AND ct.maDocGia = pm.maDocGia
        WHERE YEAR(pm.ngayMuon) = YEAR(CURRENT_DATE())
          AND pm.trangThai IN ('Đang mượn', 'Đã trả')
        GROUP BY MONTH(pm.ngayMuon)
        ORDER BY month ASC
      `),
      selectRows(`
        SELECT pm.maPhieuMuon, pm.maDocGia, dg.fullName, dg.dienThoai, dg.email,
               pm.ngayMuon, pm.ngayTra, pm.trangThai, pm.yeuCauTraAt,
               ct.maChiTietPM, ct.maSach, ct.maTacGia, ct.maTheLoai,
               s.tenSach, ct.soLuongSachMuon
        FROM PhieuMuon pm
        JOIN DocGia dg ON dg.maDocGia = pm.maDocGia
        LEFT JOIN ChiTietPhieuMuon ct
          ON ct.maPhieuMuon = pm.maPhieuMuon AND ct.maDocGia = pm.maDocGia
        LEFT JOIN Sach s
          ON s.maSach = ct.maSach AND s.maTacGia = ct.maTacGia AND s.maTheLoai = ct.maTheLoai
        WHERE pm.trangThai = 'Đang mượn'
        ORDER BY pm.ngayTra ASC, pm.maPhieuMuon ASC, ct.maChiTietPM ASC
      `),
      selectRows(`
        SELECT pm.maPhieuMuon, pm.maDocGia, dg.fullName,
               pm.ngayMuon, pm.ngayTra, pm.trangThai, pm.yeuCauTraAt,
               ct.maChiTietPM, ct.maSach, ct.soLuongSachMuon,
               s.tenSach, tg.tenTacGia, tl.tenTheLoai,
               pt.ngayTraSach, COALESCE(pt.tienPhat, 0) AS tienPhat
        FROM PhieuMuon pm
        JOIN DocGia dg ON dg.maDocGia = pm.maDocGia
        LEFT JOIN ChiTietPhieuMuon ct
          ON ct.maPhieuMuon = pm.maPhieuMuon AND ct.maDocGia = pm.maDocGia
        LEFT JOIN Sach s
          ON s.maSach = ct.maSach AND s.maTacGia = ct.maTacGia AND s.maTheLoai = ct.maTheLoai
        LEFT JOIN TacGia tg ON tg.maTacGia = s.maTacGia
        LEFT JOIN TheLoai tl ON tl.maTheLoai = s.maTheLoai
        LEFT JOIN PhieuTra pt
          ON pt.maChiTietPM = ct.maChiTietPM AND pt.maPhieuMuon = ct.maPhieuMuon AND pt.maSach = ct.maSach
        ORDER BY pm.ngayMuon DESC, pm.maPhieuMuon DESC, ct.maChiTietPM ASC
      `),
      selectRows(`
        SELECT s.maSach, s.tenSach, s.donGia, s.soLuongHienCo, s.namXuatBan, s.nguonGoc,
               tg.tenTacGia, tl.tenTheLoai, nxb.tenNXB,
               COALESCE(SUM(CASE WHEN pm.trangThai IN ('Đang mượn', 'Đã trả') THEN ct.soLuongSachMuon ELSE 0 END), 0) AS tongLuotMuon
        FROM Sach s
        LEFT JOIN TacGia tg ON tg.maTacGia = s.maTacGia
        LEFT JOIN TheLoai tl ON tl.maTheLoai = s.maTheLoai
        LEFT JOIN NhaXuatBan nxb ON nxb.maNXB = s.maNXB
        LEFT JOIN ChiTietPhieuMuon ct
          ON ct.maSach = s.maSach AND ct.maTacGia = s.maTacGia AND ct.maTheLoai = s.maTheLoai
        LEFT JOIN PhieuMuon pm
          ON pm.maPhieuMuon = ct.maPhieuMuon AND pm.maDocGia = ct.maDocGia
        GROUP BY s.maSach, s.maTacGia, s.maTheLoai, s.tenSach, s.donGia, s.soLuongHienCo,
                 s.namXuatBan, s.nguonGoc, tg.tenTacGia, tl.tenTheLoai, nxb.tenNXB
        ORDER BY s.maSach ASC
      `),
      selectRows(`
        SELECT dg.maDocGia, dg.fullName, dg.phai, dg.ngaySinh, dg.dienThoai, dg.email, dg.diaChi,
               COUNT(DISTINCT pm.maPhieuMuon) AS tongPhieuMuon,
               COALESCE(SUM(CASE WHEN pm.trangThai = 'Đang mượn' THEN ct.soLuongSachMuon ELSE 0 END), 0) AS sachDangMuon,
               COALESCE(SUM(pt.tienPhat), 0) AS tongTienPhat
        FROM DocGia dg
        LEFT JOIN PhieuMuon pm ON pm.maDocGia = dg.maDocGia
        LEFT JOIN ChiTietPhieuMuon ct
          ON ct.maPhieuMuon = pm.maPhieuMuon AND ct.maDocGia = pm.maDocGia
        LEFT JOIN PhieuTra pt
          ON pt.maChiTietPM = ct.maChiTietPM AND pt.maPhieuMuon = ct.maPhieuMuon AND pt.maSach = ct.maSach
        GROUP BY dg.maDocGia, dg.fullName, dg.phai, dg.ngaySinh, dg.dienThoai, dg.email, dg.diaChi
        ORDER BY dg.maDocGia ASC
      `),
      selectRows(`
        SELECT tg.maTacGia, tg.tenTacGia, tg.soDienThoai, tg.diaChi, COUNT(s.maSach) AS soDauSach
        FROM TacGia tg
        LEFT JOIN Sach s ON s.maTacGia = tg.maTacGia
        GROUP BY tg.maTacGia, tg.tenTacGia, tg.soDienThoai, tg.diaChi
        ORDER BY tg.maTacGia ASC
      `),
      selectRows(`
        SELECT tl.maTheLoai, tl.tenTheLoai, COUNT(s.maSach) AS soDauSach
        FROM TheLoai tl
        LEFT JOIN Sach s ON s.maTheLoai = tl.maTheLoai
        GROUP BY tl.maTheLoai, tl.tenTheLoai
        ORDER BY tl.maTheLoai ASC
      `),
      selectRows(`
        SELECT nxb.maNXB, nxb.tenNXB, nxb.diaChi, COUNT(s.maSach) AS soDauSach
        FROM NhaXuatBan nxb
        LEFT JOIN Sach s ON s.maNXB = nxb.maNXB
        GROUP BY nxb.maNXB, nxb.tenNXB, nxb.diaChi
        ORDER BY nxb.maNXB ASC
      `),
      selectRows('SELECT MSNV, hoTenNV, chucVu, soDienThoai, diaChi FROM NhanVien ORDER BY MSNV ASC'),
    ]);

    const workbook = await buildLibraryReportWorkbook({
      generatedAt,
      exporterName: req.user?.hoTenNV || 'Quản trị viên',
      summary,
      monthlyLoans,
      unreturnedLoans: foldUnreturnedLoanRows(unreturnedRows, { includeContact: true }),
      loanDetails,
      books,
      readers,
      authors,
      categories,
      publishers,
      staff,
    });

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const dateStamp = `${generatedAt.getFullYear()}-${String(generatedAt.getMonth() + 1).padStart(2, '0')}-${String(generatedAt.getDate()).padStart(2, '0')}`;
    const filename = `BaoCao_ThuVien_${dateStamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(buffer);
  } catch (error) {
    logger.error('Failed to export Excel report', { error: error.message });
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUnreturnedLoans,
  getStatistics,
  getDashboardSummary,
  getDetailedUnreturnedLoans,
  exportExcelReport,
};

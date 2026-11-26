const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');

test('buildLibraryReportWorkbook creates all 6 sheets even when datasets are empty', async () => {
  const { buildLibraryReportWorkbook } = require('../utils/excelReportBuilder');
  const workbook = await buildLibraryReportWorkbook({
    generatedAt: new Date('2026-11-26T10:00:00Z'),
    exporterName: 'Admin Test',
    summary: { sachMuonThang: 0, docGiaMuonNam: 0, phieuChuaTra: 0 },
    monthlyLoans: [],
    unreturnedLoans: [],
    loanDetails: [],
    books: [],
    readers: [],
    authors: [],
    categories: [],
    publishers: [],
    staff: [],
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const parsed = new ExcelJS.Workbook();
  await parsed.xlsx.load(buffer);

  assert.deepEqual(
    parsed.worksheets.map((ws) => ws.name),
    [
      'TongQuan',
      'PhieuChuaTra_QuaHan',
      'LichSuMuonTra',
      'KhoSach',
      'DocGia',
      'DanhMucHeThong',
    ],
  );

  const overviewText = [];
  parsed.getWorksheet('TongQuan').eachRow((row) => {
    row.eachCell((cell) => overviewText.push(String(cell.value ?? '')));
  });
  assert.ok(overviewText.some((v) => v.includes('Admin Test')));
  assert.ok(overviewText.some((v) => v.includes('Tháng 12')));
});

test('buildLibraryReportWorkbook computes overdue fines, totals, and omits sensitive fields', async () => {
  const { buildLibraryReportWorkbook, FINE_PER_DAY_PER_COPY } = require('../utils/excelReportBuilder');
  assert.equal(FINE_PER_DAY_PER_COPY, 5000);

  const workbook = await buildLibraryReportWorkbook({
    generatedAt: new Date('2026-11-26T00:00:00'),
    exporterName: 'Thủ thư A',
    summary: { sachMuonThang: 13, docGiaMuonNam: 6, phieuChuaTra: 2 },
    monthlyLoans: [
      { month: 10, totalLoans: 4, totalBooks: 10 },
      { month: 11, totalLoans: 5, totalBooks: 13 },
    ],
    unreturnedLoans: [
      {
        maPhieuMuon: 101,
        maDocGia: 7,
        fullName: 'Nguyễn Văn A',
        dienThoai: '0901234567',
        email: 'a@example.com',
        ngayMuon: '2026-11-01',
        ngayTra: '2026-11-20',
        trangThai: 'Đang mượn',
        yeuCauTraAt: null,
        chiTiet: [{ maSach: 1, tenSach: 'Clean Code', soLuongSachMuon: 2 }],
      },
      {
        maPhieuMuon: 102,
        maDocGia: 8,
        fullName: 'Trần Thị B',
        dienThoai: '0907654321',
        email: 'b@example.com',
        ngayMuon: '2026-11-20',
        ngayTra: '2026-12-04',
        trangThai: 'Đang mượn',
        yeuCauTraAt: '2026-11-25T09:00:00Z',
        chiTiet: [{ maSach: 2, tenSach: 'Dế Mèn', soLuongSachMuon: 1 }],
      },
    ],
    loanDetails: [
      {
        maPhieuMuon: 100,
        maDocGia: 7,
        fullName: 'Nguyễn Văn A',
        maSach: 1,
        tenSach: 'Clean Code',
        tenTacGia: 'Robert Martin',
        tenTheLoai: 'CNTT',
        soLuongSachMuon: 1,
        ngayMuon: '2026-10-01',
        ngayTra: '2026-10-15',
        ngayTraSach: '2026-10-17',
        trangThai: 'Đã trả',
        yeuCauTraAt: null,
        tienPhat: 10000,
      },
      {
        maPhieuMuon: 102,
        maDocGia: 8,
        fullName: 'Trần Thị B',
        maSach: 2,
        tenSach: 'Dế Mèn',
        tenTacGia: 'Tô Hoài',
        tenTheLoai: 'Thiếu nhi',
        soLuongSachMuon: 1,
        ngayMuon: '2026-11-20',
        ngayTra: '2026-12-04',
        ngayTraSach: null,
        trangThai: 'Đang mượn',
        yeuCauTraAt: '2026-11-25T09:00:00Z',
        tienPhat: 0,
      },
    ],
    books: [
      {
        maSach: 1,
        tenSach: 'Clean Code',
        tenTacGia: 'Robert Martin',
        tenTheLoai: 'CNTT',
        tenNXB: 'NXB Trẻ',
        namXuatBan: 2020,
        nguonGoc: 'Mua mới',
        donGia: 150000,
        soLuongHienCo: 4,
        tongLuotMuon: 12,
      },
    ],
    readers: [
      {
        maDocGia: 7,
        fullName: 'Nguyễn Văn A',
        phai: 'Nam',
        ngaySinh: '2002-05-10',
        dienThoai: '0901234567',
        email: 'a@example.com',
        diaChi: 'Cần Thơ',
        password: 'SECRET_HASH_DO_NOT_EXPORT',
        otp: '999999',
        tongPhieuMuon: 2,
        sachDangMuon: 2,
        tongTienPhat: 10000,
      },
    ],
    authors: [{ maTacGia: 1, tenTacGia: 'Robert Martin', soDienThoai: '0900000001', diaChi: 'USA', soDauSach: 1 }],
    categories: [{ maTheLoai: 1, tenTheLoai: 'CNTT', soDauSach: 1 }],
    publishers: [{ maNXB: 1, tenNXB: 'NXB Trẻ', diaChi: 'HCM', soDauSach: 1 }],
    staff: [{ MSNV: 1, hoTenNV: 'Thủ thư A', chucVu: 'Admin', soDienThoai: '0911111111', diaChi: 'Cần Thơ', password: 'SECRET_STAFF_PASSWORD' }],
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const parsed = new ExcelJS.Workbook();
  await parsed.xlsx.load(buffer);

  // Verify unreturned overdue calculation: 2026-11-20 -> 2026-11-26 = 6 days * 2 copies * 5000 = 60000
  const unreturnedSheet = parsed.getWorksheet('PhieuChuaTra_QuaHan');
  const unreturnedRows = [];
  unreturnedSheet.eachRow((row) => unreturnedRows.push(row.values));
  const row101 = unreturnedRows.find((r) => r.includes(101));
  assert.ok(row101, 'Should include loan #101');
  assert.ok(row101.includes('Quá hạn'));
  assert.ok(row101.includes(6));
  assert.ok(row101.includes(60000));

  const row102 = unreturnedRows.find((r) => r.includes(102));
  assert.ok(row102, 'Should include loan #102');
  assert.ok(row102.includes('Chờ xác nhận trả'));

  // Verify inventory value in KhoSach: 150000 * 4 = 600000
  const booksSheet = parsed.getWorksheet('KhoSach');
  const bookRows = [];
  booksSheet.eachRow((row) => bookRows.push(row.values));
  const cleanCodeRow = bookRows.find((r) => r.includes('Clean Code'));
  assert.ok(cleanCodeRow);
  assert.ok(cleanCodeRow.includes(600000));

  // Verify sensitive fields never appear anywhere in workbook
  const allSerialized = [];
  parsed.eachSheet((ws) => {
    ws.eachRow((row) => {
      row.eachCell((cell) => allSerialized.push(String(cell.value ?? '')));
    });
  });
  const joined = allSerialized.join(' ');
  assert.ok(!joined.includes('SECRET_HASH_DO_NOT_EXPORT'));
  assert.ok(!joined.includes('SECRET_STAFF_PASSWORD'));
  assert.ok(!joined.includes('999999'));
});

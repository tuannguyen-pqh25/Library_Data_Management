const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('book CRUD requires the complete composite key', () => {
  const controller = source('controllers/bookController.js');
  const routes = source('routes/bookRoutes.js');
  assert.match(routes, /:maSach\/:maTacGia\/:maTheLoai/);
  assert.match(controller, /where:\s*(key|bookKey)/);
  assert.match(controller, /const bookKey =/);
});

test('loan endpoints use reader composite key and approved statuses with trigger-owned stock/fines', () => {
  const controller = source('controllers/borrowController.js');
  const routes = source('routes/borrowRoutes.js');
  for (const status of ['Chờ duyệt', 'Đang mượn', 'Đã trả', 'Từ chối']) assert.ok(controller.includes(status));
  assert.match(controller, /where:\s*\{\s*maPhieuMuon,\s*maDocGia\s*\}/);
  assert.match(routes, /:maPhieuMuon\/:maDocGia/);
  assert.match(routes, /export\/borrow\/:maPhieuMuon\/:maDocGia/);
  assert.match(routes, /export\/return\/:maPhieuTra\/:maChiTietPM/);
  assert.match(controller, /maTacGia: detail\.maTacGia, maTheLoai: detail\.maTheLoai/);
  assert.match(controller, /maPhieuMuon: phieuMuon\.maPhieuMuon, maDocGia: phieuMuon\.maDocGia/);
  assert.match(controller, /maChiTietPM: detail\.maChiTietPM, maPhieuMuon: detail\.maPhieuMuon, maSach: detail\.maSach/);
  assert.match(controller, /request\.trangThai === 'Chờ duyệt'[\s\S]*\['Đang mượn', 'Từ chối'\]/);
  assert.match(controller, /request\.trangThai === 'Đang mượn' \? \['Đã trả'\]/);
  assert.doesNotMatch(controller, /PhieuMuon\.findByPk\(|PhieuTra\.findByPk\(|daysLate\s*\*\s*1000/);
  assert.match(source('controllers/reportController.js'), /sp_danh_sach_phieu_muon_chua_tra/);
  assert.match(controller, /soLuongHienCo\s*-=\s*quantity/);
  assert.doesNotMatch(controller, /daysLate\s*\*\s*1000/);
});

test('reader registration and profile use fullName, not split legacy names', () => {
  const auth = source('controllers/authController.js');
  const user = source('controllers/userController.js');
  assert.match(auth, /fullName/);
  assert.match(auth, /name:\s*type === 'admin' \? user\.hoTenNV : user\.fullName/);
  assert.doesNotMatch(auth, /hoLot|user\.ten/);
  assert.match(user, /allowedUpdates = \['fullName'/);
  assert.doesNotMatch(user, /hoLot|\['ten'/);
});

test('reader status endpoint calls the one-argument procedure and parses its SELECT row', async () => {
  const authSource = source('controllers/authController.js');
  assert.match(authSource, /CALL sp_check_reader_status\(:maDocGia\)/);
  assert.doesNotMatch(authSource, /sp_check_reader_status\([^)]*@hasPendingLoan/);
  assert.match(source('routes/authRoutes.js'), /check-reader-status\/:maDocGia/);

  const modelPath = require.resolve('../models');
  const authPath = require.resolve('../controllers/authController');
  const priorModel = require.cache[modelPath];
  const priorAuth = require.cache[authPath];
  const calls = [];
  const mockModule = new (require('node:module'))(modelPath);
  mockModule.filename = modelPath;
  mockModule.loaded = true;
  mockModule.exports = { sequelize: { query: async (sql, options) => {
    calls.push({ sql, options });
    return [{ hasPendingLoan: 2 }];
  } } };
  require.cache[modelPath] = mockModule;
  delete require.cache[authPath];
  try {
    const { checkReaderStatus } = require('../controllers/authController');
    const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; } };
    await checkReaderStatus({ params: { maDocGia: '17' } }, response);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].sql, 'CALL sp_check_reader_status(:maDocGia)');
    assert.deepEqual(calls[0].options.replacements, { maDocGia: 17 });
    assert.deepEqual(response.body, { maDocGia: 17, hasPendingLoan: 2 });
  } finally {
    delete require.cache[authPath];
    if (priorAuth) require.cache[authPath] = priorAuth;
    if (priorModel) require.cache[modelPath] = priorModel;
    else delete require.cache[modelPath];
  }
});

test('admin report endpoints call the approved SQL procedures', () => {
  const report = source('controllers/reportController.js');
  const routes = source('routes/reportRoutes.js');
  for (const routine of ['sp_danh_sach_phieu_muon_chua_tra', 'sp_thong_ke_sach_muon_thang', 'sp_thong_ke_doc_gia_muon_sach_nam']) {
    assert.ok(report.includes(routine), `missing ${routine}`);
  }
  assert.match(report, /tongSachMuonThang/);
  assert.match(report, /tongDocGiaMuonSachNam/);
  assert.match(routes, /adminAuth/);
  assert.match(source('server.js'), /reportRoutes/);
});

test('report handlers return procedure rows and statistics aliases', async () => {
  const modelPath = require.resolve('../models');
  const reportPath = require.resolve('../controllers/reportController');
  const priorModel = require.cache[modelPath];
  const priorReport = require.cache[reportPath];
  const calls = [];
  const mockModule = new (require('node:module'))(modelPath);
  mockModule.filename = modelPath;
  mockModule.loaded = true;
  mockModule.exports = { sequelize: { query: async (sql) => {
    calls.push(sql);
    if (sql.includes('sp_danh_sach')) return [[{ maPhieuMuon: 31, trangThai: 'Đang mượn' }]];
    if (sql.includes('sp_thong_ke_sach')) return [[{ tongSachMuonThang: 4 }]];
    return [[{ tongDocGiaMuonSachNam: 2 }]];
  } } };
  require.cache[modelPath] = mockModule;
  delete require.cache[reportPath];
  try {
    const { getUnreturnedLoans, getStatistics } = require('../controllers/reportController');
    const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    await getUnreturnedLoans({}, response);
    assert.deepEqual(response.body, [{ maPhieuMuon: 31, trangThai: 'Đang mượn' }]);
    await getStatistics({}, response);
    assert.deepEqual(response.body, { tongSachMuonThang: 4, tongDocGiaMuonSachNam: 2 });
    assert.equal(calls.length, 3);
  } finally {
    delete require.cache[reportPath];
    if (priorReport) require.cache[reportPath] = priorReport;
    if (priorModel) require.cache[modelPath] = priorModel;
    else delete require.cache[modelPath];
  }
});

test('server startup authenticates without mutating schema', () => {
  const server = source('server.js');
  assert.match(server, /sequelize\.authenticate\(\)/);
  assert.doesNotMatch(server, /sequelize\.sync\(/);
});

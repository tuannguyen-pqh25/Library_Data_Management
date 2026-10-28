const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

async function loadReportController(query) {
  const modelPath = require.resolve('../models');
  const controllerPath = require.resolve('../controllers/reportController');
  const previousModels = require.cache[modelPath];
  const previousController = require.cache[controllerPath];
  const mock = new Module(modelPath);
  mock.filename = modelPath;
  mock.loaded = true;
  mock.exports = { sequelize: { query } };
  require.cache[modelPath] = mock;
  delete require.cache[controllerPath];
  const controller = require('../controllers/reportController');
  return {
    controller,
    restore() {
      delete require.cache[controllerPath];
      if (previousController) require.cache[controllerPath] = previousController;
      if (previousModels) require.cache[modelPath] = previousModels;
      else delete require.cache[modelPath];
    },
  };
}

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('dashboard summary returns the two procedure statistics and counts unreturned loans', async () => {
  const calls = [];
  const loaded = await loadReportController(async (sql) => {
    calls.push(sql);
    if (sql.includes('sp_thong_ke_sach_muon_thang')) return [[{ tongSachMuonThang: 7 }]];
    if (sql.includes('sp_thong_ke_doc_gia_muon_sach_nam')) return [[{ tongDocGiaMuonSachNam: 3 }]];
    return [{ phieuChuaTra: 2 }];
  });
  try {
    const res = response();
    await loaded.controller.getDashboardSummary({}, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { sachMuonThang: 7, docGiaMuonNam: 3, phieuChuaTra: 2 });
    assert.equal(calls.length, 3);
  } finally { loaded.restore(); }
});

test('dashboard summary returns numeric zeros for a database with no activity', async () => {
  const loaded = await loadReportController(async (sql) => {
    if (sql.includes('sp_thong_ke_sach_muon_thang')) return [[{ tongSachMuonThang: null }]];
    if (sql.includes('sp_thong_ke_doc_gia_muon_sach_nam')) return [[{ tongDocGiaMuonSachNam: 0 }]];
    return [{ phieuChuaTra: 0 }];
  });
  try {
    const res = response();
    await loaded.controller.getDashboardSummary({}, res);
    assert.deepEqual(res.body, { sachMuonThang: 0, docGiaMuonNam: 0, phieuChuaTra: 0 });
  } finally { loaded.restore(); }
});

test('dashboard summary returns an error when a statistics procedure yields no result row', async () => {
  const loaded = await loadReportController(async (sql) => {
    if (sql.includes('sp_thong_ke')) return [];
    return [{ phieuChuaTra: 0 }];
  });
  try {
    const res = response();
    await loaded.controller.getDashboardSummary({}, res);
    assert.equal(res.statusCode, 500);
    assert.match(res.body.message, /Unexpected result shape/);
  } finally { loaded.restore(); }
});

test('unreturned-loan API folds joined rows into loans with detailed books', async () => {
  const rows = [
    { maPhieuMuon: 8, maDocGia: 4, fullName: 'Reader', ngayMuon: '2026-10-01', ngayTra: '2026-10-15', trangThai: 'Đang mượn', maChiTietPM: 9, maSach: 2, maTacGia: 3, maTheLoai: 5, tenSach: 'Book A', soLuongSachMuon: 1 },
    { maPhieuMuon: 8, maDocGia: 4, fullName: 'Reader', ngayMuon: '2026-10-01', ngayTra: '2026-10-15', trangThai: 'Đang mượn', maChiTietPM: 10, maSach: 6, maTacGia: 7, maTheLoai: 5, tenSach: 'Book B', soLuongSachMuon: 2 },
  ];
  const loaded = await loadReportController(async () => rows);
  try {
    const res = response();
    await loaded.controller.getDetailedUnreturnedLoans({}, res);
    assert.deepEqual(res.body, [{
      maPhieuMuon: 8, maDocGia: 4, fullName: 'Reader', ngayMuon: '2026-10-01', ngayTra: '2026-10-15', trangThai: 'Đang mượn',
      chiTiet: [
        { maChiTietPM: 9, maPhieuMuon: 8, maDocGia: 4, maSach: 2, maTacGia: 3, maTheLoai: 5, tenSach: 'Book A', soLuongSachMuon: 1 },
        { maChiTietPM: 10, maPhieuMuon: 8, maDocGia: 4, maSach: 6, maTacGia: 7, maTheLoai: 5, tenSach: 'Book B', soLuongSachMuon: 2 },
      ],
    }]);
  } finally { loaded.restore(); }
});

test('statistics endpoints are exposed only through the authenticated admin report router', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const routes = source('routes/reportRoutes.js');
  const server = source('server.js');
  assert.match(routes, /router\.get\('\/tong-quan',\s*getDashboardSummary\)/);
  assert.match(routes, /router\.get\('\/phieu-chua-tra',\s*getDetailedUnreturnedLoans\)/);
  assert.match(routes, /router\.use\(auth,\s*adminAuth\)/);
  assert.match(server, /app\.use\('\/api\/thong-ke',\s*reportRoutes\)/);
});

test('statistics authorization rejects anonymous and reader requests', async () => {
  const modelPath = require.resolve('../models');
  const authPath = require.resolve('../middlewares/authMiddleware');
  const previousModels = require.cache[modelPath];
  const previousAuth = require.cache[authPath];
  const mock = new (require('node:module'))(modelPath);
  mock.filename = modelPath;
  mock.loaded = true;
  mock.exports = {
    DocGia: { findByPk: async (id) => ({ maDocGia: id }) },
    NhanVien: { findByPk: async (id) => ({ MSNV: id }) },
  };
  require.cache[modelPath] = mock;
  delete require.cache[authPath];
  const { auth, adminAuth } = require('../middlewares/authMiddleware');
  const jwt = require('jsonwebtoken');
  const priorSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'stats-test-secret';
  const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; } });
  try {
    const anonymous = response();
    await auth({ header: () => undefined }, anonymous, () => {});
    assert.equal(anonymous.statusCode, 401);

    const reader = response();
    const request = {
      header: () => `Bearer ${jwt.sign({ id: 7, role: 'reader' }, process.env.JWT_SECRET)}`,
    };
    await auth(request, reader, () => {});
    assert.equal(request.userType, 'reader');
    await adminAuth(request, reader, () => {});
    assert.equal(reader.statusCode, 403);
  } finally {
    if (priorSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = priorSecret;
    delete require.cache[authPath];
    if (previousAuth) require.cache[authPath] = previousAuth;
    if (previousModels) require.cache[modelPath] = previousModels;
    else delete require.cache[modelPath];
  }
});

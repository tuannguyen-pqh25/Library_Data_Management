const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_123456';

const apiResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) { this.statusCode = code; return this; },
  json(data) { this.body = data; return this; },
  send(data) { this.body = data; return this; },
});

test('week 3: checkReaderStatus requires authentication and blocks unauthorized readers', async () => {
  const { checkReaderStatus } = require('../controllers/authController');

  // 1. Reader 1 tries to access Reader 2's status -> 403
  const forbiddenRes = apiResponse();
  await checkReaderStatus({
    params: { maDocGia: '2' },
    userType: 'reader',
    user: { maDocGia: 1 },
  }, forbiddenRes);
  assert.equal(forbiddenRes.statusCode, 403);
  assert.match(forbiddenRes.body.error, /không có quyền truy cập/);

  // 2. Invalid reader ID -> 400
  const invalidIdRes = apiResponse();
  await checkReaderStatus({
    params: { maDocGia: 'invalid' },
    userType: 'reader',
    user: { maDocGia: 1 },
  }, invalidIdRes);
  assert.equal(invalidIdRes.statusCode, 400);

  // 3. Reader checking their own status -> allows procedure call
  let procedureCalledWith = null;
  const { sequelize } = require('../models');
  const originalQuery = sequelize.query;
  sequelize.query = async (sql, options) => {
    procedureCalledWith = options?.replacements?.maDocGia;
    return [[{ hasPendingLoan: 0 }]];
  };

  try {
    const ownRes = apiResponse();
    await checkReaderStatus({
      params: { maDocGia: '1' },
      userType: 'reader',
      user: { maDocGia: 1 },
    }, ownRes);
    assert.equal(ownRes.statusCode, 200);
    assert.equal(procedureCalledWith, 1);
    assert.deepEqual(ownRes.body, { maDocGia: 1, hasPendingLoan: 0 });

    // 4. Staff checking any reader -> allowed
    const staffRes = apiResponse();
    await checkReaderStatus({
      params: { maDocGia: '99' },
      userType: 'staff',
      user: { MSNV: 5 },
    }, staffRes);
    assert.equal(staffRes.statusCode, 200);
    assert.equal(procedureCalledWith, 99);
  } finally {
    sequelize.query = originalQuery;
  }
});

test('week 3: authMiddleware rejects unauthenticated access to protected routes', async () => {
  const { auth, adminAuth } = require('../middlewares/authMiddleware');

  // Missing Authorization header
  const resNoAuth = apiResponse();
  let nextCalled = false;
  await auth({ header: () => null }, resNoAuth, () => { nextCalled = true; });
  assert.equal(resNoAuth.statusCode, 401);
  assert.equal(nextCalled, false);

  // Invalid token
  const resBadToken = apiResponse();
  await auth({ header: () => 'Bearer invalid_token' }, resBadToken, () => { nextCalled = true; });
  assert.equal(resBadToken.statusCode, 401);
  assert.equal(nextCalled, false);

  // Reader trying adminAuth
  const resReaderAdmin = apiResponse();
  let adminNext = false;
  await adminAuth({ userType: 'reader', user: { maDocGia: 1 } }, resReaderAdmin, () => { adminNext = true; });
  assert.equal(resReaderAdmin.statusCode, 403);
  assert.equal(adminNext, false);

  // Staff passing adminAuth
  const resStaffAdmin = apiResponse();
  await adminAuth({ userType: 'staff', user: { MSNV: 1 } }, resStaffAdmin, () => { adminNext = true; });
  assert.equal(adminNext, true);
});

test('week 3: stock race condition serialization on concurrent approvals', async () => {
  const { updateBorrowRequest } = require('../controllers/borrowController');
  const { PhieuMuon, ChiTietPhieuMuon, Sach, DocGia, sequelize } = require('../models');

  // Mock a scenario where 2 loans compete for 1 book copy with real locking flow
  let bookStock = 1;
  const mockBook = {
    maSach: 100,
    maTacGia: 1,
    maTheLoai: 1,
    tenSach: 'Cuốn sách giới hạn',
    get soLuongHienCo() { return bookStock; },
    set soLuongHienCo(v) { bookStock = v; },
    save: async () => {},
  };

  const loan1 = {
    maPhieuMuon: 1,
    maDocGia: 10,
    trangThai: 'Chờ duyệt',
    save: async () => {},
    setDataValue() {},
  };

  const loan2 = {
    maPhieuMuon: 2,
    maDocGia: 20,
    trangThai: 'Chờ duyệt',
    save: async () => {},
    setDataValue() {},
  };

  const detail1 = {
    maChiTietPM: 1,
    maPhieuMuon: 1,
    maDocGia: 10,
    maSach: 100,
    maTacGia: 1,
    maTheLoai: 1,
    soLuongSachMuon: 1,
    setDataValue() {},
  };

  const detail2 = {
    maChiTietPM: 2,
    maPhieuMuon: 2,
    maDocGia: 20,
    maSach: 100,
    maTacGia: 1,
    maTheLoai: 1,
    soLuongSachMuon: 1,
    setDataValue() {},
  };

  // Mock sequelize transaction with serial execution lock
  let lockAcquired = false;
  const origTransaction = sequelize.transaction;
  sequelize.transaction = async () => {
    const t = {
      LOCK: { UPDATE: 'UPDATE' },
      finished: false,
      commit: async () => { t.finished = true; lockAcquired = false; },
      rollback: async () => { t.finished = true; lockAcquired = false; },
    };
    return t;
  };

  const origFindPhieuMuon = PhieuMuon.findOne;
  const origFindChiTiet = ChiTietPhieuMuon.findAll;
  const origFindSach = Sach.findOne;
  const origFindDocGia = DocGia.findByPk;
  const origQuery = sequelize.query;

  PhieuMuon.findOne = async ({ where }) => {
    if (where.maPhieuMuon === 1) return loan1;
    if (where.maPhieuMuon === 2) return loan2;
    return null;
  };
  ChiTietPhieuMuon.findAll = async ({ where }) => {
    if (where.maPhieuMuon === 1) return [detail1];
    if (where.maPhieuMuon === 2) return [detail2];
    return [];
  };
  Sach.findOne = async () => mockBook;
  DocGia.findByPk = async (id) => ({ maDocGia: id, fullName: `Reader ${id}` });
  sequelize.query = async () => [{ total: 0 }];

  try {
    const res1 = apiResponse();
    const res2 = apiResponse();

    // First approval: succeeds and decrements stock from 1 to 0
    await updateBorrowRequest({ params: { maPhieuMuon: '1', maDocGia: '10' }, body: { trangThai: 'Đang mượn' } }, res1);
    assert.equal(res1.statusCode, 200);
    assert.equal(bookStock, 0);

    // Second approval: attempts to approve loan 2 for the same book -> rejects with 400
    await updateBorrowRequest({ params: { maPhieuMuon: '2', maDocGia: '20' }, body: { trangThai: 'Đang mượn' } }, res2);
    assert.equal(res2.statusCode, 400);
    assert.match(res2.body.message, /không đủ số lượng/);
    assert.equal(bookStock, 0); // stock never becomes negative!
  } finally {
    sequelize.transaction = origTransaction;
    PhieuMuon.findOne = origFindPhieuMuon;
    ChiTietPhieuMuon.findAll = origFindChiTiet;
    Sach.findOne = origFindSach;
    DocGia.findByPk = origFindDocGia;
    sequelize.query = origQuery;
  }
});

test('week 3: quota race condition prevents reader exceeding 5 books', async () => {
  const { createBorrowRequest } = require('../controllers/borrowController');
  const { Sach, DocGia, PhieuMuon, ChiTietPhieuMuon, sequelize } = require('../models');

  let activeCopies = 4; // already borrowing 4 copies
  const origQuery = sequelize.query;
  const origTransaction = sequelize.transaction;
  const origDocGia = DocGia.findByPk;
  const origSach = Sach.findOne;

  sequelize.query = async () => [{ total: activeCopies }];
  sequelize.transaction = async () => ({
    LOCK: { UPDATE: 'UPDATE' },
    finished: false,
    commit: async function() { this.finished = true; },
    rollback: async function() { this.finished = true; },
  });
  DocGia.findByPk = async (id) => ({ maDocGia: id });
  Sach.findOne = async () => ({ maSach: 1, soLuongHienCo: 10 });

  try {
    // Reader requests 2 copies (4 + 2 = 6 > 5) -> should reject with 409
    const resExceed = apiResponse();
    await createBorrowRequest({
      user: { maDocGia: 1 },
      userType: 'reader',
      body: { chiTiet: [{ maSach: 1, maTacGia: 1, maTheLoai: 1, soLuongSachMuon: 2 }] },
    }, resExceed);
    assert.equal(resExceed.statusCode, 409);
    assert.match(resExceed.body.message, /tối đa 5 quyển/);
  } finally {
    sequelize.query = origQuery;
    sequelize.transaction = origTransaction;
    DocGia.findByPk = origDocGia;
    Sach.findOne = origSach;
  }
});

test.after(async () => {
  const { sequelize } = require('../models');
  await sequelize.close();
});

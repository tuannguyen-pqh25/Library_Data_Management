const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

async function loadBorrowController(models) {
  const modelPath = require.resolve('../models');
  const controllerPath = require.resolve('../controllers/borrowController');
  const previousModels = require.cache[modelPath];
  const previousController = require.cache[controllerPath];
  const mock = new Module(modelPath);
  mock.filename = modelPath;
  mock.loaded = true;
  mock.exports = models;
  require.cache[modelPath] = mock;
  delete require.cache[controllerPath];
  const controller = require('../controllers/borrowController');
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

function baseModels(overrides = {}) {
  const operations = overrides.operations || [];
  const transaction = {
    LOCK: { UPDATE: 'UPDATE' },
    finished: false,
    async commit() { operations.push('commit'); this.finished = 'commit'; },
    async rollback() { operations.push('rollback'); this.finished = 'rollback'; },
  };
  const models = {
    sequelize: {
      transaction: async () => transaction,
      query: async () => [{ total: 0 }],
      QueryTypes: { SELECT: 'SELECT' },
    },
    PhieuMuon: {
      create: async (values) => ({ ...values, maPhieuMuon: 10, async save() { operations.push(`loan:${this.trangThai}`); } }),
      findOne: async () => null,
    },
    ChiTietPhieuMuon: {
      create: async (values) => { operations.push(['detail', values]); },
      findAll: async () => [],
    },
    PhieuTra: { findOne: async () => null, findAll: async () => [], create: async (values) => { operations.push(['return', values]); } },
    Sach: {
      findOne: async () => ({ tenSach: 'Book', soLuongHienCo: 2, async save() { operations.push(`stock:${this.soLuongHienCo}`); } }),
    },
    DocGia: {
      findByPk: async (id) => ({ maDocGia: id }),
    },
    operations,
    transaction,
  };
  return Object.assign(models, overrides);
}

test('borrow request rejects zero quantity without inserting a detail', async () => {
  const models = baseModels();
  const loaded = await loadBorrowController(models);
  try {
    const res = response();
    await loaded.controller.createBorrowRequest({
      body: { chiTiet: [{ maSach: 1, maTacGia: 2, maTheLoai: 3, soLuongSachMuon: 0 }] },
      user: { maDocGia: 4 },
      userType: 'reader',
    }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(models.operations.some((op) => Array.isArray(op) && op[0] === 'detail'), false);
  } finally { loaded.restore(); }
});

test('valid borrow request writes details without locking or changing inventory', async () => {
  const models = baseModels();
  let stockUpdates = 0;
  models.Sach.findOne = async () => ({ maSach: 1, tenSach: 'Book', soLuongHienCo: 5, async save() { stockUpdates += 1; } });
  const loaded = await loadBorrowController(models);
  try {
    const res = response();
    await loaded.controller.createBorrowRequest({
      body: { chiTiet: [{ maSach: 1, maTacGia: 2, maTheLoai: 3, soLuongSachMuon: 1 }] },
      user: { maDocGia: 4 },
      userType: 'reader',
    }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(stockUpdates, 0);
    assert.equal(models.operations.some((op) => typeof op === 'string' && op.startsWith('stock:')), false);
  } finally { loaded.restore(); }
});

test('approval rolls back without partial inventory updates when any requested book is unavailable', async () => {
  const operations = [];
  const loan = { maPhieuMuon: 10, maDocGia: 4, trangThai: 'Chờ duyệt', async save() { operations.push(`loan:${this.trangThai}`); } };
  const models = baseModels({
    operations,
    PhieuMuon: { findOne: async () => loan },
    ChiTietPhieuMuon: { findAll: async () => [
      { maChiTietPM: 1, maPhieuMuon: 10, maDocGia: 4, maSach: 2, maTacGia: 3, maTheLoai: 5, soLuongSachMuon: 1, setDataValue() {} },
      { maChiTietPM: 2, maPhieuMuon: 10, maDocGia: 4, maSach: 6, maTacGia: 7, maTheLoai: 5, soLuongSachMuon: 2, setDataValue() {} },
    ] },
    Sach: { findOne: async ({ where }) => ({ ...where, tenSach: 'Book', soLuongHienCo: where.maSach === 2 ? 1 : 1, async save() { operations.push('stock-save'); } }) },
  });
  const loaded = await loadBorrowController(models);
  try {
    const res = response();
    await loaded.controller.updateBorrowRequest({
      params: { maPhieuMuon: '10', maDocGia: '4' }, body: { trangThai: 'Đang mượn' },
    }, res);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(operations, ['rollback']);
    assert.equal(models.transaction.finished, 'rollback');
  } finally { loaded.restore(); }
});

test('approval atomically decrements inventory and changes the loan state', async () => {
  const operations = [];
  const loan = { maPhieuMuon: 10, maDocGia: 4, trangThai: 'Chờ duyệt', async save() { operations.push(`loan:${this.trangThai}`); } };
  const book = { tenSach: 'Book', soLuongHienCo: 2, async save({ transaction }) { operations.push(`stock:${this.soLuongHienCo}:${transaction === models.transaction}`); } };
  const models = baseModels({
    operations,
    PhieuMuon: { findOne: async () => loan },
    ChiTietPhieuMuon: { findAll: async () => [{ maChiTietPM: 1, maPhieuMuon: 10, maDocGia: 4, maSach: 2, maTacGia: 3, maTheLoai: 5, soLuongSachMuon: 1, setDataValue() {} }] },
    Sach: { findOne: async () => book },
  });
  const loaded = await loadBorrowController(models);
  try {
    const res = response();
    await loaded.controller.updateBorrowRequest({
      params: { maPhieuMuon: '10', maDocGia: '4' }, body: { trangThai: 'Đang mượn' },
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(book.soLuongHienCo, 1);
    assert.equal(loan.trangThai, 'Đang mượn');
    assert.deepEqual(operations, ['stock:1:true', 'loan:Đang mượn', 'commit']);
  } finally { loaded.restore(); }
});

test('return inserts the fine-triggered return and atomically restores inventory', async () => {
  const operations = [];
  const loan = { maPhieuMuon: 10, maDocGia: 4, trangThai: 'Đang mượn', yeuCauTraAt: new Date(), async save() { operations.push(`loan:${this.trangThai}`); } };
  const book = { soLuongHienCo: 1, async save({ transaction }) { operations.push(`stock:${this.soLuongHienCo}:${transaction === models.transaction}`); } };
  const models = baseModels({
    operations,
    PhieuMuon: { findOne: async () => loan },
    ChiTietPhieuMuon: {
      findAll: async () => [{ maChiTietPM: 1, maPhieuMuon: 10, maDocGia: 4, maSach: 2, maTacGia: 3, maTheLoai: 5, soLuongSachMuon: 2, setDataValue() {} }],
    },
    Sach: { findOne: async () => book },
    PhieuTra: { findOne: async () => null, findAll: async () => [], create: async (values, options) => operations.push(`return:${values.maChiTietPM}:${options.transaction === models.transaction}`) },
  });
  const loaded = await loadBorrowController(models);
  try {
    const res = response();
    await loaded.controller.updateBorrowRequest({
      params: { maPhieuMuon: '10', maDocGia: '4' }, body: { trangThai: 'Đã trả' },
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(book.soLuongHienCo, 3);
    assert.deepEqual(operations, ['return:1:true', 'stock:3:true', 'loan:Đã trả', 'commit']);
  } finally { loaded.restore(); }
});

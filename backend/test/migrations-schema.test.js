const test = require('node:test');
const assert = require('node:assert/strict');
const { DataTypes } = require('sequelize');

const migrations = {
  DocGia: require('../migrations/20251010125722-create-docgia'),
  Sach: require('../migrations/20251010140904-create-sach'),
  PhieuMuon: require('../migrations/20251010140940-create-phieumuon'),
  ChiTietPhieuMuon: require('../migrations/20251010140957-create-chitietphieumuon'),
  PhieuTra: require('../migrations/20251010141034-create-phieutra'),
};

async function inspectTable(name) {
  let columns;
  const constraints = [];
  await migrations[name].up({
    createTable: async (table, definitions) => {
      assert.equal(table, name);
      columns = definitions;
    },
    addConstraint: async (table, options) => constraints.push({ table, ...options }),
  }, DataTypes);
  return { columns, constraints };
}

function keyColumns(columns) {
  return Object.entries(columns).filter(([, column]) => column.primaryKey).map(([name]) => name);
}

test('migrations declare the exact composite primary keys without single-column unique constraints', async () => {
  const expected = {
    Sach: ['maSach', 'maTacGia', 'maTheLoai'],
    PhieuMuon: ['maPhieuMuon', 'maDocGia'],
    ChiTietPhieuMuon: ['maChiTietPM', 'maPhieuMuon', 'maSach'],
    PhieuTra: ['maPhieuTra', 'maChiTietPM'],
  };
  for (const [table, keys] of Object.entries(expected)) {
    const { columns } = await inspectTable(table);
    assert.deepEqual(keyColumns(columns), keys, table);
    for (const key of keys) assert.notEqual(columns[key].unique, true, `${table}.${key}`);
  }
});

test('reader migration uses fullName and loan migration uses only approved statuses', async () => {
  const reader = await inspectTable('DocGia');
  const loan = await inspectTable('PhieuMuon');
  assert.ok(reader.columns.fullName);
  assert.equal(reader.columns.hoLot, undefined);
  assert.equal(reader.columns.ten, undefined);
  assert.deepEqual(loan.columns.trangThai.type.values, ['Chờ duyệt', 'Đang mượn', 'Đã trả', 'Từ chối']);
});

test('detail and return migrations constrain complete parent keys', async () => {
  const detail = await inspectTable('ChiTietPhieuMuon');
  const returned = await inspectTable('PhieuTra');
  for (const field of ['maDocGia', 'maTacGia', 'maTheLoai']) {
    assert.ok(detail.columns[field], `detail.${field} missing`);
    assert.equal(detail.columns[field].allowNull, false, `detail.${field}`);
  }
  for (const field of ['maPhieuMuon', 'maSach']) {
    assert.ok(returned.columns[field], `return.${field} missing`);
    assert.equal(returned.columns[field].allowNull, false, `return.${field}`);
  }
  const foreignKeys = (table) => table.constraints
    .filter((constraint) => constraint.type === 'foreign key')
    .map(({ fields, references }) => ({ fields, table: references.table, keys: references.fields }));
  assert.deepEqual(foreignKeys(detail), [
    { fields: ['maPhieuMuon', 'maDocGia'], table: 'PhieuMuon', keys: ['maPhieuMuon', 'maDocGia'] },
    { fields: ['maSach', 'maTacGia', 'maTheLoai'], table: 'Sach', keys: ['maSach', 'maTacGia', 'maTheLoai'] },
  ]);
  assert.deepEqual(foreignKeys(returned), [
    { fields: ['maChiTietPM', 'maPhieuMuon', 'maSach'], table: 'ChiTietPhieuMuon', keys: ['maChiTietPM', 'maPhieuMuon', 'maSach'] },
  ]);
});

test('additive return migration enforces one return per detail without changing the required primary key', async () => {
  const initial = await inspectTable('PhieuTra');
  assert.deepEqual(keyColumns(initial.columns), ['maPhieuTra', 'maChiTietPM']);
  assert.equal(initial.constraints.some((constraint) => constraint.type === 'unique' && constraint.fields.join(',') === 'maChiTietPM'), false);

  const migration = require('../migrations/20260930120000-unique-return-detail');
  const constraints = [];
  const queries = [];
  await migration.up({
    showIndex: async () => [],
    addConstraint: async (table, options) => constraints.push({ table, ...options }),
    sequelize: { query: async (sql) => queries.push(sql) },
  }, DataTypes);
  assert.ok(constraints.some((constraint) => constraint.table === 'PhieuTra' && constraint.type === 'unique' && constraint.fields.join(',') === 'maChiTietPM'));
  const trigger = queries.find((query) => /CREATE TRIGGER trg_tinh_tien_phat\b/i.test(query));
  assert.ok(trigger);
  assert.match(trigger, /FROM ChiTietPhieuMuon/i);
  assert.doesNotMatch(trigger, /FROM PhieuTra/i);

  const removed = [];
  const downQueries = [];
  await migration.down({
    showIndex: async () => [{ name: 'uq_phieutra_maChiTietPM', unique: true, fields: [{ attribute: 'maChiTietPM' }] }],
    removeConstraint: async (table, name) => removed.push({ table, name }),
    sequelize: { query: async (sql) => downQueries.push(sql) },
  }, DataTypes);
  assert.deepEqual(removed, [{ table: 'PhieuTra', name: 'uq_phieutra_maChiTietPM' }]);
  assert.ok(downQueries.some((query) => /CREATE TRIGGER trg_tinh_tien_phat\b/i.test(query)));
});

test('additive return migration retry recognizes its unique index and still recreates the trigger', async () => {
  const migration = require('../migrations/20260930120000-unique-return-detail');
  const queries = [];
  let addCalls = 0;
  await migration.up({
    showIndex: async () => [{ name: 'uq_phieutra_maChiTietPM', unique: true, fields: [{ attribute: 'maChiTietPM' }] }],
    addConstraint: async () => { addCalls += 1; },
    sequelize: { query: async (sql) => queries.push(sql) },
  }, DataTypes);
  assert.equal(addCalls, 0);
  assert.ok(queries.some((query) => /DROP TRIGGER IF EXISTS trg_tinh_tien_phat/i.test(query)));
  assert.ok(queries.some((query) => /CREATE TRIGGER trg_tinh_tien_phat\b/i.test(query)));
});

test('additive return migration down tolerates a retry after the index is already removed', async () => {
  const migration = require('../migrations/20260930120000-unique-return-detail');
  const queries = [];
  let removeCalls = 0;
  await migration.down({
    showIndex: async () => [],
    removeConstraint: async () => { removeCalls += 1; },
    sequelize: { query: async (sql) => queries.push(sql) },
  }, DataTypes);
  assert.equal(removeCalls, 0);
  assert.ok(queries.some((query) => /DROP TRIGGER IF EXISTS trg_tinh_tien_phat/i.test(query)));
  assert.ok(queries.some((query) => /CREATE TRIGGER trg_tinh_tien_phat\b/i.test(query)));
});

test('database routines use complete keys, due date, quantities and actual-loan statuses', async () => {
  const queries = [];
  await require('../migrations/20251010141232-add-func-trig-proc').up({
    sequelize: { query: async (sql) => queries.push(sql) },
  }, DataTypes);
  const create = (kind, name) => {
    const sql = queries.find((query) => new RegExp(`CREATE ${kind} ${name}\\b`, 'i').test(query));
    assert.ok(sql, `${kind} ${name} missing`);
    return sql;
  };
  const inventory = create('FUNCTION', 'fn_kiem_tra_so_luong_sach');
  assert.match(inventory, /maSach_in\s+INT\s*,\s*maTacGia_in\s+INT\s*,\s*maTheLoai_in\s+INT/i);
  assert.match(inventory, /maSach\s*=\s*maSach_in\s+AND\s+maTacGia\s*=\s*maTacGia_in\s+AND\s+maTheLoai\s*=\s*maTheLoai_in/i);
  assert.match(inventory, /NOT DETERMINISTIC READS SQL DATA/i);

  const fine = create('TRIGGER', 'trg_tinh_tien_phat');
  assert.match(fine, /PhieuMuon\.ngayTra/i);
  assert.match(fine, /DATEDIFF\s*\(\s*NEW\.ngayTraSach\s*,\s*ngayTraDuKien\s*\)/i);
  assert.match(fine, /GREATEST\s*\(\s*0\s*,/i);
  assert.match(fine, /1000\s*\*\s*soLuongSachMuon|soLuongSachMuon\s*\*\s*1000/i);
  assert.match(fine, /maChiTietPM\s*=\s*NEW\.maChiTietPM/i);
  assert.match(fine, /maPhieuMuon\s*=\s*NEW\.maPhieuMuon/i);
  assert.match(fine, /maSach\s*=\s*NEW\.maSach/i);

  const unreturned = create('PROCEDURE', 'sp_danh_sach_phieu_muon_chua_tra');
  assert.match(unreturned, /trangThai\s*=\s*'Đang mượn'/i);
  const monthly = create('PROCEDURE', 'sp_thong_ke_sach_muon_thang');
  assert.match(monthly, /SUM\s*\(\s*ChiTietPhieuMuon\.soLuongSachMuon\s*\)/i);
  assert.match(monthly, /trangThai\s+IN\s*\(\s*'Đang mượn'\s*,\s*'Đã trả'\s*\)/i);
  assert.match(monthly, /ChiTietPhieuMuon\.maDocGia\s*=\s*PhieuMuon\.maDocGia/i);
  assert.match(monthly, /MONTH\s*\(\s*PhieuMuon\.ngayMuon\s*\)\s*=\s*MONTH\s*\(\s*CURRENT_DATE\(\)\s*\)/i);
  const yearly = create('PROCEDURE', 'sp_thong_ke_doc_gia_muon_sach_nam');
  assert.match(yearly, /COUNT\s*\(\s*DISTINCT\s+maDocGia\s*\)/i);
  assert.match(yearly, /trangThai\s+IN\s*\(\s*'Đang mượn'\s*,\s*'Đã trả'\s*\)/i);
  assert.match(yearly, /YEAR\s*\(\s*ngayMuon\s*\)\s*=\s*YEAR\s*\(\s*CURRENT_DATE\(\)\s*\)/i);
});

test('return trigger reads only the detail and leaves duplicate protection to the unique key', async () => {
  const queries = [];
  await require('../migrations/20251010141232-add-func-trig-proc').up({
    sequelize: { query: async (sql) => queries.push(sql) },
  }, DataTypes);
  const trigger = queries.find((query) => /CREATE TRIGGER trg_tinh_tien_phat\b/i.test(query));
  assert.ok(trigger);
  assert.match(trigger, /FROM ChiTietPhieuMuon[\s\S]*?FOR UPDATE/i);
  assert.doesNotMatch(trigger, /FROM PhieuTra/i);
  assert.doesNotMatch(trigger, /returnedCount/i);
});

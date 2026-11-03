const test = require('node:test');
const assert = require('node:assert/strict');
const { Sequelize, DataTypes } = require('sequelize');

const modelFactories = {
  Sach: require('../models/Sach'),
  DocGia: require('../models/DocGia'),
  PhieuMuon: require('../models/PhieuMuon'),
  ChiTietPhieuMuon: require('../models/ChiTietPhieuMuon'),
  PhieuTra: require('../models/PhieuTra'),
};

function defineModels() {
  const sequelize = new Sequelize('library_test', 'unused', 'unused', {
    dialect: 'mysql',
    logging: false,
  });

  const models = Object.fromEntries(
    Object.entries(modelFactories).map(([name, factory]) => [name, factory(sequelize, DataTypes)]),
  );

  return { sequelize, models };
}

function primaryKeyFields(model) {
  return Object.entries(model.rawAttributes)
    .filter(([, attribute]) => attribute.primaryKey)
    .map(([name]) => name);
}

test('core model primary keys use the complete specified identities', () => {
  const { sequelize, models } = defineModels();

  try {
    assert.deepEqual(primaryKeyFields(models.Sach), ['maSach', 'maTacGia', 'maTheLoai']);
    assert.deepEqual(primaryKeyFields(models.DocGia), ['maDocGia']);
    assert.deepEqual(primaryKeyFields(models.PhieuMuon), ['maPhieuMuon', 'maDocGia']);
    assert.deepEqual(primaryKeyFields(models.ChiTietPhieuMuon), ['maChiTietPM', 'maPhieuMuon', 'maSach']);
    assert.deepEqual(primaryKeyFields(models.PhieuTra), ['maPhieuTra', 'maChiTietPM']);
  } finally {
    sequelize.close();
  }
});

test('reader model exposes fullName instead of split name fields', () => {
  const { sequelize, models } = defineModels();

  try {
    assert.ok(models.DocGia.rawAttributes.fullName);
    assert.equal(models.DocGia.rawAttributes.hoLot, undefined);
    assert.equal(models.DocGia.rawAttributes.ten, undefined);
  } finally {
    sequelize.close();
  }
});

test('loan model restricts status to the four approved values', () => {
  const { sequelize, models } = defineModels();

  try {
    assert.deepEqual(models.PhieuMuon.rawAttributes.trangThai.type.values, [
      'Chờ duyệt',
      'Đang mượn',
      'Đã trả',
      'Từ chối',
    ]);
  } finally {
    sequelize.close();
  }
});

test('dependent models carry every composite foreign-key column without expanding their primary keys', () => {
  const { sequelize, models } = defineModels();

  try {
    for (const field of ['maPhieuMuon', 'maDocGia', 'maSach', 'maTacGia', 'maTheLoai']) {
      assert.ok(models.ChiTietPhieuMuon.rawAttributes[field], `detail missing ${field}`);
      assert.equal(models.ChiTietPhieuMuon.rawAttributes[field].allowNull, false);
    }
    for (const field of ['maChiTietPM', 'maPhieuMuon', 'maSach']) {
      assert.ok(models.PhieuTra.rawAttributes[field], `return missing ${field}`);
      assert.equal(models.PhieuTra.rawAttributes[field].allowNull, false);
    }
    assert.deepEqual(primaryKeyFields(models.ChiTietPhieuMuon), ['maChiTietPM', 'maPhieuMuon', 'maSach']);
    assert.deepEqual(primaryKeyFields(models.PhieuTra), ['maPhieuTra', 'maChiTietPM']);
  } finally {
    sequelize.close();
  }
});

test('return identity has no separate single-column unique constraint', () => {
  const { sequelize, models } = defineModels();

  try {
    assert.deepEqual(primaryKeyFields(models.PhieuTra), ['maPhieuTra', 'maChiTietPM']);
    assert.equal(models.PhieuTra.rawAttributes.maPhieuTra.unique, undefined);
  } finally {
    sequelize.close();
  }
});

test('composite lookup helpers require and preserve every reference component', () => {
  const { loanDetailWhere, bookDetailWhere, detailReturnWhere } = require('../models/compositeRelations');

  assert.deepEqual(loanDetailWhere({ maPhieuMuon: 11, maDocGia: 22 }), {
    maPhieuMuon: 11, maDocGia: 22,
  });
  assert.deepEqual(bookDetailWhere({ maSach: 31, maTacGia: 32, maTheLoai: 33 }), {
    maSach: 31, maTacGia: 32, maTheLoai: 33,
  });
  assert.deepEqual(detailReturnWhere({ maChiTietPM: 41, maPhieuMuon: 42, maSach: 43 }), {
    maChiTietPM: 41, maPhieuMuon: 42, maSach: 43,
  });
  assert.throws(() => loanDetailWhere({ maPhieuMuon: 11 }), /maDocGia/);
  assert.throws(() => bookDetailWhere({ maSach: 31, maTacGia: 32 }), /maTheLoai/);
  assert.throws(() => detailReturnWhere({ maChiTietPM: 41, maPhieuMuon: 42 }), /maSach/);
});

test('registered associations do not join a partial composite key', () => {
  const { registerAssociations } = require('../models/compositeRelations');
  const { sequelize, models } = defineModels();
  const related = {
    NhaXuatBan: require('../models/NhaXuatBan')(sequelize, DataTypes),
    TacGia: require('../models/TacGia')(sequelize, DataTypes),
    TheLoai: require('../models/TheLoai')(sequelize, DataTypes),
  };

  try {
    registerAssociations({ ...models, ...related });
    assert.ok(models.PhieuMuon.associations.DocGia);
    assert.ok(models.Sach.associations.TacGia);
    assert.deepEqual(Object.keys(models.ChiTietPhieuMuon.associations), []);
    assert.deepEqual(Object.keys(models.PhieuTra.associations), []);
    assert.equal(models.PhieuMuon.associations.ChiTietPhieuMuons, undefined);
    assert.equal(models.Sach.associations.ChiTietPhieuMuons, undefined);
  } finally {
    sequelize.close();
  }
});

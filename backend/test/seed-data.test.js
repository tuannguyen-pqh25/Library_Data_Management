const test = require('node:test');
const assert = require('node:assert/strict');
const { validateSeedEnvironment, scenarioDefinitions, getScenarioDates, seedLibraryData } = require('../scripts/seed-data');

test('demo scenarios cover all loan states and both return timing outcomes', () => {
  assert.deepEqual(scenarioDefinitions.map(({ status }) => status), [
    'Chờ duyệt', 'Đang mượn', 'Từ chối', 'Đã trả', 'Đã trả',
  ]);
  const returned = scenarioDefinitions.filter(({ status }) => status === 'Đã trả');
  assert.deepEqual(returned.map(({ returnTiming }) => returnTiming), ['on-time', 'late']);
});

test('seed requires a caller-supplied reader password', () => {
  assert.throws(() => validateSeedEnvironment({}), /SEED_READER_PASSWORD/);
  assert.throws(() => validateSeedEnvironment({ SEED_READER_PASSWORD: 'short' }), /12 characters/);
  assert.equal(validateSeedEnvironment({ SEED_READER_PASSWORD: 'a-long-demo-password' }), 'a-long-demo-password');
});

test('scenario keys use stable demo reader emails and avoid hardcoded passwords', () => {
  const emails = scenarioDefinitions.map(({ email }) => email);
  assert.equal(new Set(emails).size, emails.length);
  assert.ok(emails.every((email) => email.endsWith('@example.invalid')));
  assert.ok(scenarioDefinitions.every(({ reader }) => reader.fullName && reader.dienThoai));
});

test('returned demo scenarios use non-future due and return dates', () => {
  const today = new Date(2026, 8, 30, 12);
  const onTime = getScenarioDates(scenarioDefinitions.find(({ returnTiming }) => returnTiming === 'on-time'), today);
  const late = getScenarioDates(scenarioDefinitions.find(({ returnTiming }) => returnTiming === 'late'), today);
  assert.equal(onTime.ngayTraSach.getTime(), onTime.ngayTra.getTime());
  assert.ok(onTime.ngayTra <= today);
  assert.equal(late.ngayTraSach.getTime(), new Date(2026, 8, 30).getTime());
  assert.equal(late.ngayTra.getTime(), new Date(2026, 8, 29).getTime());
});

test('rerunning the seed skips existing loans and does not replay inventory effects', async () => {
  const state = { next: 1, publishers: [], authors: [], categories: [], books: [], readers: [], loans: [], details: [], returns: [], rejectedStockRestores: 0 };
  const findOrCreate = (rows, key, idField) => async ({ where, defaults }) => {
    let row = rows.find((candidate) => candidate[key] === where[key]);
    if (!row) {
      row = { ...defaults, [idField]: state.next++ };
      rows.push(row);
    }
    return [row, !rows.includes(row)];
  };
  const sequelize = {
    transaction: async () => ({ commit: async () => {}, rollback: async () => {} }),
  };
  const models = {
    NhaXuatBan: { findOrCreate: findOrCreate(state.publishers, 'tenNXB', 'maNXB') },
    TacGia: { findOrCreate: findOrCreate(state.authors, 'tenTacGia', 'maTacGia') },
    TheLoai: { findOrCreate: findOrCreate(state.categories, 'tenTheLoai', 'maTheLoai') },
    DocGia: { findOrCreate: findOrCreate(state.readers, 'email', 'maDocGia') },
    Sach: {
      findOrCreate: async ({ where, defaults }) => {
        let row = state.books.find((candidate) => candidate.tenSach === where.tenSach);
        if (!row) {
          row = { ...defaults, maSach: state.next++, increment: async () => { state.rejectedStockRestores += 1; } };
          state.books.push(row);
        }
        return [row, false];
      },
    },
    PhieuMuon: {
      findOne: async ({ where }) => state.loans.find((loan) => loan.maDocGia === where.maDocGia) || null,
      create: async (values) => {
        const loan = { ...values, maPhieuMuon: state.next++, update: async (changes) => Object.assign(loan, changes) };
        state.loans.push(loan);
        return loan;
      },
    },
    ChiTietPhieuMuon: { create: async (values) => { const detail = { ...values, maChiTietPM: state.next++ }; state.details.push(detail); return detail; } },
    PhieuTra: { create: async (values) => { const returned = { ...values, maPhieuTra: state.next++ }; state.returns.push(returned); return returned; } },
  };
  const options = { sequelize, models, env: { SEED_READER_PASSWORD: 'test-demo-password' }, hashPassword: async () => 'hashed', clock: () => new Date(2026, 8, 30, 12) };

  const firstRun = await seedLibraryData(options);
  assert.equal(firstRun.createdScenarios, scenarioDefinitions.length);
  assert.equal(state.rejectedStockRestores, 1);
  const firstCounts = { loans: state.loans.length, details: state.details.length, returns: state.returns.length };

  const secondRun = await seedLibraryData(options);
  assert.deepEqual(secondRun, { createdScenarios: 0, skippedScenarios: scenarioDefinitions.length });
  assert.equal(state.rejectedStockRestores, 1);
  assert.deepEqual({ loans: state.loans.length, details: state.details.length, returns: state.returns.length }, firstCounts);
});

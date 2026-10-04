'use strict';

const bcrypt = require('bcryptjs');

const scenarioDefinitions = [
  { key: 'pending', email: 'seed-pending@example.invalid', status: 'Chờ duyệt', returnTiming: null },
  { key: 'active', email: 'seed-active@example.invalid', status: 'Đang mượn', returnTiming: null },
  { key: 'rejected', email: 'seed-rejected@example.invalid', status: 'Từ chối', returnTiming: null },
  { key: 'returned-on-time', email: 'seed-returned-on-time@example.invalid', status: 'Đã trả', returnTiming: 'on-time' },
  { key: 'returned-late', email: 'seed-returned-late@example.invalid', status: 'Đã trả', returnTiming: 'late' },
].map((scenario, index) => ({
  ...scenario,
  reader: {
    fullName: `Demo Reader ${index + 1} (${scenario.key})`,
    ngaySinh: new Date('2000-01-01T00:00:00.000Z'),
    phai: index % 2 === 0 ? 'Nam' : 'Nữ',
    diaChi: 'Demo address',
    dienThoai: `09000000${String(index + 1).padStart(2, '0')}`,
  },
  bookTitle: `Demo Book: ${scenario.key}`,
}));

function validateSeedEnvironment(env) {
  const password = env.SEED_READER_PASSWORD;
  if (typeof password !== 'string' || password.length < 12) {
    throw new Error('Set SEED_READER_PASSWORD to a value at least 12 characters long before seeding demo readers.');
  }
  return password;
}

function dateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getScenarioDates(scenario, now) {
  const today = dateOnly(now);
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  if (scenario.returnTiming === 'on-time') {
    return { ngayMuon: addDays(today, -7), ngayTra: today, ngayTraSach: today };
  }
  if (scenario.returnTiming === 'late') {
    return { ngayMuon: addDays(today, -8), ngayTra: addDays(today, -1), ngayTraSach: today };
  }
  return { ngayMuon: today, ngayTra: addDays(today, 12), ngayTraSach: null };
}

async function seedLibraryData({ sequelize, models, env = process.env, clock = () => new Date(), hashPassword = (password) => bcrypt.hash(password, 10) }) {
  const readerPassword = validateSeedEnvironment(env);
  const passwordHash = await hashPassword(readerPassword);
  const { NhaXuatBan, TacGia, TheLoai, Sach, DocGia, PhieuMuon, ChiTietPhieuMuon, PhieuTra } = models;
  const transaction = await sequelize.transaction();
  let createdScenarios = 0;
  let skippedScenarios = 0;

  try {
    const [publisher] = await NhaXuatBan.findOrCreate({
      where: { tenNXB: 'Demo Library Publisher' },
      defaults: { tenNXB: 'Demo Library Publisher', diaChi: 'Demo address' },
      transaction,
    });
    const [author] = await TacGia.findOrCreate({
      where: { tenTacGia: 'Demo Library Author' },
      defaults: { tenTacGia: 'Demo Library Author', diaChi: 'Demo address', soDienThoai: '0900000000' },
      transaction,
    });
    const [category] = await TheLoai.findOrCreate({
      where: { tenTheLoai: 'Demo Category' },
      defaults: { tenTheLoai: 'Demo Category' },
      transaction,
    });

    for (const scenario of scenarioDefinitions) {
      const [reader] = await DocGia.findOrCreate({
        where: { email: scenario.email },
        defaults: { ...scenario.reader, email: scenario.email, password: passwordHash },
        transaction,
      });
      const [book] = await Sach.findOrCreate({
        where: { tenSach: scenario.bookTitle, maTacGia: author.maTacGia, maTheLoai: category.maTheLoai },
        defaults: {
          tenSach: scenario.bookTitle,
          donGia: 100000,
          soLuongHienCo: 5,
          namXuatBan: 2024,
          nguonGoc: 'Demo',
          maNXB: publisher.maNXB,
          maTacGia: author.maTacGia,
          maTheLoai: category.maTheLoai,
        },
        transaction,
      });

      // Each dedicated demo reader represents one stable scenario. Skipping an
      // existing loan prevents reruns from reapplying stock triggers/effects.
      const existingLoan = await PhieuMuon.findOne({ where: { maDocGia: reader.maDocGia }, transaction });
      if (existingLoan) {
        skippedScenarios += 1;
        continue;
      }

      const dates = getScenarioDates(scenario, clock());
      const loan = await PhieuMuon.create({
        maDocGia: reader.maDocGia,
        ...dates,
        trangThai: 'Chờ duyệt',
      }, { transaction });

      // The database trigger reserves one copy on detail insert.
      const detail = await ChiTietPhieuMuon.create({
        maPhieuMuon: loan.maPhieuMuon,
        maDocGia: reader.maDocGia,
        maSach: book.maSach,
        maTacGia: author.maTacGia,
        maTheLoai: category.maTheLoai,
        soLuongSachMuon: 1,
      }, { transaction });

      if (scenario.status === 'Từ chối') {
        await loan.update({ trangThai: 'Từ chối' }, { transaction });
        // Rejection has no database trigger; restore the reservation once here.
        await book.increment('soLuongHienCo', {
          by: 1,
          where: { maSach: book.maSach, maTacGia: author.maTacGia, maTheLoai: category.maTheLoai },
          transaction,
        });
      } else if (scenario.status === 'Đã trả') {
        await PhieuTra.create({
          maChiTietPM: detail.maChiTietPM,
          maPhieuMuon: loan.maPhieuMuon,
          maSach: book.maSach,
          ngayTraSach: dates.ngayTraSach,
        }, { transaction });
        // The return trigger computes the fine and restores stock once.
        await loan.update({ trangThai: 'Đã trả' }, { transaction });
      } else if (scenario.status === 'Đang mượn') {
        await loan.update({ trangThai: 'Đang mượn' }, { transaction });
      }
      createdScenarios += 1;
    }

    await transaction.commit();
    return { createdScenarios, skippedScenarios };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function main() {
  require('dotenv').config();
  validateSeedEnvironment(process.env);
  const { sequelize, ...models } = require('../models');
  try {
    await sequelize.authenticate();
    const result = await seedLibraryData({ sequelize, models, env: process.env });
    console.log(`Demo seed complete: ${result.createdScenarios} scenarios created, ${result.skippedScenarios} already present.`);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Demo seed failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { scenarioDefinitions, validateSeedEnvironment, getScenarioDates, seedLibraryData };

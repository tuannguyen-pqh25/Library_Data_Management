const test = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');

const databaseUrl = process.env.MIGRATION_TEST_DB_URL;

test('MySQL borrow lifecycle updates stock only on approval and serializes competing approvals', {
  skip: !databaseUrl && 'Set MIGRATION_TEST_DB_URL to the migrated disposable database',
}, async () => {
  const url = new URL(databaseUrl);
  assert.ok(['/library_migration_check', '/library_db'].includes(url.pathname));
  require('dotenv').config();
  const { sequelize, PhieuMuon, ChiTietPhieuMuon, PhieuTra, Sach } = require('../models');
  sequelize.options.logging = false;
  const { createBorrowRequest, updateBorrowRequest, requestBorrowReturn } = require('../controllers/borrowController');
  const { getDashboardSummary, getDetailedUnreturnedLoans } = require('../controllers/reportController');
  const connection = await mysql.createConnection(databaseUrl);
  const token = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const ids = { readers: [], loans: [], books: [], authors: [], categories: [], publishers: [] };
  const insert = async (sql, params = []) => (await connection.execute(sql, params))[0].insertId;
  const apiResponse = () => ({
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  });
  const request = async (readerId, book, quantity) => {
    const res = apiResponse();
    await createBorrowRequest({
      user: { maDocGia: readerId },
      userType: 'reader',
      body: { chiTiet: [{ maSach: book.maSach, maTacGia: book.maTacGia, maTheLoai: book.maTheLoai, soLuongSachMuon: quantity }] },
    }, res);
    assert.equal(res.statusCode, 201, JSON.stringify(res.body));
    ids.loans.push(res.body.maPhieuMuon);
    return res.body.maPhieuMuon;
  };
  const askReturn = async (loanId, readerId) => {
    const res = apiResponse();
    await requestBorrowReturn({
      user: { maDocGia: readerId },
      userType: 'reader',
      params: { maPhieuMuon: String(loanId) },
    }, res);
    return res;
  };
  const transition = async (loanId, readerId, status) => {
    const res = apiResponse();
    await updateBorrowRequest({ params: { maPhieuMuon: String(loanId), maDocGia: String(readerId) }, body: { trangThai: status } }, res);
    return res;
  };
  const inventory = async (book) => {
    const row = await Sach.findOne({ where: { maSach: book.maSach, maTacGia: book.maTacGia, maTheLoai: book.maTheLoai } });
    return row.soLuongHienCo;
  };

  try {
    const publisher = await insert('INSERT INTO NhaXuatBan (tenNXB, diaChi, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [`Publisher ${token}`, 'Test address']);
    ids.publishers.push(publisher);
    const author = await insert('INSERT INTO TacGia (tenTacGia, diaChi, soDienThoai, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())', [`Author ${token}`, 'Test address', '0123456789']);
    ids.authors.push(author);
    const category = await insert('INSERT INTO TheLoai (tenTheLoai, createdAt, updatedAt) VALUES (?, NOW(), NOW())', [`Category ${token}`]);
    ids.categories.push(category);
    const makeBook = async (name, quantity) => {
      const id = await insert(`INSERT INTO Sach
        (maTacGia, maTheLoai, tenSach, namXuatBan, maNXB, soLuongHienCo, donGia, nguonGoc, createdAt, updatedAt)
        VALUES (?, ?, ?, 2026, ?, ?, 10000, ?, NOW(), NOW())`, [author, category, `${name} ${token}`, publisher, quantity, 'Test origin']);
      const book = { maSach: id, maTacGia: author, maTheLoai: category };
      ids.books.push(book);
      return book;
    };
    const reader = async (name, suffix) => {
      const id = await insert(`INSERT INTO DocGia
        (fullName, ngaySinh, phai, diaChi, dienThoai, email, password, createdAt, updatedAt)
        VALUES (?, '2000-01-01', 'Nam', ?, ?, ?, 'unused', NOW(), NOW())`, [name, 'Test address', '0123456789', `reader-${token}-${suffix}@example.invalid`]);
      ids.readers.push(id);
      return id;
    };
    const firstReader = await reader(`Reader ${token}`, 'one');
    const book = await makeBook('Lifecycle book', 2);
    const loanId = await request(firstReader, book, 1);
    assert.equal(await inventory(book), 2);
    assert.equal((await transition(loanId, firstReader, 'Đang mượn')).statusCode, 200);
    assert.equal(await inventory(book), 1);
    assert.equal((await transition(loanId, firstReader, 'Đã trả')).statusCode, 409);
    assert.equal((await askReturn(loanId, firstReader)).statusCode, 200);
    assert.equal((await transition(loanId, firstReader, 'Đã trả')).statusCode, 200);
    assert.equal(await inventory(book), 2);
    assert.equal((await transition(loanId, firstReader, 'Đã trả')).statusCode, 400);
    assert.equal(await inventory(book), 2);

    const rejectedLoan = await request(firstReader, book, 1);
    assert.equal((await transition(rejectedLoan, firstReader, 'Từ chối')).statusCode, 200);
    assert.equal(await inventory(book), 2);

    const competingBook = await makeBook('Competing book', 1);
    const competingReader = await reader(`Reader ${token}`, 'two');
    const [loanA, loanB] = await Promise.all([
      request(firstReader, competingBook, 1),
      request(competingReader, competingBook, 1),
    ]);
    const approvals = await Promise.all([
      transition(loanA, firstReader, 'Đang mượn'),
      transition(loanB, competingReader, 'Đang mượn'),
    ]);
    assert.deepEqual(approvals.map((res) => res.statusCode).sort(), [200, 400]);
    assert.equal(await inventory(competingBook), 0);

    const summary = apiResponse();
    await getDashboardSummary({}, summary);
    assert.deepEqual(summary.body, {
      sachMuonThang: 2,
      docGiaMuonNam: approvals[1].statusCode === 200 ? 2 : 1,
      phieuChuaTra: 1,
    });
    const unreturned = apiResponse();
    await getDetailedUnreturnedLoans({}, unreturned);
    assert.equal(unreturned.body.length, 1);
    assert.equal(unreturned.body[0].chiTiet[0].maPhieuMuon, unreturned.body[0].maPhieuMuon);
    assert.equal(unreturned.body[0].chiTiet[0].maDocGia, unreturned.body[0].maDocGia);
    assert.equal(unreturned.body[0].chiTiet[0].maSach, competingBook.maSach);
  } finally {
    const inClause = (values) => values.length ? values : [-1];
    try {
      await PhieuTra.destroy({ where: { maPhieuMuon: inClause(ids.loans) } });
      await ChiTietPhieuMuon.destroy({ where: { maPhieuMuon: inClause(ids.loans) } });
      await PhieuMuon.destroy({ where: { maPhieuMuon: inClause(ids.loans) } });
      for (const book of ids.books) await Sach.destroy({ where: book });
      await require('../models').DocGia.destroy({ where: { maDocGia: inClause(ids.readers) } });
      await require('../models').TacGia.destroy({ where: { maTacGia: inClause(ids.authors) } });
      await require('../models').TheLoai.destroy({ where: { maTheLoai: inClause(ids.categories) } });
      await require('../models').NhaXuatBan.destroy({ where: { maNXB: inClause(ids.publishers) } });
    } finally {
      await connection.end();
      await sequelize.close();
    }
  }
});

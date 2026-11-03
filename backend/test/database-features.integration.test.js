const test = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');

const databaseUrl = process.env.MIGRATION_TEST_DB_URL;

test('migrated MySQL keys, routines and triggers work with representative loan statuses', {
  skip: !databaseUrl && 'Set MIGRATION_TEST_DB_URL to the migrated library_migration_check database',
}, async () => {
  const url = new URL(databaseUrl);
  assert.ok(['/library_migration_check', '/library_db'].includes(url.pathname), 'use the disposable migration database or the verified clean local database');
  const connection = await mysql.createConnection(databaseUrl);

  const selectRows = async (sql, params = []) => (await connection.query(sql, params))[0];
  const insert = async (sql, params = []) => (await connection.execute(sql, params))[0].insertId;
  const procedureRows = async (name) => (await selectRows(`CALL ${name}()`))[0];

  try {
    const expectedKeys = {
      Sach: ['maSach', 'maTacGia', 'maTheLoai'],
      PhieuMuon: ['maPhieuMuon', 'maDocGia'],
      ChiTietPhieuMuon: ['maChiTietPM', 'maPhieuMuon', 'maSach'],
      PhieuTra: ['maPhieuTra', 'maChiTietPM'],
    };
    for (const [table, columns] of Object.entries(expectedKeys)) {
      const rows = await selectRows(`
        SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
        ORDER BY ORDINAL_POSITION`, [table]);
      assert.deepEqual(rows.map((row) => row.COLUMN_NAME), columns, table);
    }

    const expectedForeignKeys = {
      fk_chitietphieumuon_phieumuon: ['maPhieuMuon', 'maDocGia'],
      fk_chitietphieumuon_sach: ['maSach', 'maTacGia', 'maTheLoai'],
      fk_phieutra_chitietphieumuon: ['maChiTietPM', 'maPhieuMuon', 'maSach'],
    };
    for (const [name, columns] of Object.entries(expectedForeignKeys)) {
      const rows = await selectRows(`
        SELECT COLUMN_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ?
        ORDER BY ORDINAL_POSITION`, [name]);
      assert.deepEqual(rows.map((row) => row.COLUMN_NAME), columns, name);
      assert.deepEqual(rows.map((row) => row.REFERENCED_COLUMN_NAME), columns, name);
    }

    const stockTriggers = await selectRows(`
      SELECT TRIGGER_NAME FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = DATABASE()
        AND TRIGGER_NAME IN ('trg_giam_so_luong_sach', 'trg_tang_so_luong_sach')`);
    assert.deepEqual(stockTriggers, [], 'inventory changes are owned by the loan transaction, not triggers');

    const [existing] = await selectRows('SELECT COUNT(*) AS count FROM PhieuMuon');
    assert.equal(existing.count, 0, 'integration test needs a fresh disposable database');
    await connection.beginTransaction();

    const publisher = await insert('INSERT INTO NhaXuatBan (tenNXB, diaChi, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', ['Test publisher', 'Test address']);
    const author = await insert('INSERT INTO TacGia (tenTacGia, diaChi, soDienThoai, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())', ['Test author', 'Test address', '0123456789']);
    const category = await insert('INSERT INTO TheLoai (tenTheLoai, createdAt, updatedAt) VALUES (?, NOW(), NOW())', ['Test category']);
    const book = await insert(`INSERT INTO Sach
      (maTacGia, maTheLoai, tenSach, namXuatBan, maNXB, soLuongHienCo, donGia, nguonGoc, createdAt, updatedAt)
      VALUES (?, ?, ?, 2026, ?, 100, 10000, ?, NOW(), NOW())`, [author, category, 'Test book', publisher, 'Test origin']);
    const reader = async (name, email) => insert(`INSERT INTO DocGia
      (fullName, ngaySinh, phai, diaChi, dienThoai, email, password, createdAt, updatedAt)
      VALUES (?, '2000-01-01', 'Nam', ?, ?, ?, ?, NOW(), NOW())`, [name, 'Test address', '0123456789', email, 'unused']);
    const reader1 = await reader('Test Reader One', 'test-reader-one@example.invalid');
    const reader2 = await reader('Test Reader Two', 'test-reader-two@example.invalid');
    const loan = async (readerId, status) => insert(`INSERT INTO PhieuMuon
      (maDocGia, ngayMuon, ngayTra, trangThai, createdAt, updatedAt)
      VALUES (?, CURRENT_DATE(), CURRENT_DATE(), ?, NOW(), NOW())`, [readerId, status]);
    const active1 = await loan(reader1, 'Đang mượn');
    const returned = await loan(reader1, 'Đã trả');
    const active2 = await loan(reader2, 'Đang mượn');
    const pending = await loan(reader2, 'Chờ duyệt');
    const refused = await loan(reader2, 'Từ chối');
    const detail = async (loanId, readerId, quantity) => insert(`INSERT INTO ChiTietPhieuMuon
      (maPhieuMuon, maSach, maDocGia, maTacGia, maTheLoai, soLuongSachMuon, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [loanId, book, readerId, author, category, quantity]);
    await detail(active1, reader1, 2);
    const lateDetail = await detail(returned, reader1, 3);
    const onTimeDetail = await detail(returned, reader1, 1);
    await detail(active2, reader2, 4);
    await detail(pending, reader2, 5);
    await detail(refused, reader2, 7);
    const returnBook = async (detailId, dayOffset) => insert(`INSERT INTO PhieuTra
      (maChiTietPM, maPhieuMuon, maSach, ngayTraSach, createdAt, updatedAt)
      VALUES (?, ?, ?, DATE_ADD(CURRENT_DATE(), INTERVAL ? DAY), NOW(), NOW())`, [detailId, returned, book, dayOffset]);
    const lateReturn = await returnBook(lateDetail, 2);
    const onTimeReturn = await returnBook(onTimeDetail, 0);

    await assert.rejects(returnBook(lateDetail, 3), (error) => error.code === 'ER_DUP_ENTRY' || error.errno === 1062);
    const [returnCount] = await selectRows(`SELECT COUNT(*) AS count FROM PhieuTra
      WHERE maChiTietPM = ? AND maPhieuMuon = ? AND maSach = ?`, [lateDetail, returned, book]);
    assert.equal(returnCount.count, 1);

    const [inventory] = await selectRows('SELECT fn_kiem_tra_so_luong_sach(?) AS quantity', [book]);
    assert.equal(inventory.quantity, 100, 'inserting loan details or return rows does not change stock');
    const fines = await selectRows('SELECT maPhieuTra, tienPhat FROM PhieuTra WHERE maPhieuTra IN (?, ?)', [lateReturn, onTimeReturn]);
    assert.equal(Number(fines.find((row) => row.maPhieuTra === lateReturn).tienPhat), 6000);
    assert.equal(Number(fines.find((row) => row.maPhieuTra === onTimeReturn).tienPhat), 0);

    const unreturned = await procedureRows('sp_danh_sach_phieu_muon_chua_tra');
    assert.deepEqual(unreturned.map((row) => row.maPhieuMuon).sort((a, b) => a - b), [active1, active2]);
    const [monthly] = await procedureRows('sp_thong_ke_sach_muon_thang');
    assert.equal(Number(monthly.tongSachMuonThang), 10);
    const [yearly] = await procedureRows('sp_thong_ke_doc_gia_muon_sach_nam');
    assert.equal(Number(yearly.tongDocGiaMuonSachNam), 2);
  } finally {
    try { await connection.rollback(); } finally { await connection.end(); }
  }
});

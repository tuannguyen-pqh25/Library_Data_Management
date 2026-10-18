'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_BORROW_COPIES,
  OUTSTANDING_BORROW_STATUSES,
  sumCopyQuantity,
  exceedsBorrowLimit,
  getDueDate,
  getLoanDisplayStatus,
} = require('../utils/borrowRules');

test('borrow limit includes five copies and pending plus active statuses', () => {
  assert.equal(MAX_BORROW_COPIES, 5);
  assert.deepEqual(OUTSTANDING_BORROW_STATUSES, ['Chờ duyệt', 'Đang mượn']);
});

test('sums quantities rather than counting loan details', () => {
  assert.equal(sumCopyQuantity([
    { soLuongSachMuon: 2 },
    { soLuongSachMuon: '3' },
    { soLuongSachMuon: undefined },
  ]), 5);
});

test('allows exactly five outstanding copies and rejects requests above the limit', () => {
  assert.equal(exceedsBorrowLimit(3, 2), false);
  assert.equal(exceedsBorrowLimit(3, 3), true);
  assert.equal(exceedsBorrowLimit(5), false);
  assert.equal(exceedsBorrowLimit(6), true);
});

test('due date is fourteen days after approval date', () => {
  assert.equal(
    getDueDate(new Date('2026-10-01T12:00:00.000Z')).toISOString(),
    '2026-10-15T12:00:00.000Z'
  );
});

test('return request changes the displayed status without changing stored loan state', () => {
  assert.equal(
    getLoanDisplayStatus({ trangThai: 'Đang mượn', yeuCauTraAt: '2026-10-01T12:00:00.000Z' }),
    'Chờ xác nhận trả'
  );
  assert.equal(getLoanDisplayStatus({ trangThai: 'Đang mượn', yeuCauTraAt: null }), 'Đang mượn');
  assert.equal(getLoanDisplayStatus({ trangThai: 'Đã trả', yeuCauTraAt: '2026-10-01T12:00:00.000Z' }), 'Đã trả');
});

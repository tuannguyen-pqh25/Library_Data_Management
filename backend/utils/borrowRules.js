const MAX_BORROW_COPIES = 5;
const OUTSTANDING_BORROW_STATUSES = ['Chờ duyệt', 'Đang mượn'];

const sumCopyQuantity = (details) => details.reduce(
  (total, detail) => total + Number(detail.soLuongSachMuon || 0),
  0
);

const exceedsBorrowLimit = (outstandingCopies, additionalCopies = 0) => (
  Number(outstandingCopies) + Number(additionalCopies) > MAX_BORROW_COPIES
);

const getDueDate = (startDate, loanDays = 14) => {
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + loanDays);
  return dueDate;
};

const getLoanDisplayStatus = (loan) => (
  loan.trangThai === 'Đang mượn' && loan.yeuCauTraAt
    ? 'Chờ xác nhận trả'
    : loan.trangThai
);

module.exports = {
  MAX_BORROW_COPIES,
  OUTSTANDING_BORROW_STATUSES,
  sumCopyQuantity,
  exceedsBorrowLimit,
  getDueDate,
  getLoanDisplayStatus,
};

const ExcelJS = require('exceljs');
const { getLoanDisplayStatus } = require('./borrowRules');

const FINE_PER_DAY_PER_COPY = 5000;

const COLORS = {
  headerFill: 'FF2E5B44',
  headerText: 'FFFFFFFF',
  sectionFill: 'FFEAF2EC',
  sectionText: 'FF27352C',
  totalFill: 'FFF4F7F4',
  zebraFill: 'FFFAFBF9',
  border: 'FFD5DDD7',
  mutedText: 'FF5E6A61',
  dangerText: 'FFAE4A3D',
};

const BORDER_STYLE = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

const toDateParts = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const toUtcDayNumber = (parts) => (
  parts ? Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000) : null
);

const formatDateVN = (value) => {
  const parts = toDateParts(value);
  if (!parts) return '—';
  const dd = String(parts.day).padStart(2, '0');
  const mm = String(parts.month).padStart(2, '0');
  return `${dd}/${mm}/${parts.year}`;
};

const formatDateTimeVN = (value) => {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const computeOverdueInfo = (loan, referenceDate = new Date()) => {
  const todayDay = toUtcDayNumber(toDateParts(referenceDate));
  const dueDay = toUtcDayNumber(toDateParts(loan?.ngayTra));
  const copies = Array.isArray(loan?.chiTiet)
    ? loan.chiTiet.reduce((sum, item) => sum + Number(item.soLuongSachMuon || 0), 0)
    : 0;
  const effectiveCopies = copies > 0 ? copies : 1;

  if (dueDay === null || todayDay === null || dueDay >= todayDay) {
    return { isOverdue: false, daysOverdue: 0, estimatedFine: 0, totalCopies: copies };
  }
  const daysOverdue = todayDay - dueDay;
  return {
    isOverdue: true,
    daysOverdue,
    estimatedFine: daysOverdue * FINE_PER_DAY_PER_COPY * effectiveCopies,
    totalCopies: copies,
  };
};

const styleTitleBanner = (sheet, title, subtitle, columnCount) => {
  const span = Math.max(columnCount, 4);
  sheet.mergeCells(1, 1, 1, span);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: COLORS.headerFill } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(1).height = 28;

  sheet.mergeCells(2, 1, 2, span);
  const subCell = sheet.getCell(2, 1);
  subCell.value = subtitle;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: COLORS.mutedText } };
  sheet.getRow(2).height = 18;
};

const styleHeaderRow = (row) => {
  row.height = 24;
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerFill } };
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.headerText } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_STYLE;
  });
};

const styleSectionHeaderRow = (sheet, rowNumber, label, columnCount) => {
  sheet.mergeCells(rowNumber, 1, rowNumber, columnCount);
  const cell = sheet.getCell(rowNumber, 1);
  cell.value = label;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionFill } };
  cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.sectionText } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  sheet.getRow(rowNumber).height = 22;
};

const styleDataRow = (row, index, columnDefs) => {
  row.height = 20;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const def = columnDefs[colNumber - 1];
    if (index % 2 === 1) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraFill } };
    }
    cell.font = { name: 'Calibri', size: 10.5, color: { argb: COLORS.sectionText } };
    cell.border = BORDER_STYLE;
    cell.alignment = {
      vertical: 'middle',
      horizontal: def?.align || (def?.numFmt ? 'right' : 'left'),
      wrapText: Boolean(def?.wrapText),
    };
    if (def?.numFmt) {
      cell.numFmt = def.numFmt;
    }
  });
};

const styleTotalRow = (row, columnDefs) => {
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const def = columnDefs[colNumber - 1];
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.totalFill } };
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: COLORS.sectionText } };
    cell.border = BORDER_STYLE;
    cell.alignment = {
      vertical: 'middle',
      horizontal: def?.align || (def?.numFmt ? 'right' : 'left'),
    };
    if (def?.numFmt) {
      cell.numFmt = def.numFmt;
    }
  });
};

const autoFitColumns = (sheet, minWidth = 10, maxWidth = 44) => {
  sheet.columns.forEach((column) => {
    let widest = minWidth;
    column.eachCell({ includeEmpty: false }, (cell) => {
      if (cell.isMerged) return;
      const text = cell.value === null || cell.value === undefined ? '' : String(cell.value);
      const longestLine = text.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
      widest = Math.max(widest, longestLine + 3);
    });
    column.width = Math.min(Math.max(widest, minWidth), maxWidth);
  });
};

const appendTabularBlock = (sheet, startRow, columns, rows, totalRowValues = null) => {
  const headerRow = sheet.getRow(startRow);
  columns.forEach((col, idx) => {
    headerRow.getCell(idx + 1).value = col.header;
  });
  styleHeaderRow(headerRow);

  let currentRow = startRow + 1;
  if (rows.length === 0) {
    const emptyRow = sheet.getRow(currentRow);
    sheet.mergeCells(currentRow, 1, currentRow, columns.length);
    const cell = emptyRow.getCell(1);
    cell.value = 'Chưa có dữ liệu.';
    cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: COLORS.mutedText } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    for (let c = 1; c <= columns.length; c += 1) {
      emptyRow.getCell(c).border = BORDER_STYLE;
    }
    emptyRow.height = 20;
    return currentRow + 1;
  }

  rows.forEach((item, index) => {
    const row = sheet.getRow(currentRow);
    columns.forEach((col, colIdx) => {
      row.getCell(colIdx + 1).value = typeof col.value === 'function' ? col.value(item, index) : item[col.key];
    });
    styleDataRow(row, index, columns);
    currentRow += 1;
  });

  if (totalRowValues) {
    const totalRow = sheet.getRow(currentRow);
    columns.forEach((col, colIdx) => {
      totalRow.getCell(colIdx + 1).value = totalRowValues[colIdx] ?? '';
    });
    styleTotalRow(totalRow, columns);
    currentRow += 1;
  }

  return currentRow;
};

const buildOverviewSheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('TongQuan');
  const reportMonth = referenceDate.getMonth() + 1;
  const reportYear = referenceDate.getFullYear();

  styleTitleBanner(
    sheet,
    'BÁO CÁO TỔNG QUAN HOẠT ĐỘNG THƯ VIỆN',
    `Kỳ báo cáo: Tháng ${reportMonth}/${reportYear} | Ngày xuất: ${formatDateTimeVN(referenceDate)} | Người xuất: ${data.exporterName}`,
    4,
  );

  // Compute aggregate counters from detailed datasets
  const loanMap = new Map();
  for (const row of data.loanDetails) {
    const key = `${row.maPhieuMuon}:${row.maDocGia}`;
    if (!loanMap.has(key)) {
      loanMap.set(key, {
        status: getLoanDisplayStatus(row),
        rawStatus: row.trangThai,
        finePaid: 0,
      });
    }
    loanMap.get(key).finePaid += Number(row.tienPhat || 0);
  }

  const statusCounts = {
    'Chờ duyệt': 0,
    'Đang mượn': 0,
    'Chờ xác nhận trả': 0,
    'Đã trả': 0,
    'Từ chối': 0,
  };
  let totalCollectedFines = 0;
  for (const loan of loanMap.values()) {
    if (Object.hasOwn(statusCounts, loan.status)) {
      statusCounts[loan.status] += 1;
    }
    totalCollectedFines += loan.finePaid;
  }

  let overdueCount = 0;
  let totalEstimatedFines = 0;
  for (const loan of data.unreturnedLoans) {
    const info = computeOverdueInfo(loan, referenceDate);
    if (info.isOverdue) {
      overdueCount += 1;
      totalEstimatedFines += info.estimatedFine;
    }
  }

  const totalBookCopies = data.books.reduce((sum, b) => sum + Number(b.soLuongHienCo || 0), 0);
  const totalInventoryValue = data.books.reduce(
    (sum, b) => sum + Number(b.soLuongHienCo || 0) * Number(b.donGia || 0),
    0,
  );

  let rowCursor = 4;
  styleSectionHeaderRow(sheet, rowCursor, '1. CHỈ SỐ HOẠT ĐỘNG MƯỢN TRẢ', 3);
  rowCursor += 1;

  const kpiColumns = [
    { header: 'Chỉ tiêu', key: 'label', align: 'left' },
    { header: 'Giá trị', key: 'value', align: 'right', numFmt: '#,##0' },
    { header: 'Ghi chú', key: 'note', align: 'left' },
  ];
  const kpiRows = [
    { label: 'Sách mượn trong tháng', value: Number(data.summary?.sachMuonThang || 0), note: `Tháng ${reportMonth}/${reportYear}` },
    { label: 'Độc giả đã mượn trong năm', value: Number(data.summary?.docGiaMuonNam || 0), note: `Độc giả duy nhất năm ${reportYear}` },
    { label: 'Tổng số phiếu mượn', value: loanMap.size, note: 'Toàn hệ thống' },
    { label: 'Phiếu chờ duyệt', value: statusCounts['Chờ duyệt'], note: 'Đang chờ nhân viên duyệt' },
    { label: 'Phiếu đang mượn', value: statusCounts['Đang mượn'] + statusCounts['Chờ xác nhận trả'], note: `Trong đó ${statusCounts['Chờ xác nhận trả']} phiếu chờ xác nhận trả` },
    { label: 'Phiếu quá hạn chưa trả', value: overdueCount, note: 'Hạn trả nhỏ hơn ngày xuất báo cáo' },
    { label: 'Phiếu đã trả', value: statusCounts['Đã trả'], note: 'Đã hoàn tất trả sách' },
    { label: 'Phiếu bị từ chối', value: statusCounts['Từ chối'], note: 'Không được duyệt' },
    { label: 'Tổng tiền phạt đã thu (VNĐ)', value: totalCollectedFines, note: 'Tổng hợp từ các phiếu trả' },
    { label: 'Tiền phạt tạm tính phiếu quá hạn (VNĐ)', value: totalEstimatedFines, note: 'Đơn giá 5.000 VNĐ / ngày trễ / quyển' },
  ];
  rowCursor = appendTabularBlock(sheet, rowCursor, kpiColumns, kpiRows) + 1;

  styleSectionHeaderRow(sheet, rowCursor, '2. QUY MÔ DANH MỤC THƯ VIỆN', 3);
  rowCursor += 1;
  const catalogRows = [
    { label: 'Tổng số đầu sách', value: data.books.length, note: 'Đầu sách hiện có trong danh mục' },
    { label: 'Tổng số bản sách tồn kho', value: totalBookCopies, note: 'Tổng soLuongHienCo' },
    { label: 'Tổng giá trị sách tồn kho (VNĐ)', value: totalInventoryValue, note: 'Tổng (Đơn giá × Số lượng hiện có)' },
    { label: 'Tổng số tác giả', value: data.authors.length, note: '' },
    { label: 'Tổng số thể loại', value: data.categories.length, note: '' },
    { label: 'Tổng số nhà xuất bản', value: data.publishers.length, note: '' },
    { label: 'Tổng số độc giả', value: data.readers.length, note: '' },
    { label: 'Tổng số nhân viên', value: data.staff.length, note: '' },
  ];
  rowCursor = appendTabularBlock(sheet, rowCursor, kpiColumns, catalogRows) + 1;

  styleSectionHeaderRow(sheet, rowCursor, `3. THỐNG KÊ LƯỢT MƯỢN THEO THÁNG (NĂM ${reportYear})`, 3);
  rowCursor += 1;
  const monthMap = new Map(
    (data.monthlyLoans || []).map((item) => [Number(item.month), item]),
  );
  const full12Months = Array.from({ length: 12 }, (_, idx) => {
    const m = idx + 1;
    const found = monthMap.get(m);
    return {
      monthLabel: `Tháng ${m}`,
      totalLoans: Number(found?.totalLoans || 0),
      totalBooks: Number(found?.totalBooks || 0),
    };
  });
  const monthColumns = [
    { header: 'Tháng', key: 'monthLabel', align: 'left' },
    { header: 'Số phiếu mượn', key: 'totalLoans', align: 'right', numFmt: '#,##0' },
    { header: 'Số quyển sách mượn', key: 'totalBooks', align: 'right', numFmt: '#,##0' },
  ];
  const totalYearLoans = full12Months.reduce((s, r) => s + r.totalLoans, 0);
  const totalYearBooks = full12Months.reduce((s, r) => s + r.totalBooks, 0);
  appendTabularBlock(sheet, rowCursor, monthColumns, full12Months, [
    'Tổng cả năm',
    totalYearLoans,
    totalYearBooks,
  ]);

  autoFitColumns(sheet, 14, 48);
};

const buildUnreturnedSheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('PhieuChuaTra_QuaHan');
  const columns = [
    { header: 'Mã phiếu', key: 'maPhieuMuon', align: 'center', numFmt: '0' },
    { header: 'Mã độc giả', key: 'maDocGia', align: 'center', numFmt: '0' },
    { header: 'Tên độc giả', key: 'fullName' },
    { header: 'Số điện thoại', key: 'dienThoai' },
    { header: 'Email', key: 'email' },
    { header: 'Sách đang mượn', key: 'booksSummary', wrapText: true },
    { header: 'Tổng SL', key: 'totalCopies', align: 'right', numFmt: '#,##0' },
    { header: 'Ngày mượn', key: 'ngayMuonFormatted', align: 'center' },
    { header: 'Hạn trả', key: 'ngayTraFormatted', align: 'center' },
    { header: 'Tình trạng', key: 'statusLabel', align: 'center' },
    { header: 'Số ngày quá hạn', key: 'daysOverdue', align: 'right', numFmt: '#,##0' },
    { header: 'Tiền phạt tạm tính (VNĐ)', key: 'estimatedFine', align: 'right', numFmt: '#,##0' },
  ];

  styleTitleBanner(
    sheet,
    'DANH SÁCH PHIẾU CHƯA TRẢ & QUÁ HẠN',
    `Ngày xuất: ${formatDateTimeVN(referenceDate)} | Tổng số phiếu chưa trả: ${data.unreturnedLoans.length}`,
    columns.length,
  );

  const mappedRows = data.unreturnedLoans.map((loan) => {
    const info = computeOverdueInfo(loan, referenceDate);
    const displayStatus = getLoanDisplayStatus(loan);
    const statusLabel = info.isOverdue
      ? 'Quá hạn'
      : displayStatus === 'Chờ xác nhận trả'
        ? 'Chờ xác nhận trả'
        : 'Còn hạn';
    const booksSummary = Array.isArray(loan.chiTiet) && loan.chiTiet.length
      ? loan.chiTiet.map((ct) => `${ct.tenSach || `Sách #${ct.maSach}`} × ${ct.soLuongSachMuon || 1}`).join(', ')
      : '—';
    return {
      maPhieuMuon: Number(loan.maPhieuMuon),
      maDocGia: Number(loan.maDocGia),
      fullName: loan.fullName || `Độc giả #${loan.maDocGia}`,
      dienThoai: loan.dienThoai || '—',
      email: loan.email || '—',
      booksSummary,
      totalCopies: info.totalCopies,
      ngayMuonFormatted: formatDateVN(loan.ngayMuon),
      ngayTraFormatted: formatDateVN(loan.ngayTra),
      statusLabel,
      daysOverdue: info.daysOverdue,
      estimatedFine: info.estimatedFine,
    };
  });

  const totalCopies = mappedRows.reduce((s, r) => s + r.totalCopies, 0);
  const totalFine = mappedRows.reduce((s, r) => s + r.estimatedFine, 0);
  appendTabularBlock(sheet, 4, columns, mappedRows, [
    'Tổng cộng',
    '',
    `${mappedRows.length} phiếu`,
    '',
    '',
    '',
    totalCopies,
    '',
    '',
    '',
    '',
    totalFine,
  ]);
  sheet.views = [{ state: 'frozen', ySplit: 4 }];
  autoFitColumns(sheet, 11, 42);
};

const buildLoanHistorySheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('LichSuMuonTra');
  const columns = [
    { header: 'Mã phiếu', key: 'maPhieuMuon', align: 'center', numFmt: '0' },
    { header: 'Mã độc giả', key: 'maDocGia', align: 'center', numFmt: '0' },
    { header: 'Tên độc giả', key: 'fullName' },
    { header: 'Mã sách', key: 'maSach', align: 'center', numFmt: '0' },
    { header: 'Tên sách', key: 'tenSach' },
    { header: 'Tác giả', key: 'tenTacGia' },
    { header: 'Thể loại', key: 'tenTheLoai' },
    { header: 'Số lượng', key: 'soLuongSachMuon', align: 'right', numFmt: '#,##0' },
    { header: 'Ngày mượn', key: 'ngayMuonFormatted', align: 'center' },
    { header: 'Hạn trả', key: 'ngayTraFormatted', align: 'center' },
    { header: 'Ngày trả thực tế', key: 'ngayTraThucTeFormatted', align: 'center' },
    { header: 'Trạng thái phiếu', key: 'displayStatus', align: 'center' },
    { header: 'Tiền phạt đã thu (VNĐ)', key: 'tienPhat', align: 'right', numFmt: '#,##0' },
  ];

  styleTitleBanner(
    sheet,
    'CHI TIẾT LỊCH SỬ MƯỢN - TRẢ SÁCH',
    `Ngày xuất: ${formatDateTimeVN(referenceDate)} | Tổng số dòng chi tiết: ${data.loanDetails.length}`,
    columns.length,
  );

  const rows = data.loanDetails.map((row) => ({
    maPhieuMuon: Number(row.maPhieuMuon),
    maDocGia: Number(row.maDocGia),
    fullName: row.fullName || `Độc giả #${row.maDocGia}`,
    maSach: Number(row.maSach),
    tenSach: row.tenSach || `Sách #${row.maSach}`,
    tenTacGia: row.tenTacGia || '—',
    tenTheLoai: row.tenTheLoai || '—',
    soLuongSachMuon: Number(row.soLuongSachMuon || 0),
    ngayMuonFormatted: formatDateVN(row.ngayMuon),
    ngayTraFormatted: formatDateVN(row.ngayTra),
    ngayTraThucTeFormatted: formatDateVN(row.ngayTraSach),
    displayStatus: getLoanDisplayStatus(row),
    tienPhat: Number(row.tienPhat || 0),
  }));

  const totalQty = rows.reduce((s, r) => s + r.soLuongSachMuon, 0);
  const totalFine = rows.reduce((s, r) => s + r.tienPhat, 0);
  appendTabularBlock(sheet, 4, columns, rows, [
    'Tổng cộng',
    '',
    '',
    '',
    `${rows.length} lượt chi tiết`,
    '',
    '',
    totalQty,
    '',
    '',
    '',
    '',
    totalFine,
  ]);
  sheet.views = [{ state: 'frozen', ySplit: 4 }];
  autoFitColumns(sheet, 11, 38);
};

const buildBooksSheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('KhoSach');
  const columns = [
    { header: 'Mã sách', key: 'maSach', align: 'center', numFmt: '0' },
    { header: 'Tên sách', key: 'tenSach' },
    { header: 'Tác giả', key: 'tenTacGia' },
    { header: 'Thể loại', key: 'tenTheLoai' },
    { header: 'Nhà xuất bản', key: 'tenNXB' },
    { header: 'Năm XB', key: 'namXuatBan', align: 'center', numFmt: '0' },
    { header: 'Nguồn gốc', key: 'nguonGoc' },
    { header: 'Đơn giá (VNĐ)', key: 'donGia', align: 'right', numFmt: '#,##0' },
    { header: 'Số lượng hiện có', key: 'soLuongHienCo', align: 'right', numFmt: '#,##0' },
    { header: 'Giá trị tồn kho (VNĐ)', key: 'inventoryValue', align: 'right', numFmt: '#,##0' },
    { header: 'Tổng lượt đã mượn', key: 'tongLuotMuon', align: 'right', numFmt: '#,##0' },
  ];

  styleTitleBanner(
    sheet,
    'DANH MỤC & TỒN KHO SÁCH THƯ VIỆN',
    `Ngày xuất: ${formatDateTimeVN(referenceDate)} | Tổng số đầu sách: ${data.books.length}`,
    columns.length,
  );

  const rows = data.books.map((book) => {
    const donGia = Number(book.donGia || 0);
    const soLuongHienCo = Number(book.soLuongHienCo || 0);
    return {
      maSach: Number(book.maSach),
      tenSach: book.tenSach || '—',
      tenTacGia: book.tenTacGia || '—',
      tenTheLoai: book.tenTheLoai || '—',
      tenNXB: book.tenNXB || '—',
      namXuatBan: Number(book.namXuatBan || 0),
      nguonGoc: book.nguonGoc || '—',
      donGia,
      soLuongHienCo,
      inventoryValue: donGia * soLuongHienCo,
      tongLuotMuon: Number(book.tongLuotMuon || 0),
    };
  });

  const totalStock = rows.reduce((s, r) => s + r.soLuongHienCo, 0);
  const totalValue = rows.reduce((s, r) => s + r.inventoryValue, 0);
  const totalBorrows = rows.reduce((s, r) => s + r.tongLuotMuon, 0);
  appendTabularBlock(sheet, 4, columns, rows, [
    'Tổng cộng',
    `${rows.length} đầu sách`,
    '',
    '',
    '',
    '',
    '',
    '',
    totalStock,
    totalValue,
    totalBorrows,
  ]);
  sheet.views = [{ state: 'frozen', ySplit: 4 }];
  autoFitColumns(sheet, 11, 38);
};

const buildReadersSheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('DocGia');
  const columns = [
    { header: 'Mã độc giả', key: 'maDocGia', align: 'center', numFmt: '0' },
    { header: 'Họ và tên', key: 'fullName' },
    { header: 'Giới tính', key: 'phai', align: 'center' },
    { header: 'Ngày sinh', key: 'ngaySinhFormatted', align: 'center' },
    { header: 'Số điện thoại', key: 'dienThoai' },
    { header: 'Email', key: 'email' },
    { header: 'Địa chỉ', key: 'diaChi', wrapText: true },
    { header: 'Tổng phiếu đã mượn', key: 'tongPhieuMuon', align: 'right', numFmt: '#,##0' },
    { header: 'Sách đang mượn', key: 'sachDangMuon', align: 'right', numFmt: '#,##0' },
    { header: 'Tổng tiền phạt (VNĐ)', key: 'tongTienPhat', align: 'right', numFmt: '#,##0' },
  ];

  styleTitleBanner(
    sheet,
    'DANH SÁCH & HOẠT ĐỘNG ĐỘC GIẢ',
    `Ngày xuất: ${formatDateTimeVN(referenceDate)} | Tổng số độc giả: ${data.readers.length}`,
    columns.length,
  );

  const rows = data.readers.map((reader) => ({
    maDocGia: Number(reader.maDocGia),
    fullName: reader.fullName || '—',
    phai: reader.phai || '—',
    ngaySinhFormatted: formatDateVN(reader.ngaySinh),
    dienThoai: reader.dienThoai || '—',
    email: reader.email || '—',
    diaChi: reader.diaChi || '—',
    tongPhieuMuon: Number(reader.tongPhieuMuon || 0),
    sachDangMuon: Number(reader.sachDangMuon || 0),
    tongTienPhat: Number(reader.tongTienPhat || 0),
  }));

  const totalLoans = rows.reduce((s, r) => s + r.tongPhieuMuon, 0);
  const totalHolding = rows.reduce((s, r) => s + r.sachDangMuon, 0);
  const totalFines = rows.reduce((s, r) => s + r.tongTienPhat, 0);
  appendTabularBlock(sheet, 4, columns, rows, [
    'Tổng cộng',
    `${rows.length} độc giả`,
    '',
    '',
    '',
    '',
    '',
    totalLoans,
    totalHolding,
    totalFines,
  ]);
  sheet.views = [{ state: 'frozen', ySplit: 4 }];
  autoFitColumns(sheet, 11, 38);
};

const buildSystemCatalogSheet = (workbook, data, referenceDate) => {
  const sheet = workbook.addWorksheet('DanhMucHeThong');
  styleTitleBanner(
    sheet,
    'DANH MỤC HỆ THỐNG (TÁC GIẢ, THỂ LOẠI, NXB, NHÂN VIÊN)',
    `Ngày xuất: ${formatDateTimeVN(referenceDate)}`,
    5,
  );

  let rowCursor = 4;

  styleSectionHeaderRow(sheet, rowCursor, `1. TÁC GIẢ (${data.authors.length})`, 5);
  rowCursor += 1;
  rowCursor = appendTabularBlock(sheet, rowCursor, [
    { header: 'Mã tác giả', key: 'maTacGia', align: 'center', numFmt: '0' },
    { header: 'Tên tác giả', key: 'tenTacGia' },
    { header: 'Số điện thoại', key: 'soDienThoai' },
    { header: 'Địa chỉ', key: 'diaChi' },
    { header: 'Số đầu sách', key: 'soDauSach', align: 'right', numFmt: '#,##0' },
  ], data.authors.map((a) => ({
    maTacGia: Number(a.maTacGia),
    tenTacGia: a.tenTacGia || '—',
    soDienThoai: a.soDienThoai || '—',
    diaChi: a.diaChi || '—',
    soDauSach: Number(a.soDauSach || 0),
  }))) + 1;

  styleSectionHeaderRow(sheet, rowCursor, `2. THỂ LOẠI (${data.categories.length})`, 3);
  rowCursor += 1;
  rowCursor = appendTabularBlock(sheet, rowCursor, [
    { header: 'Mã thể loại', key: 'maTheLoai', align: 'center', numFmt: '0' },
    { header: 'Tên thể loại', key: 'tenTheLoai' },
    { header: 'Số đầu sách', key: 'soDauSach', align: 'right', numFmt: '#,##0' },
  ], data.categories.map((c) => ({
    maTheLoai: Number(c.maTheLoai),
    tenTheLoai: c.tenTheLoai || '—',
    soDauSach: Number(c.soDauSach || 0),
  }))) + 1;

  styleSectionHeaderRow(sheet, rowCursor, `3. NHÀ XUẤT BẢN (${data.publishers.length})`, 4);
  rowCursor += 1;
  rowCursor = appendTabularBlock(sheet, rowCursor, [
    { header: 'Mã NXB', key: 'maNXB', align: 'center', numFmt: '0' },
    { header: 'Tên nhà xuất bản', key: 'tenNXB' },
    { header: 'Địa chỉ', key: 'diaChi' },
    { header: 'Số đầu sách', key: 'soDauSach', align: 'right', numFmt: '#,##0' },
  ], data.publishers.map((p) => ({
    maNXB: Number(p.maNXB),
    tenNXB: p.tenNXB || '—',
    diaChi: p.diaChi || '—',
    soDauSach: Number(p.soDauSach || 0),
  }))) + 1;

  styleSectionHeaderRow(sheet, rowCursor, `4. NHÂN VIÊN (${data.staff.length})`, 5);
  rowCursor += 1;
  appendTabularBlock(sheet, rowCursor, [
    { header: 'MSNV', key: 'MSNV', align: 'center', numFmt: '0' },
    { header: 'Họ tên nhân viên', key: 'hoTenNV' },
    { header: 'Chức vụ', key: 'chucVu' },
    { header: 'Số điện thoại', key: 'soDienThoai' },
    { header: 'Địa chỉ', key: 'diaChi' },
  ], data.staff.map((s) => ({
    MSNV: Number(s.MSNV),
    hoTenNV: s.hoTenNV || '—',
    chucVu: s.chucVu || '—',
    soDienThoai: s.soDienThoai || '—',
    diaChi: s.diaChi || '—',
  })));

  autoFitColumns(sheet, 12, 42);
};

async function buildLibraryReportWorkbook(rawData = {}) {
  const referenceDate = rawData.generatedAt instanceof Date
    ? rawData.generatedAt
    : new Date(rawData.generatedAt || Date.now());
  const data = {
    exporterName: rawData.exporterName || 'Quản trị viên',
    summary: rawData.summary || { sachMuonThang: 0, docGiaMuonNam: 0, phieuChuaTra: 0 },
    monthlyLoans: Array.isArray(rawData.monthlyLoans) ? rawData.monthlyLoans : [],
    unreturnedLoans: Array.isArray(rawData.unreturnedLoans) ? rawData.unreturnedLoans : [],
    loanDetails: Array.isArray(rawData.loanDetails) ? rawData.loanDetails : [],
    books: Array.isArray(rawData.books) ? rawData.books : [],
    readers: Array.isArray(rawData.readers) ? rawData.readers : [],
    authors: Array.isArray(rawData.authors) ? rawData.authors : [],
    categories: Array.isArray(rawData.categories) ? rawData.categories : [],
    publishers: Array.isArray(rawData.publishers) ? rawData.publishers : [],
    staff: Array.isArray(rawData.staff) ? rawData.staff : [],
  };

  const workbook = new ExcelJS.Workbook();
  workbook.creator = data.exporterName;
  workbook.created = referenceDate;

  buildOverviewSheet(workbook, data, referenceDate);
  buildUnreturnedSheet(workbook, data, referenceDate);
  buildLoanHistorySheet(workbook, data, referenceDate);
  buildBooksSheet(workbook, data, referenceDate);
  buildReadersSheet(workbook, data, referenceDate);
  buildSystemCatalogSheet(workbook, data, referenceDate);

  return workbook;
}

module.exports = {
  FINE_PER_DAY_PER_COPY,
  buildLibraryReportWorkbook,
  computeOverdueInfo,
  formatDateVN,
};

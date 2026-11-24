import api from '@/services/api';

const normalizeMonthlyLoans = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      label: String(item.label ?? item.thang ?? item.month ?? ''),
      value: Number(item.value ?? item.soLuong ?? item.tongSachMuon),
    }))
    .filter((item) => item.label && Number.isFinite(item.value) && item.value >= 0);
};

const normalizeLoans = (value) => {
  if (!Array.isArray(value)) {
    throw new Error('API danh sách phiếu chưa trả trả về dữ liệu không hợp lệ.');
  }

  return value.map((loan) => ({
    ...loan,
    chiTiet: Array.isArray(loan.chiTiet) ? loan.chiTiet : [],
  }));
};

const normalizeCount = (value, field) => {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) {
    throw new Error(`API tổng quan trả về chỉ số ${field} không hợp lệ.`);
  }
  return count;
};

export default {
  async getDashboardReport() {
    const [summaryResponse, loansResponse, allRequestsResponse] = await Promise.all([
      api.get('/thong-ke/tong-quan'),
      api.get('/thong-ke/phieu-chua-tra'),
      api.get('/muonsach/admin/requests').catch(() => ({ data: [] })),
    ]);

    const summary = summaryResponse.data;
    if (!summary || typeof summary !== 'object') {
      throw new Error('API tổng quan trả về dữ liệu không hợp lệ.');
    }

    const booksBorrowedThisMonth = normalizeCount(summary.sachMuonThang, 'sachMuonThang');
    let monthlyLoans = normalizeMonthlyLoans(summary.monthlyLoans);

    // Nếu API tổng quan chưa có monthlyLoans, tổng hợp từ toàn bộ lịch sử phiếu mượn thực tế
    if (monthlyLoans.length === 0 && Array.isArray(allRequestsResponse.data) && allRequestsResponse.data.length > 0) {
      const currentYear = new Date().getFullYear();
      const monthMap = new Map();

      for (const req of allRequestsResponse.data) {
        if (!req.ngayMuon) continue;
        if (!['Đang mượn', 'Đã trả'].includes(req.trangThai)) continue;

        const date = new Date(req.ngayMuon);
        if (Number.isNaN(date.getTime())) continue;
        if (date.getFullYear() !== currentYear) continue;

        const m = date.getMonth() + 1;
        const totalCopies = (req.ChiTietPhieuMuons || []).reduce(
          (sum, ct) => sum + Number(ct.soLuongSachMuon || 1), 0
        );
        monthMap.set(m, (monthMap.get(m) || 0) + totalCopies);
      }

      // Đảm bảo tháng hiện tại có số liệu khớp với sachMuonThang
      const currentMonth = new Date().getMonth() + 1;
      if (!monthMap.has(currentMonth) && booksBorrowedThisMonth > 0) {
        monthMap.set(currentMonth, booksBorrowedThisMonth);
      }

      if (monthMap.size > 0) {
        const sortedMonths = Array.from(monthMap.keys()).sort((a, b) => a - b);
        monthlyLoans = sortedMonths.map((m) => ({
          label: `Thg ${m}`,
          value: monthMap.get(m),
        }));
      }
    }

    if (monthlyLoans.length === 0) {
      const now = new Date();
      monthlyLoans.push({ label: `Thg ${now.getMonth() + 1}`, value: booksBorrowedThisMonth });
    }

    return {
      statistics: {
        tongSachMuonThang: booksBorrowedThisMonth,
        tongDocGiaMuonSachNam: normalizeCount(summary.docGiaMuonNam, 'docGiaMuonNam'),
        phieuChuaTra: normalizeCount(summary.phieuChuaTra, 'phieuChuaTra'),
      },
      unreturnedLoans: normalizeLoans(loansResponse.data),
      monthlyLoans,
    };
  },
};

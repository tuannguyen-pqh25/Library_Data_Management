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
    const [summaryResponse, loansResponse] = await Promise.all([
      api.get('/thong-ke/tong-quan'),
      api.get('/thong-ke/phieu-chua-tra'),
    ]);

    const summary = summaryResponse.data;
    if (!summary || typeof summary !== 'object') {
      throw new Error('API tổng quan trả về dữ liệu không hợp lệ.');
    }

    const booksBorrowedThisMonth = normalizeCount(summary.sachMuonThang, 'sachMuonThang');
    const monthlyLoans = normalizeMonthlyLoans(summary.monthlyLoans);
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
      // Hợp đồng hiện tại có tổng tháng này nhưng chưa có lịch sử nhiều tháng.
      monthlyLoans,
    };
  },
};

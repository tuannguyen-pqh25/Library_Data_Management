// Giai đoạn 1 dùng dữ liệu minh họa; thay implementation này bằng API ở giai đoạn 2.
const demoReport = {
  statistics: {
    tongSachMuonThang: 248,
    tongDocGiaMuonSachNam: 136,
    phieuChuaTra: 18
  },
  monthlyLoans: [
    { label: 'Thg 5', value: 154 },
    { label: 'Thg 6', value: 182 },
    { label: 'Thg 7', value: 171 },
    { label: 'Thg 8', value: 209 },
    { label: 'Thg 9', value: 221 },
    { label: 'Thg 10', value: 248 }
  ],
  unreturnedLoans: [
    {
      maPhieuMuon: 1024,
      maDocGia: 24,
      fullName: 'Nguyễn Hải Linh',
      ngayMuon: '2026-09-24',
      ngayTra: '2026-10-01'
    },
    {
      maPhieuMuon: 1081,
      maDocGia: 81,
      fullName: 'Phạm Minh Tú',
      ngayMuon: '2026-09-26',
      ngayTra: '2026-10-03'
    },
    {
      maPhieuMuon: 1115,
      maDocGia: 115,
      fullName: 'Trần Ngọc Mai',
      ngayMuon: '2026-09-28',
      ngayTra: '2026-10-07'
    }
  ]
};

const cloneReport = (report) => ({
  statistics: { ...report.statistics },
  monthlyLoans: report.monthlyLoans.map((month) => ({ ...month })),
  unreturnedLoans: report.unreturnedLoans.map((loan) => ({ ...loan }))
});

// Chọn trạng thái demo qua ?dashboardState=empty hoặc ?dashboardState=error.
const getDemoState = () => new URLSearchParams(window.location.search).get('dashboardState');

export default {
  async getDashboardReport() {
    // Giữ cùng giao diện bất đồng bộ như service API để thay nguồn dữ liệu dễ dàng.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const state = getDemoState();
    if (state === 'error') throw new Error('Không thể tải số liệu demo. Hãy thử tải lại.');
    if (state === 'empty') {
      return {
        statistics: { tongSachMuonThang: 0, tongDocGiaMuonSachNam: 0, phieuChuaTra: 0 },
        monthlyLoans: [],
        unreturnedLoans: []
      };
    }
    return cloneReport(demoReport);
  }
};

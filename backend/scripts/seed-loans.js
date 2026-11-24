'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  DocGia,
  Sach,
  PhieuMuon,
  ChiTietPhieuMuon,
  PhieuTra,
} = require('../models');

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fixedDate = (year, month, day) => {
  return new Date(year, month - 1, day, 9, 0, 0);
};

async function seedLoans() {
  await sequelize.authenticate();
  console.log('✅ Kết nối CSDL thành công!');

  const transaction = await sequelize.transaction();

  try {
    // 1. Tạo hoặc lấy danh sách các Độc giả mẫu
    const demoReadersData = [
      { email: 'demo.reader@example.test', fullName: 'Nguyễn Văn An (Demo Reader)', ngaySinh: '2000-05-15', phai: 'Nam', diaChi: 'Cần Thơ', dienThoai: '0901234567' },
      { email: 'tran.thi.b@example.test', fullName: 'Trần Thị Bích', ngaySinh: '2001-08-20', phai: 'Nữ', diaChi: 'Hậu Giang', dienThoai: '0909876543' },
      { email: 'le.van.c@example.test', fullName: 'Lê Văn Cường', ngaySinh: '2000-11-10', phai: 'Nam', diaChi: 'Vĩnh Long', dienThoai: '0912345678' },
      { email: 'pham.thi.d@example.test', fullName: 'Phạm Thị Dung', ngaySinh: '2002-03-25', phai: 'Nữ', diaChi: 'Đồng Tháp', dienThoai: '0923456789' },
      { email: 'hoang.van.e@example.test', fullName: 'Hoàng Văn Em', ngaySinh: '1999-07-14', phai: 'Nam', diaChi: 'An Giang', dienThoai: '0934567890' },
      { email: 'nguyen.thi.mai@example.test', fullName: 'Nguyễn Thị Mai', ngaySinh: '2001-12-05', phai: 'Nữ', diaChi: 'Kiên Giang', dienThoai: '0945678901' },
    ];

    const readers = [];
    const hash = await bcrypt.hash('DemoReader123!', 10);

    for (const rData of demoReadersData) {
      let r = await DocGia.findOne({ where: { email: rData.email }, transaction });
      if (!r) {
        r = await DocGia.create({
          ...rData,
          password: hash,
          ngaySinh: new Date(rData.ngaySinh),
        }, { transaction });
      }
      readers.push(r);
    }
    console.log(`👤 Đã sẵn sàng ${readers.length} tài khoản độc giả mẫu.`);

    // 2. Lấy danh sách Sách có sẵn trong hệ thống
    const books = await Sach.findAll({
      limit: 15,
      order: [['maSach', 'ASC']],
      transaction,
    });

    if (books.length === 0) {
      throw new Error('Chưa có sách nào trong CSDL! Hãy chạy `npm run demo:setup` trước để nạp sách.');
    }
    console.log(`📚 Đang sử dụng ${books.length} sách mẫu để tạo dữ liệu mượn trả.`);

    // 3. Dọn dẹp các phiếu mượn cũ của nhóm độc giả demo để nạp mới tinh
    const readerIds = readers.map(r => r.maDocGia);
    const existingLoans = await PhieuMuon.findAll({
      where: { maDocGia: readerIds },
      transaction,
    });

    if (existingLoans.length > 0) {
      console.log(`🧹 Đang dọn dẹp ${existingLoans.length} phiếu mượn cũ để tạo bộ dữ liệu biểu đồ mới nhất...`);
      for (const loan of existingLoans) {
        const details = await ChiTietPhieuMuon.findAll({
          where: { maPhieuMuon: loan.maPhieuMuon, maDocGia: loan.maDocGia },
          transaction,
        });
        for (const ct of details) {
          await PhieuTra.destroy({ where: { maChiTietPM: ct.maChiTietPM }, transaction });
        }
        await ChiTietPhieuMuon.destroy({
          where: { maPhieuMuon: loan.maPhieuMuon, maDocGia: loan.maDocGia },
          transaction,
        });
        await loan.destroy({ transaction });
      }
    }

    // Helper tạo phiếu mượn và chi tiết
    const createLoanWithDetail = async ({ reader, book, ngayMuon, ngayTra, trangThai, soLuong = 1, yeuCauTraAt = null, ngayTraSach = null }) => {
      const loan = await PhieuMuon.create({
        maDocGia: reader.maDocGia,
        ngayMuon,
        ngayTra,
        trangThai,
        yeuCauTraAt,
      }, { transaction });

      const detail = await ChiTietPhieuMuon.create({
        maPhieuMuon: loan.maPhieuMuon,
        maDocGia: reader.maDocGia,
        maSach: book.maSach,
        maTacGia: book.maTacGia,
        maTheLoai: book.maTheLoai,
        soLuongSachMuon: soLuong,
      }, { transaction });

      let phieuTra = null;
      if (trangThai === 'Đã trả' && ngayTraSach) {
        phieuTra = await PhieuTra.create({
          maChiTietPM: detail.maChiTietPM,
          maPhieuMuon: loan.maPhieuMuon,
          maSach: book.maSach,
          ngayTraSach,
        }, { transaction });
        await phieuTra.reload({ transaction });
      }

      return { loan, detail, phieuTra };
    };

    // =========================================================================
    // DỮ LIỆU LỊCH SỬ CÁC THÁNG TRƯỚC (THÁNG 6 -> THÁNG 10/2026) CHO BIỂU ĐỒ ĐẸP
    // =========================================================================
    console.log('📊 Đang tạo dữ liệu lịch sử mượn sách qua các tháng (Thg 6 -> Thg 10/2026)...');

    const historicalData = [
      // THÁNG 6 (Tổng: 8 quyển)
      { month: 6, rIdx: 0, bIdx: 0, dMuon: 5,  dTraDK: 19, dTraTT: 18, soLuong: 2 },
      { month: 6, rIdx: 1, bIdx: 1, dMuon: 12, dTraDK: 26, dTraTT: 25, soLuong: 3 },
      { month: 6, rIdx: 2, bIdx: 2, dMuon: 20, dTraDK: 4,  dTraTT: 3,  soLuong: 3 },

      // THÁNG 7 (Tổng: 12 quyển)
      { month: 7, rIdx: 0, bIdx: 3, dMuon: 4,  dTraDK: 18, dTraTT: 17, soLuong: 2 },
      { month: 7, rIdx: 3, bIdx: 4, dMuon: 10, dTraDK: 24, dTraTT: 24, soLuong: 3 },
      { month: 7, rIdx: 4, bIdx: 5, dMuon: 18, dTraDK: 1,  dTraTT: 2,  soLuong: 4 }, // Trễ 1 ngày
      { month: 7, rIdx: 1, bIdx: 0, dMuon: 25, dTraDK: 8,  dTraTT: 7,  soLuong: 3 },

      // THÁNG 8 (Tổng: 16 quyển)
      { month: 8, rIdx: 2, bIdx: 1, dMuon: 3,  dTraDK: 17, dTraTT: 16, soLuong: 3 },
      { month: 8, rIdx: 5, bIdx: 2, dMuon: 11, dTraDK: 25, dTraTT: 25, soLuong: 4 },
      { month: 8, rIdx: 0, bIdx: 6, dMuon: 18, dTraDK: 1,  dTraTT: 1,  soLuong: 4 },
      { month: 8, rIdx: 3, bIdx: 7, dMuon: 26, dTraDK: 9,  dTraTT: 8,  soLuong: 5 },

      // THÁNG 9 (Mùa khai giảng cao điểm - Tổng: 24 quyển)
      { month: 9, rIdx: 1, bIdx: 3, dMuon: 2,  dTraDK: 16, dTraTT: 15, soLuong: 4 },
      { month: 9, rIdx: 4, bIdx: 4, dMuon: 8,  dTraDK: 22, dTraTT: 22, soLuong: 5 },
      { month: 9, rIdx: 2, bIdx: 0, dMuon: 15, dTraDK: 29, dTraTT: 28, soLuong: 5 },
      { month: 9, rIdx: 0, bIdx: 8, dMuon: 21, dTraDK: 5,  dTraTT: 7,  soLuong: 4 }, // Trễ 2 ngày
      { month: 9, rIdx: 5, bIdx: 5, dMuon: 27, dTraDK: 11, dTraTT: 10, soLuong: 6 },

      // THÁNG 10 (Tổng: 19 quyển)
      { month: 10, rIdx: 3, bIdx: 1, dMuon: 3,  dTraDK: 17, dTraTT: 16, soLuong: 3 },
      { month: 10, rIdx: 1, bIdx: 2, dMuon: 10, dTraDK: 24, dTraTT: 23, soLuong: 4 },
      { month: 10, rIdx: 4, bIdx: 6, dMuon: 16, dTraDK: 30, dTraTT: 30, soLuong: 4 },
      { month: 10, rIdx: 2, bIdx: 7, dMuon: 22, dTraDK: 5,  dTraTT: 5,  soLuong: 4 },
      { month: 10, rIdx: 0, bIdx: 9, dMuon: 28, dTraDK: 11, dTraTT: 11, soLuong: 4 },
    ];

    for (const item of historicalData) {
      const reader = readers[item.rIdx % readers.length];
      const book = books[item.bIdx % books.length];

      const ngayMuon = fixedDate(2026, item.month, item.dMuon);
      // Hạn trả (thường +14 ngày, nếu qua tháng sau thì tính đúng)
      const nextMonth = item.dTraDK < item.dMuon ? item.month + 1 : item.month;
      const ngayTra = fixedDate(2026, nextMonth, item.dTraDK);
      const returnMonth = item.dTraTT < item.dMuon ? item.month + 1 : item.month;
      const ngayTraSach = fixedDate(2026, returnMonth, item.dTraTT);

      await createLoanWithDetail({
        reader,
        book,
        ngayMuon,
        ngayTra,
        trangThai: 'Đã trả',
        soLuong: item.soLuong,
        ngayTraSach,
      });
    }

    // =========================================================================
    // DỮ LIỆU THÁNG 11/2026 (THÁNG HIỆN TẠI - 5 KỊCH BẢN CHÍNH DEMO BẢO VỆ)
    // =========================================================================
    console.log('⭐ Đang tạo 5 kịch bản trọng tâm cho Tháng 11 (Demo Trigger & Phạt trễ hạn)...');

    const createdResults = [];

    // KỊCH BẢN 1: ĐÃ TRẢ QUÁ HẠN (Trigger `trg_tinh_tien_phat` tự tính tiền phạt)
    // Mượn: 20 ngày trước, Hạn trả: 7 ngày trước (quá hạn 7 ngày), Trả: Hôm nay.
    // Mượn 2 cuốn -> Phạt = 7 ngày * 5.000đ * 2 cuốn = 70.000 VNĐ.
    const b1 = books[0];
    const { phieuTra: return1 } = await createLoanWithDetail({
      reader: readers[0],
      book: b1,
      ngayMuon: dateOffset(-20),
      ngayTra: dateOffset(-7),
      trangThai: 'Đã trả',
      soLuong: 2,
      ngayTraSach: new Date(),
    });

    createdResults.push({
      thang: 'Thg 11',
      scenario: '1. Đã trả quá hạn (ĐÃ kích hoạt Trigger)',
      reader: readers[0].fullName,
      book: b1.tenSach,
      soLuong: 2,
      trangThai: 'Đã trả',
      tienPhatDoTrigger: `${return1.tienPhat.toLocaleString('vi-VN')} VNĐ`,
    });

    // KỊCH BẢN 2: ĐANG MƯỢN ĐÃ QUÁ HẠN + CHỜ XÁC NHẬN TRẢ (Dùng để test Live Trigger)
    // Mượn: 18 ngày trước, Hạn trả: 4 ngày trước (quá hạn 4 ngày).
    // Độc giả đã gửi yêu cầu trả -> UI hiện nút "Xác nhận đã nhận sách" & phạt tạm tính 20.000đ.
    const b2 = books[1] || books[0];
    await createLoanWithDetail({
      reader: readers[0],
      book: b2,
      ngayMuon: dateOffset(-18),
      ngayTra: dateOffset(-4),
      trangThai: 'Đang mượn',
      soLuong: 1,
      yeuCauTraAt: dateOffset(-1),
    });
    if (b2.soLuongHienCo > 0) {
      await b2.decrement('soLuongHienCo', { by: 1, transaction });
    }

    createdResults.push({
      thang: 'Thg 11',
      scenario: '2. Đang mượn quá hạn (Test Live Trigger)',
      reader: readers[0].fullName,
      book: b2.tenSach,
      soLuong: 1,
      trangThai: 'Đang mượn (Yêu cầu trả)',
      tienPhatDoTrigger: 'Tạm tính: 20.000 VNĐ (4 ngày * 5.000)',
    });

    // KỊCH BẢN 3: ĐANG MƯỢN TRONG HẠN (Hạn còn 11 ngày)
    const b3 = books[2] || books[0];
    await createLoanWithDetail({
      reader: readers[1],
      book: b3,
      ngayMuon: dateOffset(-3),
      ngayTra: dateOffset(11),
      trangThai: 'Đang mượn',
      soLuong: 1,
    });
    if (b3.soLuongHienCo > 0) {
      await b3.decrement('soLuongHienCo', { by: 1, transaction });
    }

    createdResults.push({
      thang: 'Thg 11',
      scenario: '3. Đang mượn trong hạn',
      reader: readers[1].fullName,
      book: b3.tenSach,
      soLuong: 1,
      trangThai: 'Đang mượn',
      tienPhatDoTrigger: '0 VNĐ',
    });

    // KỊCH BẢN 4: CHỜ DUYỆT (Yêu cầu mượn mới)
    const b4 = books[3] || books[0];
    await createLoanWithDetail({
      reader: readers[0],
      book: b4,
      ngayMuon: new Date(),
      ngayTra: dateOffset(14),
      trangThai: 'Chờ duyệt',
      soLuong: 1,
    });

    createdResults.push({
      thang: 'Thg 11',
      scenario: '4. Chờ duyệt (Yêu cầu mới)',
      reader: readers[0].fullName,
      book: b4.tenSach,
      soLuong: 1,
      trangThai: 'Chờ duyệt',
      tienPhatDoTrigger: '0 VNĐ',
    });

    // KỊCH BẢN 5: ĐÃ TRẢ ĐÚNG HẠN (Trả sớm 1 ngày)
    const b5 = books[4] || books[0];
    const { phieuTra: return5 } = await createLoanWithDetail({
      reader: readers[1],
      book: b5,
      ngayMuon: dateOffset(-14),
      ngayTra: dateOffset(-2),
      trangThai: 'Đã trả',
      soLuong: 1,
      ngayTraSach: dateOffset(-3),
    });

    createdResults.push({
      thang: 'Thg 11',
      scenario: '5. Đã trả đúng hạn (Trả sớm 1 ngày)',
      reader: readers[1].fullName,
      book: b5.tenSach,
      soLuong: 1,
      trangThai: 'Đã trả',
      tienPhatDoTrigger: `${return5.tienPhat.toLocaleString('vi-VN')} VNĐ`,
    });

    // KỊCH BẢN PHỤ CHO THÁNG 11: Thêm 2 phiếu đã trả để số lượng tháng 11 đạt 14 quyển
    await createLoanWithDetail({
      reader: readers[2],
      book: books[5] || books[0],
      ngayMuon: dateOffset(-12),
      ngayTra: dateOffset(2),
      trangThai: 'Đã trả',
      soLuong: 4,
      ngayTraSach: dateOffset(-1),
    });
    await createLoanWithDetail({
      reader: readers[3],
      book: books[6] || books[0],
      ngayMuon: dateOffset(-10),
      ngayTra: dateOffset(4),
      trangThai: 'Đã trả',
      soLuong: 4,
      ngayTraSach: dateOffset(-2),
    });

    await transaction.commit();

    console.log('\n===============================================================');
    console.log('🎉 SEED DỮ LIỆU ĐA THÁNG (THG 6 -> THG 11) & TRIGGER THÀNH CÔNG!');
    console.log('===============================================================');
    console.table(createdResults);

    // Tính thống kê theo tháng
    const [monthlyStats] = await sequelize.query(`
      SELECT 
        MONTH(pm.ngayMuon) AS thangSo,
        CONCAT('Thg ', MONTH(pm.ngayMuon)) AS nhanThang,
        SUM(ct.soLuongSachMuon) AS tongSachMuon
      FROM PhieuMuon pm
      JOIN ChiTietPhieuMuon ct ON ct.maPhieuMuon = pm.maPhieuMuon
      WHERE pm.trangThai IN ('Đang mượn', 'Đã trả')
        AND YEAR(pm.ngayMuon) = 2026
      GROUP BY MONTH(pm.ngayMuon), CONCAT('Thg ', MONTH(pm.ngayMuon))
      ORDER BY thangSo ASC;
    `);

    console.log('\n📊 THỐNG KÊ LƯỢT MƯỢN TRÊN BIỂU ĐỒ (2026):');
    console.table(monthlyStats);

  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('❌ Lỗi khi seed dữ liệu mượn trả:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedLoans().catch(() => process.exit(1));
}

module.exports = { seedLoans };

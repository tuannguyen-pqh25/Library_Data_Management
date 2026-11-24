'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  DocGia,
  Sach,
  TacGia,
  TheLoai,
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

async function seedLoans() {
  await sequelize.authenticate();
  console.log('✅ Kết nối CSDL thành công!');

  const transaction = await sequelize.transaction();

  try {
    // 1. Lấy hoặc tạo Độc giả demo
    let reader = await DocGia.findOne({ where: { email: 'demo.reader@example.test' }, transaction });
    if (!reader) {
      const hash = await bcrypt.hash('DemoReader123!', 10);
      reader = await DocGia.create({
        email: 'demo.reader@example.test',
        password: hash,
        fullName: 'Nguyễn Văn An (Demo Reader)',
        ngaySinh: new Date('2000-05-15'),
        phai: 'Nam',
        diaChi: 'Cần Thơ',
        dienThoai: '0901234567',
      }, { transaction });
      console.log('👤 Đã tạo độc giả demo:', reader.fullName);
    } else {
      console.log('👤 Đã tìm thấy độc giả demo:', reader.fullName, `(ID: ${reader.maDocGia})`);
    }

    // Độc giả thứ 2 để bảng phong phú hơn
    let reader2 = await DocGia.findOne({ where: { email: 'tran.thi.b@example.test' }, transaction });
    if (!reader2) {
      const hash2 = await bcrypt.hash('DemoReader123!', 10);
      reader2 = await DocGia.create({
        email: 'tran.thi.b@example.test',
        password: hash2,
        fullName: 'Trần Thị Bích',
        ngaySinh: new Date('2001-08-20'),
        phai: 'Nữ',
        diaChi: 'Hậu Giang',
        dienThoai: '0909876543',
      }, { transaction });
    }

    // 2. Lấy danh sách Sách có sẵn
    const books = await Sach.findAll({
      limit: 10,
      order: [['maSach', 'ASC']],
      transaction,
    });

    if (books.length === 0) {
      throw new Error('Chưa có sách nào trong CSDL! Hãy chạy `npm run demo:setup` trước để nạp sách.');
    }

    console.log(`📚 Đang sử dụng ${books.length} sách mẫu để tạo dữ liệu mượn trả.`);

    // Xóa sạch phiếu mượn cũ của 2 độc giả demo để seed lại mới tinh, không bị trùng lặp
    const existingLoans = await PhieuMuon.findAll({
      where: { maDocGia: [reader.maDocGia, reader2.maDocGia] },
      transaction,
    });

    if (existingLoans.length > 0) {
      console.log(`🧹 Đang dọn dẹp ${existingLoans.length} phiếu mượn cũ để tạo bộ dữ liệu mới nhất...`);
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

    const createdResults = [];

    // =========================================================================
    // KỊCH BẢN 1: ĐÃ TRẢ MUỘN -> TRIGGER `trg_tinh_tien_phat` ĐÃ TỰ TÍNH TIỀN PHẠT!
    // =========================================================================
    // Mượn 20 ngày trước, hạn trả 6 ngày trước (trễ 6 ngày), trả vào hôm nay.
    // Mượn 2 cuốn sách -> Tiền phạt = 6 ngày * 5.000 VNĐ * 2 cuốn = 60.000 VNĐ.
    const b1 = books[0];
    const loan1 = await PhieuMuon.create({
      maDocGia: reader.maDocGia,
      ngayMuon: dateOffset(-20),
      ngayTra: dateOffset(-6),
      trangThai: 'Đã trả',
    }, { transaction });

    const detail1 = await ChiTietPhieuMuon.create({
      maPhieuMuon: loan1.maPhieuMuon,
      maDocGia: reader.maDocGia,
      maSach: b1.maSach,
      maTacGia: b1.maTacGia,
      maTheLoai: b1.maTheLoai,
      soLuongSachMuon: 2,
    }, { transaction });

    // Tạo Phiếu Trả: Ta chỉ truyền ngày trả là hôm nay, KHÔNG truyền tienPhat để Trigger tự tính!
    const return1 = await PhieuTra.create({
      maChiTietPM: detail1.maChiTietPM,
      maPhieuMuon: loan1.maPhieuMuon,
      maSach: b1.maSach,
      ngayTraSach: new Date(),
    }, { transaction });

    // Reload lại từ CSDL để đọc tiền phạt do Trigger sinh ra
    await return1.reload({ transaction });
    createdResults.push({
      scenario: '1. Đã trả quá hạn (ĐÃ kích hoạt Trigger)',
      reader: reader.fullName,
      book: b1.tenSach,
      soLuong: 2,
      trangThai: 'Đã trả',
      ngayTraDuKien: dateOffset(-6).toISOString().split('T')[0],
      ngayTraThucTe: new Date().toISOString().split('T')[0],
      tienPhatDoTriggerTinh: return1.tienPhat,
    });

    // =========================================================================
    // KỊCH BẢN 2: ĐANG MƯỢN ĐÃ QUÁ HẠN & CÓ YÊU CẦU TRẢ (Để tự tay test Trigger trên UI)
    // =========================================================================
    // Mượn 18 ngày trước, hạn trả 4 ngày trước (quá hạn 4 ngày).
    // Độc giả đã bấm yêu cầu trả sách -> Trên UI sẽ hiện:
    // Badge "Quá hạn (4 ngày)", "Tạm tính: 20.000 đ", và Nút "Xác nhận đã nhận sách"!
    // Khi Admin bấm nút này -> Backend tạo PhieuTra -> Trigger sẽ tính tiền phạt thời gian thực!
    const b2 = books[1] || books[0];
    const loan2 = await PhieuMuon.create({
      maDocGia: reader.maDocGia,
      ngayMuon: dateOffset(-18),
      ngayTra: dateOffset(-4),
      trangThai: 'Đang mượn',
      yeuCauTraAt: dateOffset(-1),
    }, { transaction });

    await ChiTietPhieuMuon.create({
      maPhieuMuon: loan2.maPhieuMuon,
      maDocGia: reader.maDocGia,
      maSach: b2.maSach,
      maTacGia: b2.maTacGia,
      maTheLoai: b2.maTheLoai,
      soLuongSachMuon: 1,
    }, { transaction });

    // Trừ kho tương ứng vì đang mượn
    if (b2.soLuongHienCo > 0) {
      await b2.decrement('soLuongHienCo', { by: 1, transaction });
    }

    createdResults.push({
      scenario: '2. Đang mượn quá hạn + Chờ xác nhận trả (Test Trigger Live trên Web)',
      reader: reader.fullName,
      book: b2.tenSach,
      soLuong: 1,
      trangThai: 'Đang mượn (Yêu cầu trả)',
      ngayTraDuKien: dateOffset(-4).toISOString().split('T')[0],
      tienPhatTamTinh: '4 ngày * 5.000 = 20.000 VNĐ',
    });

    // =========================================================================
    // KỊCH BẢN 3: ĐANG MƯỢN TRONG HẠN (Bình thường, không quá hạn)
    // =========================================================================
    const b3 = books[2] || books[0];
    const loan3 = await PhieuMuon.create({
      maDocGia: reader2.maDocGia,
      ngayMuon: dateOffset(-3),
      ngayTra: dateOffset(11),
      trangThai: 'Đang mượn',
    }, { transaction });

    await ChiTietPhieuMuon.create({
      maPhieuMuon: loan3.maPhieuMuon,
      maDocGia: reader2.maDocGia,
      maSach: b3.maSach,
      maTacGia: b3.maTacGia,
      maTheLoai: b3.maTheLoai,
      soLuongSachMuon: 1,
    }, { transaction });

    if (b3.soLuongHienCo > 0) {
      await b3.decrement('soLuongHienCo', { by: 1, transaction });
    }

    createdResults.push({
      scenario: '3. Đang mượn đúng hạn (Hạn còn 11 ngày)',
      reader: reader2.fullName,
      book: b3.tenSach,
      soLuong: 1,
      trangThai: 'Đang mượn',
      ngayTraDuKien: dateOffset(11).toISOString().split('T')[0],
      tienPhat: '0 VNĐ',
    });

    // =========================================================================
    // KỊCH BẢN 4: CHỜ DUYỆT (Pending) -> Để Admin test duyệt mượn
    // =========================================================================
    const b4 = books[3] || books[0];
    const loan4 = await PhieuMuon.create({
      maDocGia: reader.maDocGia,
      ngayMuon: new Date(),
      ngayTra: dateOffset(14),
      trangThai: 'Chờ duyệt',
    }, { transaction });

    await ChiTietPhieuMuon.create({
      maPhieuMuon: loan4.maPhieuMuon,
      maDocGia: reader.maDocGia,
      maSach: b4.maSach,
      maTacGia: b4.maTacGia,
      maTheLoai: b4.maTheLoai,
      soLuongSachMuon: 1,
    }, { transaction });

    createdResults.push({
      scenario: '4. Chờ duyệt (Yêu cầu mới)',
      reader: reader.fullName,
      book: b4.tenSach,
      soLuong: 1,
      trangThai: 'Chờ duyệt',
      ngayTraDuKien: dateOffset(14).toISOString().split('T')[0],
      tienPhat: '0 VNĐ',
    });

    // =========================================================================
    // KỊCH BẢN 5: ĐÃ TRẢ ĐÚNG HẠN -> Tiền phạt do Trigger tính = 0 VNĐ
    // =========================================================================
    const b5 = books[4] || books[0];
    const loan5 = await PhieuMuon.create({
      maDocGia: reader2.maDocGia,
      ngayMuon: dateOffset(-14),
      ngayTra: dateOffset(-2),
      trangThai: 'Đã trả',
    }, { transaction });

    const detail5 = await ChiTietPhieuMuon.create({
      maPhieuMuon: loan5.maPhieuMuon,
      maDocGia: reader2.maDocGia,
      maSach: b5.maSach,
      maTacGia: b5.maTacGia,
      maTheLoai: b5.maTheLoai,
      soLuongSachMuon: 1,
    }, { transaction });

    const return5 = await PhieuTra.create({
      maChiTietPM: detail5.maChiTietPM,
      maPhieuMuon: loan5.maPhieuMuon,
      maSach: b5.maSach,
      ngayTraSach: dateOffset(-3), // Trả sớm hơn hạn 1 ngày
    }, { transaction });

    await return5.reload({ transaction });

    createdResults.push({
      scenario: '5. Đã trả đúng hạn (Trả sớm 1 ngày)',
      reader: reader2.fullName,
      book: b5.tenSach,
      soLuong: 1,
      trangThai: 'Đã trả',
      ngayTraDuKien: dateOffset(-2).toISOString().split('T')[0],
      ngayTraThucTe: dateOffset(-3).toISOString().split('T')[0],
      tienPhatDoTriggerTinh: return5.tienPhat,
    });

    await transaction.commit();

    console.log('\n===============================================================');
    console.log('🎉 SEED DỮ LIỆU QUẢN LÝ MƯỢN TRẢ & TRIGGER TIỀN PHẠT THÀNH CÔNG!');
    console.log('===============================================================');
    console.table(createdResults);

    console.log('\n🔍 BẰNG CHỨNG TRIGGER HOẠT ĐỘNG:');
    console.log(`- Kịch bản 1 (Quá hạn, mượn 2 cuốn): Trigger tự tính tiền phạt = ${return1.tienPhat.toLocaleString('vi-VN')} VNĐ (Công thức: DATEDIFF * 5.000 * 2)`);
    console.log(`- Kịch bản 5 (Trả sớm 1 ngày): Trigger tự tính tiền phạt = ${return5.tienPhat.toLocaleString('vi-VN')} VNĐ (ĐÚNG 0 VNĐ)`);
    console.log(`- Kịch bản 2 (Đang trễ 4 ngày): Mở tab "Chờ xác nhận trả" trên Web và bấm "Xác nhận đã nhận sách" để xem Trigger tính phạt 20.000 VNĐ trực tiếp!`);

  } catch (error) {
    await transaction.rollback();
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

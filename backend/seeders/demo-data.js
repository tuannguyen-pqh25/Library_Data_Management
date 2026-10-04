const bcrypt = require('bcryptjs');
const {
  sequelize,
  DocGia,
  NhaXuatBan,
  Sach,
  TacGia,
  TheLoai,
} = require('../models');

const DEMO_READER_EMAIL = 'demo.reader@example.test';
const DEMO_READER_PASSWORD = 'DemoReader123!';

async function findOrCreate(model, where, defaults) {
  const [record] = await model.findOrCreate({ where, defaults });
  return record;
}

async function seedDemoData() {
  await sequelize.authenticate();

  // --- 1. THỂ LOẠI (Không bao gồm Văn học) ---
  const categories = {
    xaHoi: await findOrCreate(TheLoai, { tenTheLoai: 'Xã hội học' }, { tenTheLoai: 'Xã hội học' }),
    khoaHoc: await findOrCreate(TheLoai, { tenTheLoai: 'Khoa học' }, { tenTheLoai: 'Khoa học' }),
    congNghe: await findOrCreate(TheLoai, { tenTheLoai: 'Công nghệ thông tin' }, { tenTheLoai: 'Công nghệ thông tin' }),
    tamLy: await findOrCreate(TheLoai, { tenTheLoai: 'Tâm lý & Kỹ năng' }, { tenTheLoai: 'Tâm lý & Kỹ năng' }),
    kinhTe: await findOrCreate(TheLoai, { tenTheLoai: 'Kinh tế & Đầu tư' }, { tenTheLoai: 'Kinh tế & Đầu tư' }),
  };

  // --- 2. TÁC GIẢ ---
  const authors = {
    nguyenNhatAnh: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nguyễn Nhật Ánh' },
      { tenTacGia: 'Nguyễn Nhật Ánh', diaChi: 'TP. Hồ Chí Minh', soDienThoai: '0900000001' }
    ),
    tranKhoaHoc: await findOrCreate(
      TacGia,
      { tenTacGia: 'Trần Khoa Học' },
      { tenTacGia: 'Trần Khoa Học', diaChi: 'Cần Thơ', soDienThoai: '0900000002' }
    ),
    robertMartin: await findOrCreate(
      TacGia,
      { tenTacGia: 'Robert C. Martin' },
      { tenTacGia: 'Robert C. Martin', diaChi: 'Mỹ', soDienThoai: '0900000004' }
    ),
    andrewNg: await findOrCreate(
      TacGia,
      { tenTacGia: 'Andrew Ng' },
      { tenTacGia: 'Andrew Ng', diaChi: 'Mỹ', soDienThoai: '0900000005' }
    ),
    jamesClear: await findOrCreate(
      TacGia,
      { tenTacGia: 'James Clear' },
      { tenTacGia: 'James Clear', diaChi: 'Mỹ', soDienThoai: '0900000006' }
    ),
    robertKiyosaki: await findOrCreate(
      TacGia,
      { tenTacGia: 'Robert Kiyosaki' },
      { tenTacGia: 'Robert Kiyosaki', diaChi: 'Mỹ', soDienThoai: '0900000007' }
    ),
    morganHousel: await findOrCreate(
      TacGia,
      { tenTacGia: 'Morgan Housel' },
      { tenTacGia: 'Morgan Housel', diaChi: 'Mỹ', soDienThoai: '0900000008' }
    ),
  };

  // --- 3. NHÀ XUẤT BẢN ---
  const publishers = {
    nxbCTU: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB CTU' },
      { tenNXB: 'NXB CTU', diaChi: 'Cần Thơ' }
    ),
    nxbTriThuc: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB Tri Thức' },
      { tenNXB: 'NXB Tri Thức', diaChi: 'TP. Hồ Chí Minh' }
    ),
    nxbTre: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB Trẻ' },
      { tenNXB: 'NXB Trẻ', diaChi: 'TP. Hồ Chí Minh' }
    ),
    nxbLaoDong: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB Lao Động' },
      { tenNXB: 'NXB Lao Động', diaChi: 'Hà Nội' }
    ),
    nxbThongTin: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB Thông Tin & Truyền Thông' },
      { tenNXB: 'NXB Thông Tin & Truyền Thông', diaChi: 'Hà Nội' }
    ),
  };

  // --- 4. DANH SÁCH SÁCH (10 QUYỂN) ---
  const books = [
    // 2 cuốn ban đầu
    {
      tenSach: 'Cho tôi xin một vé đi tuổi thơ',
      donGia: 85000,
      soLuongHienCo: 8,
      namXuatBan: 2020,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.nguyenNhatAnh.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
    },
    {
      tenSach: 'Khám phá khoa học',
      donGia: 120000,
      soLuongHienCo: 5,
      namXuatBan: 2023,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
    },
    // 8 cuốn thêm mới
    {
      tenSach: 'Clean Code - Mã Sạch',
      donGia: 210000,
      soLuongHienCo: 10,
      namXuatBan: 2020,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
    },
    {
      tenSach: 'Học Máy và Trí Tuệ Nhân Tạo Ứng Dụng',
      donGia: 245000,
      soLuongHienCo: 12,
      namXuatBan: 2023,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
    },
    {
      tenSach: 'Nhập Môn Lập Trình & Cấu Trúc Dữ Liệu',
      donGia: 95000,
      soLuongHienCo: 14,
      namXuatBan: 2023,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
    },
    {
      tenSach: 'Thiết Kế Hệ Thống Cơ Sở Dữ Liệu',
      donGia: 115000,
      soLuongHienCo: 8,
      namXuatBan: 2022,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
    },
    {
      tenSach: 'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ',
      donGia: 189000,
      soLuongHienCo: 7,
      namXuatBan: 2021,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.jamesClear.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
    },
    {
      tenSach: 'Cha Giàu Cha Nghèo',
      donGia: 135000,
      soLuongHienCo: 9,
      namXuatBan: 2020,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.robertKiyosaki.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
    },
    {
      tenSach: 'Tâm Lý Học Về Tiền',
      donGia: 150000,
      soLuongHienCo: 6,
      namXuatBan: 2022,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.morganHousel.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
    },
    {
      tenSach: 'Vũ Trụ Trong Vỏ Hạt Dẻ',
      donGia: 165000,
      soLuongHienCo: 5,
      namXuatBan: 2021,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
    },
  ];

  for (const book of books) {
    await findOrCreate(
      Sach,
      { tenSach: book.tenSach },
      { ...book, imagePath: null }
    );
  }

  // --- 5. ĐỘC GIẢ MẪU ---
  const readerPassword = await bcrypt.hash(DEMO_READER_PASSWORD, 10);
  await findOrCreate(
    DocGia,
    { email: DEMO_READER_EMAIL },
    {
      hoLot: 'Nguyễn Văn',
      ten: 'An',
      ngaySinh: '2000-01-01',
      phai: 'Nam',
      diaChi: 'Cần Thơ',
      dienThoai: '0900000003',
      email: DEMO_READER_EMAIL,
      password: readerPassword,
    }
  );

  console.log('Demo data is ready.');
  console.log(`Demo reader: ${DEMO_READER_EMAIL} / ${DEMO_READER_PASSWORD}`);
}

seedDemoData()
  .catch((error) => {
    console.error('Failed to seed demo data:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
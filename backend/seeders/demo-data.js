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
    {
      tenSach: 'Mắt biếc',
      donGia: 100000,
      soLuongHienCo: 11,
      namXuatBan: 1990,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.nguyenNhatAnh.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791258734719-Mat_biec.jpg',
    },
    {
      tenSach: 'Kính vạn hoa',
      donGia: 130000,
      soLuongHienCo: 0,
      namXuatBan: 1965,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.nguyenNhatAnh.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791266432476-Kinh_van_hoa.jpg',
    },
    {
      tenSach: 'Cô gái đến từ hôm qua',
      donGia: 125000,
      soLuongHienCo: 9,
      namXuatBan: 1965,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.nguyenNhatAnh.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791267289418-Co_gai_den_tu_hom_qua.jpg',
    },
    {
      tenSach: 'Lịch sử chữ quốc ngữ',
      donGia: 200000,
      soLuongHienCo: 14,
      namXuatBan: 2011,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/1791267995821-LIch_su_chu_quoc_ngu.jpg',
    },
    {
      tenSach: 'Dữ liệu đã hết thời?',
      donGia: 140000,
      soLuongHienCo: 7,
      namXuatBan: 2017,
      nguonGoc: 'Mỹ',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791273981003-Du_lieu_da_het_thoi.jpg',
    },
    {
      tenSach: 'Công nghệ phần mềm',
      donGia: 300000,
      soLuongHienCo: 13,
      namXuatBan: 2020,
      nguonGoc: 'Anh',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791274609952-Cong_nghe_phan_mem.jpg',
    },
    {
      tenSach: 'Nền tảng toán học trong công nghệ thông tin',
      donGia: 250000,
      soLuongHienCo: 11,
      namXuatBan: 2017,
      nguonGoc: 'Đức',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791274835368-Nen_tang_toan_hoc_trong_cntt.jpg',
    },
    {
      tenSach: 'Code dạo kí sự',
      donGia: 123000,
      soLuongHienCo: 12,
      namXuatBan: 2022,
      nguonGoc: 'Đức',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791275138377-Code_dao_ki_su.jpg',
    },
    {
      tenSach: 'Đi tìm lẻ sống',
      donGia: 112000,
      soLuongHienCo: 5,
      namXuatBan: 2009,
      nguonGoc: 'Hà Lan',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
      imagePath: 'uploads/1791275732298-Di_tim_le_song.jpg',
    },
    {
      tenSach: 'Sức mạnh của thói quen',
      donGia: 109000,
      soLuongHienCo: 7,
      namXuatBan: 2010,
      nguonGoc: 'Trung Quốc',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
      imagePath: 'uploads/1791275819679-Suc_manh_cua_thoi_quen.jpg',
    },
    {
      tenSach: 'Thấu hiểu tâm lý học đường',
      donGia: 135000,
      soLuongHienCo: 3,
      namXuatBan: 1999,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
      imagePath: 'uploads/1791275908130-Thau_hieu_tam_ly_hoc_duong.jpg',
    },
    {
      tenSach: 'Tâm lý học ứng dụng',
      donGia: 123000,
      soLuongHienCo: 4,
      namXuatBan: 2011,
      nguonGoc: 'Ấn độ',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
      imagePath: 'uploads/1791275983633-Tam_ly_hoc_ung_dung.jpg',
    },
    {
      tenSach: 'Nền kinh tế tự do',
      donGia: 111000,
      soLuongHienCo: 5,
      namXuatBan: 2010,
      nguonGoc: 'Mỹ',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.jamesClear.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
      imagePath: 'uploads/1791276991126-Nen_kinh_te_tu_do.jpg',
    },
    {
      tenSach: 'Lược sử văn vật',
      donGia: 124000,
      soLuongHienCo: 6,
      namXuatBan: 2007,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.jamesClear.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/1791277085919-Luoc_su_van_vat.jpg',
    },
    {
      tenSach: 'Bach khoa toàn thư về khoa học',
      donGia: 350000,
      soLuongHienCo: 8,
      namXuatBan: 2015,
      nguonGoc: 'Nga',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.jamesClear.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/1791277171804-Bach_khoa_toan_thu_ve_khoa_hoc.jpg',
    },
    {
      tenSach: 'Kinh tế đầu tư',
      donGia: 123000,
      soLuongHienCo: 4,
      namXuatBan: 2011,
      nguonGoc: 'Ấn độ',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.jamesClear.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
      imagePath: 'uploads/1791276882982-Kinh_te_dau_tu.jpg',
    },
    {
      tenSach: 'Xã hội học văn hóa',
      donGia: 250000,
      soLuongHienCo: 2,
      namXuatBan: 2004,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.robertKiyosaki.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791282480189-Xa_hoi_hoc_van_hoa.jpg',
    },
    {
      tenSach: 'Tâm lý học xã hội',
      donGia: 210000,
      soLuongHienCo: 6,
      namXuatBan: 2007,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.robertKiyosaki.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791282515734-Tam_ly_hoc_xa_hoi.jpg',
    },
    {
      tenSach: 'Lý do thực tiễn về lý thuyết hành động',
      donGia: 190000,
      soLuongHienCo: 5,
      namXuatBan: 2009,
      nguonGoc: 'Ba Lan',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.robertKiyosaki.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791282551564-Li_do_thuc_tien_ve_li_thuyet_hanh_dong.jpg',
    },
    {
      tenSach: 'Nhập môn xã hội học',
      donGia: 90000,
      soLuongHienCo: 10,
      namXuatBan: 2004,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.robertKiyosaki.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/1791282601485-Nhap_mon_xa_hoi_hoc.jpg',
    },
    {
      tenSach: 'Technology cover',
      donGia: 180000,
      soLuongHienCo: 10,
      namXuatBan: 2016,
      nguonGoc: 'Nhật Bản',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.morganHousel.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791283376176-Technology_cover.jpg',
    },
    {
      tenSach: 'công nghệ thực phẩm nhân tạo',
      donGia: 170000,
      soLuongHienCo: 12,
      namXuatBan: 2017,
      nguonGoc: 'Lào',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.morganHousel.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791283404907-Cong_nghe_thuc_pham_nhan_tao.jpg',
    },
    {
      tenSach: 'Công nghệ sinh học được',
      donGia: 190000,
      soLuongHienCo: 7,
      namXuatBan: 2014,
      nguonGoc: 'Trung Quốc',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.morganHousel.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791283435300-Cong_nghe_sinh_hoc_duoc.jpg',
    },
    {
      tenSach: 'Chuyên ngành cơ điện tử',
      donGia: 200000,
      soLuongHienCo: 12,
      namXuatBan: 2018,
      nguonGoc: 'Indonesia',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.morganHousel.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/1791283468775-Chuyen_nganh_co_dien_tu.jpg',
    },
  ];

  for (const book of books) {
    await findOrCreate(
      Sach,
      { tenSach: book.tenSach },
      { ...book, imagePath: book.imagePath ?? null }
    );
  }

  // --- 5. ĐỘC GIẢ MẪU ---
  const readerPassword = await bcrypt.hash(DEMO_READER_PASSWORD, 10);
  await findOrCreate(
    DocGia,
    { email: DEMO_READER_EMAIL },
    {
      fullName: 'Nguyễn Văn An',
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
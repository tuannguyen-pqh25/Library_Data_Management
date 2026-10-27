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

  // --- 1. THỂ LOẠI ---
  const categories = {
    xaHoi: await findOrCreate(TheLoai, { tenTheLoai: 'Xã hội học' }, { tenTheLoai: 'Xã hội học' }),
    khoaHoc: await findOrCreate(TheLoai, { tenTheLoai: 'Khoa học' }, { tenTheLoai: 'Khoa học' }),
    congNghe: await findOrCreate(TheLoai, { tenTheLoai: 'Công nghệ thông tin' }, { tenTheLoai: 'Công nghệ thông tin' }),
    tamLy: await findOrCreate(TheLoai, { tenTheLoai: 'Tâm lý & Kỹ năng' }, { tenTheLoai: 'Tâm lý & Kỹ năng' }),
    kinhTe: await findOrCreate(TheLoai, { tenTheLoai: 'Kinh tế & Đầu tư' }, { tenTheLoai: 'Kinh tế & Đầu tư' }),
    vanHoc: await findOrCreate(TheLoai, { tenTheLoai: 'Văn học' }, { tenTheLoai: 'Văn học' }),
  };

  // --- 2. TÁC GIẢ ---
  const authors = {
    nguyenNhatAnh: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nguyễn Nhật Ánh' },
      { tenTacGia: 'Nguyễn Nhật Ánh', diaChi: 'TP. Hồ Chí Minh', soDienThoai: '0900000001' }
    ),
    namCao: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nam Cao' },
      { tenTacGia: 'Nam Cao', diaChi: 'Hà Nam', soDienThoai: '0900000009' }
    ),
    ngoTatTo: await findOrCreate(
      TacGia,
      { tenTacGia: 'Ngô Tất Tố' },
      { tenTacGia: 'Ngô Tất Tố', diaChi: 'Hà Nội', soDienThoai: '0900000010' }
    ),
    toHoai: await findOrCreate(
      TacGia,
      { tenTacGia: 'Tô Hoài' },
      { tenTacGia: 'Tô Hoài', diaChi: 'Hà Nội', soDienThoai: '0900000011' }
    ),
    vuTrongPhung: await findOrCreate(
      TacGia,
      { tenTacGia: 'Vũ Trọng Phụng' },
      { tenTacGia: 'Vũ Trọng Phụng', diaChi: 'Hà Nội', soDienThoai: '0900000012' }
    ),
    baoNinh: await findOrCreate(
      TacGia,
      { tenTacGia: 'Bảo Ninh' },
      { tenTacGia: 'Bảo Ninh', diaChi: 'Quảng Bình', soDienThoai: '0900000013' }
    ),
    kimLan: await findOrCreate(
      TacGia,
      { tenTacGia: 'Kim Lân' },
      { tenTacGia: 'Kim Lân', diaChi: 'Bắc Ninh', soDienThoai: '0900000014' }
    ),
    nguyenDu: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nguyễn Du' },
      { tenTacGia: 'Nguyễn Du', diaChi: 'Hà Tĩnh', soDienThoai: '0900000015' }
    ),
    thachLam: await findOrCreate(
      TacGia,
      { tenTacGia: 'Thạch Lam' },
      { tenTacGia: 'Thạch Lam', diaChi: 'Hà Nội', soDienThoai: '0900000017' }
    ),
    toHuu: await findOrCreate(
      TacGia,
      { tenTacGia: 'Tố Hữu' },
      { tenTacGia: 'Tố Hữu', diaChi: 'Thừa Thiên Huế', soDienThoai: '0900000018' }
    ),
    xuanDieu: await findOrCreate(
      TacGia,
      { tenTacGia: 'Xuân Diệu' },
      { tenTacGia: 'Xuân Diệu', diaChi: 'Bình Định', soDienThoai: '0900000019' }
    ),
    hanMacTu: await findOrCreate(
      TacGia,
      { tenTacGia: 'Hàn Mặc Tử' },
      { tenTacGia: 'Hàn Mặc Tử', diaChi: 'Bình Định', soDienThoai: '0900000020' }
    ),
    cheLanVien: await findOrCreate(
      TacGia,
      { tenTacGia: 'Chế Lan Viên' },
      { tenTacGia: 'Chế Lan Viên', diaChi: 'Quảng Trị', soDienThoai: '0900000021' }
    ),
    nguyenKhoaDiem: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nguyễn Khoa Điềm' },
      { tenTacGia: 'Nguyễn Khoa Điềm', diaChi: 'Thừa Thiên Huế', soDienThoai: '0900000022' }
    ),
    nguyenAiQuoc: await findOrCreate(
      TacGia,
      { tenTacGia: 'Nguyễn Ái Quốc' },
      { tenTacGia: 'Nguyễn Ái Quốc', diaChi: 'Nghệ An', soDienThoai: '0900000023' }
    ),
    pauloCoelho: await findOrCreate(
      TacGia,
      { tenTacGia: 'Paulo Coelho' },
      { tenTacGia: 'Paulo Coelho', diaChi: 'Brazil', soDienThoai: '0900000024' }
    ),
    damodarGujarati: await findOrCreate(
      TacGia,
      { tenTacGia: 'Damodar N. Gujarati' },
      { tenTacGia: 'Damodar N. Gujarati', diaChi: 'Hoa Kỳ', soDienThoai: '0900000025' }
    ),
    philipKotler: await findOrCreate(
      TacGia,
      { tenTacGia: 'Philip Kotler' },
      { tenTacGia: 'Philip Kotler', diaChi: 'Hoa Kỳ', soDienThoai: '0900000026' }
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
    nxbVanHoc: await findOrCreate(
      NhaXuatBan,
      { tenNXB: 'NXB Văn Học' },
      { tenNXB: 'NXB Văn Học', diaChi: 'Hà Nội' }
    ),
  };

  // --- 4. DANH SÁCH SÁCH ---
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
      tenSach: 'Đi tìm lẽ sống',
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
      tenSach: 'Bách khoa toàn thư về khoa học',
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
      tenSach: 'Công nghệ sinh học dược',
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
    {
      tenSach: 'Chí Phèo',
      donGia: 75000,
      soLuongHienCo: 8,
      namXuatBan: 1941,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.namCao.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/102_chi_pheo.jpg',
    },
    {
      tenSach: 'Lão Hạc',
      donGia: 68000,
      soLuongHienCo: 7,
      namXuatBan: 1943,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.namCao.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/211_lao_hac.jpg',
    },
    {
      tenSach: 'Tắt đèn',
      donGia: 82000,
      soLuongHienCo: 6,
      namXuatBan: 1939,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.ngoTatTo.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/103_tat_den.jpg',
    },
    {
      tenSach: 'Dế Mèn phiêu lưu ký',
      donGia: 95000,
      soLuongHienCo: 9,
      namXuatBan: 1941,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.toHoai.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/109_de_men_phieu_luu_ky.jpg',
    },
    {
      tenSach: 'Số đỏ',
      donGia: 105000,
      soLuongHienCo: 7,
      namXuatBan: 1936,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.vuTrongPhung.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/101_so_do.jpg',
    },
    {
      tenSach: 'Nỗi buồn chiến tranh',
      donGia: 135000,
      soLuongHienCo: 5,
      namXuatBan: 1987,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.baoNinh.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/104_noi_buon_chien_tranh.jpg',
    },
    {
      tenSach: 'Vợ nhặt',
      donGia: 78000,
      soLuongHienCo: 8,
      namXuatBan: 1962,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.kimLan.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/105_vo_nhat.jpg',
    },
    {
      tenSach: 'Truyện Kiều',
      donGia: 120000,
      soLuongHienCo: 10,
      namXuatBan: 1820,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.nguyenDu.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/106_truyen_kieu.jpg',
    },
    {
      tenSach: 'Hai đứa trẻ',
      donGia: 72000,
      soLuongHienCo: 7,
      namXuatBan: 1938,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbVanHoc.maNXB,
      maTacGia: authors.thachLam.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/108_hai_dua_tre.jpg',
    },
    {
      tenSach: 'Dế Mèn phiêu lưu ký',
      donGia: 95000,
      soLuongHienCo: 9,
      namXuatBan: 1941,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.toHoai.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/109_de_men_phieu_luu_ky.jpg',
    },
    {
      tenSach: 'Cạm bẫy người',
      donGia: 92000,
      soLuongHienCo: 5,
      namXuatBan: 1933,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.vuTrongPhung.maTacGia,
      maTheLoai: categories.tamLy.maTheLoai,
      imagePath: 'uploads/541_cam_bay-nguoi.jpg',
    },
    {
      tenSach: 'Kỹ nghệ lấy Tây',
      donGia: 88000,
      soLuongHienCo: 6,
      namXuatBan: 1934,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.vuTrongPhung.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/542_ky_nghe_lay_tay.jpg',
    },
    {
      tenSach: 'Cơm thầy cơm cô',
      donGia: 85000,
      soLuongHienCo: 5,
      namXuatBan: 1937,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.vuTrongPhung.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/543_com_thay_com_co.jpg',
    },
    {
      tenSach: 'Bản án chế độ thực dân Pháp',
      donGia: 110000,
      soLuongHienCo: 8,
      namXuatBan: 1925,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.nguyenAiQuoc.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/549_ban_an_che_do_thuc_dan_phap.jpg',
    },
    {
      tenSach: 'Đường Kách Mệnh',
      donGia: 95000,
      soLuongHienCo: 7,
      namXuatBan: 1927,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.nguyenAiQuoc.maTacGia,
      maTheLoai: categories.xaHoi.maTheLoai,
      imagePath: 'uploads/550_duong_kach_menh.jpg',
    },
    {
      tenSach: 'Vi sinh vật học đại cương',
      donGia: 145000,
      soLuongHienCo: 8,
      namXuatBan: 2021,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/981_vi_sinh_vat.jpg',
    },
    {
      tenSach: 'Bệnh học thủy sản cơ bản',
      donGia: 160000,
      soLuongHienCo: 6,
      namXuatBan: 2022,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbTriThuc.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/982_benh_thuy_san.jpg',
    },
    {
      tenSach: 'Hóa đại cương',
      donGia: 135000,
      soLuongHienCo: 9,
      namXuatBan: 2020,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.khoaHoc.maTheLoai,
      imagePath: 'uploads/983_hoa_dai_cuong_ctu.jpg',
    },
    {
      tenSach: 'Kinh tế lượng nhập môn',
      donGia: 175000,
      soLuongHienCo: 7,
      namXuatBan: 2021,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.damodarGujarati.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
      imagePath: 'uploads/984_kinh_te_luong.jpg',
    },
    {
      tenSach: 'Quản trị marketing',
      donGia: 185000,
      soLuongHienCo: 6,
      namXuatBan: 2022,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbLaoDong.maNXB,
      maTacGia: authors.philipKotler.maTacGia,
      maTheLoai: categories.kinhTe.maTheLoai,
      imagePath: 'uploads/985_qt_marketing.jpg',
    },
    {
      tenSach: 'Kỹ thuật điện căn bản',
      donGia: 155000,
      soLuongHienCo: 8,
      namXuatBan: 2020,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbCTU.maNXB,
      maTacGia: authors.tranKhoaHoc.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/988_ky_thuat_dien.jpg',
    },
    {
      tenSach: 'Tin học đại cương',
      donGia: 165000,
      soLuongHienCo: 9,
      namXuatBan: 2023,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.robertMartin.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/990_ta_cntt.jpg',
    },
    {
      tenSach: 'Trí tuệ nhân tạo: học máy và ứng dụng',
      donGia: 220000,
      soLuongHienCo: 7,
      namXuatBan: 2024,
      nguonGoc: 'Việt Nam',
      maNXB: publishers.nxbThongTin.maNXB,
      maTacGia: authors.andrewNg.maTacGia,
      maTheLoai: categories.congNghe.maTheLoai,
      imagePath: 'uploads/2_tri_tue_nhan_tao_hoc_may_va_ung_dung.jpg',
    },
    {
      tenSach: 'Nhà giả kim',
      donGia: 125000,
      soLuongHienCo: 6,
      namXuatBan: 2020,
      nguonGoc: 'Dịch',
      maNXB: publishers.nxbTre.maNXB,
      maTacGia: authors.pauloCoelho.maTacGia,
      maTheLoai: categories.vanHoc.maTheLoai,
      imagePath: 'uploads/1754122553134-nhagiakimTB2020.jpg',
    },
  ];
// tạo ngẫu nhiên các sách từ các ảnh chưa sử dụng
  const additionalBookCovers = [
    '107_vang_bong_mot_thoi.jpg',
    '1091_one_piece.jpg',
    '1092_naruto.jpg',
    '1093_dragon_ball.jpg',
    '1094_conan.jpg',
    '1095_doraemon.jpg',
    '1096_attack_on_titan.jpg',
    '1097_slam_dunk.jpg',
    '1098_death_note.jpg',
    '1099_fullmetal_alchemist.jpg',
    '1100_demon_slayer.jpg',
    '110_mat_biec.jpg',
    '1754569576420-Capybara Hutech.jpg',
    '1754569577342-Capybara Hutech.jpg',
    '1754569590583-Capybara Hutech.jpg',
    '1760437788195-Capybara CTU.jpg',
    '1760437792583-Capybara CTU.jpg',
    '1760438295113-Capybara CTU.jpg',
    '1760438329139-Capybara CTU.jpg',
    '1760439062392-Capybara CTU.jpg',
    '1760575252758-Capybara CTU.jpg',
    '1760594574954-Capybara Hutech.jpg',
    '1791201209954-1_clean_code.jpg',
    '1791262664917-Toi_thay_hoa_vang_tren_co_xanh.jpg',
    '1_clean_code.jpg',
    '212_lang.jpg',
    '213_gio_lanh_dau_mua.jpg',
    '214_vo_chong_a_phu.jpg',
    '215_chu_nguoi_tu_tu.jpg',
    '216_doi_thua.jpg',
    '217_con_cho_xau_xi.jpg',
    '218_duoi_bong_hoang_lan.jpg',
    '219_truyen_ngan_nguyen_tuan.jpg',
    '220_truyen_ngan_to_hoai.jpg',
    '321_viet_bac.jpg',
    '322_gui_huong_cho_gio.jpg',
    '323_dau_thuong.jpg',
    '324_anh_sang_va_phu_sa.jpg',
    '325_loi_ru_tren_mat_dat.jpg',
    '326_nhat_ky_trong_tu.jpg',
    '327_vu_tru_ca.jpg',
    '328_may_trang_cua_doi_toi.jpg',
    '329_uc_trai_thi_tap.jpg',
    '330_la.jpg',
    '431_giong_to.jpg',
    '432_leu_chong.jpg',
    '433_binh_ngo_dai_cao.jpg',
    '434_ha_noi_bam_sau_pho_phuong.jpg',
    '435_nguoi_lai_do_song_da.jpg',
    '436_tu_ay.jpg',
    '437_tuyen_ngon_doc_lap.jpg',
    '438_van_te_thap_loai_chung_sinh.jpg',
    '439_giang_sang.jpg',
    '440_tuoi_tho_du_doi.jpg',
    '544_chiec_lu_dong_mat_cua.jpg',
    '545_tuy_but_khang_chien.jpg',
    '546_ha_noi_ta_danh_my_gioi.jpg',
    '547_truyen_tay_bac.jpg',
    '548_cat_bui_chan_ai.jpg',
    '651_hon_truong_ba_da_hang_thit.jpg',
    '652_loi_the_thu_9.jpg',
    '653_nang_sita.jpg',
    '654_benh_si.jpg',
    '655_toi_va_chung_ta.jpg',
    '656_ong_khong_phai_la_bo_toi.jpg',
    '657_tin_o_hoa_hong.jpg',
    '658_loi_noi_doi_cuoi_cung.jpg',
    '659_hoa_cuc_xanh_tren_dam_lay.jpg',
    '660_hon_buom_mo_tien.jpg',
    '761_cho_toi_xin_mot_ve_di_tuoi_tho.jpg',
    '762_toi_thay_hoa_vang_tren_co_xanh.jpg',
    '763_kinh_van_hoa.jpg',
    '764_chu_be_rac_roi.jpg',
    '765_la_co_theu_sau_chu_vang.jpg',
    '766_goc_san_va_khoang_troi.jpg',
    '767_bau_troi_trong_qua_trung.jpg',
    '768_tuoi_tho_im_lang.jpg',
    '769_chuyen_hoa_chuyen_hoa.jpg',
    '770_ngoi_khoc_tren_cay.jpg',
    '871_dune.jpg',
    '872_foundation.jpg',
    '873_1984.jpg',
    '874_brave_new_world.jpg',
    '875_the_martian.jpg',
    '876_enders_game.jpg',
    '877_time_machine.jpg',
    '878_fahrenheit451.jpg',
    '879_neuromancer.jpg',
    '880_i_robot.jpg',
    '986_di_truyen_hoc.jpg',
    '987_luat_hien_phap.jpg',
    '989_csvh_vietnam.jpg',
  ];
  const vietnameseBookTitles = new Map([
    ['107_vang_bong_mot_thoi.jpg', 'Vang bóng một thời'],
    ['110_mat_biec.jpg', 'Mắt biếc'],
    ['212_lang.jpg', 'Làng'],
    ['213_gio_lanh_dau_mua.jpg', 'Gió lạnh đầu mùa'],
    ['214_vo_chong_a_phu.jpg', 'Vợ chồng A Phủ'],
    ['215_chu_nguoi_tu_tu.jpg', 'Chữ người tử tù'],
    ['216_doi_thua.jpg', 'Đời thừa'],
    ['217_con_cho_xau_xi.jpg', 'Con chó xấu xí'],
    ['218_duoi_bong_hoang_lan.jpg', 'Dưới bóng hoàng lan'],
    ['219_truyen_ngan_nguyen_tuan.jpg', 'Truyện ngắn Nguyễn Tuân'],
    ['220_truyen_ngan_to_hoai.jpg', 'Truyện ngắn Tô Hoài'],
    ['321_viet_bac.jpg', 'Việt Bắc'],
    ['322_gui_huong_cho_gio.jpg', 'Gửi hương cho gió'],
    ['323_dau_thuong.jpg', 'Đau thương'],
    ['324_anh_sang_va_phu_sa.jpg', 'Ánh sáng và phù sa'],
    ['325_loi_ru_tren_mat_dat.jpg', 'Lời ru trên mặt đất'],
    ['326_nhat_ky_trong_tu.jpg', 'Nhật ký trong tù'],
    ['327_vu_tru_ca.jpg', 'Vũ trụ ca'],
    ['328_may_trang_cua_doi_toi.jpg', 'Mây trắng của đời tôi'],
    ['329_uc_trai_thi_tap.jpg', 'Ức Trai thi tập'],
    ['330_la.jpg', 'Lá'],
    ['431_giong_to.jpg', 'Giông tố'],
    ['432_leu_chong.jpg', 'Lều chõng'],
    ['433_binh_ngo_dai_cao.jpg', 'Bình Ngô đại cáo'],
    ['434_ha_noi_bam_sau_pho_phuong.jpg', 'Hà Nội băm sáu phố phường'],
    ['435_nguoi_lai_do_song_da.jpg', 'Người lái đò sông Đà'],
    ['436_tu_ay.jpg', 'Từ ấy'],
    ['437_tuyen_ngon_doc_lap.jpg', 'Tuyên ngôn độc lập'],
    ['438_van_te_thap_loai_chung_sinh.jpg', 'Văn tế thập loại chúng sinh'],
    ['439_giang_sang.jpg', 'Giăng sáng'],
    ['440_tuoi_tho_du_doi.jpg', 'Tuổi thơ dữ dội'],
    ['544_chiec_lu_dong_mat_cua.jpg', 'Chiếc lư đồng mắt cua'],
    ['545_tuy_but_khang_chien.jpg', 'Tùy bút kháng chiến'],
    ['546_ha_noi_ta_danh_my_gioi.jpg', 'Hà Nội ta đánh Mỹ giỏi'],
    ['547_truyen_tay_bac.jpg', 'Truyện Tây Bắc'],
    ['548_cat_bui_chan_ai.jpg', 'Cát bụi chân ai'],
    ['651_hon_truong_ba_da_hang_thit.jpg', 'Hồn Trương Ba, da hàng thịt'],
    ['652_loi_the_thu_9.jpg', 'Lời thề thứ 9'],
    ['653_nang_sita.jpg', 'Nàng Sita'],
    ['654_benh_si.jpg', 'Bệnh sĩ'],
    ['655_toi_va_chung_ta.jpg', 'Tôi và chúng ta'],
    ['656_ong_khong_phai_la_bo_toi.jpg', 'Ông không phải là bố tôi'],
    ['657_tin_o_hoa_hong.jpg', 'Tin ở hoa hồng'],
    ['658_loi_noi_doi_cuoi_cung.jpg', 'Lời nói dối cuối cùng'],
    ['659_hoa_cuc_xanh_tren_dam_lay.jpg', 'Hoa cúc xanh trên đầm lầy'],
    ['660_hon_buom_mo_tien.jpg', 'Hồn bướm mơ tiên'],
    ['761_cho_toi_xin_mot_ve_di_tuoi_tho.jpg', 'Cho tôi xin một vé đi tuổi thơ'],
    ['1791262664917-Toi_thay_hoa_vang_tren_co_xanh.jpg', 'Tôi thấy hoa vàng trên cỏ xanh'],
    ['762_toi_thay_hoa_vang_tren_co_xanh.jpg', 'Tôi thấy hoa vàng trên cỏ xanh'],
    ['763_kinh_van_hoa.jpg', 'Kính vạn hoa'],
    ['764_chu_be_rac_roi.jpg', 'Chú bé rắc rối'],
    ['765_la_co_theu_sau_chu_vang.jpg', 'Lá cờ thêu sáu chữ vàng'],
    ['766_goc_san_va_khoang_troi.jpg', 'Góc sân và khoảng trời'],
    ['767_bau_troi_trong_qua_trung.jpg', 'Bầu trời trong quả trứng'],
    ['768_tuoi_tho_im_lang.jpg', 'Tuổi thơ im lặng'],
    ['769_chuyen_hoa_chuyen_hoa.jpg', 'Chuyện hoa chuyện quả'],
    ['770_ngoi_khoc_tren_cay.jpg', 'Ngồi khóc trên cây'],
    ['986_di_truyen_hoc.jpg', 'Di truyền học'],
    ['987_luat_hien_phap.jpg', 'Luật hiến pháp'],
    ['989_csvh_vietnam.jpg', 'Cơ sở văn hóa Việt Nam'],
  ]);
  const authorKeys = [
    'nguyenNhatAnh', 'namCao', 'ngoTatTo', 'toHoai', 'vuTrongPhung',
    'baoNinh', 'kimLan', 'nguyenDu', 'thachLam', 'toHuu', 'xuanDieu',
    'hanMacTu', 'cheLanVien', 'nguyenKhoaDiem', 'nguyenAiQuoc',
    'pauloCoelho', 'tranKhoaHoc', 'robertMartin', 'andrewNg', 'jamesClear',
    'robertKiyosaki', 'morganHousel', 'damodarGujarati', 'philipKotler',
  ];
  const categoryKeys = ['vanHoc', 'khoaHoc', 'congNghe', 'tamLy', 'kinhTe', 'xaHoi'];
  const publisherKeys = ['nxbVanHoc', 'nxbCTU', 'nxbTriThuc', 'nxbTre', 'nxbLaoDong', 'nxbThongTin'];
  const origins = ['Việt Nam', 'Mỹ', 'Nhật Bản', 'Pháp', 'Anh', 'Hàn Quốc', 'Canada', 'Úc'];
  const normalizeTitle = (title) => title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi');
  const existingTitles = new Set(books.map((book) => normalizeTitle(book.tenSach)));

  for (const [index, coverName] of additionalBookCovers.entries()) {
    const coverTitle = vietnameseBookTitles.get(coverName) ?? coverName
      .replace(/\.[^.]+$/, '')
      .replace(/^\d{10,}-/, '')
      .replace(/^\d+[-_]?/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    let tenSach = coverTitle
      ? `${coverTitle.charAt(0).toLocaleUpperCase('vi')}${coverTitle.slice(1)}`
      : `Sách minh họa ${index + 1}`;
    if (existingTitles.has(normalizeTitle(tenSach))) {
      tenSach = `${tenSach} - Bản ảnh ${index + 1}`;
    }
    existingTitles.add(normalizeTitle(tenSach));

    books.push({
      tenSach,
      donGia: 70000 + (index % 16) * 10000,
      soLuongHienCo: 3 + (index % 10),
      namXuatBan: 2000 + (index % 25),
      nguonGoc: origins[index % origins.length],
      maNXB: publishers[publisherKeys[index % publisherKeys.length]].maNXB,
      maTacGia: authors[authorKeys[index % authorKeys.length]].maTacGia,
      maTheLoai: categories[categoryKeys[index % categoryKeys.length]].maTheLoai,
      imagePath: `uploads/${coverName}`,
    });
  }

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
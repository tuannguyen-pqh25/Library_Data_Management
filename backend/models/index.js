const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log, // Enable query logging
    define: { freezeTableName: true }
  }
);

// Test kết nối
sequelize.authenticate()
  .then(() => console.log('Kết nối MySQL thành công!'))
  .catch(err => console.error('Lỗi kết nối:', err));

// Initialize models
const DocGia = require('./DocGia')(sequelize, DataTypes);
const NhanVien = require('./NhanVien')(sequelize, DataTypes);
const NhaXuatBan = require('./NhaXuatBan')(sequelize, DataTypes);
const TacGia = require('./TacGia')(sequelize, DataTypes);
const TheLoai = require('./TheLoai')(sequelize, DataTypes);
const Sach = require('./Sach')(sequelize, DataTypes);
const PhieuMuon = require('./PhieuMuon')(sequelize, DataTypes);
const ChiTietPhieuMuon = require('./ChiTietPhieuMuon')(sequelize, DataTypes);
const PhieuTra = require('./PhieuTra')(sequelize, DataTypes);

// Associations
Sach.belongsTo(TacGia, { foreignKey: 'maTacGia', as: 'TacGia' });
TacGia.hasMany(Sach, { foreignKey: 'maTacGia', as: 'Sachs' });
Sach.belongsTo(TheLoai, { foreignKey: 'maTheLoai', as: 'TheLoai' });
TheLoai.hasMany(Sach, { foreignKey: 'maTheLoai', as: 'Sachs' });
Sach.belongsTo(NhaXuatBan, { foreignKey: 'maNXB', as: 'NhaXuatBan' });
NhaXuatBan.hasMany(Sach, { foreignKey: 'maNXB', as: 'Sachs' });
PhieuMuon.belongsTo(DocGia, { foreignKey: 'maDocGia', as: 'DocGia' });
DocGia.hasMany(PhieuMuon, { foreignKey: 'maDocGia', as: 'PhieuMuons' });
ChiTietPhieuMuon.belongsTo(PhieuMuon, { foreignKey: 'maPhieuMuon', as: 'PhieuMuon' });
PhieuMuon.hasMany(ChiTietPhieuMuon, { foreignKey: 'maPhieuMuon', as: 'ChiTietPhieuMuons' });
ChiTietPhieuMuon.belongsTo(Sach, { foreignKey: 'maSach', as: 'Sach' });
Sach.hasMany(ChiTietPhieuMuon, { foreignKey: 'maSach', as: 'ChiTietPhieuMuons' });
PhieuTra.belongsTo(ChiTietPhieuMuon, { foreignKey: 'maChiTietPM', as: 'ChiTietPhieuMuon' });
ChiTietPhieuMuon.hasOne(PhieuTra, { foreignKey: 'maChiTietPM', as: 'PhieuTra' });

// Debugging
console.log('NhanVien.findOne:', typeof NhanVien.findOne);
console.log('DocGia.findOne:', typeof DocGia.findOne);
console.log('NhaXuatBan.findOne:', typeof NhaXuatBan.findOne);

module.exports = { sequelize, DocGia, NhanVien, NhaXuatBan, TacGia, TheLoai, Sach, PhieuMuon, ChiTietPhieuMuon, PhieuTra };
//backend/models/PhieuMuon.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuMuon extends Model {}
  PhieuMuon.init({
    maPhieuMuon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    maDocGia: { type: DataTypes.INTEGER, allowNull: false },
    ngayMuon: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    ngayTra: { type: DataTypes.DATE, allowNull: false },
    trangThai: { type: DataTypes.ENUM('Chờ duyệt', 'Đã duyệt', 'Đã trả', 'Từ chối'), defaultValue: 'Chờ duyệt' },
  }, {
    sequelize,
    modelName: 'PhieuMuon',
    freezeTableName: true,
    timestamps: true,
  });

  return PhieuMuon;
};
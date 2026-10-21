//backend/models/ChiTietPhieuMuon.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChiTietPhieuMuon extends Model {}
  ChiTietPhieuMuon.init({
    maChiTietPM: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    maPhieuMuon: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    maSach: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    maDocGia: { type: DataTypes.INTEGER, allowNull: false },
    maTacGia: { type: DataTypes.INTEGER, allowNull: false },
    maTheLoai: { type: DataTypes.INTEGER, allowNull: false },
    soLuongSachMuon: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  }, {
    sequelize,
    modelName: 'ChiTietPhieuMuon',
    freezeTableName: true,
    timestamps: true,
  });

  return ChiTietPhieuMuon;
};

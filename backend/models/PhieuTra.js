//backend/models/PhieuTra.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuTra extends Model {}
  PhieuTra.init({
    maPhieuTra: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true, autoIncrement: true },
    maChiTietPM: { type: DataTypes.INTEGER, allowNull: false },
    ngayTraSach: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    tienPhat: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'PhieuTra',
    freezeTableName: true,
    timestamps: true,
  });

  return PhieuTra;
};
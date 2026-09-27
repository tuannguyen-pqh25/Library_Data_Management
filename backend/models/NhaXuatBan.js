// backend/models/NhaXuatBan.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NhaXuatBan extends Model {}
  NhaXuatBan.init({
    maNXB: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenNXB: { type: DataTypes.STRING, allowNull: false },
    diaChi: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'NhaXuatBan',
    freezeTableName: true,
    timestamps: true,
  });

  return NhaXuatBan;
};
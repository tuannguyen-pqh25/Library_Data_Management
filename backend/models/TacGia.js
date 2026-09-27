// backend/src/models/TacGia.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TacGia extends Model {}
  TacGia.init({
    maTacGia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenTacGia: { type: DataTypes.STRING, allowNull: false },
    diaChi: { type: DataTypes.STRING, allowNull: false },
    soDienThoai: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'TacGia',
    freezeTableName: true,
    timestamps: true,
  });

  return TacGia;
};
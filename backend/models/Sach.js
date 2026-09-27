// backend/models/Sach.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sach extends Model {}
  Sach.init({
    maSach: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    tenSach: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    donGia: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    soLuongHienCo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    namXuatBan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nguonGoc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maNXB: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maTacGia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maTheLoai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Sach',
    freezeTableName: true,
    timestamps: true,
  });

  return Sach;
};
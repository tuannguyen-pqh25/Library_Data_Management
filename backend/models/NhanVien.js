const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NhanVien extends Model {}
  NhanVien.init({
    MSNV: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    hoTenNV: { 
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    chucVu: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    diaChi: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    soDienThoai: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
  }, {
    sequelize,
    modelName: 'NhanVien',
    freezeTableName: true,
    timestamps: true,
  });

  return NhanVien;
};
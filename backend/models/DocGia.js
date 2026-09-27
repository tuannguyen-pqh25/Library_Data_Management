const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DocGia extends Model {}
  DocGia.init({
    maDocGia: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    hoLot: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    ten: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    ngaySinh: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    phai: { 
      type: DataTypes.ENUM('Nam', 'Nữ'), 
      allowNull: false 
    },
    diaChi: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    dienThoai: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    otp: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    otpExpiry: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
  }, {
    sequelize,
    modelName: 'DocGia',
    freezeTableName: true,
    timestamps: true,
  });

  return DocGia;
};
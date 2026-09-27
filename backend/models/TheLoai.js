//backend/models/TheLoai.js
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TheLoai extends Model {}
  TheLoai.init({
    maTheLoai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenTheLoai: { type: DataTypes.STRING, allowNull: false },
  }, {
    sequelize,
    modelName: 'TheLoai',
    freezeTableName: true,
    timestamps: true,
  });

  return TheLoai;
};
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocGia', {
      maDocGia: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hoLot: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ten: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ngaySinh: {
        allowNull: false,
        type: Sequelize.DATE
      },
      phai: {
        allowNull: false,
        type: Sequelize.ENUM('Nam', 'Nữ')
      },
      diaChi: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dienThoai: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      otp: {
        type: Sequelize.STRING
      },
      otpExpiry: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocGia');
  }
};
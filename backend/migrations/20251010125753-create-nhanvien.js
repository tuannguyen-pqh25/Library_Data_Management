'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('NhanVien', {
      MSNV: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      hoTenNV: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      chucVu: {
        allowNull: false,
        type: Sequelize.STRING
      },
      diaChi: {
        allowNull: false,
        type: Sequelize.STRING
      },
      soDienThoai: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('NhanVien');
  }
};

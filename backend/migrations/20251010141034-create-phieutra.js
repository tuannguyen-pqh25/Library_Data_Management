'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PhieuTra', {
      maPhieuTra: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      maChiTietPM: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ChiTietPhieuMuon', key: 'maChiTietPM' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ngayTraSach: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      tienPhat: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
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
    await queryInterface.dropTable('PhieuTra');
  }
};
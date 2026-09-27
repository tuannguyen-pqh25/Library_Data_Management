'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChiTietPhieuMuon', {
      maChiTietPM: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      maPhieuMuon: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'PhieuMuon', key: 'maPhieuMuon' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      maSach: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Sach', key: 'maSach' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      soLuongSachMuon: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    await queryInterface.dropTable('ChiTietPhieuMuon');
  }
};
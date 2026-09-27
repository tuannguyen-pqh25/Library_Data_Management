'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PhieuMuon', {
      maPhieuMuon: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      maDocGia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'DocGia', key: 'maDocGia' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ngayMuon: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      ngayTra: {
        allowNull: false,
        type: Sequelize.DATE
      },
      trangThai: {
        type: Sequelize.ENUM('Chờ duyệt', 'Đã duyệt', 'Đã trả', 'Từ chối'), 
        defaultValue: 'Chờ duyệt'
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
    await queryInterface.dropTable('PhieuMuon');
  }
};
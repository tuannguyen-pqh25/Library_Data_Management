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
        primaryKey: true
      },
      maPhieuMuon: { type: Sequelize.INTEGER, allowNull: false },
      maSach: { type: Sequelize.INTEGER, allowNull: false },
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
    await queryInterface.addConstraint('PhieuTra', {
      fields: ['maChiTietPM', 'maPhieuMuon', 'maSach'],
      type: 'foreign key',
      name: 'fk_phieutra_chitietphieumuon',
      references: { table: 'ChiTietPhieuMuon', fields: ['maChiTietPM', 'maPhieuMuon', 'maSach'] },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PhieuTra');
  }
};

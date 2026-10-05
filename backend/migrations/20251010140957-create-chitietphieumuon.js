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
        primaryKey: true
      },
      maSach: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      maDocGia: { type: Sequelize.INTEGER, allowNull: false },
      maTacGia: { type: Sequelize.INTEGER, allowNull: false },
      maTheLoai: { type: Sequelize.INTEGER, allowNull: false },
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
    await queryInterface.addConstraint('ChiTietPhieuMuon', {
      fields: ['maPhieuMuon', 'maDocGia'],
      type: 'foreign key',
      name: 'fk_chitietphieumuon_phieumuon',
      references: { table: 'PhieuMuon', fields: ['maPhieuMuon', 'maDocGia'] },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('ChiTietPhieuMuon', {
      fields: ['maSach', 'maTacGia', 'maTheLoai'],
      type: 'foreign key',
      name: 'fk_chitietphieumuon_sach',
      references: { table: 'Sach', fields: ['maSach', 'maTacGia', 'maTheLoai'] },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChiTietPhieuMuon');
  }
};

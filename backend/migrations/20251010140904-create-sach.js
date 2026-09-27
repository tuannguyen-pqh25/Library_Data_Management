'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sach', {
      maSach: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      maTacGia: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'TacGia', key: 'maTacGia' },  onDelete: 'CASCADE', onUpdate: 'CASCADE'},
      maTheLoai: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'TheLoai', key: 'maTheLoai' }, onDelete: 'CASCADE', onUpdate: 'CASCADE'},
      tenSach: { allowNull: false, type: Sequelize.STRING },
      namXuatBan: { allowNull: false, type: Sequelize.INTEGER },
      maNXB: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'NhaXuatBan', key: 'maNXB' },  onDelete: 'CASCADE', onUpdate: 'CASCADE'},
      soLuongHienCo: { allowNull: false, type: Sequelize.INTEGER },
      donGia: { allowNull: false, type: Sequelize.FLOAT },
      nguonGoc: { allowNull: false, type: Sequelize.STRING },
      imagePath: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sach');
  }
};
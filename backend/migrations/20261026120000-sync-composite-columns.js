'use strict';

/**
 * Migration đồng bộ các cột khóa ngoại còn thiếu trong ChiTietPhieuMuon và PhieuTra
 * Đảm bảo schema CSDL khớp hoàn toàn với Model Sequelize và các ràng buộc toàn vẹn.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [ctColumns] = await queryInterface.sequelize.query('DESCRIBE ChiTietPhieuMuon');
    const ctColNames = ctColumns.map((col) => col.Field);

    if (!ctColNames.includes('maDocGia')) {
      await queryInterface.addColumn('ChiTietPhieuMuon', 'maDocGia', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!ctColNames.includes('maTacGia')) {
      await queryInterface.addColumn('ChiTietPhieuMuon', 'maTacGia', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!ctColNames.includes('maTheLoai')) {
      await queryInterface.addColumn('ChiTietPhieuMuon', 'maTheLoai', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    const [ptColumns] = await queryInterface.sequelize.query('DESCRIBE PhieuTra');
    const ptColNames = ptColumns.map((col) => col.Field);

    if (!ptColNames.includes('maPhieuMuon')) {
      await queryInterface.addColumn('PhieuTra', 'maPhieuMuon', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!ptColNames.includes('maSach')) {
      await queryInterface.addColumn('PhieuTra', 'maSach', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const [ctColumns] = await queryInterface.sequelize.query('DESCRIBE ChiTietPhieuMuon');
    const ctColNames = ctColumns.map((col) => col.Field);

    if (ctColNames.includes('maDocGia')) {
      await queryInterface.removeColumn('ChiTietPhieuMuon', 'maDocGia');
    }
    if (ctColNames.includes('maTacGia')) {
      await queryInterface.removeColumn('ChiTietPhieuMuon', 'maTacGia');
    }
    if (ctColNames.includes('maTheLoai')) {
      await queryInterface.removeColumn('ChiTietPhieuMuon', 'maTheLoai');
    }

    const [ptColumns] = await queryInterface.sequelize.query('DESCRIBE PhieuTra');
    const ptColNames = ptColumns.map((col) => col.Field);

    if (ptColNames.includes('maPhieuMuon')) {
      await queryInterface.removeColumn('PhieuTra', 'maPhieuMuon');
    }
    if (ptColNames.includes('maSach')) {
      await queryInterface.removeColumn('PhieuTra', 'maSach');
    }
  },
};

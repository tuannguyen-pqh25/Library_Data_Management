'use strict';

/**
 * Migration cập nhật ENUM trạng thái trong bảng PhieuMuon
 * Đảm bảo hỗ trợ đầy đủ trạng thái 'Đang mượn' theo Tieuchiduan.md và các logic nghiệp vụ.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE PhieuMuon
      MODIFY COLUMN trangThai ENUM('Chờ duyệt', 'Đang mượn', 'Đã duyệt', 'Đã trả', 'Từ chối')
      NOT NULL DEFAULT 'Chờ duyệt'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE PhieuMuon
      MODIFY COLUMN trangThai ENUM('Chờ duyệt', 'Đã duyệt', 'Đã trả', 'Từ chối')
      NOT NULL DEFAULT 'Chờ duyệt'
    `);
  },
};

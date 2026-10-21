// Use these predicates with findAll/findOne on the dependent model. Sequelize v6
// associations cannot express the composite foreign keys on these three paths.
function completeKey(source, fields) {
  const where = {};
  for (const field of fields) {
    const value = source?.[field];
    if (value === null || value === undefined) {
      throw new TypeError(`Missing composite key field: ${field}`);
    }
    where[field] = value;
  }
  return where;
}

const loanDetailWhere = (loan) => completeKey(loan, ['maPhieuMuon', 'maDocGia']);
const bookDetailWhere = (book) => completeKey(book, ['maSach', 'maTacGia', 'maTheLoai']);
const detailReturnWhere = (detail) => completeKey(detail, ['maChiTietPM', 'maPhieuMuon', 'maSach']);

function registerAssociations({ Sach, TacGia, TheLoai, NhaXuatBan, PhieuMuon, DocGia }) {
  Sach.belongsTo(TacGia, { foreignKey: 'maTacGia', as: 'TacGia' });
  TacGia.hasMany(Sach, { foreignKey: 'maTacGia', as: 'Sachs' });
  Sach.belongsTo(TheLoai, { foreignKey: 'maTheLoai', as: 'TheLoai' });
  TheLoai.hasMany(Sach, { foreignKey: 'maTheLoai', as: 'Sachs' });
  Sach.belongsTo(NhaXuatBan, { foreignKey: 'maNXB', as: 'NhaXuatBan' });
  NhaXuatBan.hasMany(Sach, { foreignKey: 'maNXB', as: 'Sachs' });
  PhieuMuon.belongsTo(DocGia, { foreignKey: 'maDocGia', as: 'DocGia' });
  DocGia.hasMany(PhieuMuon, { foreignKey: 'maDocGia', as: 'PhieuMuons' });
}

module.exports = { registerAssociations, loanDetailWhere, bookDetailWhere, detailReturnWhere };

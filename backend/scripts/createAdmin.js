require('dotenv').config({ path: '../.env' }); 
const bcrypt = require('bcryptjs');
const { sequelize, NhanVien } = require('../models');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công');

    if (!NhanVien || typeof NhanVien.findOne !== 'function') {
      throw new Error('Model NhanVien không được import đúng cách');
    }

    const adminExists = await NhanVien.findOne({ where: { hoTenNV: 'Admin' } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await NhanVien.create({
        hoTenNV: 'Admin',
        password: hashedPassword,
        chucVu: 'Admin',
        diaChi: 'Admin Address',
        soDienThoai: '0123456789'
      });

      console.log('✅ Tạo tài khoản admin mặc định thành công (hoTenNV: Admin, password: admin123)');
    } else {
      console.log('⚠️ Tài khoản admin với hoTenNV "Admin" đã tồn tại');
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Đã đóng kết nối MySQL');
  }
};

createAdmin();
// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const sachRoutes = require('./routes/bookRoutes');
const nhaXuatBanRoutes = require('./routes/publisherRoutes');
const theoDoiMuonSachRoutes = require('./routes/borrowRoutes');
const nhanVienRoutes = require('./routes/staffRoutes');
const docGiaRoutes = require('./routes/userRoutes');
const tacGiaRoutes = require('./routes/authorRoutes');
const theLoaiRoutes = require('./routes/categoryRoutes');

const app = express();



// Middleware
app.use(cors());
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sach', sachRoutes);
app.use('/api/nhaxuatban', nhaXuatBanRoutes);
app.use('/api/muonsach', theoDoiMuonSachRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/docgia', docGiaRoutes);
app.use('/api/tacgia', tacGiaRoutes);
app.use('/api/theloai', theLoaiRoutes);

// static (dist)
app.use(express.static('dist'));
app.use('/uploads', express.static('uploads'));
// Serve the frontend application
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

const PORT = process.env.PORT || 5000;
// ✅ Kết nối MySQL và tự động sync models
sequelize.sync({ alter: true })  // alter: true sẽ cập nhật bảng nếu có thay đổi cấu trúc
  .then(() => {
    console.log('✅ Kết nối MySQL thành công & các bảng đã được đồng bộ!');
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Lỗi khi kết nối hoặc sync Sequelize:', err);
  });
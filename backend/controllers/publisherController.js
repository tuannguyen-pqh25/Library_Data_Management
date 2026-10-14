const logger = require('../src/logger');
const { NhaXuatBan, Sach } = require('../models');

const getValidatedPublisherData = (body = {}) => {
  const tenNXB = typeof body.tenNXB === 'string' ? body.tenNXB.trim() : '';
  const diaChi = typeof body.diaChi === 'string' ? body.diaChi.trim() : '';
  const errors = {};

  if (!tenNXB) {
    errors.tenNXB = 'Tên nhà xuất bản là bắt buộc';
  }
  if (!diaChi) {
    errors.diaChi = 'Địa chỉ là bắt buộc';
  } else if (diaChi.length < 5) {
    errors.diaChi = 'Địa chỉ phải có ít nhất 5 ký tự';
  }

  return { data: { tenNXB, diaChi }, errors };
};

// Lấy danh sách tất cả nhà xuất bản
const getAllPublishers = async (req, res) => {
  try {
    logger.info('Fetching all publishers');
    const publishers = await NhaXuatBan.findAll();
    logger.info('Publishers fetched', { count: publishers.length });
    res.json(publishers);
  } catch (error) {
    logger.error('Error in getAllPublishers', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

// Thêm nhà xuất bản mới
const createPublisher = async (req, res) => {
  try {
    logger.info('Creating publisher', { data: req.body });
    const { data: publisherData, errors } = getValidatedPublisherData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Thông tin nhà xuất bản không hợp lệ',
        errors,
      });
    }
    const publisher = await NhaXuatBan.create(publisherData);
    logger.info('Publisher created', { publisher: publisher.toJSON() });
    res.status(201).json(publisher);
  } catch (error) {
    logger.error('Create publisher error', { error: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin nhà xuất bản
const updatePublisher = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      logger.warn('Missing publisher ID in request');
      return res.status(400).json({ message: 'Mã nhà xuất bản là bắt buộc' });
    }
    logger.info('Updating publisher', { id, data: req.body });
    const { data: publisherData, errors } = getValidatedPublisherData(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Thông tin nhà xuất bản không hợp lệ',
        errors,
      });
    }

    const [updated] = await NhaXuatBan.update(publisherData, {
      where: { maNXB: id },
    });
    if (updated === 0) {
      logger.warn('Publisher not found', { id });
      return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
    }
    const publisher = await NhaXuatBan.findByPk(id);
    logger.info('Publisher updated', { publisher: publisher.toJSON() });
    res.json(publisher);
  } catch (error) {
    logger.error('Update publisher error', { error: error.message, stack: error.stack });
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhà xuất bản
const deletePublisher = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      logger.warn('Invalid publisher ID in delete request', { id: req.params.id });
      return res.status(400).json({ message: 'Mã nhà xuất bản là bắt buộc' });
    }

    logger.info('Checking publisher books', { id });
    const books = await Sach.findAll({
      where: { maNXB: id },
      attributes: ['maSach', 'tenSach'],
    });
    if (books.length > 0) {
      const linkedBooks = books.map((book) => ({
        maSach: book.maSach,
        tenSach: book.tenSach,
      }));
      logger.warn('Cannot delete publisher due to associated books', {
        id,
        bookCount: linkedBooks.length,
      });
      return res.status(409).json({
        message: 'Không thể xóa nhà xuất bản vì vẫn còn sách liên kết. Hãy chuyển các sách này sang nhà xuất bản khác trước.',
        books: linkedBooks,
      });
    }

    logger.info('Deleting publisher', { id });
    const deleted = await NhaXuatBan.destroy({ where: { maNXB: id } });
    if (deleted === 0) {
      logger.warn('Publisher not found for deletion', { id });
      return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
    }
    logger.info('Publisher deleted successfully', { id });
    res.json({ message: 'Xóa nhà xuất bản thành công' });
  } catch (error) {
    if (error.message.includes('foreign key constraint fails')) {
      logger.warn('Cannot delete author due to foreign key constraint', { error: error.message });
      return res.status(409).json({ message: 'Không thể xóa nhà xuất bản vì có sách liên kết' });
    }
    logger.error('Delete publisher error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một nhà xuất bản theo ID
const getPublisherById = async (req, res) => {
  try {
    const { id } = req.params; // Sử dụng 'id' thay vì 'maNXB'
    if (!id) {
      logger.warn('Missing publisher ID in request');
      return res.status(400).json({ message: 'Mã nhà xuất bản là bắt buộc' });
    }
    logger.info('Fetching publisher by ID', { id });
    const publisher = await NhaXuatBan.findByPk(id);
    if (!publisher) {
      logger.warn('Publisher not found', { id });
      return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
    }
    logger.info('Publisher fetched', { publisher: publisher.toJSON() });
    res.json(publisher);
  } catch (error) {
    logger.error('Get publisher by ID error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

// Xuất các hàm để sử dụng trong file routes
module.exports = {
  getAllPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublisherById,
};
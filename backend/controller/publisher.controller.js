const publisherService = require('../model/service/publisher.service');

const publisherController = {
  // Tạo nhà xuất bản mới
  createPublisher: async (req, res) => {
    try {
      const newPublisher = await publisherService.createPublisher(req.body);
      res.status(201).json(newPublisher);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Lấy danh sách nhà xuất bản (có phân trang)
  getAllPublishers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 0;
      const search = req.query.search || '';

      const result = await publisherService.getAllPublishers({ page, limit, search });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy thông tin nhà xuất bản theo ID
  getPublisherById: async (req, res) => {
    try {
      const publisher = await publisherService.getPublisherById(req.params.id);
      if (!publisher) return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
      res.status(200).json(publisher);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật thông tin nhà xuất bản
  updatePublisher: async (req, res) => {
    try {
      const updatedPublisher = await publisherService.updatePublisher(req.params.id, req.body);
      if (!updatedPublisher) return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
      res.status(200).json(updatedPublisher);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Xoá nhà xuất bản
  deletePublisher: async (req, res) => {
    try {
      const deleted = await publisherService.deletePublisher(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy nhà xuất bản' });
      res.status(200).json({ message: 'Đã xoá nhà xuất bản thành công' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = publisherController;

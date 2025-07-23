const purchaseReceiptService = require('../model/service/purchaseReceipt.service');

const purchaseReceiptController = {
  // Tạo phiếu nhập mới
  createReceipt: async (req, res) => {
    try {
      const receipt = await purchaseReceiptService.create(req.body);
      res.status(201).json(receipt);
    } catch (error) {
      res.status(400).json({ 
        message: "Lỗi tạo phiếu nhập", 
        error: error.message 
      });
    }
  },

  // Lấy danh sách phiếu nhập
  getAllReceipts: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const receipts = await purchaseReceiptService.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });
      res.status(200).json(receipts);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi lấy danh sách phiếu nhập", 
        error: error.message 
      });
    }
  },

  // Lấy chi tiết phiếu nhập theo ID
  getReceiptById: async (req, res) => {
    try {
      const receipt = await purchaseReceiptService.getById(req.params.id);
      if (!receipt) {
        return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
      }
      res.status(200).json(receipt);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi lấy chi tiết phiếu nhập", 
        error: error.message 
      });
    }
  },

  // Cập nhật phiếu nhập
  updateReceipt: async (req, res) => {
    try {
      const updated = await purchaseReceiptService.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Không tìm thấy phiếu nhập để cập nhật' });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ 
        message: "Lỗi cập nhật phiếu nhập", 
        error: error.message 
      });
    }
  },

  // Xóa phiếu nhập
  deleteReceipt: async (req, res) => {
    try {
      const deleted = await purchaseReceiptService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Không tìm thấy phiếu nhập để xóa' });
      }
      res.status(200).json({ message: 'Đã xóa phiếu nhập thành công' });
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi xóa phiếu nhập", 
        error: error.message 
      });
    }
  },

  // Thống kê phiếu nhập
  getReceiptStatistics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const statistics = await purchaseReceiptService.getStatistics(startDate, endDate);
      res.status(200).json(statistics);
    } catch (error) {
      res.status(500).json({ 
        message: "Lỗi thống kê phiếu nhập", 
        error: error.message 
      });
    }
  }
};

module.exports = purchaseReceiptController;
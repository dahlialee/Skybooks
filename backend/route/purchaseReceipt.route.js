const express = require('express');
const router = express.Router();
const purchaseReceiptController = require('../controller/purchaseReceipt.controller');

// Tạo phiếu nhập mới
router.post('/', purchaseReceiptController.createReceipt);

// Lấy danh sách phiếu nhập
router.get('/', purchaseReceiptController.getAllReceipts);

// Lấy chi tiết phiếu nhập
router.get('/:id', purchaseReceiptController.getReceiptById);

// Cập nhật phiếu nhập
router.put('/:id', purchaseReceiptController.updateReceipt);

// Xóa phiếu nhập
router.delete('/:id', purchaseReceiptController.deleteReceipt);

// Thống kê phiếu nhập
router.get('/statistics', purchaseReceiptController.getReceiptStatistics);

module.exports = router;
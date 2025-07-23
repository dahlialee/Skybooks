const express = require('express');
const router = express.Router();
const publisherController = require('../controller/publisher.controller');

// Lấy danh sách nhà xuất bản (có phân trang + tìm kiếm)
router.get('/', publisherController.getAllPublishers);

// Lấy thông tin 1 nhà xuất bản theo ID
router.get('/:id', publisherController.getPublisherById);

// Tạo mới nhà xuất bản
router.post('/', publisherController.createPublisher);

// Cập nhật nhà xuất bản theo ID
router.put('/:id', publisherController.updatePublisher);

// Xoá nhà xuất bản theo ID
router.delete('/:id', publisherController.deletePublisher);

module.exports = router;

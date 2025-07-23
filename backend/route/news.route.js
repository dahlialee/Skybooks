const express = require('express');
const router = express.Router();
const newsController = require('../controller/news.controller');

// Lấy danh sách tin tức (có phân trang) - cho user (chỉ tin đã đăng)
router.get('/', newsController.getNewsList);

// Lấy danh sách tất cả tin tức (cho admin) - mọi trạng thái
router.get('/admin/all', newsController.getAllNewsList);

// Lấy chi tiết tin tức đã đăng (cho user)
router.get('/published/:id', newsController.getPublishedNewsById);

// Tăng lượt xem tin tức
router.post('/:id/view', newsController.incrementView);

// Lấy chi tiết một tin tức theo ID (cho admin) - mọi trạng thái
router.get('/:id', newsController.getNewsById);

// Tạo mới tin tức
router.post('/', newsController.createNews);

// Cập nhật tin tức theo ID
router.put('/:id', newsController.updateNews);

// Xóa tin tức theo ID
router.delete('/:id', newsController.deleteNews);

module.exports = router;

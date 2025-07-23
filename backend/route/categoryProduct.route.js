const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryProduct.controller');

router.get('/', categoryController.getCategories);        // Lấy danh sách category (có phân trang)
router.get('/:id', categoryController.getCategoryById);   // Lấy category theo id
router.post('/', categoryController.createCategory);      // Tạo category mới
router.put('/:id', categoryController.updateCategory);    // Cập nhật category theo id
router.delete('/:id', categoryController.deleteCategory); // Xóa category theo id

module.exports = router;

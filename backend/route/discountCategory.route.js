const express = require('express');
const router = express.Router();
const discountCategoryController = require('../controller/discountCategory.controller');

router.post('/', discountCategoryController.createDiscountCategory);
router.get('/', discountCategoryController.getAllDiscountCategories);
router.get('/:id', discountCategoryController.getDiscountCategoryById);
router.put('/:id', discountCategoryController.updateDiscountCategory);
router.delete('/:id', discountCategoryController.deleteDiscountCategory);

module.exports = router;

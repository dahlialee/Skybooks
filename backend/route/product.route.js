const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

router.post('/', productController.createProduct);
router.get('/', productController.getProductList);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Thêm route tìm kiếm theo barcode
router.get('/barcode/:barcode', productController.findProductByBarcode);

module.exports = router;

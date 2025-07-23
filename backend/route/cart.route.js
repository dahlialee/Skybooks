const express = require('express');
const router = express.Router();
const CartController = require('../controller/cart.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Sử dụng middleware guest để hỗ trợ khách hàng
router.get('/', authMiddleware.guest, CartController.getCart);
router.post('/add', authMiddleware.guest, CartController.addToCart);
router.put('/update/:productId', authMiddleware.guest, CartController.updateCartItem);
router.delete('/delete/:productId', authMiddleware.guest, CartController.deleteCartItem);
router.delete('/clear', authMiddleware.guest, CartController.clearCart);
router.get('/total', authMiddleware.guest, CartController.calculateCartTotal);
router.post('/sync', authMiddleware.guest, CartController.syncLocalCartWithServer);

module.exports = router;

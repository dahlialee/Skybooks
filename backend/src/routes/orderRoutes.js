const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route đặt hàng cho người dùng đã đăng nhập
router.post('/', authMiddleware, orderController.createOrder);

// Route đặt hàng không cần token (cho khách)
router.post('/guest', orderController.createGuestOrder);

module.exports = router; 
const express = require('express');
const router = express.Router();
const vnpayController = require('../controller/vnpay.controller');
const vnpayValidation = require('../middleware/vnpay.validation');

// Tạo URL thanh toán VNPay
router.post('/create-payment', 
  vnpayValidation.validatePaymentRequest, 
  vnpayController.createPayment
);

// Xử lý kết quả trả về từ VNPay
router.get('/payment-result', 
  vnpayController.vnpayReturn
);

// Kiểm tra trạng thái thanh toán
router.get('/check-status', 
  (req, res) => {
    if (typeof vnpayController.checkPaymentStatus === 'function') {
      return vnpayController.checkPaymentStatus(req, res);
    } else {
      return res.status(501).json({ 
        message: 'Chức năng kiểm tra trạng thái thanh toán chưa được triển khai' 
      });
    }
  }
);

module.exports = router; 
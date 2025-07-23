// Middleware kiểm tra và xác thực yêu cầu thanh toán VNPay
exports.validatePaymentRequest = (req, res, next) => {
  try {
    const { amount, orderInfo } = req.body;

    // Kiểm tra amount
    if (!amount) {
      return res.status(400).json({
        message: 'Thiếu thông tin số tiền thanh toán',
        error: 'Amount là bắt buộc'
      });
    }

    // Kiểm tra giá trị amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: 'Số tiền không hợp lệ',
        error: 'Số tiền phải là số dương'
      });
    }

    // Kiểm tra orderInfo
    if (!orderInfo || typeof orderInfo !== 'string' || orderInfo.trim() === '') {
      return res.status(400).json({
        message: 'Thiếu thông tin đơn hàng',
        error: 'OrderInfo là bắt buộc và phải là chuỗi không rỗng'
      });
    }

    // Giới hạn độ dài thông tin đơn hàng
    if (orderInfo.length > 255) {
      return res.status(400).json({
        message: 'Thông tin đơn hàng quá dài',
        error: 'OrderInfo không được vượt quá 255 ký tự'
      });
    }

    // Kiểm tra ký tự đặc biệt
    const specialCharsRegex = /[<>'"&]/;
    if (specialCharsRegex.test(orderInfo)) {
      return res.status(400).json({
        message: 'Thông tin đơn hàng chứa ký tự không hợp lệ',
        error: 'Không được chứa các ký tự đặc biệt như <, >, \', ", &'
      });
    }

    // Nếu tất cả kiểm tra đều hợp lệ, chuyển sang middleware/controller tiếp theo
    next();

  } catch (error) {
    console.error('❌ Lỗi xác thực thanh toán:', error);
    return res.status(500).json({
      message: 'Lỗi hệ thống khi xác thực thanh toán',
      error: error.message
    });
  }
}; 
// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  // Log lỗi để theo dõi (có thể sử dụng winston hoặc morgan để log chi tiết hơn)
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
  console.error(err.stack);

  // Xác định mã trạng thái
  const statusCode = err.statusCode || 500;

  // Trả về phản hồi lỗi chi tiết
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Đã xảy ra lỗi không xác định',
    // Chỉ hiển thị stack trace trong môi trường phát triển
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware bắt lỗi không xác định (404)
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Không tìm thấy: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 
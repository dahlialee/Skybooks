const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();
const port = process.env.PORT || 1906;

// Cấu hình CORS chi tiết hơn
app.use(cors({
  origin: true, // Cho phép tất cả các origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
  credentials: true // Cho phép gửi cookie
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('public/image'));

// Thêm middleware CSP trước các route
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy', 
    "default-src 'self' https://sandbox.vnpayment.vn; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sandbox.vnpayment.vn; " +
    "style-src 'self' 'unsafe-inline' https://sandbox.vnpayment.vn; " +
    "img-src 'self' data: https://sandbox.vnpayment.vn; " +
    "connect-src 'self' https://sandbox.vnpayment.vn; " +
    "font-src 'self' https://sandbox.vnpayment.vn; " +
    "frame-src 'self' https://sandbox.vnpayment.vn"
  );
  next();
});

// Routes
const authRoutes = require('./route/auth.route');
app.use('/api/auth', authRoutes);

const categoryProductRoutes = require('./route/categoryProduct.route');
app.use('/api/categoryProduct', categoryProductRoutes);

const cartRoutes = require('./route/cart.route');
app.use('/api/cart', cartRoutes);

const customerRoutes = require('./route/customer.route');
app.use('/api/customer', customerRoutes);

const discountCategoryRoutes = require('./route/discountCategory.route');
app.use('/api/discountCategory', discountCategoryRoutes);

const employeeRoutes = require('./route/employee.route');
app.use('/api/employee', employeeRoutes);

const invoiceRoutes = require('./route/invoice.route');
app.use('/api/invoice', invoiceRoutes);

const newsRoutes = require('./route/news.route');
app.use('/api/news', newsRoutes);

const productRoutes = require('./route/product.route');
app.use('/api/product', productRoutes);

const publisherRoutes = require('./route/publisher.route');
app.use('/api/publisher', publisherRoutes);

const purchaseReceiptRoutes = require('./route/purchaseReceipt.route');
app.use('/api/purchaseReceipt', purchaseReceiptRoutes);

const vnpayRoutes = require('./route/vnpay.route');
app.use('/api/vnpay', vnpayRoutes);

const dashboardRoutes = require('./route/dashboard.route');
app.use('/api/dashboard', dashboardRoutes);

// Middleware bắt lỗi không tìm thấy
app.use(notFoundHandler);

// Middleware xử lý lỗi cuối cùng
app.use(errorHandler);

// ✅ Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

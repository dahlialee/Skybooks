const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard.controller');
const Invoice = require('../model/entity/invoice.schema');
const Customer = require('../model/entity/customer.schema');

// Các route thống kê (chỉ admin mới được truy cập)
router.get(
  '/overview', DashboardController.getDashboardOverview
);

router.get(
  '/revenue', 
  DashboardController.getRevenueStatistics
);

router.get(
  '/products', 
  DashboardController.getProductStatistics
);

router.get(
  '/customers', 
  DashboardController.getCustomerStatistics
);

router.get('/orders', async (req, res) => {
  try {
    const orderStats = await Invoice.aggregate([
      {
        $group: {
          _id: '$shipping_status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    console.log('Order Stats:', orderStats);

    // Nếu không có dữ liệu, trả về mảng trống
    res.json(orderStats.length > 0 ? orderStats : []);
  } catch (error) {
    console.error('Chi tiết lỗi thống kê đơn hàng:', error);
    
    res.status(500).json({ 
      message: 'Lỗi thống kê đơn hàng', 
      error: error.toString(),
      stack: error.stack
    });
  }
});

// Thêm route thống kê tổng quan
router.get('/overview', async (req, res) => {
  try {
    // Kiểm tra kết nối và dữ liệu
    console.log('Bắt đầu truy vấn overview');

    // Kiểm tra số lượng hóa đơn
    const totalInvoices = await Invoice.countDocuments();
    console.log('Tổng số hóa đơn:', totalInvoices);

    // Kiểm tra tổng doanh thu
    const revenueResult = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    console.log('Kết quả doanh thu:', revenueResult);

    // Kiểm tra khách hàng
    const totalCustomers = await Customer.countDocuments();
    console.log('Tổng số khách hàng:', totalCustomers);

    // Trả về dữ liệu
    res.json({
      totalRevenue: revenueResult[0]?.total || 0,
      totalOrders: totalInvoices,
      newCustomers: totalCustomers
    });
  } catch (error) {
    console.error('Chi tiết lỗi overview:', error);
    res.status(500).json({ 
      message: 'Lỗi thống kê tổng quan', 
      error: error.toString() 
    });
  }
});

module.exports = router;

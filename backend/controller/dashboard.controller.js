const DashboardService = require('../model/service/dashboard.service');

class DashboardController {
  // Thống kê tổng quan
  async getDashboardOverview(req, res) {
    try {
      const overview = await DashboardService.getOverviewStatistics();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ 
        message: 'Lỗi thống kê tổng quan', 
        error: error.message 
      });
    }
  }

  // Thống kê doanh thu
  async getRevenueStatistics(req, res) {
    try {
      const { 
        startDate, 
        endDate, 
        groupBy 
      } = req.query;

      const revenueStats = await DashboardService.getRevenueStatistics({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        groupBy
      });

      res.json(revenueStats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Lỗi thống kê doanh thu', 
        error: error.message 
      });
    }
  }

  // Thống kê sản phẩm
  async getProductStatistics(req, res) {
    try {
      const productStats = await DashboardService.getProductStatistics();
      res.json(productStats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Lỗi thống kê sản phẩm', 
        error: error.message 
      });
    }
  }

  // Thống kê khách hàng
  async getCustomerStatistics(req, res) {
    try {
      const customerStats = await DashboardService.getCustomerStatistics();
      res.json(customerStats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Lỗi thống kê khách hàng', 
        error: error.message 
      });
    }
  }

  // Thống kê đơn hàng
  async getOrderStatistics(req, res) {
    try {
      const orderStats = await DashboardService.getOrderStatistics();
      res.json(orderStats);
    } catch (error) {
      res.status(500).json({ 
        message: 'Lỗi thống kê đơn hàng', 
        error: error.message 
      });
    }
  }
}

module.exports = new DashboardController();

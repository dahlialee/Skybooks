import axios from "axios";

const BASE_URL = "http://localhost:1906/api/dashboard";

const DashboardAPI = {
  // Lấy thống kê tổng quan
  async getDashboardOverview() {
    try {
      const response = await axios.get(`${BASE_URL}/overview`);
      
      // Đảm bảo luôn có dữ liệu
      const data = response.data || {};
      return {
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        newCustomers: data.newCustomers || 0,
        topSellingProducts: data.topSellingProducts || []
      };
    } catch (error) {
      console.error('Chi tiết lỗi overview:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        totalRevenue: 0,
        totalOrders: 0,
        newCustomers: 0,
        topSellingProducts: []
      };
    }
  },

  // Lấy thống kê doanh thu
  async getRevenueStatistics(params = {}) {
    try {
      console.log('Tham số thống kê doanh thu:', params);
      const response = await axios.get(`${BASE_URL}/revenue`, { params });
      
      console.log('Phản hồi từ API:', response);
      console.log('Dữ liệu doanh thu:', response.data);

      // Kiểm tra và log chi tiết từng phần
      if (Array.isArray(response.data)) {
        response.data.forEach((item, index) => {
          console.log(`Chi tiết doanh thu [${index}]:`, item);
        });
      }

      return {
        data: response.data || [],
        summary: {
          totalRevenue: response.data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0),
          totalOrders: response.data.reduce((sum, item) => sum + (item.orderCount || 0), 0)
        }
      };
    } catch (error) {
      console.error('Chi tiết lỗi thống kê doanh thu:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        data: [],
        summary: {
          totalRevenue: 0,
          totalOrders: 0
        }
      };
    }
  },

  // Lấy thống kê sản phẩm
  async getProductStatistics() {
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thống kê sản phẩm:', error);
      throw error;
    }
  },

  // Lấy thống kê khách hàng
  async getCustomerStatistics() {
    try {
      const response = await axios.get(`${BASE_URL}/customers`);
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy thống kê khách hàng:', error);
      throw error;
    }
  },

  // Lấy thống kê đơn hàng
  async getOrderStatistics() {
    try {
      const response = await axios.get(`${BASE_URL}/orders`);
      console.log('Dữ liệu đơn hàng từ API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Chi tiết lỗi đơn hàng:', error.response?.data || error.message);
      throw error;
    }
  },

  // Lấy toàn bộ dữ liệu dashboard
  async getAllDashboardData(options = {}) {
    try {
      const [
        overview,
        revenue,
        products,
        customers,
        orders
      ] = await Promise.all([
        this.getDashboardOverview(),
        this.getRevenueStatistics(options.revenue),
        this.getProductStatistics(),
        this.getCustomerStatistics(),
        this.getOrderStatistics()
      ]);

      return {
        overview,
        revenue,
        products,
        customers,
        orders
      };
    } catch (error) {
      console.error('Lỗi lấy toàn bộ dữ liệu dashboard:', error);
      return {
        overview: {
          totalRevenue: 0,
          totalOrders: 0,
          newCustomers: 0,
          topSellingProducts: []
        },
        revenue: {
          data: [],
          summary: {
            totalRevenue: 0,
            totalOrders: 0
          }
        },
        products: {},
        customers: {},
        orders: []
      };
    }
  },

  // Lấy thống kê doanh thu theo khoảng thời gian và nhóm
  getRevenueStatistics: (params) => {
    return axios.get(`${BASE_URL}/revenue`, { 
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy || 'daily'
      }
    });
  },
};

export default DashboardAPI;

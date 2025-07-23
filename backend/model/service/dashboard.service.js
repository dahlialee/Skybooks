const Invoice = require('../entity/invoice.schema');
const Product = require('../entity/product.schema');
const Customer = require('../entity/customer.schema');
const CategoryProduct = require('../entity/categoryProduct.schema');

class DashboardService {
  // Thống kê tổng quan
  async getOverviewStatistics() {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const [
        totalRevenue,
        totalOrders,
        newCustomers,
        topSellingProducts
      ] = await Promise.all([
        // Tổng doanh thu trong tháng hiện tại (các đơn đã giao)
        Invoice.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 1)
              },
              payment_status: 'Đã thanh toán',
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$total_amount' }
            }
          }
        ]),

        // Tổng số đơn hàng 
        Invoice.countDocuments({ 
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }),

        // Khách hàng mới trong tháng
        Customer.countDocuments({
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }),

        // Top sản phẩm bán chạy
        this.getTopSellingProducts(5)
      ]);

      return {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        newCustomers,
        topSellingProducts
      };
    } catch (error) {
      throw new Error(`Lỗi thống kê tổng quan: ${error.message}`);
    }
  }

  // Thống kê doanh thu chi tiết
  async getRevenueStatistics(options = {}) {
    try {
      const { 
        startDate = new Date(new Date().getFullYear() - 1, 0, 1),
        endDate = new Date(),
        groupBy = 'monthly'
      } = options;

      // Điều chỉnh múi giờ cho startDate và endDate
      const adjustStartDate = new Date(Date.UTC(
        startDate.getFullYear(), 
        startDate.getMonth(), 
        startDate.getDate()
      ));

      const adjustEndDate = new Date(Date.UTC(
        endDate.getFullYear(), 
        endDate.getMonth(), 
        endDate.getDate() + 1  // Thêm 1 ngày để bao gồm toàn bộ ngày cuối
      ));

      console.log('Ngày bắt đầu (UTC):', adjustStartDate);
      console.log('Ngày kết thúc (UTC):', adjustEndDate);

      let groupStage;
      switch(groupBy) {
        case 'daily':
          groupStage = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          };
          break;
        case 'weekly':
          groupStage = {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          };
          break;
        default:
          groupStage = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          };
      }

      const result = await Invoice.aggregate([
        {
          $match: {
            payment_status: 'Đã thanh toán', // Chỉ tính các đơn đã giao
            createdAt: { 
              $gte: adjustStartDate,
              $lt: adjustEndDate
            }
          }
        },
        {
          $group: {
            _id: groupStage,
            totalRevenue: { $sum: '$total_amount' },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      console.log('Kết quả thống kê doanh thu:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('Chi tiết lỗi thống kê doanh thu:', error);
      throw new Error(`Lỗi thống kê doanh thu: ${error.message}`);
    }
  }

  // Thống kê sản phẩm
  async getProductStatistics() {
    try {
      const [
        inventoryStatus,
        categoryPerformance,
        lowStockProducts,
        topSellingProducts
      ] = await Promise.all([
        // Tổng quan trạng thái kho
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              totalInventory: { $sum: '$quantity' },
              averagePrice: { $avg: '$price' }
            }
          }
        ]),

        // Hiệu suất theo danh mục
        this.getCategoryPerformance(),

        // Sản phẩm sắp hết hàng
        Product.find({ quantity: { $lt: 10 } })
          .select('name quantity price')
          .limit(10),

        // Top sản phẩm bán chạy
        this.getTopSellingProducts(10)
      ]);

      return {
        inventoryStatus: inventoryStatus[0] || {},
        categoryPerformance,
        lowStockProducts,
        topSellingProducts
      };
    } catch (error) {
      throw new Error(`Lỗi thống kê sản phẩm: ${error.message}`);
    }
  }

  // Thống kê khách hàng
  async getCustomerStatistics() {
    try {
      const [
        customerSegmentation,
        topCustomers,
        customerGrowth
      ] = await Promise.all([
        // Phân loại khách hàng theo chi tiêu
        this.getCustomerSegmentation(),

        // Top khách hàng
        this.getTopCustomers(),

        // Tăng trưởng khách hàng theo tháng
        Customer.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              newCustomers: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);

      return {
        customerSegmentation,
        topCustomers,
        customerGrowth
      };
    } catch (error) {
      throw new Error(`Lỗi thống kê khách hàng: ${error.message}`);
    }
  }

  // Thống kê đơn hàng
  async getOrderStatistics() {
    try {
      const [
        orderStatusBreakdown,
        orderTrend,
        averageOrderValue
      ] = await Promise.all([
        // Phân bổ trạng thái đơn hàng
        Invoice.aggregate([
          {
            $group: {
              _id: '$shipping_status',
              count: { $sum: 1 },
              total_amount: { $sum: '$total_amount' }
            }
          }
        ]),

        // Xu hướng đơn hàng theo tháng
        Invoice.aggregate([
          {
            $match: {
              shipping_status: { $ne: 'Đã hủy' } // Loại trừ các đơn bị hủy
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              orderCount: { $sum: 1 },
              totalRevenue: { $sum: '$total_amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        // Giá trị đơn hàng trung bình
        Invoice.aggregate([
          {
            $match: {
              shipping_status: { $ne: 'Đã hủy' } // Loại trừ các đơn bị hủy
            }
          },
          {
            $group: {
              _id: null,
              averageOrderValue: { $avg: '$total_amount' }
            }
          }
        ])
      ]);

      return {
        orderStatusBreakdown,
        orderTrend,
        averageOrderValue: averageOrderValue[0]
      };
    } catch (error) {
      throw new Error(`Lỗi thống kê đơn hàng: ${error.message}`);
    }
  }

  // Các phương thức hỗ trợ
  async getTopSellingProducts(limit = 5) {
    return await Invoice.aggregate([
      {
        $match: {
          shipping_status: { $ne: 'Đã hủy' } // Chỉ tính các đơn không bị hủy
        }
      },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      }
    ]);
  }

  // Hiệu suất danh mục
  async getCategoryPerformance() {
    return await Invoice.aggregate([
      {
        $match: {
          shipping_status: { $ne: 'Đã hủy' } // Chỉ tính các đơn không bị hủy
        }
      },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.categoryId',
          totalRevenue: { $sum: '$products.quantity' },
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categoryproducts',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      }
    ]);
  }

  // Phân loại khách hàng
  async getCustomerSegmentation() {
    return await Invoice.aggregate([
      {
        $match: {
          shipping_status: { $ne: 'Đã hủy' } // Chỉ tính các đơn không bị hủy
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { 
                  case: { $lt: ['$total_amount', 1000000] }, 
                  then: 'Khách hàng mới' 
                },
                { 
                  case: { $lt: ['$total_amount', 5000000] }, 
                  then: 'Khách hàng thân thiết' 
                }
              ],
              default: 'Khách hàng VIP'
            }
          },
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$total_amount' }
        }
      }
    ]);
  }

  // Top khách hàng
  async getTopCustomers(limit = 10) {
    return await Invoice.aggregate([
      {
        $match: {
          shipping_status: { $ne: 'Đã hủy' } // Chỉ tính các đơn không bị hủy
        }
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$total_amount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      }
    ]);
  }
}

module.exports = new DashboardService();

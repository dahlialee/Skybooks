// src/admin/pages/Dashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import DashboardAPI from '../../services/dashboardAPI';
import { toast } from 'react-toastify';
// Đăng ký đầy đủ các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStats, setOrderStats] = useState([]);
  const [revenueFilters, setRevenueFilters] = useState({
    startDate: null,
    endDate: null,
    groupBy: 'daily' // Mặc định là daily
  });

  // Kiểm tra tính hợp lệ của ngày
  const isValidDateRange = useMemo(() => {
    if (!revenueFilters.startDate || !revenueFilters.endDate) return false;
    return new Date(revenueFilters.startDate) <= new Date(revenueFilters.endDate);
  }, [revenueFilters.startDate, revenueFilters.endDate]);

  // Hàm render an toàn được nâng cấp
  const renderSafely = (value, defaultValue = 0) => {
    return value !== undefined && value !== null ? value : defaultValue;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await DashboardAPI.getAllDashboardData({
          revenue: {
            startDate: revenueFilters.startDate,
            endDate: revenueFilters.endDate,
            groupBy: revenueFilters.groupBy
          }
        });

        console.log('Dữ liệu dashboard nhận được:', data);
        console.log('Dữ liệu doanh thu:', data.revenue);
        console.log('Chi tiết doanh thu:', data.revenue.data);
        
        // Kiểm tra và log chi tiết từng phần
        if (data.revenue && data.revenue.data) {
          data.revenue.data.forEach((item, index) => {
            console.log(`Chi tiết doanh thu [${index}]:`, item);
          });
        }

        setDashboardData(data);
        setOrderStats(data.orders || []);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error);
        setError(error);
        setLoading(false);
      }
    };

    const fetchOrderStatistics = async () => {
      try {
        const data = await DashboardAPI.getOrderStatistics();
        console.log('Dữ liệu đơn hàng:', data);
        setOrderStats(data);
      } catch (error) {
        console.error('Lỗi tải dữ liệu dashboard:', error);
      }
    };

    const fetchOverview = async () => {
      try {
        const data = await DashboardAPI.getDashboardOverview();
        console.log('Dữ liệu overview chi tiết:', data);
        setDashboardData(prev => ({ ...prev, overview: data }));
      } catch (error) {
        console.error('Lỗi tải overview:', error);
      }
    };

    fetchDashboardData();
    fetchOrderStatistics();
    fetchOverview();
  }, [revenueFilters]);

  // Hàm format ngày đơn giản (CHÍNH XÁC HƠN)
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    
    // Log chi tiết để kiểm tra
    console.log('Ngày gốc:', dateStr);
    
    // Tạo Date object với múi giờ UTC để tránh chênh lệch
    const date = new Date(dateStr);
    
    // Log thông tin Date object
    console.log('Date object:', date);
    console.log('Date toString:', date.toString());
    console.log('Date toLocaleString:', date.toLocaleString());
    console.log('Date toLocaleDateString:', date.toLocaleDateString("vi-VN"));
    
    // Điều chỉnh múi giờ (nếu cần)
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    
    return adjustedDate.toLocaleDateString("vi-VN");
  };

  // Hàm format nhãn thời gian theo nhóm
  const formatTimeLabel = (groupBy, data) => {
    if (!data || data.length === 0) return [];

    // Hàm tạo nhãn thời gian
    const createLabel = (item) => {
      // Tạo đối tượng Date từ các thành phần năm, tháng, ngày
      const dateStr = `${item._id.year}-${item._id.month}-${item._id.day|| 1}`;
      return formatDate(dateStr);
    };

    switch(groupBy) {
      case 'daily':
        return data.map(item => createLabel(item));
      
      case 'weekly':
        return data.map(item => `Tuần ${item._id.week}/${item._id.year}`);
      
      case 'monthly':
        return data.map(item => `${item._id.month < 10 ? '0' : ''}${item._id.month}/${item._id.year}`);
      
      case 'yearly':
        return data.map(item => `${item._id.year}`);
      
      default:
        return data.map(item => createLabel(item));
    }
  };

  // Hàm tạo key để so sánh
  const createSortKey = (item, groupBy) => {
    // Tạo đối tượng Date từ các thành phần năm, tháng, ngày
    const dateStr = `${item._id.year}-${item._id.month}-${item._id.day || 1}`;
    const date = new Date(dateStr);

    switch(groupBy) {
      case 'yearly':
        return date.getFullYear().toString().padStart(4, '0');
      
      case 'monthly':
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      case 'weekly':
        // Tạo key cho tuần với năm và số tuần
        return `${date.getFullYear().toString().padStart(4, '0')}-W${item._id.week.toString().padStart(2, '0')}`;
      
      case 'daily':
      default:
        // Tạo key chi tiết cho ngày
        return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  };

  // Tạo nhãn theo nhóm thời gian
  const createLabels = (sortedData, groupBy) => {
    return sortedData.map(item => {
      // Log chi tiết để kiểm tra
      console.log('Item _id:', item._id);
      
      // Tạo đối tượng Date với điều chỉnh múi giờ
      const dateStr = `${item._id.year}-${item._id.month}-${item._id.day || 1}`;
      const date = new Date(Date.UTC(
        item._id.year, 
        (item._id.month || 1) - 1,  // Điều chỉnh tháng (0-indexed)
        item._id.day || 1
      ));
      
      // Log thông tin Date
      console.log('Date object:', date);
      console.log('Date UTC:', date.toUTCString());
      console.log('Date local:', date.toLocaleString());

      switch(groupBy) {
        case 'yearly':
          return `${date.getUTCFullYear()}`;
        case 'monthly':
          return `${(date.getUTCMonth() + 1) < 10 ? '0' : ''}${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
        case 'weekly':
          // Sử dụng UTC để tránh chênh lệch
          return `Tuần ${Math.ceil(date.getUTCDate() / 7)}/${date.getUTCFullYear()}`;
        default: // daily
          return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
      }
    });
  };

  // Hàm load dữ liệu dashboard
  const loadDashboardData = async () => {
    // Kiểm tra tính hợp lệ của ngày
    if (!isValidDateRange) {
      toast.error('Vui lòng chọn khoảng thời gian hợp lệ');
      return;
    }

    try {
      setLoading(true);
      console.log('Tham số lọc:', {
        startDate: revenueFilters.startDate,
        endDate: revenueFilters.endDate,
        groupBy: revenueFilters.groupBy
      });

      const response = await DashboardAPI.getRevenueStatistics({
        startDate: revenueFilters.startDate,
        endDate: revenueFilters.endDate,
        groupBy: revenueFilters.groupBy
      });

      console.log('Phản hồi từ API:', response);
      
      // Kiểm tra và log chi tiết dữ liệu
      if (response.data) {
        console.log('Số lượng dữ liệu:', response.data.length);
        response.data.forEach((item, index) => {
          console.log(`Chi tiết doanh thu [${index}]:`, item);
        });
      }

      // Cập nhật state với dữ liệu mới
      setDashboardData(prevData => {
        const newData = {
          ...prevData,
          revenue: {
            data: response.data || [],
            summary: response.summary || { totalRevenue: 0, totalOrders: 0 }
          }
        };
        
        console.log('Dữ liệu dashboard mới:', newData);
        return newData;
      });

      // Hiển thị thông báo nếu không có dữ liệu
      if (!response.data || response.data.length === 0) {
        toast.info('Không có dữ liệu thống kê cho khoảng thời gian này');
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu thống kê:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Hàm render khi đang tải
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  // Render khi có lỗi
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700">
        <h2>Đã xảy ra lỗi khi tải dữ liệu</h2>
        <p>{error.message}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  // Kiểm tra dữ liệu overview
  const overviewData = dashboardData.overview || {};
  console.log('overviewData', overviewData)

  // Chuẩn bị dữ liệu cho biểu đồ doanh thu
  const prepareRevenueChartData = () => {
    // Log toàn bộ dữ liệu dashboard
    console.log('Toàn bộ dashboardData:', dashboardData);
    console.log('Dữ liệu doanh thu:', dashboardData.revenue);

    // Kiểm tra và xử lý trường hợp không có dữ liệu
    if (!dashboardData?.revenue?.data || dashboardData.revenue.data.length === 0) {
      console.warn('Không có dữ liệu doanh thu để hiển thị');
      return {
        labels: [],
        datasets: [{
          label: 'Doanh Thu (VND)',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      };
    }

    // Log chi tiết từng mục dữ liệu
    dashboardData.revenue.data.forEach((item, index) => {
      console.log(`Chi tiết doanh thu [${index}]:`, item);
    });

    // Nhóm dữ liệu theo nhóm thời gian
    const groupData = (data, groupBy) => {
      return data.reduce((acc, item) => {
        let key;
        switch(groupBy) {
          case 'yearly':
            key = item._id.year;
            break;
          case 'monthly':
            key = `${item._id.year}-${item._id.month}`;
            break;
          case 'weekly':
            key = `${item._id.year}-W${item._id.week}`;
            break;
          default: // daily
            key = `${item._id.year}-${item._id.month}-${item._id.day}`;
        }

        // Tìm hoặc tạo mục trong accumulator
        const existingItem = acc.find(x => x.key === key);
        if (existingItem) {
          existingItem.totalRevenue += item.totalRevenue;
        } else {
          acc.push({
            key: key,
            _id: item._id,
            totalRevenue: item.totalRevenue,
            sortKey: createSortKey(item, groupBy)
          });
        }

        return acc;
      }, []);
    };

    // Sắp xếp dữ liệu
    const sortData = (data) => {
      return data.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    };

    // Nhóm và sắp xếp dữ liệu
    const groupedData = groupData(dashboardData.revenue.data, revenueFilters.groupBy);
    const sortedData = sortData(groupedData);

    // Tạo nhãn và dữ liệu
    const labels = createLabels(sortedData, revenueFilters.groupBy);
    const data = sortedData.map(item => item.totalRevenue);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Doanh Thu (VND)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  // Chuẩn bị dữ liệu cho biểu đồ sản phẩm bán chạy
  const topProductsChartData = {
    labels: (dashboardData.overview.topSellingProducts || []).map(
      product => renderSafely(product.productDetails?.[0]?.name, 'Sản phẩm')
    ),
    datasets: [
      {
        label: 'Số lượng bán',
        data: (dashboardData.overview.topSellingProducts || []).map(
          product => renderSafely(product.totalQuantity, 0)
        ),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  };

  // Chuẩn bị dữ liệu cho biểu đồ trạng thái đơn hàng
  const orderStatusData = {
    labels: orderStats.map(item => item._id || 'Không xác định'),
    datasets: [{
      label: 'Số lượng đơn hàng',
      data: orderStats.map(item => item.count || 0),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)'
      ]
    }]
  };

  // Chuẩn bị dữ liệu cho biểu đồ tổng giá trị đơn hàng với biểu đồ cột chồng
  const prepareOrderAmountStackedBarData = () => {
    // Nhóm dữ liệu theo trạng thái vận chuyển và thanh toán
    const groupedData = orderStats.reduce((acc, item) => {
      const status = item._id || 'Không xác định';
      
      if (!acc[status]) {
        acc[status] = {
          'Đã thanh toán': 0,
          'Chưa thanh toán': 0
        };
      }

      // Tổng hợp giá trị theo trạng thái thanh toán
      acc[status]['Đã thanh toán'] += item.paidAmount || 0;
      acc[status]['Chưa thanh toán'] += item.unpaidAmount || 0;

      return acc;
    }, {});

    return {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label: 'Đã Thanh Toán',
          data: Object.values(groupedData).map(item => item['Đã thanh toán']),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Chưa Thanh Toán',
          data: Object.values(groupedData).map(item => item['Chưa thanh toán']),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Render dashboard
  return (
    <div className="dashboard-container p-6 bg-gray-50 h-screen flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-grow flex flex-col overflow-hidden">
        {/* Phần tổng quan nhỏ gọn - CỐ ĐỊNH */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          <div className="bg-blue-100 p-2 rounded flex flex-col items-center">
            <h3 className="text-sm font-bold mb-1">Tổng Doanh Thu</h3>
            <p className="text-lg font-semibold">
              {renderSafely(dashboardData.overview.totalRevenue, 0).toLocaleString()} VNĐ
            </p>
          </div>
          <div className="bg-green-100 p-2 rounded flex flex-col items-center">
            <h3 className="text-sm font-bold mb-1">Tổng Đơn Hàng</h3>
            <p className="text-lg font-semibold">
              {renderSafely(dashboardData.overview.totalOrders, 0)}
            </p>
          </div>
          <div className="bg-purple-100 p-2 rounded flex flex-col items-center">
            <h3 className="text-sm font-bold mb-1">Khách Hàng Mới</h3>
            <p className="text-lg font-semibold">
              {renderSafely(dashboardData.overview.newCustomers, 0)}
            </p>
          </div>
        </div>

        {/* Khung cuộn chính cho nội dung dashboard */}
        <div className="dashboard-content flex-grow overflow-y-auto">
          <div className="p-6 pb-[220px]">
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Thống kê doanh thu - CỐ ĐỊNH */}
              <div className="bg-white shadow rounded p-4 h-[500px] flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Thống Kê Doanh Thu</h3>
                
                {/* Filter thời gian */}
                <div className="flex space-x-4 mb-4 items-end">
                  <div className="flex-1">
                    <label className="block mb-2 text-sm">Từ Ngày</label>
                    <input 
                      type="date" 
                      value={revenueFilters.startDate || ''}
                      onChange={(e) => setRevenueFilters(prev => ({
                        ...prev, 
                        startDate: e.target.value
                      }))}
                      className="border p-2 rounded w-full text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 text-sm">Đến Ngày</label>
                    <input 
                      type="date" 
                      value={revenueFilters.endDate || ''}
                      onChange={(e) => setRevenueFilters(prev => ({
                        ...prev, 
                        endDate: e.target.value
                      }))}
                      className="border p-2 rounded w-full text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 text-sm">Nhóm Theo</label>
                    <select 
                      value={revenueFilters.groupBy}
                      onChange={(e) => setRevenueFilters(prev => ({
                        ...prev, 
                        groupBy: e.target.value
                      }))}
                      className="border p-2 rounded w-full text-sm"
                    >
                      <option value="daily">Ngày</option>
                      <option value="weekly">Tuần</option>
                      <option value="monthly">Tháng</option>
                      <option value="yearly">Năm</option>
                    </select>
                  </div>
                  <div>
                    <button 
                      onClick={loadDashboardData}
                      disabled={!isValidDateRange}
                      className={`
                        px-4 py-2 rounded 
                        ${isValidDateRange 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      Tải Thống Kê
                    </button>
                  </div>
                </div>

                {/* Hiển thị lỗi nếu ngày không hợp lệ */}
                {!isValidDateRange && revenueFilters.startDate && revenueFilters.endDate && (
                  <div className="text-red-500 text-sm mb-4">
                    Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc
                  </div>
                )}

                {/* Tổng quan doanh thu */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-100 p-2 rounded">
                    <h4 className="text-xs font-semibold">Tổng Doanh Thu</h4>
                    <p className="text-base">
                      {renderSafely(dashboardData.revenue.summary?.totalRevenue, 0).toLocaleString()} VNĐ
                      {console.log('dashboardData.revenue', dashboardData.revenue)}
                      {console.log('dashboardData.revenue.data', dashboardData.revenue.data)}
                      {console.log('dashboardData.revenue.summary', dashboardData.revenue.summary)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <h4 className="text-xs font-semibold">Tổng Số Đơn Hàng</h4>
                    <p className="text-base">
                      {renderSafely(dashboardData.revenue.summary?.totalOrders, 0)}
                    </p>
                  </div>
                </div>

                {/* Biểu đồ doanh thu */}
                <div className="flex-grow">
                  {dashboardData?.revenue?.data?.length > 0 ? (
                    <Line 
                      data={prepareRevenueChartData()} 
                      options={{ 
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value.toLocaleString() + ' VND';
                              }
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: revenueFilters.groupBy === 'yearly' 
                                ? 'Năm' 
                                : revenueFilters.groupBy === 'monthly' 
                                ? 'Tháng' 
                                : revenueFilters.groupBy === 'weekly' 
                                ? 'Tuần' 
                                : 'Ngày'
                            }
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Không có dữ liệu thống kê. Vui lòng chọn khoảng thời gian và tải lại.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thêm lại biểu đồ trạng thái đơn hàng */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white shadow rounded p-4 h-[500px] flex flex-col">
                  <h3 className="text-lg font-semibold mb-4">Trạng Thái Đơn Hàng</h3>
                  <div className="flex-grow">
                    <Bar 
                      data={orderStatusData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Số lượng đơn hàng' }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Số Lượng Đơn Hàng'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

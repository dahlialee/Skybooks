import React, { useState, useEffect, useContext, Fragment } from 'react';
import { UserContext } from '../../context/UserContext';
import { getOrdersByCustomer, updateInvoice } from '../../services/invoiceAPI';
import axios from 'axios';
import { 
  FaShoppingCart, 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaBan,
  FaEdit
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Dialog, Transition} from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils';

// Mapping trạng thái đơn hàng
const ORDER_STATUS_MAP = {
  'Chưa xử lý': { 
    text: 'Chưa xử lý', 
    color: 'text-yellow-600 bg-yellow-100', 
    icon: FaShoppingCart 
  },
  'Đang xử lý': { 
    text: 'Đang xử lý', 
    color: 'text-blue-600 bg-blue-100', 
    icon: FaBox 
  },
  'Đang giao': { 
    text: 'Đang giao', 
    color: 'text-orange-600 bg-orange-100', 
    icon: FaTruck 
  },
  'Đã giao': { 
    text: 'Đã giao', 
    color: 'text-green-600 bg-green-100', 
    icon: FaCheckCircle 
  },
  'Đã hủy': { 
    text: 'Đã hủy', 
    color: 'text-red-600 bg-red-100', 
    icon: FaTimesCircle 
  }
};

// Horizontal Order Status Timeline
const OrderStatusTimeline = ({ status }) => {
  const statuses = [
    { key: 'Chưa xử lý', icon: FaShoppingCart },
    { key: 'Đang xử lý', icon: FaBox },
    { key: 'Đang giao', icon: FaTruck },
    { key: 'Đã giao', icon: FaCheckCircle },
    { key: 'Đã hủy', icon: FaTimesCircle }
  ];

  const currentIndex = statuses.findIndex(s => s.key === status);

  return (
    <div className="w-full py-4 px-4 bg-gray-50 relative">
      <div className="flex items-center justify-between relative">
        {/* Đường kẻ ngang mỏng xuyên qua giữa các hình tròn */}
        <div 
          className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5"
          style={{
            background: `linear-gradient(to right, 
              ${currentIndex > 0 ? 'green' : 'gray'} 0%, 
              ${currentIndex > 1 ? 'green' : 'gray'} 25%, 
              ${currentIndex > 2 ? 'green' : 'gray'} 50%, 
              ${currentIndex > 3 ? 'green' : 'gray'} 75%, 
              ${status === 'Đã hủy' ? 'red' : 'gray'} 100%
            )`
          }}
        />

        {statuses.map((s, index) => {
          const StatusIcon = s.icon;
          const isActive = index <= currentIndex;
          const isCancelled = status === 'Đã hủy' && s.key === 'Đã hủy';

          return (
            <div 
              key={s.key} 
              className="flex flex-col items-center z-10 relative"
            >
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center 
                  ${isCancelled ? 'bg-red-500 text-white' : 
                    isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}
                  shadow-md border-2 border-white
                `}
              >
                <StatusIcon className="w-4 h-4" />
              </div>
              <span 
                className={`
                  text-xs text-center mt-1
                  ${isCancelled ? 'text-red-600' : 
                    isActive ? 'text-green-600 font-bold' : 'text-gray-500'}
                `}
              >
                {s.key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UserOrderPage = () => {
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsOrderDetailsOpen(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getOrdersByCustomer(user._id);
        
        if (!response || !response.data) {
          throw new Error('Không nhận được dữ liệu đơn hàng');
        }

        // Log để kiểm tra dữ liệu đơn hàng
        console.log('Fetched orders:', response.data);

        setOrders(response.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Chi tiết lỗi khi tải đơn hàng:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Server response error:', error.response.data);
            setError(`Lỗi server: ${error.response.data.message || 'Không thể tải đơn hàng'}`);
          } else if (error.request) {
            setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
          } else {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
          }
        } else {
          setError(error.message || 'Không thể tải đơn hàng. Vui lòng thử lại.');
        }
        
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    try {
      // Cập nhật trạng thái đơn hàng thành "Đã hủy"
      await updateInvoice(orderId, { shipping_status: 'Đã hủy' });
      
      // Cập nhật state để hiển thị ngay lập tức
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, shipping_status: 'Đã hủy' } 
            : order
        )
      );

      // Thông báo thành công
      toast.success('Đã hủy đơn hàng thành công');
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleEditOrder = (order) => {
    navigate(`/orders/${order._id}`, { 
      state: { 
        order: order,
        fromOrderPage: true,
        startEditing: true
      } 
    });
  };

  const handleViewOrderDetails = (order) => {
    navigate(`/orders/${order._id}`, { 
      state: { 
        order: order,
        fromOrderPage: true 
      } 
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Vui lòng đăng nhập để xem đơn hàng</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Đơn hàng của tôi</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order, orderIndex) => {
              // Lấy thông tin trạng thái
              const statusInfo = ORDER_STATUS_MAP[order.shipping_status] || 
                { text: 'Không xác định', color: 'text-gray-600 bg-gray-100', icon: FaShoppingCart };
              const StatusIcon = statusInfo.icon;

              return (
                <div 
                  key={order._id} 
                  className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden"
                >
                  {/* Header đơn hàng */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          Mã đơn hàng: <span className="font-semibold text-gray-800">{order._id}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Timeline trạng thái */}
                      <div className="w-1/2 relative ml-auto">
                        <div 
                          className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5"
                          style={{
                            background: `linear-gradient(to right, 
                              ${order.shipping_status !== 'Chưa xử lý' ? 'green' : 'gray'} 0%, 
                              ${['Đang xử lý', 'Đang giao', 'Đã giao'].includes(order.shipping_status) ? 'green' : 'gray'} 33%, 
                              ${['Đang giao', 'Đã giao'].includes(order.shipping_status) ? 'green' : 'gray'} 66%, 
                              ${order.shipping_status === 'Đã giao' ? 'green' : 'gray'} 100%
                            )`
                          }}
                        ></div>
                        <div className="flex justify-between items-center relative">
                          {[
                            { key: 'Chưa xử lý', icon: FaShoppingCart },
                            { key: 'Đang xử lý', icon: FaBox },
                            { key: 'Đang giao', icon: FaTruck },
                            { key: 'Đã giao', icon: FaCheckCircle }
                          ].map((status, index) => {
                            const isActive = 
                              ['Chưa xử lý', 'Đang xử lý', 'Đang giao', 'Đã giao']
                                .slice(0, ['Chưa xử lý', 'Đang xử lý', 'Đang giao', 'Đã giao'].indexOf(order.shipping_status) + 1)
                                .includes(status.key);

                            return (
                              <div 
                                key={status.key} 
                                className="flex flex-col items-center"
                              >
                                <div 
                                  className={`
                                    w-6 h-6 rounded-full flex items-center justify-center
                                    ${isActive ? 'bg-green-500' : 'bg-gray-300'}
                                  `}
                                >
                                  {React.createElement(status.icon, { 
                                    className: `w-3 h-3 ${isActive ? 'text-white' : 'text-gray-500'}`
                                  })}
                                </div>
                                <span 
                                  className={`
                                    text-[8px] text-center mt-0.5
                                    ${isActive ? 'text-green-600' : 'text-gray-500'}
                                  `}
                                >
                                  {status.key}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Icon hủy đơn riêng biệt */}
                      <div className="w-24 flex justify-between items-center mt-2 ml-auto">
                        <div className="w-[calc(100%-48px)] opacity-0 h-6"></div>
                        <div className="flex flex-col items-center">
                          <div 
                            className={`
                              w-6 h-6 rounded-full flex items-center justify-center
                              ${order.shipping_status === 'Đã hủy' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-300'}
                            `}
                          >
                            {React.createElement(FaTimesCircle, { 
                              className: `w-3 h-3 ${order.shipping_status === 'Đã hủy' 
                                ? 'text-white' 
                                : 'text-gray-500'}`
                            })}
                          </div>
                          <span 
                            className={`
                              text-[8px] text-center mt-0.5
                              ${order.shipping_status === 'Đã hủy' 
                                ? 'text-yellow-600' 
                                : 'text-gray-500'}
                            `}
                          >
                            Đã hủy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nội dung đơn hàng */}
                  <div className="grid md:grid-cols-3 gap-4 p-6">
                    {/* Danh sách sản phẩm */}
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Chi tiết sản phẩm</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {order.details.map((item, itemIndex) => (
                          <div 
                            key={item.product_id} 
                            className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg"
                          >
                            {/* Ảnh sản phẩm */}
                            {item.product_id?.cover_image && (
                              <img 
                                src={`/image/${item.product_id.cover_image || 'default.jpg'}`}
                                alt={item.title} 
                                className="w-20 h-20 object-cover rounded-lg shadow-md"
                              />
                            )}
                            
                            {/* Thông tin sản phẩm */}
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                {item.title}
                              </h4>
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                  SL: {item.quantity}
                                </p>
                                <p className="text-sm text-pink-600 font-medium">
                                  {formatCurrency(item.unit_price)}
                                </p>
                              </div>
                              <div className="text-right mt-2">
                                <span className="text-sm font-bold text-green-600">
                                  {formatCurrency(item.quantity * item.unit_price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Thông tin thanh toán */}
                    <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4">Thông tin thanh toán</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phương thức:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {order.payment_method}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tổng tiền:</span>
                          <span className="text-base font-bold text-green-600">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        
                        {/* Nút hủy và sửa đơn */}
                        {order.shipping_status === 'Chưa xử lý' && 
                          (order.payment_status === 'Chưa thanh toán' || !order.payment_status) && (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleCancelOrder(order._id)}
                                className="w-1/2 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center justify-center"
                              >
                                <FaBan className="mr-2" />
                                <span>Hủy đơn hàng</span>
                              </button>
                              <button 
                                onClick={() => handleEditOrder(order)}
                                className="w-1/2 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                              >
                                <FaEdit className="mr-2" />
                                <span>Sửa đơn hàng</span>
                              </button>
                            </div>
                          )}

                        <button 
                          className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <FaEye className="mr-2" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default UserOrderPage; 
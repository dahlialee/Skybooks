import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { updateInvoice, fetchInvoiceById } from '../../services/invoiceAPI';
import { toast } from 'react-toastify';
import { 
  FaShoppingCart, 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEdit,
  FaSave
} from 'react-icons/fa';
import { formatCurrency } from '../../utils';

// Mapping trạng thái đơn hàng (giống như trong UserOrderPage)
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

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Lấy ID từ URL
  const { user } = useContext(UserContext);

  // State cho thông tin đơn hàng
  const [order, setOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });

  // Kiểm tra điều kiện chỉnh sửa
  const checkCanEdit = (orderData) => {
    return orderData.shipping_status === 'Chưa xử lý' && 
      (orderData.payment_status === 'Chưa thanh toán' || !orderData.payment_status);
  };

  // Tải chi tiết đơn hàng
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Nếu có order từ state (từ trang đơn hàng)
        let orderData;
        if (location.state?.order) {
          const response = await fetchInvoiceById(location.state.order._id);
          orderData = response.data;
        } 
        // Nếu không có state, sử dụng ID từ URL
        else if (id) {
          const response = await fetchInvoiceById(id);
          orderData = response.data;
        } 
        else {
          // Nếu không có order từ state hoặc URL, quay lại trang đơn hàng
          navigate('/user/orders');
          return;
        }

        setOrder(orderData);
        
        // Điền thông tin giao hàng
        setShippingInfo({
          fullName: orderData.shipping_info?.fullName || '',
          phone: orderData.shipping_info?.phone || '',
          email: orderData.shipping_info?.email || '',
          address: orderData.shipping_info?.address || '',
          note: orderData.shipping_info?.note || ''
        });

        // Tự động bật chế độ chỉnh sửa nếu có flag
        const canEdit = checkCanEdit(orderData);
        if (location.state?.startEditing && canEdit) {
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Lỗi tải chi tiết đơn hàng:', error);
        toast.error('Không thể tải chi tiết đơn hàng');
        navigate('/user/orders');
      }
    };

    fetchOrderDetails();
  }, [location.state, navigate, id, user]);

  // Xử lý thay đổi thông tin giao hàng
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Lưu thông tin giao hàng
  const handleSaveShippingInfo = async () => {
    try {
      // Validate thông tin
      if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Cập nhật đơn hàng
      await updateInvoice(order._id, {
        shipping_info: {
          name: shippingInfo.fullName,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          address: shippingInfo.address,
          note: shippingInfo.note
        }
      });

      toast.success('Cập nhật thông tin giao hàng thành công');
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      toast.error('Không thể cập nhật thông tin giao hàng');
    }
  };

  // Không có đơn hàng
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Đang tải...</p>
      </div>
    );
  }

  // Không cho phép sửa khi đơn hàng đã xử lý
  const canEdit = checkCanEdit(order);

  // Hàm chuyển sang chế độ chỉnh sửa
  const handleEditOrder = () => {
    // Nếu đơn hàng có thể chỉnh sửa
    if (canEdit) {
      setIsEditing(true);
    } else {
      toast.warning('Đơn hàng không thể chỉnh sửa');
    }
  };

  // Hàm hủy chỉnh sửa
  const handleCancelEdit = () => {
    // Khôi phục thông tin ban đầu
    setShippingInfo({
      fullName: order.shipping_info?.name || '',
      phone: order.shipping_info?.phone || '',
      email: order.shipping_info?.email || '',
      address: order.shipping_info?.address || '',
      note: order.shipping_info?.note || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Tiêu đề và nút chỉnh sửa */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Chi Tiết Đơn Hàng</h1>
          {canEdit && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveShippingInfo}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                  >
                    <FaSave className="mr-2" />
                    Lưu
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                  >
                    <FaTimesCircle className="mr-2" />
                    Hủy
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditOrder}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Chỉnh Sửa
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thông tin đơn hàng */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Thông tin vận chuyển */}
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Thông Tin Giao Hàng</h2>
            
            {isEditing ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập địa chỉ giao hàng"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleInputChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ghi chú về đơn hàng (nếu có)"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleSaveShippingInfo}
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <FaSave className="mr-2" />
                    Lưu Thông Tin
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-semibold">{shippingInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold">{shippingInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{shippingInfo.email || 'Chưa cung cấp'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-semibold">{shippingInfo.address}</p>
                </div>
                {shippingInfo.note && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Ghi chú</p>
                    <p className="font-semibold">{shippingInfo.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm */}
          <div className="p-6 bg-gray-50 border-t">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sản Phẩm Đặt Hàng</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {order.details.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm"
                >
                  {item.product_id?.cover_image && (
                    <img 
                      src={`/image/${item.product_id.cover_image}`} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-green-600 font-medium">
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="p-6 bg-white border-t">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Thông Tin Thanh Toán</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-semibold">{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                <p className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                <p className="font-semibold">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                <p className={`font-semibold ${ORDER_STATUS_MAP[order.shipping_status]?.color}`}>
                  {order.shipping_status}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 
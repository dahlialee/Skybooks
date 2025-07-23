import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { UserContext } from "../../context/UserContext";
import { addInvoice } from "../../services/invoiceAPI";
import { clearCart as clearCartAPI, removeSelectedItems, deleteCartItem } from "../../services/cartAPI";
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt } from "react-icons/fa";
import axios from "axios";
import { createVNPayPayment } from "../../services/vnpayAPI";
import moment from "moment";
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils';


const PaymentMethod = ({ method, icon, name, selected, onSelect }) => (
  <div 
    className={`
      flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-300
      ${selected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-400'}
    `}
    onClick={() => onSelect(method)}
  >
    <div className="flex items-center space-x-4">
      <div className="text-2xl text-blue-600">{icon}</div>
      <span className="font-medium text-gray-800">{name}</span>
    </div>
    {selected && <div className="text-blue-500">✓</div>}
  </div>
);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    calculateSelectedItems, 
    calculateTotalPrice, 
    totalPrice,
    setTotalPrice,
    clearCart: clearCartContext,
    selectedItems: contextSelectedItems,
    cartItems,
    removeFromCart
  } = useContext(CartContext);

  const { user, isAuthenticated } = useContext(UserContext);
  console.log('Checkout - isAuthenticated:', isAuthenticated);
  console.log('Checkout - user:', JSON.stringify(user, null, 2));

  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    note: ""
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hằng số chi phí ship
  const SHIPPING_FEE = 30000;

  // Thêm state để lưu chi phí ship
  const [shippingFee, setShippingFee] = useState(SHIPPING_FEE);

  // Điều chỉnh hàm tính tổng tiền
  const calculateTotalWithShipping = () => {
    // Tính tổng tiền sản phẩm
    const productTotal = selectedItems.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );

    // Tính thuế VAT 10%
    const tax = productTotal * 0.1;

    // Tổng tiền = tổng sản phẩm + thuế + phí ship
    const totalAmount = productTotal + tax + shippingFee;

    return {
      productTotal,
      tax,
      shippingFee,
      totalAmount
    };
  };

  // Effect to pre-fill user info if authenticated
  useEffect(() => {
    // Ưu tiên dữ liệu từ trạng thái chuyển hướng (mua ngay hoặc từ giỏ hàng)
    if (location.state?.selectedItems) {
      const selectedItemsFromState = location.state.selectedItems.map(item => ({
        ...item,
        id: item.id || item.product_id?._id || item._id,
        name: item.name || item.title,
        price: item.price,
        quantity: item.quantity || 1, // Đảm bảo có số lượng
        image: item.image || `/image/${item.product_id?.cover_image || 'default.jpg'}`,
        product_id: item.product_id || {}
      }));

      setSelectedItems(selectedItemsFromState);
      
      // Tính tổng giá từ các mục được chọn
      const total = selectedItemsFromState.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      setTotalPrice(total);
    } 
    // Nếu không phải mua ngay, sử dụng các mục đã chọn từ context
    else if (contextSelectedItems && contextSelectedItems.length > 0) {
      setSelectedItems(contextSelectedItems);
      setTotalPrice(calculateTotalPrice());
    } 
    // Nếu không có gì, chuyển về trang giỏ hàng
    else {
      toast.warning('Vui lòng chọn sản phẩm để thanh toán');
      navigate('/cart');
    }

    // Pre-fill shipping info if user is logged in
    if (isAuthenticated && user) {
      setShippingInfo(prevInfo => ({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        note: prevInfo.note // Giữ nguyên ghi chú của người dùng
      }));
    }
  }, [location.state, contextSelectedItems, isAuthenticated, user, calculateTotalPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVNPayPayment = async () => {
    try {
      // Kiểm tra số tiền
      if (!totalPrice || totalPrice <= 0) {
        alert('Số tiền thanh toán không hợp lệ');
        return;
      }

      // Tạo đơn hàng với trạng thái ban đầu
      const invoiceData = {
        customerInfo: {
          name: shippingInfo.fullName,
          email: shippingInfo.email || 'guest@skybooks.com',
          phone: shippingInfo.phone,
          address: shippingInfo.address
        },
        customer_id: user?.id || null, 
        payment_method: 'VNPAY',
        total_amount: calculateTotalWithShipping().totalAmount,
        payment_status: 'Chưa thanh toán',
        shipping_status: 'Chưa xử lý',
        shipping_info: shippingInfo,
        details: selectedItems.map(item => ({
          product_id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        is_guest_order: !user
      };

      // Tạo đơn hàng và lấy ID
      const response = await addInvoice(invoiceData);
      const temporaryInvoiceId = response.data.data._id;

      // Lưu invoiceId vào localStorage
      localStorage.setItem('lastInvoiceId', temporaryInvoiceId);

      // Tạo thanh toán VNPay
      const paymentResponse = await createVNPayPayment(
        calculateTotalWithShipping().totalAmount, 
        `Thanh toán đơn hàng #${temporaryInvoiceId}`,
        temporaryInvoiceId
      );

      // Chuyển hướng trực tiếp tại trang hiện tại
      if (paymentResponse.paymentUrl) {
        setIsSubmitting(true);
        window.location.href = paymentResponse.paymentUrl;
      } else {
        alert('Không nhận được đường dẫn thanh toán');
      }

    } catch (error) {
      console.error('Chi tiết lỗi thanh toán VNPay:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        alert(`Lỗi: ${error.response.data.message || 'Không thể tạo đường dẫn thanh toán'}`);
      } else if (error.request) {
        alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      } else {
        alert('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const requiredFields = ['fullName', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
      alert(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
      return;
    }

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Nếu chọn VNPay thì gọi hàm riêng
    if (paymentMethod === 'vnpay') {
      await handleVNPayPayment();
      return;
    }

    setIsSubmitting(true);

    try {
      // Tạo đơn hàng với trạng thái ban đầu là TẠM THỜI
      const invoiceData = {
        customerInfo: {
          name: shippingInfo.fullName,
          email: shippingInfo.email || 'guest@skybooks.com',
          phone: shippingInfo.phone,
          address: shippingInfo.address
        },
        customer_id: user?.id || null, 
        payment_method: paymentMethod.toUpperCase(),
        total_amount: calculateTotalWithShipping().totalAmount,
        payment_status: 'Chưa thanh toán',
        shipping_status: 'Chưa xử lý',
        shipping_info: shippingInfo,
        details: selectedItems.map(item => ({
          product_id: item.id,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        is_guest_order: !user // Đánh dấu đơn hàng khách
      };

      console.log('Dữ liệu đơn hàng:', invoiceData);

      // Tạo đơn hàng và lấy ID
      const response = await addInvoice(invoiceData);
      const temporaryInvoiceId = response.data.data._id;
      console.log('temporaryInvoiceId', temporaryInvoiceId)

      // Xóa giỏ hàng
      try {
        // Kiểm tra xem đơn hàng có phải từ giỏ hàng không
        if (location.state?.fromCart) {
          // Lấy ID các sản phẩm đã chọn
          const selectedItemIds = selectedItems.map(item => item.id);
          
          // Xóa từng sản phẩm đã chọn
          for (const itemId of selectedItemIds) {
            await deleteCartItem(itemId);
          }
          
          // Cập nhật context
          selectedItemIds.forEach(itemId => {
            removeFromCart(itemId);
          });
        }
        // Không làm gì nếu không phải từ giỏ hàng
      } catch (clearError) {
        console.warn('Không thể xóa sản phẩm khỏi giỏ hàng:', clearError);
      }

      // Chuyển hướng hoặc hiển thị thông báo thành công
      navigate('/thank-you', { 
        state: { 
          orderId: temporaryInvoiceId,
          totalAmount: calculateTotalWithShipping().totalAmount 
        } 
      });

    } catch (error) {
      setIsSubmitting(false);
      
      // Xử lý lỗi chi tiết
      if (error.response && error.response.data) {
        // Lỗi từ backend (ví dụ: không đủ số lượng sản phẩm)
        alert(error.response.data.message || 'Đã có lỗi xảy ra khi tạo đơn hàng');
      } else {
        // Lỗi khác
        alert('Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
      
      console.error('Lỗi khi tạo đơn hàng:', error);
    }
  };

  const paymentMethods = [
    { 
      method: 'cod', 
      icon: <FaMoneyBillWave />, 
      name: 'Thanh toán khi nhận hàng (COD)' 
    },
    { 
      method: 'momo', 
      icon: <FaMobileAlt />, 
      name: 'Thanh toán MoMo' 
    },
    { 
      method: 'vnpay', 
      icon: <FaCreditCard />, 
      name: 'Thanh toán VNPay' 
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>
      
      {/* Danh sách sản phẩm */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cột trái: Danh sách sản phẩm và thành tiền */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sản Phẩm Đã Chọn</h2>
            {selectedItems.map((item, index) => (
              <div key={index} className="flex items-center mb-4 border-b pb-4 last:border-b-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover mr-4 rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Số lượng: {item.quantity}</p>
                </div>
                <p className="text-green-600 font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}

            {/* Chi tiết thanh toán */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Tổng sản phẩm:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateTotalWithShipping().productTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Thuế VAT (10%):</span>
                <span className="font-semibold">
                  {formatCurrency(calculateTotalWithShipping().tax)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Phí vận chuyển:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateTotalWithShipping().shippingFee)}
                </span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t font-bold text-xl">
                <span className="text-gray-900">Tổng cộng:</span>
                <span className="text-green-600">
                  {formatCurrency(calculateTotalWithShipping().totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Thông tin giao hàng và thanh toán */}
        <div>
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            {/* Thông tin đặt hàng */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nhập địa chỉ giao hàng"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleChange}
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ghi chú về đơn hàng (nếu có)"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Phương Thức Thanh Toán</h2>
              <div className="grid grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <PaymentMethod
                    key={method.method}
                    {...method}
                    selected={paymentMethod === method.method}
                    onSelect={setPaymentMethod}
                  />
                ))}
              </div>
            </div>

            {/* Nút đặt hàng */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                w-full text-white font-semibold py-3 rounded transition duration-300 
                flex items-center justify-center space-x-2
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
                }
              `}
            >
              <span>
                {isSubmitting 
                  ? 'Đang xử lý...' 
                  : `Xác nhận đặt hàng (${formatCurrency(calculateTotalWithShipping().totalAmount)})`
                }
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


import React, { useEffect, useState, useContext, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchCart,
  updateCartItem,
  deleteCartItem,
  clearCart as clearCartAPI
} from "../../services/cartAPI";
import { UserContext } from "../../context/UserContext";
import { CartContext } from "../../context/CartContext";
import { FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils';

function CartPage() {
  const navigate = useNavigate();
  const { user, isLoading: isUserLoading, logoutUser } = useContext(UserContext);
  const { 
    cartItems, 
    setCartItems, 
    selectedItems, 
    setSelectedItems, 
    calculateTotalPrice,
    totalPrice,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleSelectItem
  } = useContext(CartContext);
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Ref to track mount status and prevent memory leaks
  const isMountedRef = useRef(true);

  // Memoized debug logging to prevent unnecessary re-renders
  const debugLog = useCallback((message, ...args) => {
    console.log(`[CartPage Debug] ${message}`, ...args);
  }, []);

  // Memoized cart loading function
  const loadCart = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (!isMountedRef.current) return;
    
    // Extensive debugging logs
    debugLog('loadCart started', {
      user: user?.id,
      isUserLoading
    });

    // Reset loading states
    setIsLoading(true);
    setLoadError(null);

    try {
      // Thêm log chi tiết để debug
      console.log('Cart Load Debug:', {
        user: user ? 'Có user' : 'Không có user',
        isUserLoading,
        userDetails: user ? JSON.stringify(user) : 'null'
      });

      // Nếu không có user, thử tải giỏ hàng guest
      if (!user || isUserLoading) {
        debugLog('Attempting to load guest cart');
        
        // Thử lấy giỏ hàng từ localStorage
        const localCartItems = JSON.parse(localStorage.getItem("localCartItems") || '[]');
        
        console.log('Local Cart Items:', localCartItems);
        
        if (localCartItems.length > 0) {
          debugLog('Found local cart items', localCartItems);
          
          // Chuyển đổi local items sang định dạng chuẩn
          const processedItems = localCartItems.map(item => ({
            id: item.id || item._id || 'unknown',
            name: item.name || 'Sản phẩm không xác định',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || '/image/default.jpg',
            product_id: item.product_id || {}
          })).filter(item => item.id !== 'unknown');

          // Loại bỏ các sản phẩm trùng lặp
          const uniqueItems = removeDuplicateCartItems(processedItems);

          setCartItems(uniqueItems);
          
          // Chọn tất cả các mục
          setSelectedItems(uniqueItems.map(item => item.id));
          
          calculateTotalPrice();
          
          toast.info(`Đã tải ${uniqueItems.length} sản phẩm từ giỏ hàng local`);
          
          return;
        }
        
        // Nếu không có giỏ hàng local
        debugLog('No local cart items found');
        setCartItems([]);
        setSelectedItems([]);
        toast.info("Giỏ hàng của bạn đang trống");
        
        return;
      }
      
      debugLog('Fetching cart from server...');
      const res = await fetchCart();
      
      debugLog('Cart fetch response', {
        status: res.status,
        data: res.data ? 'Có dữ liệu' : 'Không có dữ liệu',
        items: res.data?.items?.length || 0,
        itemDetails: res.data?.items ? JSON.stringify(res.data.items.map(item => ({
          id: item._id,
          productId: item.product_id?._id,
          quantity: item.quantity,
          title: item.product_id?.title
        }))) : 'Không có chi tiết'
      });

      // Validate response
      if (!res.data || !res.data.items || res.data.items.length === 0) {
        console.warn('Không có dữ liệu giỏ hàng', res.data);
        
        // Thử lấy giỏ hàng từ localStorage nếu server trả về rỗng
        const localCartItems = JSON.parse(localStorage.getItem("localCartItems") || '[]');
        
        if (localCartItems.length > 0) {
          debugLog('Fallback to local cart items', localCartItems);
          
          const processedItems = localCartItems.map(item => ({
            id: item.id || item._id || 'unknown',
            name: item.name || 'Sản phẩm không xác định',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.image || '/image/default.jpg',
            product_id: item.product_id || {}
          })).filter(item => item.id !== 'unknown');

          // Loại bỏ các sản phẩm trùng lặp
          const uniqueItems = removeDuplicateCartItems(processedItems);

          setCartItems(uniqueItems);
          setSelectedItems(uniqueItems.map(item => item.id));
          calculateTotalPrice();
          
          toast.warning('Không tìm thấy giỏ hàng trên server. Đã tải từ local.');
          return;
        }

        // Nếu cả server và local đều trống
        setCartItems([]);
        setSelectedItems([]);
        toast.info("Giỏ hàng của bạn đang trống");
        return;
      }

      // Process cart items with memoization
      const items = res.data.items.map(item => {
        // Kiểm tra an toàn khi truy cập thuộc tính
        const product = item.product_id || {};
        return {
          id: item._id || product._id || 'unknown',
          name: product.title || 'Sản phẩm không xác định',
          price: (product.price || 0) - ((product.price || 0) * (product.discount_percent || 0)) / 100,
          quantity: item.quantity || 1,
          image: `/image/${product.cover_image || 'default.jpg'}`,
          product_id: product
        };
      }).filter(item => item.id !== 'unknown'); // Loại bỏ các mục không hợp lệ
      
      // Loại bỏ các sản phẩm trùng lặp
      const uniqueItems = removeDuplicateCartItems(items);
      
      debugLog('Processed cart items', uniqueItems);
      
      // Update cart context with fetched items
      if (isMountedRef.current) {
        setCartItems(uniqueItems);

        // Lấy selectedItems từ localStorage, nếu không có thì chọn tất cả
        const savedSelected = JSON.parse(localStorage.getItem("selectedCartItems") || '[]');
        // Lọc lại chỉ lấy những id còn tồn tại trong giỏ hàng mới load
        const validSelected = savedSelected.filter(id => uniqueItems.some(item => item.id === id));

        // Nếu không có mục nào được chọn, chọn tất cả
        const finalSelected = validSelected.length > 0 ? validSelected : uniqueItems.map(item => item.id);

        setSelectedItems(finalSelected);
        calculateTotalPrice();

        // Thêm thông báo tải giỏ hàng thành công
        if (uniqueItems.length > 0) {
          toast.success(`Đã tải ${uniqueItems.length} sản phẩm vào giỏ hàng`);
        } else {
          toast.info("Giỏ hàng của bạn đang trống");
        }
      }
    } catch (err) {
      debugLog('Cart load error', err);
      
      // Chi tiết hơn về các loại lỗi
      if (err.response) {
        switch (err.response.status) {
          case 403:
            toast.error("Bạn không có quyền truy cập giỏ hàng.");
            break;
          case 404:
            toast.info("Không tìm thấy giỏ hàng. Bạn có thể bắt đầu mua sắm ngay!");
            break;
          case 500:
            toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
            break;
          default:
            toast.error("Không thể tải giỏ hàng. Vui lòng thử lại.");
        }
      } else if (err.request) {
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        toast.error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      }

      // Thử tải giỏ hàng từ localStorage
      const localCartItems = JSON.parse(localStorage.getItem("localCartItems") || '[]');
      
      if (localCartItems.length > 0) {
        debugLog('Fallback to local cart items after server error', localCartItems);
        
        const processedItems = localCartItems.map(item => ({
          id: item.id || item._id || 'unknown',
          name: item.name || 'Sản phẩm không xác định',
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || '/image/default.jpg',
          product_id: item.product_id || {}
        })).filter(item => item.id !== 'unknown');

        // Loại bỏ các sản phẩm trùng lặp
        const uniqueItems = removeDuplicateCartItems(processedItems);

        setCartItems(uniqueItems);
        setSelectedItems(uniqueItems.map(item => item.id));
        calculateTotalPrice();
        
        toast.warning('Không thể tải giỏ hàng từ server. Đã tải từ local.');
      } else {
        setLoadError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại.");
        setCartItems([]);
        setSelectedItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    user, 
    isUserLoading, 
    setCartItems, 
    setSelectedItems, 
    calculateTotalPrice,
    debugLog
  ]);

  // Optimize useEffect for cart loading
  useEffect(() => {
    let isCancelled = false;
    
    const safeLoadCart = async () => {
      if (!isCancelled) {
        await loadCart();
      }
    };

    safeLoadCart();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [loadCart]);

  // Lưu selectedItems vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

  // Gọi calculateTotalPrice khi cần
  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems, selectedItems, calculateTotalPrice]);

  // Tính toán chi tiết về giá
  const [priceDetails, setPriceDetails] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    shippingFee: 0
  });

  // Cập nhật chi tiết giá khi thay đổi
  useEffect(() => {
    const details = calculateTotalPrice();
    setPriceDetails(details || {
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      shippingFee: 0
    });
  }, [calculateTotalPrice]);

  // Thêm kiểm tra giá trị mặc định
  const safeToLocaleString = (value) => {
    return formatCurrency(value || 0);
  };

  // Hàm xử lý thay đổi số lượng sản phẩm
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Cập nhật số lượng trong context
      updateQuantity(itemId, newQuantity);

      // Đồng bộ với server
      await updateCartItem(itemId, { quantity: newQuantity });

      // Tính lại tổng tiền
      calculateTotalPrice();

      // Thông báo thành công
      toast.success('Đã cập nhật số lượng sản phẩm');
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      toast.error('Không thể cập nhật số lượng. Vui lòng thử lại.');
      
      // Hoàn tác thay đổi nếu cập nhật thất bại
      updateQuantity(itemId, cartItems.find(item => item.id === itemId).quantity);
    }
  };

  // Hàm xóa một sản phẩm khỏi giỏ hàng
  const handleDeleteItem = async (itemId) => {
    try {
      // Xóa sản phẩm khỏi context
      removeFromCart(itemId);

      // Đồng bộ với server
      await deleteCartItem(itemId);

      // Tính lại tổng tiền
      calculateTotalPrice();

      // Thông báo thành công
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
      
      // Hoàn tác thay đổi nếu xóa thất bại
      // Nếu cần, có thể thêm lại sản phẩm vào context
    }
  };

  // Hàm xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    try {
      // Hiển thị xác nhận trước khi xóa
      const confirmed = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?');
      
      if (!confirmed) return;

      // Xóa toàn bộ giỏ hàng trong context
      clearCart();

      // Đồng bộ với server
      await clearCartAPI();

      // Xóa các mục đã chọn trong localStorage
      localStorage.removeItem('selectedCartItems');

      // Thông báo thành công
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    calculateTotalPrice();
  };

  const handleUpdateShipping = () => {
    setEditing(false);
    // Gửi shippingInfo đến server nếu cần
  };

  const handleCheckout = () => {
    // Kiểm tra xem có sản phẩm nào được chọn không
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    // Lấy các sản phẩm được chọn
    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id)).map(item => ({
      id: item.product_id?._id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      product_id: item.product_id
    }));

    // Chuyển hướng đến trang thanh toán với dữ liệu sản phẩm
    navigate('/checkout', { 
      state: { 
        selectedItems: selectedCartItems,
        fromCart: true
      } 
    });
  };

  // Hàm loại bỏ sản phẩm trùng lặp
  const removeDuplicateCartItems = (items) => {
    // Tạo một map để theo dõi các sản phẩm duy nhất
    const uniqueItemsMap = new Map();

    items.forEach(item => {
      const key = `${item.product_id?._id || item.id}`;
      
      if (!uniqueItemsMap.has(key)) {
        uniqueItemsMap.set(key, { ...item, quantity: item.quantity || 1 });
      } else {
        // Nếu đã tồn tại, cộng dồn số lượng
        const existingItem = uniqueItemsMap.get(key);
        existingItem.quantity += item.quantity || 1;
      }
    });

    return Array.from(uniqueItemsMap.values());
  };

  // Render loading or error states
  if (isUserLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="animate-pulse">
          <p>Đang tải giỏ hàng...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-6 text-center text-red-600">
        {loadError}
        <button 
          onClick={loadCart} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-semibold mb-6">🛍️ Giỏ hàng của bạn</h2>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          className="w-4 h-4 accent-blue-500 cursor-pointer"
          checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
          onChange={(e) => {
            if (e.target.checked) {
              // Chọn tất cả các sản phẩm
              const allItemIds = cartItems.map(item => item.id);
              setSelectedItems(allItemIds);
            } else {
              // Bỏ chọn tất cả
              setSelectedItems([]);
            }
          }}
          id="selectAllCheckbox"
        />
        <label htmlFor="selectAllCheckbox" className="ml-2 text-sm cursor-pointer">
          Chọn tất cả
        </label>
      </div>

      <div className="space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Giỏ hàng của bạn đang trống</p>
        ) : (
          cartItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center bg-white rounded-lg shadow p-4 space-x-4"
            >
              <input
                type="checkbox"
                className="accent-blue-500"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelectItem(item.id)}
              />
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-red-500">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="bg-gray-200 px-2 rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-12 text-center border rounded"
                  min="1"
                />
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="bg-gray-200 px-2 rounded"
                >
                  +
                </button>
              </div>
              <div className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </div>
              <button 
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{safeToLocaleString(priceDetails.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế (10%):</span>
            <span>{safeToLocaleString(priceDetails.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển*:</span>
            <span>{safeToLocaleString(priceDetails.shippingFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Khuyến mãi:</span>
            <span>-{safeToLocaleString(priceDetails.discount)}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Tổng thanh toán:</span>
            <span className="text-red-500">
              {formatCurrency(priceDetails.total)}</span>
          </div>
          <div className="flex justify-between mt-4">
            <button 
              onClick={handleClearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Xóa giỏ hàng
            </button>
            <button 
              onClick={handleCheckout}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thanh toán
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            * Mức phí vận chuyển cố định
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;

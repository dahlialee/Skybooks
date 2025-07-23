import React, { createContext, useState, useCallback, useMemo, useEffect, useContext, useRef } from "react";
import { 
  fetchCart, 
  addItemToCart, 
  updateCartItem, 
  deleteCartItem, 
  clearCart as clearCartAPI,
  syncLocalCart
} from "../services/cartAPI";
import { toast } from 'react-toastify';
import axios from 'axios';
import { UserContext } from "../context/UserContext";

// Hàm khôi phục giỏ hàng từ localStorage
const getInitialCartItems = () => {
  try {
    const savedCart = localStorage.getItem("localCartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Lỗi khi khôi phục giỏ hàng từ localStorage:", error);
    return [];
  }
};

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy thông tin user từ UserContext, với giá trị mặc định là null
  const { user = null } = useContext(UserContext) || {};

  // Trạng thái giỏ hàng
  const [cartItems, setCartItems] = useState(getInitialCartItems);

  // Ref để kiểm soát việc tải giỏ hàng
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Biến để ngăn log liên tục
  const [hasLoggedNoUser, setHasLoggedNoUser] = useState(false);

  // Các mục được chọn để thanh toán
  const [selectedItems, setSelectedItems] = useState(() => {
    try {
      const savedSelected = localStorage.getItem("selectedCartItems");
      return savedSelected ? JSON.parse(savedSelected) : [];
    } catch (error) {
      console.error("Lỗi khi khôi phục các mục đã chọn:", error);
      return [];
    }
  });

  // Các trạng thái khác
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm cập nhật số lượng trên header
  const updateHeaderCartCount = useCallback((items) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    window.updateHeaderCartCount?.(totalItems);
  }, []);

  // Tính toán tổng tiền - MEMOIZED để tránh render liên tục
  const calculateTotalPrice = useCallback(() => {
    const selectedItemsDetails = cartItems.filter(item => 
      selectedItems.includes(item.id)
    );

    // Tính tổng tiền sản phẩm đã chọn
    const subtotal = selectedItemsDetails.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );

    // Tính thuế VAT 10%
    const tax = subtotal * 0.1;

    // Phí ship cố định
    const shippingFee = 30000;

    // Giả sử không có khuyến mãi
    const discount = 0;

    // Tổng tiền = tổng sản phẩm + thuế + phí ship - khuyến mãi
    const total = subtotal + tax + shippingFee - discount;
    
    // Sử dụng functional update an toàn
    setTotalPrice(prevTotal => {
      const newTotal = total;
      return Math.abs(prevTotal - newTotal) > 0.01 ? newTotal : prevTotal;
    });
    
    return {
      subtotal,
      tax,
      discount,
      shippingFee,
      total
    };
  }, [cartItems, selectedItems]);

  // Tính toán các sản phẩm được chọn
  const calculateSelectedItems = useCallback(() => {
    return cartItems.filter(item => selectedItems.includes(item.id));
  }, [cartItems, selectedItems]);

  // Lưu giỏ hàng vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem("localCartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Lỗi khi lưu giỏ hàng vào localStorage:", error);
    }
  }, [cartItems]);

  // Lưu các mục được chọn
  useEffect(() => {
    try {
      localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    } catch (error) {
      console.error("Lỗi khi lưu các mục đã chọn:", error);
    }
  }, [selectedItems]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      const existingItem = prev.find((item) => item.id === product.id);
      
      let updatedItems;
      if (!existingItem) {
        // Nếu sản phẩm chưa tồn tại, thêm mới
        updatedItems = [...prev, { ...product, quantity: 1 }];
      } else {
        // Nếu sản phẩm đã tồn tại, giữ nguyên
        updatedItems = prev;
      }

      return updatedItems;
    });
  }, []);

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback((productId) => {
    // Sử dụng functional update để tránh vấn đề về độ sâu cập nhật
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);

      // Đồng bộ với server
      deleteCartItem(productId)
        .then(() => {
          // Cập nhật header cart count
          updateHeaderCartCount(updatedItems);
          // Tính lại tổng tiền
          calculateTotalPrice();
          // Cập nhật selectedItems
          setSelectedItems(prev => prev.filter(id => id !== productId));
        })
        .catch(error => {
          console.error('Lỗi xóa sản phẩm:', error);
          // Thông báo lỗi nếu không thể xóa trên server
          toast.error('Không thể xóa sản phẩm khỏi giỏ hàng');
        });

      return updatedItems;
    });
  }, [calculateTotalPrice]);

  // Cập nhật số lượng sản phẩm
  const updateQuantity = useCallback((productId, action) => {
    setCartItems(prevItems => {
      // Tìm sản phẩm trong giỏ hàng
      const currentItem = prevItems.find(item => item.id === productId);
      
      if (!currentItem) return prevItems;

      // Xác định số lượng mới dựa trên action
      let newQuantity;
      switch (action) {
        case 'increase':
          newQuantity = currentItem.quantity + 1;
          break;
        case 'decrease':
          newQuantity = currentItem.quantity - 1;
          break;
        default:
          return prevItems;
      }

      // Nếu số lượng < 1, xóa sản phẩm
      if (newQuantity < 1) {
        removeFromCart(productId);
        return prevItems.filter(item => item.id !== productId);
      }

      // Cập nhật số lượng
      const updatedItems = prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      );

      // Đồng bộ với server
      updateCartItem(productId, { quantity: newQuantity })
        .then(() => {
          // Cập nhật header cart count
          updateHeaderCartCount(updatedItems);
          // Tính lại tổng tiền
          calculateTotalPrice();
        })
        .catch(error => {
          console.error('Lỗi cập nhật số lượng:', error);
          // Thông báo lỗi nếu không thể cập nhật trên server
          toast.error('Không thể cập nhật số lượng sản phẩm');
        });

      return updatedItems;
    });
  }, [removeFromCart, calculateTotalPrice]);

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async () => {
    // Hiển thị xác nhận trước khi xóa
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?');
    
    if (!confirmed) return;

    try {
      // Gọi API xóa giỏ hàng
      await clearCartAPI();

      // Cập nhật state với functional update
      setCartItems([]);
      setSelectedItems([]);
      setTotalPrice(0);
      
      // Cập nhật header cart count
      updateHeaderCartCount([]);

      // Xóa giỏ hàng trong localStorage
      localStorage.removeItem('localCartItems');
      localStorage.removeItem('selectedCartItems');

      // Thông báo thành công
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      console.error('Lỗi xóa giỏ hàng:', error);
      
      // Thông báo lỗi nếu không thể xóa trên server
      toast.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  }, []);

  // Chọn/bỏ chọn sản phẩm
  const toggleSelectItem = useCallback((productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // Tải giỏ hàng - TÁCH BIỆT HOÀN TOÀN
  const loadCartItems = useCallback(async () => {
    // Ngăn chặn việc tải nhiều lần
    if (isLoadingRef.current || !isMountedRef.current) return;

    try {
      isLoadingRef.current = true;
      setIsLoading(true);
      
      // Nếu không có user, không làm gì
      if (!user) {
        setCartItems([]);
        updateHeaderCartCount([]);
        return [];
      }
      
      // Tải từ server
      const res = await fetchCart();
      
      if (!res.data || !res.data.items || res.data.items.length === 0) {
        if (isMountedRef.current) {
          setCartItems([]);
          updateHeaderCartCount([]);
        }
        return [];
      }
      console.log('items', res.data.items);
      
      const processedItems = res.data.items.map(item => ({
        id: item.product_id,
        name: item.product_id.title,
        price: item.product_id.price,
        quantity: item.quantity,
        image: `/image/${item.product_id.cover_image || 'default.jpg'}`,
        product_id: item.product_id
      }));

      if (isMountedRef.current) {
        setCartItems(processedItems);
        updateHeaderCartCount(processedItems);
        calculateTotalPrice();
      }
      
      return processedItems;
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error);
      
      if (isMountedRef.current) {
        setCartItems([]);
        updateHeaderCartCount([]);
      }
      
      return [];
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [user, calculateTotalPrice, updateHeaderCartCount]);

  // Tự động tải giỏ hàng - SỬA ĐỔI ĐỂ TRÁNH RENDER LẶP
  useEffect(() => {
    loadCartItems();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadCartItems]);

  // Phương thức đặt hàng không cần token
  const placeOrder = useCallback(async (orderDetails) => {
    // Kiểm tra thông tin bắt buộc
    if (!orderDetails.customerName || !orderDetails.customerPhone || !orderDetails.shippingAddress) {
      return {
        success: false,
        message: "Vui lòng điền đầy đủ thông tin: Tên, Số điện thoại và Địa chỉ"
      };
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    if (cartItems.length === 0) {
      return {
        success: false,
        message: "Giỏ hàng của bạn đang trống"
      };
    }

    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderPayload = {
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        customerEmail: orderDetails.customerEmail || null,
        shippingAddress: orderDetails.shippingAddress,
        items: cartItems.map(item => ({
          product_id: item.id || item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Thực hiện gọi API đặt hàng
      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      // Phân tích kết quả
      const result = await response.json();

      if (response.ok) {
        // Đặt hàng thành công
        clearCart(); // Xóa giỏ hàng

        return {
          success: true,
          message: "Đặt hàng thành công!",
          orderId: result.orderId,
          totalPrice: result.totalPrice
        };
      } else {
        // Đặt hàng thất bại
        return {
          success: false,
          message: result.message || "Không thể đặt hàng. Vui lòng thử lại."
        };
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng."
      };
    }
  }, [cartItems, clearCart]);

  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectedItems,
    setSelectedItems,
    toggleSelectItem,
    calculateSelectedItems,
    calculateTotalPrice,
    totalPrice,
    setTotalPrice,
    setCartItems,
    isLoading,
    loadCartItems,
    placeOrder
  }), [
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectedItems,
    setSelectedItems,
    toggleSelectItem,
    calculateSelectedItems,
    calculateTotalPrice,
    totalPrice,
    setTotalPrice,
    isLoading,
    loadCartItems,
    placeOrder
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

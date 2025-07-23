import axios from "axios";
const BASE_URL = "http://localhost:1906/api/cart";

// Lấy thông tin user từ localStorage
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    return {};
  }
};

// Lấy giỏ hàng (hỗ trợ cả khách và đăng nhập)
export const fetchCart = () => {
  const user = getUserInfo();
  
  return axios.get(`${BASE_URL}`, {
    params: {
      // Truyền userId nếu có
      ...(user && user.id ? { userId: user.id } : {})
    }
  });
};

// Thêm sản phẩm vào giỏ hàng 
export const addItemToCart = (data) => {
  const user = getUserInfo();
  return axios.post(`${BASE_URL}/add`, {
    ...data,
    ...(user && user.id ? { userId: user.id } : {})
  });
};

// Cập nhật sản phẩm trong giỏ hàng
export const updateCartItem = (productId, data) => {
  const user = getUserInfo();
  return axios.put(`${BASE_URL}/update/${productId}`, {
    ...data,
    ...(user && user.id ? { userId: user.id } : {})
  });
};

// Xóa sản phẩm khỏi giỏ hàng
export const deleteCartItem = (productId) => {
  const user = getUserInfo();
  return axios.delete(`${BASE_URL}/delete/${productId}`, {
    params: {
      ...(user && user.id ? { userId: user.id } : {})
    }
  });
};

// Xóa toàn bộ giỏ hàng
export const clearCart = () => {
  const user = getUserInfo();
  return axios.delete(`${BASE_URL}/clear`, {
    params: {
      ...(user && user.id ? { userId: user.id } : {})
    }
  });
};

// Lấy tổng giá trị giỏ hàng
export const getCartTotal = () => {
  const user = getUserInfo();
  return axios.get(`${BASE_URL}/total`, {
    params: {
      ...(user && user.id ? { userId: user.id } : {})
    }
  });
};

// Lấy tổng giá trị các sản phẩm được chọn
export const getCheckedTotal = () => {
  const user = getUserInfo();
  return axios.get(`${BASE_URL}/checked-total`, {
    params: {
      ...(user && user.id ? { userId: user.id } : {})
    }
  });
};

// Xóa các sản phẩm đã chọn khỏi giỏ hàng
export const removeSelectedItems = (selectedItemIds) => {
  const user = getUserInfo();
  return axios.delete(`${BASE_URL}/remove-selected`, {
    params: {
      ...(user && user.id ? { userId: user.id } : {}),
      selectedItemIds: selectedItemIds.join(',')
    }
  });
};

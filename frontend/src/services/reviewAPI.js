import axios from "axios";
const BASE_URL = "http://localhost:1906/api/review";

// Lấy header xác thực
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token 
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

// Lấy đánh giá theo sản phẩm
export const fetchReviewsByProduct = (productId) => {
  return axios.get(`${BASE_URL}/product/${productId}`);
};

// Thêm đánh giá mới
export const addReview = (reviewData) => {
  return axios.post(BASE_URL, reviewData, authHeader());
};

// Cập nhật đánh giá
export const updateReview = (reviewId, reviewData) => {
  return axios.put(`${BASE_URL}/${reviewId}`, reviewData, authHeader());
};

// Xóa đánh giá
export const deleteReview = (reviewId) => {
  return axios.delete(`${BASE_URL}/${reviewId}`, authHeader());
}; 
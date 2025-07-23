// frontend/src/services/productAPI.js
import axios from "axios";
const BASE_URL = "http://localhost:1906/api/product";

// Lấy danh sách sản phẩm
export const fetchProducts = (page = 1, limit = 0, search = '') => {
  return axios.get(BASE_URL, {
    params: { page, limit, search }
  });
};

// Lấy chi tiết sản phẩm
export const fetchProductById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

// Thêm sản phẩm
export const addProduct = (data) => {
  return axios.post(BASE_URL, data);
};

// Cập nhật sản phẩm
export const updateProduct = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

// Xóa sản phẩm
export const deleteProduct = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

// Tìm kiếm sản phẩm theo mã
export const findProductByBarcode = (barcode) => {
  return axios.get(`${BASE_URL}/barcode/${barcode}`);
};

export const searchProducts = (query) => {
  return axios.get(`${BASE_URL}/search`, { 
    params: { query } 
  });
};

// services/categoryProductAPI.js
import axios from "axios";

// 🔗 Đổi BASE_URL này cho đúng backend của bạn
const BASE_URL = "http://localhost:1906/api/categoryProduct";

/**
 * Lấy danh sách category sản phẩm có phân trang + tìm kiếm (nếu có)
 * @param {number} page - Trang hiện tại (mặc định 1)
 * @param {number} limit - Số phần tử trên trang (mặc định 5)
 * @param {string} search - Từ khóa tìm kiếm (mặc định rỗng)
 * @returns Promise
 */
export const fetchCategoryProducts = (page = 1, limit = 0, search = "") => {
  // Tạo query params
  const params = {
    page,
    limit,
    includeProductCount: true // Thêm tham số để backend trả về số lượng sản phẩm
  };
  if (search) params.search = search;

  return axios.get(BASE_URL, { params });
};

export const getCategoryProductById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

/**
 * Thêm mới danh mục
 * @param {Object} data - Dữ liệu category mới { category_name, description }
 * @returns Promise
 */
export const addCategoryProduct = (data) => {
  return axios.post(BASE_URL, data);
};

/**
 * Cập nhật danh mục theo id
 * @param {string} id - ID category cần cập nhật
 * @param {Object} data - Dữ liệu cập nhật { category_name?, description? }
 * @returns Promise
 */
export const updateCategoryProduct = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

/**
 * Xóa danh mục theo id
 * @param {string} id - ID category cần xóa
 * @returns Promise
 */
export const deleteCategoryProduct = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

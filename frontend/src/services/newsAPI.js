import axios from "axios";

const BASE_URL = "http://localhost:1906/api/news";

// Lấy danh sách tin tức (có phân trang và tìm kiếm) - cho user (chỉ tin đã đăng)
export const fetchNews = (page = 1, limit = 5, search = "") => {
  return axios.get(`${BASE_URL}?page=${page}&limit=${limit}&search=${search}`);
};

// Lấy danh sách tất cả tin tức (cho admin) - mọi trạng thái
export const fetchAllNews = (page = 1, limit = 5, search = "") => {
  return axios.get(`${BASE_URL}/admin/all?page=${page}&limit=${limit}&search=${search}`);
};

// Lấy chi tiết tin tức theo ID
export const fetchNewsById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

// Lấy chi tiết tin tức đã đăng (cho user)
export const fetchPublishedNewsById = (id) => {
  return axios.get(`${BASE_URL}/published/${id}`);
};

// Tạo mới tin tức
export const addNews = (data) => {
  return axios.post(BASE_URL, data);
};

// Cập nhật tin tức
export const updateNews = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

// Xóa tin tức
export const deleteNews = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const incrementNewsViews = async (newsId) => {
  try {
    const response = await axios.post(`${BASE_URL}/${newsId}/view`);
    return response.data;
  } catch (error) {
    console.error('Lỗi tăng lượt xem:', error);
    return null;
  }
};

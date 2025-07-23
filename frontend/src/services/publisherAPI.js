import axios from 'axios';

// Lấy danh sách nhà xuất bản
export const fetchPublishers = (page = 1, limit = 10, search = "") => {
  return axios.get('http://localhost:1906/api/publisher', {
    params: { page, limit, search }
  });
};

// Lấy chi tiết nhà xuất bản
export const fetchPublisherById = (id) => {
  return axios.get(`http://localhost:1906/api/publisher/${id}`);
};

// Thêm nhà xuất bản
export const addPublisher = (data) => {
  return axios.post('http://localhost:1906/api/publisher', data);
};

// Cập nhật nhà xuất bản
export const updatePublisher = (id, data) => {
  return axios.put(`http://localhost:1906/api/publisher/${id}`, data);
};

// Xóa nhà xuất bản
export const deletePublisher = (id) => {
  return axios.delete(`http://localhost:1906/api/publisher/${id}`);
};

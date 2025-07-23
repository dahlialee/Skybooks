import axios from "axios";

const BASE_URL = "http://localhost:1906/api/employee";

// Lấy danh sách nhân viên có hỗ trợ phân trang và tìm kiếm
export const fetchEmployees = (page = 1, limit = 0, search = "") => {
  return axios.get(`${BASE_URL}?page=${page}&limit=${limit}&search=${search}`);
};

// Lấy chi tiết nhân viên theo ID
export const fetchEmployeeById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

// Thêm mới nhân viên
export const addEmployee = (data) => {
  // Log dữ liệu trước khi gửi
  console.log('Dữ liệu nhân viên gửi đi:', data);

  // Kiểm tra các trường bắt buộc
  const requiredFields = ['name', 'username', 'email', 'phone', 'role', 'password'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.error('Thiếu các trường bắt buộc:', missingFields);
    throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
  }

  return axios.post(BASE_URL, data);
};

// Cập nhật thông tin nhân viên
export const updateEmployee = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

// Xoá nhân viên theo ID
export const deleteEmployee = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

// Đăng nhập nhân viên bằng email
export const loginEmployee = async (email, password) => {
  try {
    const res = await axios.post(`${BASE_URL}/login`, { email, password });
    
    // Kiểm tra và trả về thông tin nhân viên
    if (res.data.success && res.data.employee) {
      return res.data;
    } else {
      throw new Error(res.data.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    // Xử lý lỗi chi tiết
    if (error.response) {
      // Lỗi từ server
      console.error('Lỗi đăng nhập từ server:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // Lỗi kết nối
      console.error('Lỗi kết nối:', error.request);
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      // Lỗi khác
      console.error('Lỗi đăng nhập:', error.message);
      throw error;
    }
  }
};

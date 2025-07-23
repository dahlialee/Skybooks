import axios from "axios";

const BASE_URL = "http://localhost:1906/api/invoice";

// Loại bỏ hàm getAuthHeader
export const fetchInvoices = (page = 1, limit = 0, queryParams = {}) => {
  // Tạo URL search params
  const params = new URLSearchParams();
  
  // Thêm page và limit
  params.append('page', page);
  params.append('limit', limit);

  // Xử lý các tham số tìm kiếm
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Sử dụng giá trị gốc không mã hóa
      const processedValue = value.toString().trim();
      
      params.append(key, processedValue);
      
      console.group(`🔍 Tham số tìm kiếm`);
      console.log(`Khóa: ${key}`);
      console.log(`Giá trị gốc: ${value}`);
      console.log(`Giá trị xử lý: ${processedValue}`);
      console.groupEnd();
    }
  });

  // Chuyển đổi thành chuỗi query
  const queryString = params.toString();
  console.log('queryString', queryString);
  
  console.group(`🌐 URL Tìm kiếm`);
  console.log('URL đầy đủ:', `${BASE_URL}?${queryString}`);
  console.groupEnd();

  // Gọi API
  return axios.get(`${BASE_URL}?${queryString}`);
};

export const fetchInvoiceById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

export const addInvoice = (data) => {
  return axios.post(BASE_URL, data);
};

export const updateInvoice = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteInvoice = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const getOrdersByCustomer = (customerId) => {
  return axios.get(`${BASE_URL}/customer/${customerId}`);
};

export const getInvoiceDetails = async (invoiceId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${invoiceId}`);
    return response.data.data;
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    throw error;
  }
};

export const createOfflineInvoice = (invoiceData) => {
  return axios.post(`${BASE_URL}/offline`, invoiceData);
};

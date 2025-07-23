import axios from "axios";

const BASE_URL = "http://localhost:1906/api/purchaseReceipt";


// Lấy danh sách phiếu nhập
export const getPurchaseReceipts = async (page = 1, limit = 10, search = "") => {
  const response = await axios.get(BASE_URL, {
    params: { page, limit, search }
  });
  return response.data;
};

// Lấy chi tiết phiếu nhập
export const getPurchaseReceiptById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Thêm phiếu nhập mới
export const createPurchaseReceipt = async (receiptData) => {
  const response = await axios.post(BASE_URL, receiptData);
  return response.data;
};

// Cập nhật phiếu nhập
export const updatePurchaseReceipt = async (id, receiptData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, receiptData);
  return response.data;
};

// Xóa phiếu nhập
export const deletePurchaseReceipt = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// Thống kê phiếu nhập
export const getPurchaseReceiptStatistics = (startDate, endDate) => {
  return axios.get('/purchaseReceipt/statistics', {
    params: { startDate, endDate }
  });
}; 
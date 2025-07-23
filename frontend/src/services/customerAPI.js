import axios from "axios";

const BASE_URL = "http://localhost:1906/api/customer";

export const fetchCustomers = ( page = 1, limit = 0, search = "" ) => {
  return axios.get(BASE_URL, {
    params: { page, limit, search },
  });
};

export const fetchCustomerById = (id) => {
  return axios.get(`${BASE_URL}/${id}`).then(response => {
    // Đảm bảo trả về dữ liệu đúng định dạng
    const customer = response.data;
    return {
      ...customer,
      id: customer._id || customer.id,
      _id: customer._id || customer.id
    };
  });
};

export const addCustomer = (data) => {
  return axios.post(BASE_URL, data);
};

export const updateCustomer = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteCustomer = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

export const loginCustomer = (credentials) => {
  return axios.post(`${BASE_URL}/login`, credentials);
};

export const register = (userData) => {
  console.log('userData', userData)
  return axios.post(BASE_URL, userData);
};

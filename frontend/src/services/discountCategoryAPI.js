import axios from "axios";

const BASE_URL = "http://localhost:1906/api/discountCategories";

export const fetchDiscountCategories = (page = 1, limit = 0, search = "") => {
  return axios.get(`${BASE_URL}?page=${page}&limit=${limit}&search=${search}`);
};

export const fetchDiscountCategoryById = (id) => {
  return axios.get(`${BASE_URL}/${id}`);
};

export const addDiscountCategory = (data) => {
  return axios.post(BASE_URL, data);
};

export const updateDiscountCategory = (id, data) => {
  return axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteDiscountCategory = (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};

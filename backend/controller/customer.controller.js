const customerService = require('../model/service/customer.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const customerController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const customer = await customerService.login(email, password);

      res.status(200).json({
        message: 'Đăng nhập thành công',
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          gender: customer.gender,
          date_of_birth: customer.date_of_birth,
          role: 'customer',
        }
      });
    } catch (error) {
      if (error.message === 'Email không tồn tại') {
        return res.status(404).json({ message: error.message });
      } else if (error.message === 'Mật khẩu không đúng') {
        return res.status(401).json({ message: error.message });
      } else {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng nhập' });
      }
    }
  },

  // ✅ Create new customer
  createCustomer: async (req, res) => {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({ message: "Đăng ký thành công", customer });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ✅ Get all customers with pagination
  getAllCustomers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 0;

      const customers = await customerService.getAll(page, limit);
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ✅ Get customer by ID
  getCustomerById: async (req, res) => {
    try {
      const customer = await customerService.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
      }
      
      // Trả về thông tin chi tiết, loại bỏ các trường nhạy cảm
      const customerDetails = {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gender: customer.gender,
        date_of_birth: customer.date_of_birth,
        role: 'customer'
      };

      res.status(200).json(customerDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ✅ Update customer
  updateCustomer: async (req, res) => {
    try {
      const updatedCustomer = await customerService.update(req.params.id, req.body);
      if (!updatedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // ✅ Soft delete customer
  deleteCustomer: async (req, res) => {
    try {
      const deletedCustomer = await customerService.softDelete(req.params.id);
      if (!deletedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = customerController;

const Customer = require('../entity/customer.schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const customerService = {
  login: async (email, password) => {
    const customer = await customerService.findByEmail(email);
    if (!customer) throw new Error('Email không tồn tại');
    
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new Error('Mật khẩu không đúng');

    return customer;
  },

  // Tạo khách hàng mới (với đăng ký đầy đủ)
  create: async (data) => {
    const { email, username, phone, password } = data;

    // Kiểm tra các trường bắt buộc khi đăng ký
    if (email && username && password) {
      const [emailExists, usernameExists, phoneExists] = await Promise.all([
        customerService.findByEmail(email),
        customerService.findByUsername(username),
        customerService.findByPhone(phone)
      ]);

      if (emailExists) throw new Error("Email đã tồn tại");
      if (usernameExists) throw new Error("Tên đăng nhập đã tồn tại");
      if (phoneExists) throw new Error("Số điện thoại đã tồn tại");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newCustomer = new Customer({ ...data, password: hashedPassword });

      return await newCustomer.save();
    } 
    // Tạo khách hàng từ thông tin đặt hàng (không yêu cầu đăng ký)
    else {
      // Kiểm tra số điện thoại
      if (phone) {
        const phoneExists = await customerService.findByPhone(phone);
        if (phoneExists) throw new Error("Số điện thoại đã tồn tại");
      }

      // Tạo khách hàng tạm thời (không có tài khoản)
      const newCustomer = new Customer({
        ...data,
        username: phone, // Sử dụng số điện thoại làm username tạm thời
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Mật khẩu ngẫu nhiên
        isTemporary: true // Đánh dấu là khách hàng tạm thời
      });

      return await newCustomer.save();
    }
  },

  // Tạo khách hàng từ thông tin đặt hàng
  createFromOrder: async (customerInfo) => {
    const { name, phone, email, address } = customerInfo;
    
    // Kiểm tra xem khách hàng đã tồn tại chưa
    const existingCustomer = await customerService.findByPhone(phone);
    if (existingCustomer) return existingCustomer;
    
    // Tạo khách hàng mới
    const newCustomer = new Customer({
      name,
      phone,
      email: email || undefined, // Sử dụng undefined nếu không có email
      address,
      isTemporary: true // Đánh dấu là khách hàng tạm thời
    });
    
    return await newCustomer.save();
  },

  // ✅ GET ALL with pagination
  getAll: async (page = 1, limit = 0) => {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments({ isDeleted: false })
    ]);

    return {
      data: customers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    };
  },

  getById: async (id) => {
    return await Customer.findOne({ _id: id, isDeleted: false });
  },

  update: async (id, data) => {
    return await Customer.findByIdAndUpdate(id, data, { new: true });
  },

  softDelete: async (id) => {
    return await Customer.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  },

  findByEmail: async (email) => {
    return await Customer.findOne({ email, isDeleted: false });
  },

  findByUsername: async (username) => {
    return await Customer.findOne({ username, isDeleted: false });
  },

  findByPhone: async (phone) => {
    return await Customer.findOne({ phone, isDeleted: false });
  }

};

module.exports = customerService;

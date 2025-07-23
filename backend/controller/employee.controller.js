const employeeService = require('../model/service/employee.service');
const jwt = require('jsonwebtoken');

const employeeController = {
  // Tạo mới nhân viên
  createEmployee: async (req, res) => {
    try {
      // Log toàn bộ dữ liệu nhận được
      console.log('Dữ liệu nhân viên nhận được:', req.body);

      // Kiểm tra từng trường dữ liệu
      const { 
        name, 
        username, 
        email, 
        phone, 
        role, 
        password, 
        dob, 
        address, 
        avatar 
      } = req.body;

      // Log từng trường
      console.log('Tên:', name);
      console.log('Username:', username);
      console.log('Email:', email);
      console.log('Phone:', phone);
      console.log('Role:', role);
      console.log('Password:', password ? '[đã nhập]' : '[trống]');
      console.log('Ngày sinh:', dob);
      console.log('Địa chỉ:', address);
      console.log('Avatar:', avatar);

      const newEmployee = await employeeService.create(req.body);
      res.status(201).json(newEmployee);
    } catch (error) {
      // Log lỗi chi tiết
      console.error('Lỗi khi tạo nhân viên:', {
        message: error.message,
        stack: error.stack,
        body: req.body
      });

      res.status(400).json({ 
        message: error.message || 'Lỗi khi tạo nhân viên',
        details: error
      });
    }
  },

  // Đăng nhập nhân viên bằng email
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Kiểm tra xem email và password có được cung cấp không
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Vui lòng cung cấp email và mật khẩu' 
        });
      }
      
      // Gọi service để xác thực đăng nhập
      const loginResult = await employeeService.loginByEmail(email, password);
      
      // Trả về thông tin nhân viên
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        employee: loginResult.employee
      });
    } catch (error) {
      // Xử lý các loại lỗi khác nhau
      console.error('Lỗi đăng nhập:', error);

      if (error.message === 'Email không tồn tại') {
        return res.status(404).json({ 
          success: false,
          message: 'Email không tồn tại' 
        });
      }
      
      if (error.message === 'Mật khẩu không chính xác') {
        return res.status(401).json({ 
          success: false,
          message: 'Mật khẩu không chính xác' 
        });
      }
      
      // Lỗi không xác định
      res.status(500).json({ 
        success: false,
        message: 'Lỗi đăng nhập. Vui lòng thử lại.' 
      });
    }
  },

  // Lấy danh sách nhân viên (có phân trang)
  getAllEmployees: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 0;

      const employees = await employeeService.getAll(page, limit);
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết nhân viên theo ID
  getEmployeeById: async (req, res) => {
    try {
      const employee = await employeeService.getById(req.params.id);
      if (!employee) return res.status(404).json({ message: 'Employee not found' });
      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật thông tin nhân viên
  updateEmployee: async (req, res) => {
    try {
      const updatedEmployee = await employeeService.update(req.params.id, req.body);
      if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Xoá nhân viên
  deleteEmployee: async (req, res) => {
    try {
      const deletedEmployee = await employeeService.delete(req.params.id);
      if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = employeeController;

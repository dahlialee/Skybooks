const Employee = require('../entity/employee.schema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const employeeService = {
  // Tạo mới nhân viên
  create: async (data) => {
    try {
      // Validate dữ liệu đầu vào
      if (!data.name) {
        throw new Error('Tên nhân viên là bắt buộc');
      }
      if (!data.email) {
        throw new Error('Email là bắt buộc');
      }
      if (!data.phone) {
        throw new Error('Số điện thoại là bắt buộc');
      }
      if (!data.username) {
        throw new Error('Tên đăng nhập là bắt buộc');
      }
      if (!data.password) {
        throw new Error('Mật khẩu là bắt buộc');
      }
      if (!data.role) {
        throw new Error('Vai trò là bắt buộc');
      }

      // Kiểm tra email đã tồn tại
      const existingEmail = await Employee.findOne({ email: data.email });
      if (existingEmail) {
        throw new Error('Email đã được sử dụng');
      }

      // Kiểm tra username đã tồn tại
      const existingUsername = await Employee.findOne({ username: data.username });
      if (existingUsername) {
        throw new Error('Tên đăng nhập đã được sử dụng');
      }

      // Kiểm tra số điện thoại đã tồn tại
      const existingPhone = await Employee.findOne({ phone: data.phone });
      if (existingPhone) {
        throw new Error('Số điện thoại đã được sử dụng');
      }

      // Kiểm tra mật khẩu
      if (data.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Tạo salt
      const salt = await bcrypt.genSalt(10);
      // Hash mật khẩu
      data.password = await bcrypt.hash(data.password, salt);

      // Tạo nhân viên mới với mật khẩu đã hash
      const employee = new Employee(data);
      return await employee.save();
    } catch (error) {
      // Log lỗi nếu có
      console.error('Lỗi khi tạo nhân viên:', error);
      throw error;
    }
  },

  // Lấy tất cả nhân viên có phân trang
  getAll: async (page = 1, limit = 0) => {
    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      Employee.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments()
    ]);

    return {
      data: employees,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    };
  },

  // Lấy nhân viên theo ID
  getById: async (id) => {
    return await Employee.findById(id);
  },

  // Cập nhật thông tin nhân viên
  update: async (id, data) => {
    return await Employee.findByIdAndUpdate(id, data, { new: true });
  },

  // Xoá nhân viên
  delete: async (id) => {
    return await Employee.findByIdAndDelete(id);
  },

  // Phương thức đăng nhập bằng email không sử dụng token
  loginByEmail: async (email, password) => {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }

      console.log('Đăng nhập với email:', email);

      // Tìm nhân viên theo email
      const employee = await Employee.findOne({ email });
      
      // Kiểm tra tồn tại nhân viên
      if (!employee) {
        console.error('Không tìm thấy nhân viên với email:', email);
        throw new Error('Email không tồn tại');
      }

      // So sánh mật khẩu trực tiếp
      const isMatch = password === employee.password;
      
      console.log('Kết quả so sánh mật khẩu:', isMatch);

      if (!isMatch) {
        console.error('Mật khẩu không chính xác cho email:', email);
        throw new Error('Mật khẩu không chính xác');
      }

      console.log('Đăng nhập thành công cho email:', email);

      return {
        success: true,
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          username: employee.username
        }
      };
    } catch (error) {
      // Log lỗi chi tiết
      console.error('Lỗi trong quá trình đăng nhập:', {
        message: error.message,
        stack: error.stack
      });
      
      // Ném lỗi để controller xử lý
      throw {
        success: false,
        message: error.message || 'Lỗi đăng nhập. Vui lòng thử lại.'
      };
    }
  }
};

module.exports = employeeService;

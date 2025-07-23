const jwt = require('jsonwebtoken');
const Employee = require('../model/entity/employee.schema');

// Middleware xác minh token
const verifyToken = async (req, res, next) => {
  // Bỏ qua xác thực cho route login
  if (req.path === '/api/employee/login' && req.method === 'POST') {
    return next();
  }

  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    // Kiểm tra header Authorization
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không tìm thấy token xác thực' 
      });
    }

    // Tách token từ header (loại bỏ tiền tố 'Bearer ')
    const token = authHeader.split(' ')[1];
    
    // Kiểm tra token
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    // Giải mã và xác minh token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your_jwt_secret'
    );

    // Tìm nhân viên dựa trên ID từ token
    const employee = await Employee.findById(decoded.id).select('-password');
    
    // Kiểm tra nhân viên tồn tại
    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nhân viên không tồn tại' 
      });
    }

    // Gán thông tin nhân viên vào request
    req.employee = employee;
    req.token = token;

    // Chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    // Log lỗi chi tiết
    console.error('Lỗi xác thực token:', error);

    // Xử lý các lỗi liên quan đến token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token đã hết hạn' 
      });
    }

    // Lỗi không xác định
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực' 
    });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  // Kiểm tra vai trò của nhân viên
  if (req.employee && req.employee.role === 'quản lý') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Bạn không có quyền truy cập' 
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  // Middleware cho các route không bắt buộc đăng nhập
  optional: (req, res, next) => {
    // Nếu có token, xác thực người dùng
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        req.user = decoded;
      } catch (error) {
        // Nếu token không hợp lệ, vẫn cho phép tiếp tục
        req.user = { id: 'guest' };
      }
    } else {
      // Không có token, đặt user là guest
      req.user = { id: 'guest' };
    }
    next();
  },

  // Middleware yêu cầu đăng nhập
  required: (req, res, next) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
      }

      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ' });
    }
  },

  // Middleware cho phép truy cập không cần xác thực
  guest: (req, res, next) => {
    try {
      // Ưu tiên lấy user ID từ các nguồn
      let userId = 'guest';

      // Thử lấy từ session
      if (req.session && req.session.user && req.session.user.id) {
        userId = req.session.user.id;
      } 
      // Thử lấy từ body
      else if (req.body && req.body.userId) {
        userId = req.body.userId;
      }
      // Thử lấy từ query
      else if (req.query && req.query.userId) {
        userId = req.query.userId;
      }

      // Gán user vào request
      req.user = { 
        id: userId,
        type: userId === 'guest' ? 'guest' : 'user'
      };

      next();
    } catch (error) {
      console.error('Lỗi trong Guest Middleware:', error);
      
      // Đảm bảo luôn có user
      req.user = { id: 'guest', type: 'guest' };
      next();
    }
  }
}; 
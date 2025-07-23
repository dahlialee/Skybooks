const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Employee = require('../model/entity/employee.schema');

// Route đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm nhân viên theo username
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Tài khoản không tồn tại' 
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mật khẩu không chính xác' 
      });
    }

    // Tạo token
    const token = jwt.sign(
      { 
        id: employee._id, 
        username: employee.username, 
        role: employee.role 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '1h' }
    );

    // Trả về thông tin và token
    res.json({
      success: true,
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        role: employee.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi đăng nhập', 
      error: error.message 
    });
  }
});

module.exports = router;

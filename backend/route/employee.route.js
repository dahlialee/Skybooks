const express = require('express');
const router = express.Router();
const employeeController = require('../controller/employee.controller');

// Route đăng nhập không cần xác thực
router.post('/login', employeeController.login);

// Các route khác yêu cầu xác thực và quyền admin
router.post('/', employeeController.createEmployee);

router.get('/', employeeController.getAllEmployees);

// Lấy thông tin 1 nhân viên theo ID
router.get('/:id', employeeController.getEmployeeById);

// Cập nhật thông tin 1 nhân viên
router.put('/:id', employeeController.updateEmployee);

// Xoá 1 nhân viên
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;

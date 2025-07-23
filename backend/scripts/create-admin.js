const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../model/entity/employee.schema');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAdminEmployee() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Kiểm tra xem đã tồn tại nhân viên admin chưa
    const existingAdmin = await Employee.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Nhân viên admin đã tồn tại');
      return;
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!@#', salt);

    // Tạo nhân viên admin mới
    const adminEmployee = new Employee({
      name: 'Admin Quản Lý',
      email: 'admin@example.com',
      phone: '0123456789',
      username: 'admin',
      password: hashedPassword, // Sử dụng mật khẩu đã hash
      role: 'quản lý',
      address: 'Hà Nội',
      dob: new Date('1990-01-01')
    });

    // Lưu nhân viên
    await adminEmployee.save();
    
    console.log('Đã tạo nhân viên admin thành công');
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên admin:', error);
  } finally {
    // Đóng kết nối MongoDB
    await mongoose.connection.close();
  }
}

// Chạy script
createAdminEmployee(); 
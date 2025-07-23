import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

// Ghi chú: Trang dashboard quản trị
const AdminDashboard = () => {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra và lấy thông tin người dùng khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    } else {
      // Nếu không có thông tin người dùng, chuyển về trang đăng nhập
      navigate('/admin/login');
    }
  }, [navigate]);

  // Hàm đăng xuất
  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('adminUser');
    // Chuyển về trang đăng nhập
    navigate('/admin/login');
  };

  // Nếu chưa có thông tin người dùng, hiển thị loading
  if (!adminUser) {
    return <div>Đang tải...</div>;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Bảng điều khiển Quản trị</h1>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Chào mừng, {adminUser.name}
            </h2>
            <div className="mb-4">
              <p><strong>Email:</strong> {adminUser.email}</p>
              <p><strong>Vai trò:</strong> {adminUser.role}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 
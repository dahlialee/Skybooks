import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchCustomerById } from '../services/customerAPI';

// Tạo context cho thông tin người dùng
export const UserContext = createContext(null);

// Provider để quản lý trạng thái đăng nhập
export const UserProvider = ({ children }) => {
  // Khôi phục thông tin người dùng từ localStorage khi khởi tạo
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Lỗi khi đọc thông tin người dùng từ localStorage:', error);
      return null;
    }
  });

  // Hàm làm sạch dữ liệu người dùng
  const sanitizeUserData = (userData) => {
    if (!userData) return null;

    // Tạo bản sao và làm sạch dữ liệu
    const cleanedData = { ...userData };
    
    // Loại bỏ các ký tự escape không mong muốn
    Object.keys(cleanedData).forEach(key => {
      if (typeof cleanedData[key] === 'string') {
        cleanedData[key] = cleanedData[key]
          .replace(/\\/g, '')  // Loại bỏ dấu gạch chéo
          .trim();  // Loại bỏ khoảng trắng thừa
      }
    });

    return cleanedData;
  };

  // Hàm đăng nhập
  const loginUser = (userData) => {
    // Validate dữ liệu
    if (!userData || !userData.email) {
      toast.error('Thông tin đăng nhập không hợp lệ');
      return;
    }

    // Làm sạch và lưu thông tin người dùng
    // Đảm bảo _id và id được gán đúng
    const cleanedUserData = {
      ...sanitizeUserData(userData),
      id: userData.id || userData._id,
      _id: userData._id || userData.id
    };

    // Lưu vào localStorage
    try {
      localStorage.setItem('user', JSON.stringify(cleanedUserData));
    } catch (error) {
      console.error('Lỗi khi lưu thông tin người dùng:', error);
    }

    setUser(cleanedUserData);
  };

  // Hàm đăng xuất
  const logoutUser = () => {
    // Xóa thông tin người dùng
    setUser(null);
    
    // Xóa localStorage
    localStorage.removeItem('user');
    
    // Thông báo đăng xuất
    toast.info('Bạn đã đăng xuất');
  };

  // Hàm lấy thông tin chi tiết người dùng
  const fetchUserProfile = async () => {
    try {
      if (!user || !user.id) {
        return null;
      }

      const response = await fetchCustomerById(user.id);
      
      if (response.data) {
        // Cập nhật thông tin người dùng với dữ liệu mới từ API
        const updatedUserData = {
          ...user,
          ...response.data,
          id: response.data._id || response.data.id
        };

        // Lưu vào localStorage
        try {
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        } catch (error) {
          console.error('Lỗi khi lưu thông tin người dùng:', error);
        }

        // Cập nhật lại thông tin người dùng trong context
        setUser(sanitizeUserData(updatedUserData));

        return updatedUserData;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      toast.error('Không thể tải thông tin tài khoản');
    }

    return null;
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,  // Thêm isAuthenticated 
      loginUser, 
      logoutUser,
      fetchUserProfile  // Thêm phương thức mới
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook để sử dụng context người dùng
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

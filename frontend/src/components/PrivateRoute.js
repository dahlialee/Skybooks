import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PrivateRoute = () => {
  const { user } = useUser();

  // Nếu không có người dùng, chuyển hướng đến trang đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có người dùng, cho phép truy cập các route con
  return <Outlet />;
};

export default PrivateRoute; 
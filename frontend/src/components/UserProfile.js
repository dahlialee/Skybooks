import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '../context/UserContext';

const UserProfile = () => {
  const { user } = useUser();

  // Nếu không có người dùng, không hiển thị gì
  if (!user) return null;

  return (
    <div className="relative group">
      <div className="flex items-center space-x-3 cursor-pointer">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <FaUserCircle className="text-blue-600 text-2xl" />
        </div>

        {/* Thông tin người dùng */}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-gray-700">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="p-2 space-y-1">
          <a 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Hồ sơ cá nhân
          </a>
          <a 
            href="/orders" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
          >
            Đơn hàng của tôi
          </a>
        </div>

      </div>
    </div>
  );
};

export default UserProfile; 
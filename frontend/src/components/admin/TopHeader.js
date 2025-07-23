import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaUser, FaSignOutAlt, FaCog, FaKey } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const themes = [
  { name: 'Hồng dễ thương', value: '#f8b9c9' },
  { name: 'Xanh nhẹ nhàng', value: '#b3d4fc' },
  { name: 'Tím pastel', value: '#d9b3ff' },
  { name: 'Xanh mint', value: '#b3ffd9' },
  { name: 'Cam dịu', value: '#ffd9b3' },
  { name: 'Xám nhạt', value: '#f0f0f0' },
];

const languages = {
  vi: { label: 'Tiếng Việt', flag: '/image/flags/vn.png' },
  en: { label: 'English', flag: '/image/flags/en.svg' },
  cn: { label: '中国', flag: '/image/flags/cn.webp' },
};

const TopHeader = () => {
  const [lang, setLang] = useState('vi');
  const [showTheme, setShowTheme] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedLang = localStorage.getItem('selectedLang') || 'vi';
    const storedUser = localStorage.getItem('adminUser');

    if (savedTheme) document.documentElement.style.setProperty('--theme-color', savedTheme);
    setLang(savedLang);

    // Lấy thông tin admin từ localStorage
    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }

    // Đóng dropdown khi click ngoài
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowUserDropdown(false);
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeTheme = (color) => {
    localStorage.setItem('selectedTheme', color);
    document.documentElement.style.setProperty('--theme-color', color);
    setShowTheme(false);
  };

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem('selectedLang', code);
    setShowLang(false);
  };

  // Hàm xác nhận đăng xuất
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    try {
      // Xóa thông tin đăng nhập
      localStorage.removeItem('adminUser');
      
      // Chuyển hướng về trang đăng nhập
      navigate('/admin/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Hiển thị thông báo lỗi nếu cần
      alert('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
    }
  };

  // Hàm hủy đăng xuất
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Các hàm điều hướng
  const navigateToProfile = () => {
    navigate('/admin/profile');
    setShowUserDropdown(false);
  };

  const navigateToChangePassword = () => {
    navigate('/admin/change-password');
    setShowUserDropdown(false);
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
      {/* Logo + Brand */}
      <div className="flex items-center">
        <img src="/image/icon/logo.ico" alt="Logo" className="w-10 h-10" />
        <span className="ml-3 text-xl font-bold">Skybooks</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6 relative">
        {/* Theme */}
        <div className="relative">
          <button
            onClick={() => setShowTheme(!showTheme)}
            className="px-3 py-2 rounded hover:bg-gray-700 transition"
          >
            🎨 Giao diện
          </button>
          {showTheme && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg p-2 grid grid-cols-3 gap-2 w-48 z-20">
              {themes.map((t, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: t.value }}
                  title={t.name}
                  onClick={() => changeTheme(t.value)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Language */}
        <div className="relative">
          <button
            onClick={() => setShowLang(!showLang)}
            className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-gray-700 transition"
          >
            <img src={languages[lang].flag} alt="flag" className="w-6 h-4" />
            <span>{languages[lang].label}</span>
          </button>
          {showLang && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg w-48 z-20">
              {Object.entries(languages).map(([code, { label, flag }]) => (
                <div
                  key={code}
                  onClick={() => changeLang(code)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <img src={flag} alt="flag" className="w-6 h-4 mr-2" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" id="user-dropdown">
          <div 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 p-2 rounded-md transition"
          >
            {adminUser && adminUser.avatar ? (
              <img 
                src={adminUser.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            ) : (
              <FaUserCircle className="w-6 h-6" />
            )}
            <span className="text-white">
              {adminUser ? adminUser.name : 'Admin'}
            </span>
          </div>

          {/* Dropdown User */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-2xl z-50 overflow-hidden">
              {/* Thông tin người dùng */}
              <div className="px-4 py-3 bg-gray-100 border-b">
                <p className="text-sm font-medium text-gray-800">
                  {adminUser ? adminUser.name : 'Admin'}
                </p>
                <p className="text-xs text-gray-500">
                  {adminUser ? adminUser.email : 'admin@example.com'}
                </p>
              </div>

              {/* Các chức năng */}
              <div className="py-1">
                {/* Thông tin tài khoản */}
                <button 
                  onClick={navigateToProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaUser className="mr-3" /> Thông tin tài khoản
                </button>

                {/* Đổi mật khẩu */}
                <button 
                  onClick={navigateToChangePassword}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaKey className="mr-3" /> Đổi mật khẩu
                </button>

                {/* Cài đặt */}
                <button 
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaCog className="mr-3" /> Cài đặt
                </button>

                {/* Đăng xuất */}
                <button 
                  onClick={confirmLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt className="mr-3" /> Đăng xuất
                </button>
              </div>
            </div>
          )}

          {/* Modal xác nhận đăng xuất */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center transform transition-all duration-300 ease-in-out hover:scale-[1.02]">
                {/* Icon đăng xuất */}
                <div className="mx-auto mb-6 w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="w-12 h-12 text-indigo-500" />
                </div>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Xác nhận đăng xuất
                </h2>

                {/* Nội dung */}
                <p className="text-gray-600 mb-6 text-base">
                  Bạn có chắc chắn muốn đăng xuất khỏi hệ thống? 
                  Mọi thao tác chưa lưu sẽ bị mất.
                </p>

                {/* Các nút */}
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={cancelLogout}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 ease-in-out"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-300 ease-in-out shadow-md hover:shadow-lg"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopHeader;

import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { CartContext } from '../../context/CartContext';
import {
  FaUser,
  FaShoppingCart,
  FaBars,
  FaSignOutAlt,
  FaUserCircle,
  FaClipboardList,
  FaStar,
  FaSignInAlt,
  FaUserPlus,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserHeader = () => {
  const { user, logoutUser } = useContext(UserContext);
  const { cartItems } = useContext(CartContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!user;

  const currentPath = location.pathname;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
    setSelectedItem('');
    navigate('/login');
  };

  const handleSelect = (path, key) => {
    if (path === '/profile' || path === '/user/orders' || path === '/reviews') {
      if (!isAuthenticated) {
        toast.info('Vui lòng đăng nhập để truy cập trang này');
        navigate('/login');
        return;
      }
    }

    setSelectedItem(key);
    setDropdownOpen(false);
    navigate(path);
  };

  const cartCount = useMemo(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;

    return cartItems.reduce((sum, item) => {
      const quantity = item.quantity && typeof item.quantity === 'number' 
        ? item.quantity 
        : 0;
      return sum + quantity;
    }, 0);
  }, [cartItems]);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-none relative shadow-sm">
      <div className="flex items-center">
        <img src="/image/icon/logo.ico" alt="Logo" className="w-10 h-10" />
        <span className="ml-3 text-xl cursor-pointer font-semibold hover:text-sky-600 transition-colors">
          Skybooks
        </span>
      </div>

      <nav>
        <ul className="hidden md:flex gap-5 list-none p-0 m-0">
          <li>
            <Link 
              to="/home" 
              className={`font-medium hover:text-sky-600 ${currentPath === '/home' ? 'text-sky-600 font-bold' : ''}`}
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={`font-medium hover:text-sky-600 ${currentPath === '/about' ? 'text-sky-600 font-bold' : ''}`}
            >
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link 
              to="/bookshelf" 
              className={`font-medium hover:text-sky-600 ${currentPath === '/bookshelf' ? 'text-sky-600 font-bold' : ''}`}
            >
              Tủ sách
            </Link>
          </li>
          <li>
            <Link 
              to="/news" 
              className={`font-medium hover:text-sky-600 ${currentPath === '/news' ? 'text-sky-600 font-bold' : ''}`}
            >
              Tin tức
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center gap-6 text-lg relative">
        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(prev => !prev)} className="cursor-pointer hover:text-sky-600 transition-colors">
            <FaUser />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 shadow-lg rounded-xl z-20 overflow-hidden animate-fade-in">
              {!isAuthenticated ? (
                <>
                  <div
                    onClick={() => handleSelect('/login', 'login')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-sky-100 ${selectedItem === 'login' ? 'bg-sky-100 font-semibold text-sky-700' : ''}`}
                  >
                    <FaSignInAlt className="text-sky-600" />
                    Đăng nhập
                  </div>
                  <div
                    onClick={() => handleSelect('/register', 'register')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-sky-100 ${selectedItem === 'register' ? 'bg-sky-100 font-semibold text-sky-700' : ''}`}
                  >
                    <FaUserPlus className="text-sky-600" />
                    Đăng ký
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={() => handleSelect('/profile', 'profile')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-sky-100 ${selectedItem === 'profile' ? 'bg-sky-100 font-semibold text-sky-700' : ''}`}
                  >
                    <FaUserCircle className="text-sky-600" />
                    Thông tin tài khoản
                  </div>
                  <div
                    onClick={() => handleSelect('/user/orders', 'order')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-sky-100 ${selectedItem === 'order' ? 'bg-sky-100 font-semibold text-sky-700' : ''}`}
                  >
                    <FaClipboardList className="text-sky-600" />
                    Quản lý đơn hàng
                  </div>
                  <div
                    onClick={() => handleSelect('/reviews', 'reviews')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm cursor-pointer hover:bg-sky-100 ${selectedItem === 'reviews' ? 'bg-sky-100 font-semibold text-sky-700' : ''}`}
                  >
                    <FaStar className="text-sky-600" />
                    Quản lý đánh giá
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt />
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="cursor-pointer hover:text-sky-600 relative"
          onClick={() => navigate("/cart")}
        >
          <FaShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-sky-600 text-white text-xs px-1.5 rounded-full select-none">
              {cartCount}
            </span>
          )}
        </div>

        <div className="cursor-pointer md:hidden">
          <FaBars />
        </div>
      </div>
    </header>
  );
};

export default UserHeader;

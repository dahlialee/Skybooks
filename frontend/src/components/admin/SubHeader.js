import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import {
  FaAngleDown, FaUsers, FaBox, FaClipboard, FaCartPlus,
  FaClipboardList, FaCogs, FaFileImport, FaShoppingCart,
  FaBookOpen, FaBlog, FaChartBar
} from 'react-icons/fa';

const SubHeader = () => {
  const [isQuanLyOpen, setIsQuanLyOpen] = useState(false);
  const [isGiaoDichOpen, setIsGiaoDichOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const giaoDichDropdownRef = useRef(null);

  // Thêm state để lưu vai trò của người dùng
  const [userRole, setUserRole] = useState(null);

  const toggleQuanLy = () => setIsQuanLyOpen(!isQuanLyOpen);
  const closeDropdown = () => setIsQuanLyOpen(false);
  const toggleGiaoDich = () => setIsGiaoDichOpen(!isGiaoDichOpen);
  const closeGiaoDichDropdown = () => setIsGiaoDichOpen(false);

  useEffect(() => {
    // Lấy vai trò người dùng từ session hoặc localStorage
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuanLyOpen(false);
      }
      if (giaoDichDropdownRef.current && !giaoDichDropdownRef.current.contains(event.target)) {
        setIsGiaoDichOpen(false);
      }
    };
    if (isQuanLyOpen || isGiaoDichOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isQuanLyOpen, isGiaoDichOpen]);

  // Hàm kiểm tra và vô hiệu hóa nút
  const isButtonDisabled = (buttonName) => {
    if (userRole === 'quản lý') return false; // Quản lý được phép tất cả
    
    // Danh sách các nút bị vô hiệu hóa cho nhân viên
    const disabledButtons = ['Nhân viên', 'Thống kê'];
    return disabledButtons.includes(buttonName);
  };

  return (
      <div className="flex justify-between items-center bg-blue-100 px-5 h-12 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className={`flex items-center text-sm text-gray-800 cursor-pointer px-3 py-1.5 rounded hover:bg-blue-200 ${
              isButtonDisabled('Thống kê') ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            } ${
              location.pathname === "/admin/dashboard" ? "bg-blue-100 font-semibold text-blue-600" : ""
            }`}
          >
            <FaChartBar className="mr-2" />
            <span>Thống kê</span>
          </Link>

          <div className="relative" ref={giaoDichDropdownRef}>
            <div
              onClick={toggleGiaoDich}
              className="flex items-center text-sm text-gray-800 cursor-pointer px-3 py-1.5 rounded hover:bg-blue-200"
            >
              <FaCartPlus className="mr-1" />
              <span>Giao dịch</span>
              <FaAngleDown className="ml-1" />
            </div>
            {isGiaoDichOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-md rounded-lg z-10 w-48 flex flex-col py-2">
                <Link
                  to="/admin/purchasereceipt"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/purchasereceipt" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeGiaoDichDropdown}
                >
                  <FaFileImport className="mr-2" /> Phiếu nhập xuất
                </Link>
                <Link
                  to="/admin/order"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/order" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeGiaoDichDropdown}
                >
                  <FaShoppingCart className="mr-2" /> Đơn hàng
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={toggleQuanLy}
              className="flex items-center text-sm text-gray-800 cursor-pointer px-3 py-1.5 rounded hover:bg-blue-200"
            >
              <FaCogs className="mr-1" />
              <span>Quản lý</span>
              <FaAngleDown className="ml-1" />
            </div>
            {isQuanLyOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-md rounded-lg z-10 w-48 flex flex-col py-2">
                <Link
                  to="/admin/employee"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/employee" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  } ${isButtonDisabled('Nhân viên') ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                  onClick={closeDropdown}
                >
                  <FaUsers className="mr-2" /> Nhân viên
                </Link>
                <Link
                  to="/admin/customer"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/customer" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeDropdown}
                >
                  <FaUsers className="mr-2" /> Khách hàng
                </Link>
                <Link
                  to="/admin/categoryProduct"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/categoryProduct" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeDropdown}
                >
                  <FaClipboardList className="mr-2" /> Danh mục sản phẩm
                </Link>
                <Link
                  to="/admin/product"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/product" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeDropdown}
                >
                  <FaBox className="mr-2" /> Sản phẩm
                </Link>
                <Link
                  to="/admin/publisher"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/publisher" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeDropdown}
                >
                  <FaBookOpen className="mr-2" /> Nhà xuất bản
                </Link>
                <Link
                  to="/admin/news"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname === "/admin/news" ? "bg-blue-100 font-semibold text-blue-600" : ""
                  }`}
                  onClick={closeDropdown}
                >
                  <FaBlog className="mr-2" /> Tin tức
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <Link
            to="/admin/offlinesale"
            className="flex items-center bg-blue-600 text-white px-4 py-1.5 rounded text-sm cursor-pointer hover:bg-blue-700"
          >
            <FaCartPlus className="mr-2" />
            <span>Bán hàng</span>
          </Link>
        </div>
      </div>
  );
};

export default SubHeader;

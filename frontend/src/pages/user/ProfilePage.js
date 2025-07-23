import React, { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils";

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  console.log('user', user)
  const navigate = useNavigate();

  // Hàm làm sạch và hiển thị giá trị
  const safeDisplay = (value) => {
    if (!value) return "-";
    
    // Loại bỏ các ký tự escape không mong muốn
    return typeof value === 'string' 
      ? value.replace(/\\/g, '').trim() 
      : value;
  };

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg">Bạn chưa đăng nhập.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Thông tin tài khoản</h1>

      <div className="space-y-4 text-gray-700">
        <div>
          <strong>Họ tên:</strong> {safeDisplay(user.name)}
        </div>
        <div>
          <strong>Email:</strong> {safeDisplay(user.email)}
        </div>
        <div>
          <strong>Số điện thoại:</strong> {safeDisplay(user.phone)}
        </div>
        <div>
          <strong>Địa chỉ:</strong> {safeDisplay(user.address)}
        </div>
        <div>
          <strong>Giới tính:</strong> {safeDisplay(user.gender)}
        </div>
        <div>
          <strong>Ngày sinh:</strong> {user.date_of_birth 
            ? safeDisplay(formatDate(user.date_of_birth)) 
            : "-"}
        </div>
      </div>

      <div className="mt-8 flex space-x-4">
        <button
          onClick={() => navigate("/profile/edit")}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sửa thông tin
        </button>
        <button
          onClick={() => navigate("/profile/change-password")}
          className="bg-gray-300 text-gray-800 px-5 py-2 rounded-md hover:bg-gray-400 transition"
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

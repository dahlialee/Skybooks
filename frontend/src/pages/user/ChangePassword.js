import React, { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios"; // hoặc bạn có thể tạo api riêng
import { useNavigate } from "react-router-dom";

const ChangePasswordPage = () => {
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  if (!user) {
    return <p className="text-center mt-10">Bạn chưa đăng nhập.</p>;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      // Gửi API đổi mật khẩu
      // Giả sử API của bạn có endpoint:
      // PUT http://localhost:1906/api/customer/change-password/:id
      // body: { currentPassword, newPassword }

      await axios.put(
        `http://localhost:1906/api/customer/change-password/${user.id}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      logoutUser();
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu."
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Đổi mật khẩu</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Đổi mật khẩu
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;

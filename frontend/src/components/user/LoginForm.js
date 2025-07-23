import React, { useState } from "react";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center z-50"
      style={{
        background: `
          radial-gradient(
            ellipse at left center,
            rgba(181, 221, 240, 0.8),
            transparent 70%
          ),
          radial-gradient(
            ellipse at right center,
            rgba(181, 221, 240, 0.8),
            transparent 70%
          ),
          #ffffff
        `,
        paddingTop: "120px",
        overflow: "hidden",
      }}
    >
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md h-fit self-start">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Đăng nhập Skybooks
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition"
          >
            Đăng nhập
          </button>

          <p className="text-center text-sm mt-4 text-gray-600">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/customerAPI";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "Nam",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const newCustomer = await register(formData);
      console.log("formData", formData);
      console.log("newCustomer", newCustomer);
      setMessage("Đăng ký thành công!");
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi đăng ký";
      setMessage(msg);
    }
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
        paddingTop: "80px",
        overflow: "hidden",
      }}
    >
      <div
        className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-xl absolute">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Đăng ký tài khoản
        </h2>
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Họ tên"
            value={formData.name}
            onChange={handleChange}
            required
            className="col-span-2 p-3 border rounded-xl"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="col-span-1 p-3 border rounded-xl"
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            required
            className="col-span-1 p-3 border rounded-xl"
          />
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={formData.address}
            onChange={handleChange}
            required
            className="col-span-2 p-3 border rounded-xl"
          />
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="col-span-1 p-3 border rounded-xl"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="col-span-1 p-3 border rounded-xl"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            required
            className="col-span-1 p-3 border rounded-xl"
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
            className="col-span-1 p-3 border rounded-xl"
          />
          <button
            type="submit"
            className="col-span-2 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition"
          >
            Đăng ký
          </button>
          <p className="col-span-2 text-center text-sm mt-2 text-gray-600">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

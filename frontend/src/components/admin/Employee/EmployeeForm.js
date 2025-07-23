import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

function EmployeeForm({ onSubmit, editData, onCancel, isOpen, existingEmails = [], existingUsernames = [], existingPhones = [] }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("nhân viên"); // default role
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("avt.jpg");

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setUsername(editData.username || "");
      setEmail(editData.email || "");
      setPhone(editData.phone || "");
      setDob(editData.dob ? editData.dob.slice(0, 10) : ""); // format yyyy-mm-dd
      setAddress(editData.address || "");
      setRole(editData.role || "nhân viên");
      setAvatar(editData.avatar || "avt.jpg");
      setPassword(""); // không điền mật khẩu khi sửa
    } else {
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setDob("");
      setAddress("");
      setRole("nhân viên");
      setAvatar("avt.jpg");
      setPassword("");
    }
  }, [editData]);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  const isDuplicateEmail = (inputEmail) => {
    const trimmed = inputEmail.trim().toLowerCase();
    return existingEmails
      .filter((e) => !editData || e !== editData.email)
      .some((e) => e.trim().toLowerCase() === trimmed);
  };

  const isDuplicateUsername = (inputUsername) => {
    const trimmed = inputUsername.trim().toLowerCase();
    return existingUsernames
      .filter((u) => !editData || u !== editData.username)
      .some((u) => u.trim().toLowerCase() === trimmed);
  };

  const isDuplicatePhone = (inputPhone) => {
    const trimmed = inputPhone.trim();
    return existingPhones
      .filter((p) => !editData || p !== editData.phone)
      .some((p) => p.trim() === trimmed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning("Tên nhân viên không được để trống.");
      return;
    }
    if (!username.trim()) {
      toast.warning("Tên đăng nhập không được để trống.");
      return;
    }
    if (isDuplicateUsername(username)) {
      toast.warning("Tên đăng nhập đã tồn tại.");
      return;
    }
    if (!email.trim()) {
      toast.warning("Email không được để trống.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.warning("Email không hợp lệ.");
      return;
    }
    if (isDuplicateEmail(email)) {
      toast.warning("Email đã tồn tại.");
      return;
    }
    if (!phone.trim()) {
      toast.warning("Số điện thoại không được để trống.");
      return;
    }
    if (isDuplicatePhone(phone)) {
      toast.warning("Số điện thoại đã tồn tại.");
      return;
    }
    if (!editData && !password) {
      toast.warning("Mật khẩu không được để trống.");
      return;
    }
    if (role !== "quản lý" && role !== "nhân viên") {
      toast.warning("Vai trò không hợp lệ.");
      return;
    }

    onSubmit({ name, username, email, phone, dob, address, role, password, avatar });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-[720px]"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">
          {editData ? "Sửa nhân viên" : "Thêm nhân viên"}
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Cột 1 */}
          <div>
            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Tên nhân viên</span>
              <input
                type="text"
                value={name}
                ref={nameInputRef}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập tên nhân viên"
                autoComplete="off"
              />
            </label>

            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Số điện thoại</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Số điện thoại"
              />
            </label>

            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Địa chỉ</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Địa chỉ"
              />
            </label>

            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Ảnh đại diện (URL)</span>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="URL ảnh đại diện"
              />
            </label>
          </div>

          {/* Cột 2 */}
          <div>
            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Tên đăng nhập</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Tên đăng nhập"
                autoComplete="off"
              />
            </label>

            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Email"
                autoComplete="off"
              />
            </label>

            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Ngày sinh</span>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>

            {!editData && (
              <label className="block mb-4">
                <span className="block mb-1 font-medium text-gray-700">Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Mật khẩu"
                  autoComplete="new-password"
                />
              </label>
            )}

            <label className="block mb-6">
              <span className="block mb-1 font-medium text-gray-700">Vai trò</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="quản lý">Quản lý</option>
                <option value="nhân viên">Nhân viên</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;

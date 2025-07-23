import React, { useState, useEffect, useRef } from "react";

function CustomerForm({ editData, onSubmit, onCancel, isOpen, existingCustomers }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Nam");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);

  const usernameRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setEmail(editData.email || "");
      setPhone(editData.phone || "");
      setAddress(editData.address || "");
      setDateOfBirth(editData.date_of_birth ? editData.date_of_birth.slice(0, 10) : "");
      setGender(editData.gender || "Nam");
      setUsername(editData.username || "");
      setIsDeleted(editData.isDeleted || false);
      setPassword(""); // Reset password for editing
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setDateOfBirth("");
      setGender("Nam");
      setUsername("");
      setIsDeleted(false);
      setPassword("");
    }
  }, [editData]);

  useEffect(() => {
    if (isOpen && usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Tên không được để trống");
    if (!email.trim()) return alert("Email không được để trống");
    if (!phone.trim()) return alert("Số điện thoại không được để trống");
    if (!address.trim()) return alert("Địa chỉ không được để trống");
    if (!gender) return alert("Vui lòng chọn giới tính");
    if (!username.trim()) return alert("Tên đăng nhập không được để trống");
    if (!editData && !password.trim()) return alert("Mật khẩu không được để trống");

    // Bạn có thể thêm check trùng email, phone, username tương tự như trước

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      date_of_birth: dateOfBirth,
      gender,
      username: username.trim(),
      password: password.trim(),
      isDeleted,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-[600px]">
        <h2 className="text-center text-xl mb-6">{editData ? "Sửa khách hàng" : "Thêm khách hàng"}</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Cột trái */}
          <div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Tên khách hàng"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Số điện thoại"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Địa chỉ"
              />
            </div>
          </div>

          {/* Cột phải */}
          <div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Ngày sinh</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Tên đăng nhập</label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Tên đăng nhập"
                disabled={!!editData} // Khóa không cho sửa username khi edit
              />
            </div>

            {!editData && (
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Mật khẩu</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Mật khẩu"
                />
              </div>
            )}

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={isDeleted}
                onChange={(e) => setIsDeleted(e.target.checked)}
                id="isDeleted"
                className="mr-2"
              />
              <label htmlFor="isDeleted">Đã xoá</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editData ? "Lưu" : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

function PublisherForm({ onSubmit, editData, onCancel, isOpen, existingEmails = [], existingUsernames = [], existingPhones = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");


  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setEmail(editData.email || "");
      setPhone(editData.phone || "");
      setAddress(editData.address || "");
      setWebsite(editData.website || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setWebsite("");
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

  const isDuplicatePhone = (inputPhone) => {
    const trimmed = inputPhone.trim();
    return existingPhones
      .filter((p) => !editData || p !== editData.phone)
      .some((p) => p.trim() === trimmed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning("Tên nhà xuất bản không được để trống.");
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

    onSubmit({ name, email, phone, address, website });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-[720px]"
      >
        <h2 className="text-xl font-semibold mb-6 text-center">
          {editData ? "Sửa nhà xuất bản" : "Thêm nhà xuất bản"}
        </h2>


          <div>
            <label className="block mb-4">
              <span className="block mb-1 font-medium text-gray-700">Tên nhà xuất bản</span>
              <input
                type="text"
                value={name}
                ref={nameInputRef}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập tên nhà xuất bản"
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
              <span className="block mb-1 font-medium text-gray-700">Email</span>
              <input
                type="tel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Email"
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
              <span className="block mb-1 font-medium text-gray-700">Website</span>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Website"
              />
            </label>
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

export default PublisherForm;

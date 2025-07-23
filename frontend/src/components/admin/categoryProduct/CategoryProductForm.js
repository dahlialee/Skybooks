import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

function CategoryProductForm({ onSubmit, editData, onCancel, isOpen, existingNames = [] }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      setName(editData.category_name || "");
      setDesc(editData.description || "");
    } else {
      setName("");
      setDesc("");
    }
  }, [editData]);

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  const isDuplicate = (inputName) => {
    const trimmed = inputName.trim().toLowerCase();
    return existingNames
      .filter((n) => !editData || n !== editData.category_name) // loại trừ tên hiện tại khi chỉnh sửa
      .some((n) => n.trim().toLowerCase() === trimmed);
  };

  const handleSubmit = (e, keepOpen = false) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.warning("Tên danh mục không được để trống.");
      return;
    }

    if (isDuplicate(trimmedName)) {
      toast.error("Tên danh mục đã tồn tại.");
      return;
    }

    onSubmit({ category_name: trimmedName, description: desc.trim() });
    toast.success(editData ? "Cập nhật thành công" : "Thêm thành công");

    if (!keepOpen) {
      onCancel();
    }

    if (!editData) {
      setName("");
      setDesc("");
      if (nameInputRef.current) nameInputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
          onClick={onCancel}
        >
          &times;
        </button>

        <h2 className="mb-4 text-xl font-bold">
          {editData ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        </h2>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <input
            type="text"
            placeholder="Tên danh mục"
            value={name}
            ref={nameInputRef}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 mb-3 border border-gray-300 rounded-md"
          />

          <textarea
            placeholder="Mô tả"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2 mb-3 border border-gray-300 rounded-md"
          />

          <div className="flex justify-end gap-3">
            {!editData && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}  // Giữ form mở sau khi thêm
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Thêm tiếp
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editData ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryProductForm;

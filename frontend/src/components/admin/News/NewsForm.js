import React, { useState, useEffect } from "react";

function NewsForm({ isOpen, onSubmit, onCancel, editData, employeeList = [] }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("Bản nháp");
  const [scheduledDate, setScheduledDate] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setTitle(editData?.title || "");
    setContent(editData?.content || "");
    setEmployeeId(editData?.employee_id?._id || "");
    setStatus(editData?.status || "Bản nháp");
    setScheduledDate(editData?.scheduled_date?.slice(0, 10) || null);
    setImage(editData?.image || "");
    setImageFile(null); // không prefill ảnh
  }, [editData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      content,
      employee_id: employeeId,
      status,
      image: image,
      scheduled_date: scheduledDate,
      imageFile,
    };

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-lg space-y-4"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-semibold mb-4">{editData ? "Sửa Tin Tức" : "Thêm Tin Tức"}</h2>

        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-medium mb-1">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Nội dung */}
        <div>
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full border rounded-md px-3 py-2 resize-none"
          />
        </div>

        {/* Ảnh */}
        <div>
          <label className="block text-sm font-medium mb-1">Hình ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {image && (
              <img
                src={editData && !imageFile ? `/image/${image}` : URL.createObjectURL(imageFile)}
                alt="Ảnh tin tức"
                className="mt-2 w-32 h-44 object-cover border"
              />
            )}
        </div>

        {/* Nhân viên đăng bài */}
        <div>
          <label className="block text-sm font-medium mb-1">Nhân viên đăng bài</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">-- Chọn nhân viên --</option>
            {employeeList.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="Bản nháp">Bản nháp</option>
            <option value="Đã đăng">Đã đăng</option>
            <option value="Đã lên lịch">Đã lên lịch</option>
          </select>
        </div>

        {/* Ngày lên lịch (chỉ hiển thị nếu status là "Đã lên lịch") */}
        {status === "Đã lên lịch" && (
          <div>
            <label className="block text-sm font-medium mb-1">Ngày lên lịch</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewsForm;

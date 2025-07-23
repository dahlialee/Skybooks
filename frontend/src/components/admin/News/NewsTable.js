import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function NewsTable({ data, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const renderStatus = (status) => {
    const statusConfig = {
      'Đã đăng': { color: 'bg-green-100 text-green-800', text: 'Đã đăng' },
      'Đã lên lịch': { color: 'bg-blue-100 text-blue-800', text: 'Đã lên lịch' },
      'Bản nháp': { color: 'bg-gray-100 text-gray-800', text: 'Bản nháp' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="w-12 px-4 py-2 text-left border-b">#</th>
              <th className="w-48 px-4 py-2 text-left border-b">Tiêu đề</th>
              <th className="w-64 px-4 py-2 text-left border-b">Nội dung</th>
              <th className="w-40 px-4 py-2 text-center border-b">Ảnh</th>
              <th className="w-36 px-4 py-2 text-left border-b">Trạng thái</th>
              <th className="w-36 px-4 py-2 text-left border-b">Người đăng</th>
              <th className="w-40 px-4 py-2 text-left border-b">Ngày lên lịch</th>
              <th className="w-32 px-4 py-2 text-left border-b">Ngày đăng</th>
              <th className="w-20 px-4 py-2 text-center border-b">Lượt xem</th>
              <th className="w-20 px-4 py-2 text-center border-b">Phản ứng</th>
              <th className="w-24 px-4 py-2 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500 italic">
                  Không có tin tức nào.
                </td>
              </tr>
            ) : (
              data.map((news, index) => (
                <tr key={news._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2 truncate" title={news.title}>{news.title}</td>
                  <td className="px-4 py-2 truncate" title={news.content}>
                    {news.content.length > 60 ? news.content.slice(0, 60) + "..." : news.content}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {news.image ? (
                      <img
                        src={`/image/${news.image}`}
                        alt={news.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 text-gray-400 text-xs flex items-center justify-center rounded">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">{renderStatus(news.status)}</td>
                  <td className="px-4 py-2">{news.employee_id?.name || "-"}</td>
                  <td className="px-4 py-2">
                    {news.scheduled_date ? formatDate(news.scheduled_date) : "-"}
                  </td>
                  <td className="px-4 py-2">{formatDate(news.publish_date || news.createdAt)}</td>
                  <td className="px-4 py-2 text-center">{news.views || 0}</td>
                  <td className="px-4 py-2 text-center">{news.reacts || 0}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-3 text-lg">
                      <button
                        onClick={() => onEdit(news)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(news._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Xoá"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NewsTable;

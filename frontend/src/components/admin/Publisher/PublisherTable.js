import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function PublisherTable({ data, onEdit, onDelete }) {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="w-10 px-4 py-2 text-left border-b">#</th>
              <th className="w-40 px-4 py-2 text-left border-b">Tên nhà xuất bản</th>
              <th className="w-52 px-4 py-2 text-left border-b">Email</th>
              <th className="w-36 px-4 py-2 text-left border-b">Số điện thoại</th>
              <th className="w-40 px-4 py-2 text-left border-b">Địa chỉ</th>
              <th className="w-40 px-4 py-2 text-left border-b">Website</th>
              <th className="w-28 px-4 py-2 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              data.map((pub, index) => (
                <tr key={pub._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2">{pub.name}</td>
                  <td className="px-4 py-2">{pub.email}</td>
                  <td className="px-4 py-2">{pub.phone}</td>
                  <td className="px-4 py-2">{pub.address}</td>
                  <td className="px-4 py-2">{pub.website}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-3 text-lg">
                      <button
                        onClick={() => onEdit(pub)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(pub._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Xóa"
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

export default PublisherTable;

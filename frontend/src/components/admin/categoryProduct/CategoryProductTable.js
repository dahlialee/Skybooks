import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

function CategoryProductTable({ data, onEdit, onDelete }) {
  return (
    <div className="border border-gray-300 rounded-md">
      <div className="overflow-auto">
        {/* Table header */}
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="px-4 py-2 w-10 text-left border-b">#</th>
              <th className="px-4 py-2 w-1/4 text-center border-b">Tên danh mục</th>
              <th className="px-4 py-2 w-1/3 text-left border-b">Mô tả</th>
              <th className="px-4 py-2 w-1/4 text-center border-b">Số sản phẩm</th>
              <th className="px-4 py-2 w-48 text-center border-b">Hành động</th>
            </tr>
          </thead>
        </table>
        {/* Scrollable body */}
        <div style={{ maxHeight: "384px", overflowY: "auto" }}>
          <table className="min-w-full table-fixed text-sm overflow-y-auto">
            <tbody className="block max-h-[200px] overflow-y-auto">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                data.map((cat, index) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 w-10 border-t text-center">{index + 1}</td>
                    <td className="px-4 py-2 w-1/4 border-t text-center">{cat.category_name}</td>
                    <td className="px-4 py-2 w-1/3 border-t">{cat.description}</td>
                    <td className="px-4 py-2 w-1/4 border-t text-center">
                      {cat.product_count}
                    </td>
                    <td className="px-4 py-2 w-48 border-t text-center">
                      <div className="flex justify-center gap-3 text-lg">
                        <button
                          onClick={() => onEdit(cat)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onDelete(cat._id)}
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
    </div>
  );
}

export default CategoryProductTable;

import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

function ProductTable({ data, onEdit, onDelete, onView }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="w-20 px-4 py-2 text-left border-b">#</th>
              <th className="w-20 px-4 py-2 text-left border-b">Mã SP</th>
              <th className="w-20 px-4 py-2 text-center border-b">Ảnh</th>
              <th className="w-48 px-4 py-2 text-left border-b">Tên sách</th>
              <th className="w-36 px-4 py-2 text-left border-b">Tác giả</th>
              <th className="w-32 px-4 py-2 text-left border-b">Danh mục</th>
              <th className="w-36 px-4 py-2 text-left border-b">Nhà XB</th>
              <th className="w-40 px-4 py-2 text-left border-b">KM (%)</th>
              <th className="w-24 px-4 py-2 text-right border-b">Giá</th>
              <th className="w-24 px-4 py-2 text-center border-b">Tồn kho</th>
              <th className="w-32 px-4 py-2 text-left border-b">Ngày tạo</th>
              <th className="w-32 px-4 py-2 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500 italic">
                  Không có sản phẩm nào.
                </td>
              </tr>
            ) : (
              data.map((product, index) => (
                <tr key={product._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2">{product.barcode}</td>
                  <td className="px-4 py-2 text-center">
                    {product.cover_image ? (
                      <img
                        src={`/image/${product.cover_image}`}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 text-gray-400 text-xs flex items-center justify-center rounded">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">{product.title}</td>
                  <td className="px-4 py-2">{product.author}</td>
                  <td className="px-4 py-2">{product.category_id?.category_name || "-"}</td>
                  <td className="px-4 py-2">{product.publisher_id?.name || "-"}</td>
                  <td className="px-4 py-2">
                    {product.discount_category_id
                      ? `${product.discount_category.name} (${product.discount_category.discount_percentage}%)`
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {typeof product.price === "number"
                      ? product.price.toLocaleString("vi-VN") + "₫"
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">{product.stock_quantity}</td>
                  <td className="px-4 py-2">{formatDate(product.createdAt)}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-3 text-lg">
                      <button
                        onClick={() => onView(product)}
                        className="text-green-600 hover:text-green-800"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
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

export default ProductTable;

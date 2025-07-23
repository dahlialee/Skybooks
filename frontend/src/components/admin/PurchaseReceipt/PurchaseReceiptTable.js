import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { formatCurrency, formatDate } from "../../../utils";

function PurchaseReceiptTable({ data, onEdit, onDelete, onDetail }) {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="w-20 px-4 py-2 text-left border-b">#</th>
              <th className="w-40 px-4 py-2 text-left border-b">Mã Phiếu</th>
              <th className="w-40 px-4 py-2 text-left border-b">Nhà Xuất Bản</th>
              <th className="w-36 px-4 py-2 text-left border-b">Ngày Nhập</th>
              <th className="w-36 px-4 py-2 text-right border-b">Tổng Giá Trị</th>
              <th className="w-36 px-4 py-2 text-left border-b">Trạng Thái</th>
              <th className="w-28 px-4 py-2 text-center border-b">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((receipt, index) => (
              console.log('receipt', receipt),
              <tr 
                key={receipt._id} 
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-4 py-3 border-b">{index + 1}</td>
                <td className="px-4 py-3 border-b font-medium">
                  {receipt.receiptCode}
                </td>
                <td className="px-4 py-3 border-b">
                  {receipt.publisherName || 'Không xác định'}
                </td>
                <td className="px-4 py-3 border-b">
                  {formatDate(receipt.receiptDate)}
                </td>
                <td className="px-4 py-3 border-b text-right">
                  {formatCurrency(receipt.totalValue)}
                </td>
                <td className="px-4 py-3 border-b">
                  <span 
                    className={`
                      px-2 py-1 rounded-full text-xs font-semibold
                      ${receipt.status === 'Mới' ? 'bg-blue-100 text-blue-800' : 
                        receipt.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}
                    `}
                  >
                    {receipt.status}
                  </span>
                </td>
                <td className="px-4 py-3 border-b text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <button 
                      onClick={() => onDetail(receipt)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => onEdit(receipt)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => onDelete(receipt._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            Không có phiếu nhập nào
          </div>
        )}
      </div>
    </div>
  );
}

export default PurchaseReceiptTable; 
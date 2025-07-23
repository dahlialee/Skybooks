import React, { useState, useEffect } from "react";
import { fetchInvoiceById } from "../../../services/invoiceAPI";

function OrderForm({ 
  isOpen, 
  onSubmit, 
  onCancel, 
  editData,
  mode = "edit",
  customerList = [],
  productList = []
}) {
  const [status, setStatus] = useState({
    payment_status: "Chưa thanh toán",
    shipping_status: "Chưa xử lý"
  });
  const [fullOrderDetails, setFullOrderDetails] = useState(null);
  const [isEditable, setIsEditable] = useState(mode !== "view");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsEditable(mode !== "view");

    // Nếu ở chế độ xem và có ID đơn hàng, lấy chi tiết
    const fetchOrderDetails = async () => {
      if (mode === "view" && editData?._id) {
        try {
          setIsLoading(true);
          const response = await fetchInvoiceById(editData._id);
          console.log('Chi tiết đơn hàng:', response.data);
          
          // Log chi tiết sản phẩm
          if (response.data.details) {
            response.data.details.forEach((item, index) => {
              console.log(`Sản phẩm ${index + 1}:`, item);
              console.log('Chi tiết sản phẩm:', item.product_id);
            });
          }
          
          setFullOrderDetails(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrderDetails();

    if (editData) {
      setStatus({
        payment_status: editData.payment_status || "Chưa thanh toán",
        shipping_status: editData.shipping_status || "Chưa xử lý"
      });
    }
  }, [editData, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditable) return;

    const data = {
      payment_status: status.payment_status,
      shipping_status: status.shipping_status
    };

    onSubmit(data);
  };

  const handleToggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isOpen) return null;

  // Chọn dữ liệu để hiển thị (ưu tiên fullOrderDetails)
  const displayData = fullOrderDetails || editData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      {isLoading ? (
        <div className="bg-white p-6 rounded-2xl">Đang tải...</div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl w-full max-w-4xl shadow-lg space-y-4 max-h-[90vh] flex flex-col overflow-y-auto"
        >
          {/* Tiêu đề form */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              {mode === "create" ? "Tạo đơn hàng mới" : 
               mode === "view" ? "Chi tiết đơn hàng" : 
               "Cập nhật trạng thái đơn hàng"}
            </h2>
            {mode === "view" && (
              <button 
                type="button"
                onClick={handleToggleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditable ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            )}
          </div>

          {/* Trạng thái thanh toán */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái thanh toán
              </label>
              <div className="relative">
                <select
                  value={status.payment_status}
                  onChange={(e) => 
                    setStatus(prev => ({...prev, payment_status: e.target.value}))
                  }
                  disabled={!isEditable}
                  className={`
                    w-full px-3 py-2 border rounded-lg 
                    ${isEditable 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400' 
                      : 'bg-gray-100 cursor-not-allowed'}
                    appearance-none pr-8
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <option value="Chưa thanh toán" className="bg-white text-gray-800">
                    Chưa thanh toán
                  </option>
                  <option value="Đã thanh toán" className="bg-white text-green-700">
                    Đã thanh toán
                  </option>
                  <option value="Đang chờ thanh toán" className="bg-white text-yellow-700">
                    Đang chờ thanh toán
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái vận chuyển
              </label>
              <div className="relative">
                <select
                  value={status.shipping_status}
                  onChange={(e) => 
                    setStatus(prev => ({...prev, shipping_status: e.target.value}))
                  }
                  disabled={!isEditable}
                  className={`
                    w-full px-3 py-2 border rounded-lg 
                    ${isEditable 
                      ? 'border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400' 
                      : 'bg-gray-100 cursor-not-allowed'}
                    appearance-none pr-8
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <option value="Chưa xử lý" className="bg-white text-gray-800">
                    Chưa xử lý
                  </option>
                  <option value="Đang chuẩn bị" className="bg-white text-yellow-700">
                    Đang chuẩn bị
                  </option>
                  <option value="Đang giao" className="bg-white text-blue-700">
                    Đang giao
                  </option>
                  <option value="Đã giao" className="bg-white text-green-700">
                    Đã giao
                  </option>
                  <option value="Đã hủy" className="bg-white text-red-700">
                    Đã hủy
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Danh sách sản phẩm</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Ảnh</th>
                  <th className="border px-2 py-1">Mã SP</th>
                  <th className="border px-2 py-1">Tên sản phẩm</th>
                  <th className="border px-2 py-1">Số lượng</th>
                  <th className="border px-2 py-1">Đơn giá</th>
                  <th className="border px-2 py-1">Giảm giá</th>
                  <th className="border px-2 py-1">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {displayData?.details?.map((item, index) => {
                  // Log thông tin chi tiết từng sản phẩm
                  console.log(`Chi tiết sản phẩm ${index + 1}:`, item);
                  console.log('Product ID object:', item.product_id);
                  console.log('Cover image:', item.product_id?.cover_image);
                  
                  return (
                    <tr key={index}>
                      <td className="border px-2 py-1 text-center">
                        {item.product_id?.cover_image ? (
                          <img 
                            src={`/image/${item.product_id.cover_image}`} 
                            alt={item.title || item.product_id?.title || 'Sản phẩm'} 
                            className="w-16 h-20 object-cover mx-auto rounded"
                            onError={(e) => {
                              console.log('Lỗi tải ảnh:', e.target.src);
                              e.target.onerror = null;
                              e.target.src = '/image/default-cover.png';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gray-200 flex items-center justify-center text-xs text-center rounded">
                            <div>
                              <div className="text-gray-500">Không có</div>
                              <div className="text-gray-500">ảnh</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="border px-2 py-1 text-center">
                        {item.product_id?.barcode || item.barcode || "-"}
                      </td>
                      <td className="border px-2 py-1">
                        {item.title || item.product_id?.title || "Sản phẩm không xác định"}
                      </td>
                      <td className="border px-2 py-1 text-center">{item.quantity}</td>
                      <td className="border px-2 py-1 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {formatCurrency(item.discount)}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <p><strong>Tên:</strong> {displayData?.customer_id?.name || "-"}</p>
                <p><strong>Email:</strong> {displayData?.customer_id?.email || "-"}</p>
              </div>
            </div>

            {/* Thông tin vận chuyển */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin vận chuyển</h3>
              <div className="space-y-2">
                <p><strong>Tên:</strong> {displayData?.shipping_info?.fullName || "-"}</p>
                <p><strong>Điện thoại:</strong> {displayData?.shipping_info?.phone || "-"}</p>
                <p><strong>Địa chỉ:</strong> {displayData?.shipping_info?.address || "-"}</p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán và vận chuyển */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin thanh toán</h3>
              <div className="space-y-2">
                <p><strong>Phương thức:</strong> {displayData?.payment_method || "-"}</p>
                <p><strong>Trạng thái:</strong> {displayData?.payment_status || "-"}</p>
                <p><strong>Tổng tiền:</strong> {formatCurrency(displayData?.total_amount)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin vận chuyển</h3>
              <div className="space-y-2">
                <p><strong>Trạng thái:</strong> {displayData?.shipping_status || "-"}</p>
                <p><strong>Ngày đặt hàng:</strong> {formatDate(displayData?.invoice_date)}</p>
                <p><strong>Loại đơn:</strong> {displayData?.invoice_type || "-"}</p>
              </div>
            </div>
          </div>

          {/* Nút điều khiển */}
          <div className="flex justify-end space-x-3 mt-6">
            {mode !== "view" && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Lưu thay đổi
              </button>
            )}
            {mode === "view" && isEditable && (
              <button
                type="button"
                onClick={handleToggleEdit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

OrderForm.defaultProps = {
  mode: "edit",
  customerList: [],
  productList: []
};

export default OrderForm;

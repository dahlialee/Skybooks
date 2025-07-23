import React from "react";
import { FaEdit, FaTrash, FaEye, FaPrint } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function OrderTable({ data, onEdit, onView, onPrint }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  // Hàm in hóa đơn PDF
  const handlePrintInvoice = async (invoice) => {
    // Tạo một phần tử div tạm để chứa nội dung in
    const printElement = document.createElement('div');
    printElement.innerHTML = `
      <div style="font-family: Arial, sans-serif; width: 100%; margin: 0 auto; padding: 10px; font-size: 12px;">
        <!-- PHẦN 1: Thông tin cửa hàng và mã đơn hàng -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="width: 50%; display: flex; align-items: left;">
            <img src="/image/icon/logo.ico" alt="SkyBooks" style="height: 50px; margin-right: 10px;">
            <div>
              <h1 style="font-size: 16px; margin: 0; color: #333;">SKYBOOKS</h1>
              <p style="margin: 0; font-size: 10px;">Cửa hàng Văn hóa Đọc</p>
              <p style="margin: 0; font-size: 10px;">Số 87/59, Yên Xá, Thanh Trì, Thanh Xuân, Hà Nội</p>
              <p style="margin: 0; font-size: 10px;">ĐT: 0376390962</p>
            </div>
          </div>
          <div style="width: 50%; text-align: right;">
            <h2 style="font-size: 16px; margin: 0 0 10px 0; color: #333;">HÓA ĐƠN</h2>
            <p style="margin: 5px 0; font-size: 12px;"><strong>Số HĐ:</strong> ${invoice._id}</p>
            <p style="margin: 5px 0; font-size: 12px;"><strong>Ngày đặt:</strong> ${formatDate(invoice.invoice_date)}</p>
          </div>
        </div>

        <!-- PHẦN 2: Thông tin khách hàng -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background-color: #f9f9f9; padding: 10px;">
          <div style="width: 100%;">
            <h3 style="font-size: 14px; margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">THÔNG TIN KHÁCH HÀNG</h3>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Họ tên:</strong> ${invoice.customer_id?.name || invoice.shipping_info.fullName || '-'}</p>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Địa chỉ:</strong> ${invoice.shipping_info.address || '-'}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>Điện thoại:</strong> ${invoice.shipping_info.phone || '-'}</p>
                <p style="margin: 5px 0; font-size: 12px;"><strong>Email:</strong> ${invoice.shipping_info.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PHẦN 3: Thông tin sản phẩm -->
        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">TÊN SẢN PHẨM</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 10%;">SL</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right; width: 20%;">ĐƠN GIÁ</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right; width: 20%;">THÀNH TIỀN</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.details.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.unit_price)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Tính toán tổng -->
          <div style="margin-top: 10px; text-align: right;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Tạm tính:</span>
              <span>${formatCurrency(invoice.total_amount - (invoice.total_amount * 0.1) - 30000)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Thuế VAT (10%):</span>
              <span>${formatCurrency(invoice.total_amount * 0.1)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Phí vận chuyển:</span>
              <span>${formatCurrency(30000)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 10px; border-top: 2px solid #333; padding-top: 10px;">
              <span>TỔNG THANH TOÁN:</span>
              <span>${formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        <!-- PHẦN 4: Footer -->
        <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-style: italic; font-size: 10px; color: #666;">
          Cảm ơn bạn đã chọn mua sản phẩm của Skybooks!
        </div>
      </div>
    `;

    // Thêm phần tử vào body để có thể chuyển đổi
    document.body.appendChild(printElement);

    try {
      // Chuyển đổi HTML sang canvas
      const canvas = await html2canvas(printElement, { 
        scale: 2,
        useCORS: true,
      });

      // Tạo PDF với lề 1cm
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [100, 250],  // Chiều rộng 100mm, chiều cao 250mm
        putOnlyUsedFonts: true,
        compress: true
      });

      // Cài đặt lề 1cm (10mm)
      pdf.internal.pageSize.width = 100;  
      pdf.internal.pageSize.height = 250; 
      pdf.internal.pageSize.getWidth = () => 100;
      pdf.internal.pageSize.getHeight = () => 250;

      const imgWidth = 80; // Trừ 2 * 10mm lề
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const image = canvas.toDataURL('image/png');

      // Thêm hình ảnh vào PDF, với lề 10mm
      pdf.addImage(image, 'PNG', 10, 10, imgWidth, imgHeight, '', 'FAST');

      // Lưu PDF
      pdf.save(`Hoa_don_${invoice._id}.pdf`);
    } catch (error) {
      console.error('Lỗi khi in hóa đơn:', error);
      alert('Không thể in hóa đơn. Vui lòng thử lại.');
    } finally {
      // Xóa phần tử tạm
      document.body.removeChild(printElement);
    }
  };

  // Hàm lấy thông tin sản phẩm đầu tiên
  const getFirstProductInfo = (details) => {
    if (!details || details.length === 0) return { title: "-", barcode: "-" };
    const firstProduct = details[0];
    return {
      title: firstProduct.title || "-",
      barcode: firstProduct.product_id?.barcode || "-"
    };
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100 text-gray-700 sticky top-0 z-0">
            <tr>
              <th className="w-12 px-4 py-2 text-left border-b">#</th>
              <th className="w-36 px-4 py-2 text-left border-b">Mã hoá đơn</th>
              <th className="w-36 px-4 py-2 text-left border-b">Khách hàng</th>
              <th className="w-36 px-4 py-2 text-left border-b">Ngày hoá đơn</th>
              <th className="w-36 px-4 py-2 text-right border-b">Tổng tiền</th>
              <th className="w-36 px-4 py-2 text-left border-b">Trạng thái thanh toán</th>
              <th className="w-36 px-4 py-2 text-left border-b">Trạng thái đơn hàng</th>
              <th className="w-24 px-4 py-2 text-center border-b">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500 italic">
                  Không có hoá đơn nào.
                </td>
              </tr>
            ) : (
              data.map((invoice, index) => {
                const firstProduct = getFirstProductInfo(invoice.details);
                return (
                  <tr key={invoice._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 text-center">{index + 1}</td>
                    <td className="px-4 py-2">{invoice._id}</td>
                    <td className="px-4 py-2">{invoice.customer_id?.name || invoice.shipping_info.fullName ||"-"}</td>
                    <td className="px-4 py-2">{formatDate(invoice.invoice_date)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(invoice.total_amount)}</td>
                    <td className="px-4 py-2">{invoice.payment_status}</td>
                    <td className="px-4 py-2">{invoice.shipping_status}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-3 text-lg">
                        <button
                          onClick={() => onView(invoice)}
                          className="text-green-600 hover:text-green-800"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => onEdit(invoice)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Cập nhật trạng thái"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="text-purple-600 hover:text-purple-800"
                          title="In hóa đơn"
                        >
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;

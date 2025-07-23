import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle} from 'react-icons/fa';
import { handleVNPayPaymentResult } from '../../services/vnpayAPI';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState({
    success: false,
    message: 'Đang xử lý thanh toán...',
    details: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        // Lấy các tham số từ URL
        const searchParams = new URLSearchParams(location.search || window.location.search);
        const queryParams = Object.fromEntries(searchParams);
        
        console.log('VNPay Query Params:', queryParams);

        // Gọi API xử lý kết quả thanh toán
        const result = await handleVNPayPaymentResult(queryParams);

        // Xử lý kết quả thanh toán
        if (result.status === 'Thành công') {
          setPaymentStatus({
            success: true,
            message: 'Thanh toán thành công',
            details: result.transactionInfo
          });
        } else {
          // Trạng thái thanh toán thất bại
          setPaymentStatus({
            success: false,
            message: result.message || 'Thanh toán không thành công',
            details: result.transactionInfo
          });
        }
      } catch (error) {
        // Xử lý lỗi từ API
        console.error('Lỗi xử lý kết quả thanh toán:', error);
        
        setPaymentStatus({
          success: false,
          message: error.response?.data?.message || 'Đã xảy ra lỗi trong quá trình thanh toán',
          details: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentResult();
  }, [location.search, navigate]);

  // Trạng thái loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto"></div>
          <p className="text-xl">Đang xử lý thanh toán...</p>
        </div>
      </div>
    );
  }

  // Render kết quả thanh toán
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          {paymentStatus.success ? (
            <FaCheckCircle className="mx-auto text-6xl text-green-500 mb-4" />
          ) : (
            <FaTimesCircle className="mx-auto text-6xl text-red-500 mb-4" />
          )}
          
          <h1 className={`text-3xl font-bold mb-2 ${paymentStatus.success ? 'text-green-800' : 'text-red-800'}`}>
            {paymentStatus.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
          </h1>
          
          <p className="text-gray-600 mb-4">
            {paymentStatus.message}
          </p>
        </div>

        {paymentStatus.success && paymentStatus.details && (
          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="font-semibold mb-2">Chi tiết đơn hàng</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Mã đơn hàng:</span>{' '}
                <span className="text-blue-600">{paymentStatus.details.invoiceId}</span>
              </p>
              <p>
                <span className="font-medium">Tổng tiền:</span>{' '}
                <span className="text-pink-600 font-bold">
                  {paymentStatus.details.amount.toLocaleString()}₫
                </span>
              </p>
              <p>
                <span className="font-medium">Phương thức thanh toán:</span>{' '}
                <span>VNPAY</span>
              </p>
            </div>
          </div>
        )}

        {!paymentStatus.success && paymentStatus.details && (
          <div className="bg-red-50 rounded-lg p-4">
            <h2 className="font-semibold mb-2 text-red-700">Chi tiết lỗi</h2>
            <p className="text-red-600">{paymentStatus.message}</p>
            {paymentStatus.details && (
              <p>
                <span className="font-medium">Số tiền:</span>{' '}
                <span>{paymentStatus.details.amount?.toLocaleString() || 'N/A'} VNĐ</span>
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {/* Nút về trang chủ */}
          <button 
            onClick={() => navigate('/')} 
            className={`
              px-6 py-2 text-white rounded 
              flex items-center justify-center space-x-2 
              w-1/2 
              ${paymentStatus.success ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
            `}
          >
            <span>{paymentStatus.success ? 'Về trang chủ' : 'Thử lại'}</span>
          </button>
          
          {/* Nút quản lý đơn hàng */}
          {paymentStatus.success && (
            <button 
              onClick={() => navigate('/user/orders')} 
              className="
                px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                flex items-center justify-center space-x-2 
                w-1/2
              "
            >
              <span>Quản lý đơn hàng</span>
            </button>
          )}
          
          {/* Nút quay lại thanh toán nếu thất bại */}
          {!paymentStatus.success && (
            <button 
              onClick={() => navigate('/checkout')} 
              className="
                px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                flex items-center justify-center space-x-2 
                w-1/2
              "
            >
              <span>Quay lại thanh toán</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage; 
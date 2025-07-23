import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin đơn hàng từ state
  const { orderId, totalAmount } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Cảm Ơn Bạn Đã Đặt Hàng!
        </h1>
        
        {orderId && (
          <div className="mb-4">
            <p className="text-gray-600">
              Mã Đơn Hàng: 
              <span className="font-semibold text-blue-600 ml-2">
                {orderId}
              </span>
            </p>
          </div>
        )}
        
        {totalAmount && (
          <div className="mb-6">
            <p className="text-gray-600">
              Tổng Số Tiền: 
              <span className="font-semibold text-green-600 ml-2">
                {totalAmount.toLocaleString()} VNĐ
              </span>
            </p>
          </div>
        )}
        
        <div className="text-gray-600 mb-6">
          Chúng tôi đã nhận được đơn hàng của bạn. 
          Nhân viên Skybooks sẽ liên hệ để xác nhận và giao hàng trong thời gian sớm nhất.
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/user/orders')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Xem Đơn Hàng
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage; 
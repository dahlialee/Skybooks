import axios from 'axios';
const BASE_URL = "http://localhost:1906/api/vnpay";


// Tạo đường dẫn thanh toán VNPay
export const createVNPayPayment = async (amount, orderInfo, invoiceId) => {
  try {
    const response = await axios.post(`${BASE_URL}/create-payment`, {
      amount,
      orderInfo,
      invoiceId
    });

    // Kiểm tra và xử lý phản hồi
    if (response.status !== 200) {
      throw new Error(response.data.message || 'Không thể tạo đường dẫn thanh toán');
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi tạo thanh toán VNPay:', error);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán
export const checkVNPayPaymentStatus = async (transactionRef) => {
  try {
    const response = await axios.get(`${BASE_URL}/check-payment-status`, {
      params: { transactionRef }
    });

    // Kiểm tra và xử lý phản hồi
    if (response.status !== 200) {
      throw new Error(response.data.message || 'Không thể kiểm tra trạng thái thanh toán');
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
    throw error;
  }
};

// Xử lý kết quả thanh toán VNPay
export const handleVNPayPaymentResult = async (paymentData) => {
  try {
    // Chuyển sang GET và truyền params
    const response = await axios.get(`${BASE_URL}/payment-result`, {
      params: paymentData,
    });
    console.log('response', response);
    // Kiểm tra và xử lý phản hồi
    if (response.status !== 200) {
      throw new Error(response.data.message || 'Không thể xử lý kết quả thanh toán');
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi xử lý kết quả thanh toán:', error);
    throw error;
  }
};

const vnpayConfig = require('../config/vnpay');
const Invoice = require('../model/entity/invoice.schema');
const moment = require('moment');
const querystring = require('querystring');

// Hàm sinh các tham số thanh toán
const generatePaymentParams = (options = {}) => {
  const {
    amount = 23800000,
    orderInfo = 'Thanh toán đơn hàng SkyBooks',
    returnUrl = 'http://localhost:3000/payment-result',
    txnRef = null
  } = options;

  const ipAddr = '127.0.0.1';
  const createDate = moment().format('YYYYMMDDHHmmss');
  const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

  const params = {
    vnp_Version: '2.0.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.tmnCode,
    vnp_Amount: amount,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef || moment().format('HHmmss'),
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_BankCode: 'NCB',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  // Tạo chữ ký
  const secureHash = vnpayConfig.createSignature(params);
  
  // Thêm chữ ký vào params
  params.vnp_SecureHash = secureHash;
  params.vnp_SecureHashType = 'SHA512';

  return params;
};

exports.createPayment = async (req, res) => {
  try {
    const { amount, orderInfo, invoiceId } = req.body;
    
    // Kiểm tra và xử lý dữ liệu đầu vào
    if (!amount || !orderInfo) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin thanh toán' 
      });
    }

    // Tạo mã giao dịch duy nhất
    const txnRef = invoiceId 
      ? `${invoiceId.toString()}${moment().format('HHmmss')}` 
      : `SKYBOOK${moment().format('YYMMDDHHmmss')}`;

    const paymentParams = generatePaymentParams({
      amount: Math.round(parseFloat(amount) * 100),
      orderInfo,
      txnRef: txnRef
    });

    const paymentUrl = `${vnpayConfig.vnpUrl}?${querystring.stringify(paymentParams)}`;

    res.status(200).json({ 
      paymentUrl,
      txnRef,
      invoiceId: invoiceId || null
    });
  } catch (error) {
    console.error('Lỗi tạo thanh toán:', error);
    res.status(500).json({ 
      message: 'Không thể tạo đường dẫn thanh toán',
      error: error.message 
    });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    // Log toàn bộ query params để kiểm tra
    console.log('🔍 VNPay Return Params:', req.query);

    // Kiểm tra và xử lý an toàn
    const { 
      vnp_TxnRef, 
      vnp_ResponseCode,
      vnp_Amount,
      vnp_BankCode,
      vnp_PayDate
    } = req.query || {};

    // Kiểm tra tham số bắt buộc
    if (!vnp_TxnRef) {
      return res.status(400).json({
        status: 'Thất bại',
        message: 'Thiếu mã giao dịch'
      });
    }

    // Trích xuất ID đơn hàng gốc (loại bỏ phần timestamp)
    const originalInvoiceId = vnp_TxnRef.slice(0, -6);
    console.log('originalInvoiceId', originalInvoiceId)

    // Kiểm tra chữ ký VNPay
    const isValidSignature = vnpayConfig.verifySignature(req.query);
    if (!isValidSignature) {
      return res.status(400).json({
        status: 'Thất bại',
        message: 'Chữ ký không hợp lệ'
      });
    }

    // Kiểm tra mã phản hồi
    if (vnp_ResponseCode !== '00') {
      // Cập nhật trạng thái đơn hàng nếu thanh toán thất bại
      await Invoice.findOneAndUpdate(
        { _id: originalInvoiceId }, 
        {
          payment_status: 'Thanh toán thất bại',
          payment_method: 'VNPAY'
        }
      );

      return res.status(400).json({
        status: 'Thất bại',
        message: `Thanh toán không thành công. Mã lỗi: ${vnp_ResponseCode}`
      });
    }

    // Tìm và cập nhật đơn hàng
    const invoice = await Invoice.findOneAndUpdate(
      { _id: originalInvoiceId },
      {
        payment_status: 'Đã thanh toán',
        payment_method: 'VNPAY',
        bank_info: {
          bank_code: vnp_BankCode,
          transaction_date: vnp_PayDate 
            ? moment(vnp_PayDate, 'YYYYMMDDHHmmss').toDate()
            : new Date()
        }
      },
      { new: true }
    );

    // Kiểm tra nếu không tìm thấy đơn hàng
    if (!invoice) {
      return res.status(404).json({
        status: 'Thất bại',
        message: 'Không tìm thấy đơn hàng'
      });
    }

    return res.status(200).json({
      status: 'Thành công',
      message: 'Thanh toán thành công',
      transactionInfo: {
        invoiceId: invoice._id,
        amount: invoice.total_amount,
        paymentMethod: 'VNPAY'
      }
    });

  } catch (error) {
    console.error('❌ Lỗi xử lý kết quả thanh toán:', error);
    
    return res.status(500).json({
      status: 'Thất bại',
      message: 'Lỗi hệ thống khi xử lý thanh toán',
      error: error.message
    });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transactionRef } = req.query;

    if (!transactionRef) {
      return res.status(400).json({
        status: 'Thất bại',
        message: 'Thiếu mã giao dịch'
      });
    }

    // Tìm hóa đơn theo mã giao dịch
    const invoice = await Invoice.findOne({ 
      orderCode: transactionRef 
    });

    if (!invoice) {
      return res.status(404).json({
        status: 'Không tìm thấy',
        message: 'Không tìm thấy thông tin giao dịch'
      });
    }

    return res.status(200).json({
      status: invoice.paymentStatus || 'Chưa xác định',
      transactionInfo: {
        orderCode: invoice.orderCode,
        totalAmount: invoice.totalAmount,
        paymentMethod: invoice.paymentMethod,
        transactionDate: invoice.transactionDate
      }
    });

  } catch (error) {
    console.error('❌ Lỗi kiểm tra trạng thái thanh toán:', error);
    
    return res.status(500).json({
      status: 'Thất bại',
      message: 'Lỗi hệ thống khi kiểm tra trạng thái thanh toán',
      error: error.message
    });
  }
}; 
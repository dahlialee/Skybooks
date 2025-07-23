const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  invoice_date: {
    type: Date,
    default: Date.now
  },
  payment_method: {
    type: String,
    enum: ['COD', 'VNPAY', 'MoMo'],
  },
  invoice_type: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  },
  payment_status: {
    type: String,
    enum: [
      'Chưa thanh toán', 
      'Đã thanh toán', 
      'Thanh toán thất bại'
    ],
    default: 'Chưa thanh toán'
  },
  shipping_status: {
    type: String,
    enum: [
      'Chưa xử lý',
      'Đang xử lý', 
      'Đang giao', 
      'Đã giao', 
      'Đã hủy'
    ],
    default: 'Chưa xử lý'
  },
  total_amount: {
    type: Number,
    required: true
  },
  details: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    title: String,
    quantity: Number,
    unit_price: Number,
    discount: {
      type: Number,
      default: 0
    },
    total_price: Number
  }],
  shipping_info: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    note: String
  },
  is_guest_order: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

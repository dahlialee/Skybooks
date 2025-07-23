const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Thông tin khách hàng
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: null
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },

  // Các sản phẩm trong đơn hàng
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],

  // Tổng giá trị đơn hàng
  total_price: {
    type: Number,
    required: true,
    min: 0
  },

  // Địa chỉ giao hàng
  shipping_address: {
    type: String,
    required: true,
    trim: true
  },

  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: [
      'pending',     // Chờ xử lý
      'confirmed',   // Đã xác nhận
      'processing', // Đang xử lý
      'shipping',   // Đang giao
      'completed',  // Hoàn thành
      'cancelled'   // Đã hủy
    ],
    default: 'pending'
  },

  // Loại đơn hàng
  order_type: {
    type: String,
    enum: ['guest', 'registered'],
    default: 'guest'
  },

  // Thời gian tạo đơn
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index để tối ưu truy vấn
OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ created_at: -1 });

module.exports = mongoose.model('Order', OrderSchema); 
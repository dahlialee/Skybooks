const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer_id: { 
    type: mongoose.Schema.Types.Mixed, // Hỗ trợ cả string và ObjectId
    required: true,
    unique: true 
  },
  items: [{
    product_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      default: 1,
      min: [1, 'Số lượng phải lớn hơn 0'] // ✅ Validate không cho < 1
    },
    checked: { 
      type: Boolean, 
      default: true // ✅ Mặc định sản phẩm được chọn khi thanh toán
    }
  }]
}, 
{ 
  timestamps: true 
});

module.exports = mongoose.model('Cart', cartSchema);

const mongoose = require('mongoose');

const PurchaseReceiptSchema = new mongoose.Schema({
  // Mã phiếu nhập
  receiptCode: {
    type: String,
    required: true,
    unique: true
  },
  
  // Nhà xuất bản
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: true
  },
  
  // Ngày nhập
  receiptDate: {
    type: Date,
    default: Date.now
  },
  
  // Danh sách sản phẩm
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Tổng giá trị
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Trạng thái phiếu nhập
  status: {
    type: String,
    enum: ['Mới', 'Đã duyệt', 'Đã hủy'],
    default: 'Mới'
  },
  
  // Người tạo phiếu
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Ghi chú
  note: {
    type: String,
    trim: true
  },
  
  // Thời gian tạo
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Thời gian cập nhật
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index để tìm kiếm nhanh
PurchaseReceiptSchema.index({ receiptCode: 1, publisher: 1 });

// Middleware để cập nhật thời gian
PurchaseReceiptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PurchaseReceipt', PurchaseReceiptSchema);
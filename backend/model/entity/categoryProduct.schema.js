const mongoose = require('mongoose');

const categoryProductSchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
    unique: true, // Không trùng tên
    trim: true,
  },
  description: {
    type: String,
    default: '',
  }
}, {
  timestamps: true, // Tự động có createdAt và updatedAt
});

module.exports = mongoose.model('CategoryProduct', categoryProductSchema);

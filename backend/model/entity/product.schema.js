// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryProduct', // tên model của danh mục sản phẩm
    required: true
  },
  publisher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: true
  },
  discount_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountCategory'
  },
  cover_image: String,
  price: {
    type: Number,
    required: true
  },
  description: String,
  stock_quantity: {
    type: Number,
    required: true
  },
  language: String,
  weight: Number,
  dimensions: String,
  page: Number
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

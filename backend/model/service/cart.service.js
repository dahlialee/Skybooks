const Cart = require('../entity/cart.schema');
const Customer = require('../entity/customer.schema');
const Product = require('../entity/product.schema');
const mongoose = require('mongoose');

const CartService = {
  // Lấy giỏ hàng theo user ID (hỗ trợ cả guest)
  getCartByUserId: async (customerId) => {
    // Kiểm tra giỏ hàng tồn tại
    let cart = await Cart.findOne({ customer_id: customerId })
      .populate({
        path: 'items.product_id',
        select: 'title price cover_image discount_percent'
      });
    
    // Tạo giỏ hàng mới nếu chưa có
    if (!cart) {
      cart = new Cart({ 
        customer_id: customerId, 
        items: [] 
      });
      await cart.save();
    }
    
    return cart;
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (customerId, newItem) => {
    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ customer_id: customerId });

    if (!cart) {
      cart = new Cart({ 
        customer_id: customerId,
        items: [newItem]
      });
    } else {
      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingItemIndex = cart.items.findIndex(
        item => item.product_id.toString() === newItem.product_id.toString()
      );

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        cart.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Thêm sản phẩm mới
        cart.items.push(newItem);
      }
    }

    return await cart.save();
  },

  // Đồng bộ giỏ hàng từ local
  syncLocalCartWithServer: async (customerId, localCartItems) => {
    // Lấy giỏ hàng hiện tại
    let cart = await Cart.findOne({ customer_id: customerId });

    if (!cart) {
      cart = new Cart({ 
        customer_id: customerId, 
        items: [] 
      });
    }

    // Hợp nhất giỏ hàng
    const mergedItems = [...cart.items];

    for (const localItem of localCartItems) {
      const existingItemIndex = mergedItems.findIndex(
        item => item.product_id.toString() === localItem.product_id.toString()
      );

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        mergedItems[existingItemIndex].quantity += localItem.quantity;
      } else {
        // Thêm sản phẩm mới
        mergedItems.push({
          product_id: localItem.product_id,
          quantity: localItem.quantity,
          checked: true
        });
      }
    }

    // Cập nhật giỏ hàng
    cart.items = mergedItems;
    return await cart.save();
  },

  // Cập nhật sản phẩm trong giỏ hàng
  updateCartItem: async (customerId, productId, updatedItem) => {
    const cart = await Cart.findOne({ customer_id: customerId });
    if (!cart) throw new Error('Giỏ hàng không tồn tại');

    const item = cart.items.find(item => item.product_id.toString() === productId);
    if (!item) throw new Error('Sản phẩm không tồn tại trong giỏ hàng');

    if (updatedItem.quantity !== undefined) item.quantity = updatedItem.quantity;
    if (updatedItem.checked !== undefined) item.checked = updatedItem.checked;

    return await cart.save();
  },

  // Xoá 1 sản phẩm trong giỏ hàng
  deleteCartItem: async (customerId, productId) => {
    return await Cart.findOneAndUpdate(
      { customer_id: customerId },
      { $pull: { items: { product_id: productId } } },
      { new: true }
    ).populate('items.product_id');
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async (customerId) => {
    const cart = await Cart.findOne({ customer_id: customerId });
    if (!cart) throw new Error('Giỏ hàng không tồn tại');

    cart.items = []; // Xóa toàn bộ sản phẩm
    return await cart.save();
  },

  // Tính tổng giỏ hàng
  calculateCartTotal: async (customerId) => {
    const cart = await Cart.findOne({ customer_id: customerId }).populate('items.product_id');
    if (!cart) throw new Error('Giỏ hàng không tồn tại');

    let total = 0;
    for (const item of cart.items) {
      const product = item.product_id;
      const price = product.price || 0;
      const discount = product.discount_percent || 0;
      const discountedPrice = price - (price * discount / 100);
      total += discountedPrice * item.quantity;
    }

    return {
      total,
      itemsCount: cart.items.length
    };
  }
};

module.exports = CartService;
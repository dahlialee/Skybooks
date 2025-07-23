const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Controller đặt hàng không cần token
exports.createGuestOrder = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerEmail,
      shippingAddress, 
      items 
    } = req.body;

    // Validate thông tin đơn hàng
    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp đầy đủ thông tin đơn hàng" 
      });
    }

    // Kiểm tra và tính toán chi tiết sản phẩm
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      // Kiểm tra sản phẩm có tồn tại không
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ 
          message: `Sản phẩm ${item.product_id} không tồn tại` 
        });
      }

      // Tính giá sản phẩm sau khuyến mãi
      const discountedPrice = product.price - (product.price * (product.discount_percent || 0) / 100);
      
      // Tạo mục đơn hàng
      const orderItem = {
        product_id: product._id,
        quantity: item.quantity,
        price: discountedPrice
      };

      // Tính tổng giá
      totalPrice += discountedPrice * item.quantity;

      orderItems.push(orderItem);
    }

    // Tạo đơn hàng
    const newOrder = new Order({
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
      },
      items: orderItems,
      total_price: totalPrice,
      shipping_address: shippingAddress,
      status: 'pending', // Trạng thái đơn hàng ban đầu
      order_type: 'guest' // Loại đơn hàng là khách
    });

    // Lưu đơn hàng
    await newOrder.save();

    // Cập nhật số lượng sản phẩm
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product_id, 
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    res.status(201).json({
      message: "Đặt hàng thành công",
      orderId: newOrder._id,
      totalPrice: newOrder.total_price
    });
  } catch (error) {
    console.error("Lỗi khi đặt hàng không cần token:", error);
    res.status(500).json({ 
      message: "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.",
      error: error.message 
    });
  }
}; 
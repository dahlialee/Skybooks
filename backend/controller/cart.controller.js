const CartService = require('../model/service/cart.service');
const ProductService = require('../model/service/product.service');
const CustomerService = require('../model/service/customer.service');

const CartController = {
  // Lấy giỏ hàng
  getCart: async (req, res) => {
    try {
      // Lấy user ID từ middleware
      const customerId = req.user ? req.user.id : 'guest';

      const cart = await CartService.getCartByUserId(customerId);
      
      res.json(cart);
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể lấy giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (req, res) => {
    try {
      // Yêu cầu bắt buộc phải có user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' 
        });
      }

      const { product_id, quantity } = req.body;

      const cart = await CartService.addToCart(req.user.id, {
        product_id,
        quantity: quantity || 1
      });

      res.status(201).json(cart);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      
      res.status(500).json({ 
        message: 'Không thể thêm sản phẩm vào giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Cập nhật sản phẩm trong giỏ hàng
  updateCartItem: async (req, res) => {
    try {
      // Yêu cầu bắt buộc phải có user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để cập nhật sản phẩm' 
        });
      }

      const { productId } = req.params;
      const { quantity, checked } = req.body;

      const updatedCart = await CartService.updateCartItem(req.user.id, productId, { quantity, checked });
      res.json(updatedCart);
    } catch (error) {
      console.error('Lỗi cập nhật giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể cập nhật sản phẩm trong giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Xoá 1 sản phẩm khỏi giỏ hàng
  deleteCartItem: async (req, res) => {
    try {
      // Yêu cầu bắt buộc phải có user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để xóa sản phẩm' 
        });
      }

      const { productId } = req.params;

      const updatedCart = await CartService.deleteCartItem(req.user.id, productId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể xóa sản phẩm khỏi giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Xoá toàn bộ giỏ hàng
  clearCart: async (req, res) => {
    try {
      // Yêu cầu bắt buộc phải có user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để xóa giỏ hàng' 
        });
      }
      
      await CartService.clearCart(req.user.id);
      res.json({ message: 'Giỏ hàng đã được xóa thành công' });
    } catch (error) {
      console.error('Lỗi xóa giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể xóa giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Tính tổng giỏ hàng
  calculateCartTotal: async (req, res) => {
    try {
      // Yêu cầu bắt buộc phải có user ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          message: 'Vui lòng đăng nhập để tính tổng giỏ hàng' 
        });
      }
      
      const total = await CartService.calculateCartTotal(req.user.id);
      res.json(total);
    } catch (error) {
      console.error('Lỗi tính tổng giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể tính tổng giỏ hàng', 
        error: error.message 
      });
    }
  },

  // Tính tổng các sản phẩm được chọn
  calculateCheckedTotal: async (req, res) => {
    try {
      // Ưu tiên lấy customerId từ user, nếu không có thì dùng 'guest'
      const customerId = req.user ? req.user.id : 'guest';
      
      const result = await CartService.calculateCheckedItemsTotal(customerId);
      res.json(result);
    } catch (error) {
      console.error('Lỗi tính tổng các sản phẩm được chọn:', error);
      res.status(500).json({ 
        message: 'Không thể tính tổng các sản phẩm được chọn', 
        error: error.message 
      });
    }
  },

  // Đồng bộ giỏ hàng từ local
  syncLocalCartWithServer: async (req, res) => {
    try {
      // Lấy user ID từ middleware
      const customerId = req.user ? req.user.id : 'guest';
      const localCartItems = req.body.localCartItems || [];

      // Kiểm tra và xử lý các mục local
      const validItems = await Promise.all(
        localCartItems.map(async (item) => {
          // Kiểm tra sản phẩm có tồn tại không
          const product = await ProductService.getProductById(item.product_id);
          return product ? item : null;
        })
      );

      // Lọc bỏ các mục không hợp lệ
      const filteredItems = validItems.filter(item => item !== null);

      // Đồng bộ giỏ hàng
      const updatedCart = await CartService.syncLocalCartWithServer(
        customerId, 
        filteredItems
      );

      res.status(200).json({
        message: 'Đồng bộ giỏ hàng thành công',
        data: updatedCart
      });
    } catch (error) {
      console.error('Lỗi đồng bộ giỏ hàng:', error);
      res.status(500).json({ 
        message: 'Không thể đồng bộ giỏ hàng', 
        error: error.message 
      });
    }
  }
};

module.exports = CartController;

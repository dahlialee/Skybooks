const PurchaseReceipt = require('../entity/purchaseReceipt.schema');
const Product = require('../entity/product.schema');

const purchaseReceiptService = {
  // Tạo phiếu nhập mới
  create: async (data) => {
    try {
      // Tính tổng giá trị
      const totalValue = data.items.reduce((total, item) => 
        total + (item.quantity * item.unitPrice), 0);

      // Tạo phiếu nhập
      const receipt = new PurchaseReceipt({
        ...data,
        totalValue,
        status: 'Mới',
        createdAt: new Date()
      });

      // Lưu phiếu nhập
      const savedReceipt = await receipt.save();

      // Cập nhật số lượng sản phẩm (stock_quantity)
      for (let item of data.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock_quantity: item.quantity }
        });
      }

      return savedReceipt;
    } catch (error) {
      throw new Error(`Lỗi tạo phiếu nhập: ${error.message}`);
    }
  },

  // Lấy danh sách phiếu nhập
  getAll: async ({ page, limit, search }) => {
    try {
      const query = search 
        ? { 
            $or: [
              { receiptCode: { $regex: search, $options: 'i' } },
              { publisher: { $regex: search, $options: 'i' } }
            ] 
          } 
        : {};

      const totalReceipts = await PurchaseReceipt.countDocuments(query);
      const receipts = await PurchaseReceipt.find(query)
        .populate('items.productId')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        data: receipts,
        totalPages: Math.ceil(totalReceipts / limit),
        currentPage: page,
        totalReceipts
      };
    } catch (error) {
      throw new Error(`Lỗi lấy danh sách phiếu nhập: ${error.message}`);
    }
  },

  // Lấy chi tiết phiếu nhập
  getById: async (id) => {
    try {
      return await PurchaseReceipt.findById(id).populate('items.productId');
    } catch (error) {
      throw new Error(`Lỗi lấy chi tiết phiếu nhập: ${error.message}`);
    }
  },

  // Cập nhật phiếu nhập
  update: async (id, data) => {
    try {
      // Lấy phiếu nhập cũ để so sánh
      const oldReceipt = await PurchaseReceipt.findById(id);
      if (!oldReceipt) {
        throw new Error('Không tìm thấy phiếu nhập');
      }

      // Tính lại tổng giá trị
      const totalValue = data.items.reduce((total, item) => 
        total + (item.quantity * item.unitPrice), 0);

      // Cập nhật phiếu nhập
      const updatedReceipt = await PurchaseReceipt.findByIdAndUpdate(
        id, 
        { ...data, totalValue }, 
        { new: true }
      );

      // Cập nhật số lượng sản phẩm
      // Trước tiên, hoàn lại số lượng cũ
      for (let item of oldReceipt.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock_quantity: -item.quantity }
        });
      }

      // Sau đó, cộng số lượng mới
      for (let item of data.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock_quantity: item.quantity }
        });
      }

      return updatedReceipt;
    } catch (error) {
      throw new Error(`Lỗi cập nhật phiếu nhập: ${error.message}`);
    }
  },

  // Xóa phiếu nhập
  delete: async (id) => {
    try {
      const receipt = await PurchaseReceipt.findById(id);
      if (!receipt) return false;

      // Hoàn lại số lượng sản phẩm (stock_quantity)
      for (let item of receipt.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock_quantity: -item.quantity }
        });
      }

      await PurchaseReceipt.findByIdAndDelete(id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi xóa phiếu nhập: ${error.message}`);
    }
  },

  // Thống kê phiếu nhập
  getStatistics: async (startDate, endDate) => {
    try {
      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const statistics = await PurchaseReceipt.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalReceipts: { $sum: 1 },
            totalValue: { $sum: '$totalValue' },
            totalItems: { $sum: { $sum: '$items.quantity' } }
          }
        }
      ]);

      return statistics[0] || {
        totalReceipts: 0,
        totalValue: 0,
        totalItems: 0
      };
    } catch (error) {
      throw new Error(`Lỗi thống kê phiếu nhập: ${error.message}`);
    }
  }
};

module.exports = purchaseReceiptService;
const Invoice = require('../entity/invoice.schema');
const ProductService = require('./product.service');
const Product = require('../entity/product.schema');
const mongoose = require('mongoose');

const invoiceService = {
  create: async (data) => {
    try {
      // Xác thực và chuẩn hóa dữ liệu sản phẩm
      const validatedDetails = await Promise.all(data.details.map(async (item) => {
        // Tìm sản phẩm để xác nhận và lấy _id chính xác
        const product = await Product.findOne({ 
          $or: [
            { _id: item.product_id },  // Thử với ID hiện tại
            { title: item.title },     // Thử với tiêu đề
            { barcode: item.barcode }  // Thử với mã vạch nếu có
          ]
        });
        
        if (!product) {
          throw new Error(`Không tìm thấy sản phẩm: ${item.title}`);
        }

        // Luôn sử dụng _id chính xác từ sản phẩm
        return {
          ...item,
          product_id: product._id,
          unit_price: product.price,
          title: product.title
        };
      }));

      // Tạo hóa đơn với dữ liệu đã được xác thực
      const invoice = new Invoice({
        ...data,
        details: validatedDetails
      });

      const savedInvoice = await invoice.save();

      // Giảm số lượng sản phẩm
      for (const item of validatedDetails) {
        await ProductService.reduceProductQuantity(
          item.product_id, 
          item.quantity
        );
      }

      return savedInvoice;

    } catch (error) {
      console.error('Chi tiết lỗi tạo hóa đơn:', {
        message: error.message,
        stack: error.stack,
        data: data
      });
      throw error;
    }
  },

  getAll: async (page = 1, limit = 0, queryParams = {}) => {
    const skip = (page - 1) * limit;
    
    // Tạo điều kiện tìm kiếm
    const searchQuery = {};

    // Tìm kiếm theo từ khóa
    if (queryParams.search) {
      searchQuery._id.toString().toLowerCase().includes(queryParams.search.toLowerCase());
    }

    // Giữ nguyên các điều kiện lọc khác
    if (queryParams.paymentStatus) {
      searchQuery.payment_status = queryParams.paymentStatus;
    }

    if (queryParams.shippingStatus) {
      searchQuery.shipping_status = queryParams.shippingStatus;
    }

    if (queryParams.customerId) {
      searchQuery.customer_id = queryParams.customerId;
    }

    if (queryParams.startDate || queryParams.endDate) {
      searchQuery.invoice_date = {};
      
      if (queryParams.startDate) {
        searchQuery.invoice_date.$gte = new Date(queryParams.startDate);
      }
      
      if (queryParams.endDate) {
        const endDate = new Date(queryParams.endDate);
        endDate.setDate(endDate.getDate() + 1);
        searchQuery.invoice_date.$lt = endDate;
      }
    }

    console.log('🔎 Toàn bộ điều kiện tìm kiếm:', JSON.stringify(searchQuery, null, 2));

    const totalRecords = await Invoice.countDocuments(searchQuery);
    
    const invoices = await Invoice.find(searchQuery)
      .populate('customer_id', 'name email')
      .populate('employee_id', 'name email')
      .populate('details.product_id', 'title barcode cover_image price author')
      .sort({ invoice_date: -1 })
      .skip(skip)
      .limit(limit || totalRecords);

    return {
      data: invoices,
      totalRecords: totalRecords,
      page: page,
      totalPages: Math.ceil(totalRecords / (limit || totalRecords))
    };
  },

  getById: async (id) => {
    return await Invoice.findById(id)
      .populate('customer_id', 'name email')
      .populate('employee_id', 'name email')
      .populate('details.product_id', 'title barcode cover_image price author');
  },

  update: async (id, data) => {
    return await Invoice.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return await Invoice.findByIdAndDelete(id);
  },

  getByCustomerId: async (customerId) => {
    return await Invoice.find({ customer_id: customerId })
      .sort({ createdAt: -1 })
      .populate('details.product_id', 'title barcode cover_image price author');
  },


};

module.exports = invoiceService;

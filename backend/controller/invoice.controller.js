const invoiceService = require('../model/service/invoice.service');
const customerService = require('../model/service/customer.service');

const invoiceController = {
  createInvoice: async (req, res) => {
    try {
      const { 
        customerInfo, 
        customer_id: requestCustomerId, 
        details, 
        total_amount, 
        payment_method,
        shipping_status,
        payment_status,
        shipping_info,
        is_guest_order
      } = req.body;

      // Validate required fields
      if (!customerInfo || !details || !total_amount || !payment_method) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc để tạo hóa đơn' 
        });
      }

      // Chuẩn bị dữ liệu hóa đơn
      const invoiceData = {
        customer_id: requestCustomerId || null, // Cho phép null
        is_guest_order: is_guest_order || false, // Đánh dấu đơn hàng khách
        invoice_type: requestCustomerId ? 'Online' : 'Offline',
        payment_method: payment_method.toUpperCase(),
        total_amount,
        payment_status: payment_status || 'Chưa thanh toán',
        shipping_status: shipping_status || 'Chưa xử lý',
        details,
        shipping_info: {
          fullName: customerInfo.name,
          email: customerInfo.email || 'guest@skybooks.com',
          phone: customerInfo.phone,
          address: customerInfo.address
        }
      };

      // Tạo hóa đơn sử dụng service
      const savedInvoice = await invoiceService.create(invoiceData);

      // Trả về kết quả
      res.status(201).json({
        message: 'Tạo hóa đơn thành công',
        data: savedInvoice
      });
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn:', error);
      res.status(500).json({ 
        message: 'Không thể tạo hóa đơn', 
        error: error.message 
      });
    }
  },

  getAllInvoices: async (req, res) => {
    console.log('🔍 Toàn bộ query params:', req.query);
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      
      // Tạo đối tượng query params
      const queryParams = {
        search: req.query.search || "",
        paymentStatus: req.query.paymentStatus,
        shippingStatus: req.query.shippingStatus,
        customerId: req.query.customerId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      console.log('🔎 Các tham số tìm kiếm:', queryParams);

      const invoices = await invoiceService.getAll(page, limit, queryParams);
      
      console.log('📋 Kết quả tìm kiếm:', {
        totalRecords: invoices.totalRecords,
        dataCount: invoices.data.length
      });

      res.status(200).json(invoices);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách hóa đơn:', error);
      res.status(500).json({ 
        message: 'Không thể lấy danh sách hóa đơn', 
        error: error.message 
      });
    }
  },

  getInvoiceById: async (req, res) => {
    try {
      const invoice = await invoiceService.getById(req.params.id);
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      res.status(200).json(invoice);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateInvoice: async (req, res) => {
    try {
      const updatedInvoice = await invoiceService.update(req.params.id, req.body);
      if (!updatedInvoice) return res.status(404).json({ message: 'Invoice not found' });
      res.status(200).json(updatedInvoice);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteInvoice: async (req, res) => {
    try {
      const deletedInvoice = await invoiceService.delete(req.params.id);
      if (!deletedInvoice) return res.status(404).json({ message: 'Invoice not found' });
      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getInvoicesByCustomer: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      // Kiểm tra xem customer có tồn tại không
      const customer = await customerService.getById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Khách hàng không tồn tại' });
      }

      // Lấy tất cả hóa đơn của khách hàng
      const invoices = await invoiceService.getByCustomerId(customerId);
      
      res.status(200).json(invoices);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng của khách hàng:', error);
      res.status(500).json({ message: 'Không thể tải đơn hàng' });
    }
  },

  // Controller mới cho tạo hóa đơn offline
  createOfflineInvoice: async (req, res) => {
    try {
      const { 
        details, 
        total_amount, 
        payment_method,
        shipping_status,
        payment_status,
        shipping_info,
        employee_id
      } = req.body;

      // Validate required fields
      if (!details || !total_amount || !payment_method) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc để tạo hóa đơn offline' 
        });
      }

      // Chuẩn bị dữ liệu hóa đơn offline
      const invoiceData = {
        customer_id: null, // Không có customer_id cho offline
        employee_id: employee_id, // ID của nhân viên tạo hóa đơn
        invoice_type: 'Offline', // Đánh dấu là hóa đơn offline
        payment_method: payment_method.toUpperCase(),
        total_amount,
        payment_status: payment_status || 'Đã thanh toán',
        shipping_status: shipping_status || 'Đã giao',
        details,
        shipping_info: shipping_info || {
          fullName: 'Khách hàng tại quầy',
          email: 'guest@skybooks.com',
          phone: '',
          address: ''
        },
        is_guest_order: true
      };

      // Tạo hóa đơn sử dụng service
      const savedInvoice = await invoiceService.create(invoiceData);

      // Trả về kết quả
      res.status(201).json({
        message: 'Tạo hóa đơn offline thành công',
        data: savedInvoice
      });
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn offline:', error);
      res.status(500).json({ 
        message: 'Không thể tạo hóa đơn offline', 
        error: error.message 
      });
    }
  }
};

module.exports = invoiceController;

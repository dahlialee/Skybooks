const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/invoice.controller');

// Route test
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Invoice API is working!' });
});

router.post('/', invoiceController.createInvoice);
router.post('/offline', invoiceController.createOfflineInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Thêm route mới để lấy đơn hàng theo khách hàng
router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer);

module.exports = router;

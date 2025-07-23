const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controller/purchaseOrder.controller');

router.post('/', purchaseOrderController.createOrder);
router.get('/', purchaseOrderController.getAllOrders);
router.get('/:id', purchaseOrderController.getOrderById);
router.put('/:id', purchaseOrderController.updateOrder);
router.delete('/:id', purchaseOrderController.deleteOrder);

module.exports = router;

const purchaseOrderService = require('../model/service/purchaseOrder.service');

const purchaseOrderController = {
  createOrder: async (req, res) => {
    try {
      const order = await purchaseOrderService.create(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await purchaseOrderService.getAll();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await purchaseOrderService.getById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const updated = await purchaseOrderService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const deleted = await purchaseOrderService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = purchaseOrderController;

const PurchaseOrder = require('../entity/purchaseOrder.schema');

const purchaseOrderService = {
  create: async (data) => {
    const order = new PurchaseOrder(data);
    return await order.save();
  },

  getAll: async () => {
    return await PurchaseOrder.find()
      .populate('employee_id', 'name')
      .populate('supplier_id', 'name')
      .populate('items.product_id', 'title')
      .sort({ createdAt: -1 });
  },

  getById: async (id) => {
    return await PurchaseOrder.findById(id)
      .populate('employee_id', 'name')
      .populate('supplier_id', 'name')
      .populate('items.product_id', 'title');
  },

  update: async (id, data) => {
    return await PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return await PurchaseOrder.findByIdAndDelete(id);
  }
};

module.exports = purchaseOrderService;

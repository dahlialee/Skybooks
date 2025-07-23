const DiscountCategory = require('../entity/discountCategory.schema');

const discountCategoryService = {
  create: async (data) => {
    const discountCategory = new DiscountCategory(data);
    return await discountCategory.save();
  },

  getAll: async () => {
    return await DiscountCategory.find().sort({ createdAt: -1 });
  },

  getById: async (id) => {
    return await DiscountCategory.findById(id);
  },

  update: async (id, data) => {
    return await DiscountCategory.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return await DiscountCategory.findByIdAndDelete(id);
  }
};

module.exports = discountCategoryService;

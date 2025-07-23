const discountCategoryService = require('../model/service/discountCategory.service');

const discountCategoryController = {
  createDiscountCategory: async (req, res) => {
    try {
      const newCategory = await discountCategoryService.create(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllDiscountCategories: async (req, res) => {
    try {
      const categories = await discountCategoryService.getAll();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getDiscountCategoryById: async (req, res) => {
    try {
      const category = await discountCategoryService.getById(req.params.id);
      if (!category) return res.status(404).json({ message: 'Discount category not found' });
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateDiscountCategory: async (req, res) => {
    try {
      const updatedCategory = await discountCategoryService.update(req.params.id, req.body);
      if (!updatedCategory) return res.status(404).json({ message: 'Discount category not found' });
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteDiscountCategory: async (req, res) => {
    try {
      const deletedCategory = await discountCategoryService.delete(req.params.id);
      if (!deletedCategory) return res.status(404).json({ message: 'Discount category not found' });
      res.status(200).json({ message: 'Discount category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = discountCategoryController;

const CategoryProduct = require('../entity/categoryProduct.schema');
const Product = require('../entity/product.schema');

async function getCategories(page = 1, limit = 0) {
  const skip = (page - 1) * limit;

  // Lấy danh mục có phân trang và dạng plain object (.lean())
  const categories = await CategoryProduct.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  // Đếm tổng số bản ghi (dùng cho pagination)
  const totalRecords = await CategoryProduct.countDocuments();

  // Đếm sản phẩm theo từng danh mục
  const data = await Promise.all(
    categories.map(async (category) => {
      const product_count = await Product.countDocuments({ category_id: category._id });
      return {
        ...category,
        product_count,
      };
    })
  );

  return {
    data,
    totalRecords,
    page,
    totalPages: Math.ceil(totalRecords / limit),
    limit,
  };
}

async function getCategoryById(id) {
  const category = await CategoryProduct.findById(id);
  if (!category) throw new Error('Category không tồn tại');
  return category;
}


async function createCategory(data) {
  const { category_name, description } = data;

  // Kiểm tra trùng tên
  const existed = await CategoryProduct.findOne({ category_name });
  if (existed) throw new Error('Tên danh mục đã tồn tại');

  const category = new CategoryProduct({
    category_name,
    description
  });

  await category.save();
  return category;
}

async function updateCategory(id, data) {
  const category = await CategoryProduct.findById(id);
  if (!category) throw new Error('Category không tồn tại');

  // Nếu người dùng muốn cập nhật tên
  if (data.category_name && data.category_name !== category.category_name) {
    const existed = await CategoryProduct.findOne({ category_name: data.category_name });
    if (existed) throw new Error('Tên danh mục đã tồn tại');
    category.category_name = data.category_name;
  }

  // Cập nhật các trường khác nếu có
  if (data.description !== undefined) {
    category.description = data.description;
  }

  await category.save();
  return category;
}

async function deleteCategory(id) {
  const category = await CategoryProduct.findById(id);
  if (!category) throw new Error('Category không tồn tại');

  await category.deleteOne();
  return true;
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

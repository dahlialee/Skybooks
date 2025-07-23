const Product = require('../entity/product.schema');
const CategoryProduct = require('../entity/categoryProduct.schema');
const Publisher = require('../entity/publisher.schema');
const DiscountCategory = require('../entity/discountCategory.schema');

async function createProduct(data) {
  const {
    barcode,
    title,
    author,
    categoryId,
    publisherId,
    cover_image,
    discountId,
    price,
    description,
    stock_quantity,
    language,
    weight,
    dimensions,
    page
  } = data;

  // Kiểm tra tồn tại
  if (!(await CategoryProduct.findById(categoryId))) {
    throw new Error('Category không tồn tại');
  }

  if (!(await Publisher.findById(publisherId))) {
    throw new Error('Publisher không tồn tại');
  }

  if (discountId && !(await DiscountCategory.findById(discountId))) {
    throw new Error('Discount category không tồn tại');
  }

  const newProduct = new Product({
    barcode,
    title,
    author,
    category_id: categoryId,
    publisher_id: publisherId,
    discount_category_id: discountId || null,
    cover_image,
    price,
    description,
    stock_quantity,
    language,
    weight,
    dimensions,
    page
  });

  await newProduct.save();
  return newProduct;
}

async function updateProduct(id, data) {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product không tồn tại');

  // Nếu thay đổi category
  if (data.categoryId) {
    const category = await CategoryProduct.findById(data.categoryId);
    if (!category) throw new Error('Category không tồn tại');
    product.category_id = data.categoryId;
  }

  // Nếu thay đổi publisher
  if (data.publisherId) {
    const publisher = await Publisher.findById(data.publisherId);
    if (!publisher) throw new Error('Publisher không tồn tại');
    product.publisher_id = data.publisherId;
  }

  // Nếu thay đổi discount
  if (data.discountId !== undefined) {
    if (data.discountId) {
      const discount = await DiscountCategory.findById(data.discountId);
      if (!discount) throw new Error('Discount category không tồn tại');
      product.discount_category_id = data.discountId;
    } else {
      product.discount_category_id = null;
    }
  }

  // Các trường đơn giản
  const fieldsToUpdate = [
    'barcode', 'title', 'author', 'cover_image', 'price', 'description',
    'stock_quantity', 'language', 'weight', 'dimensions', 'page'
  ];
  fieldsToUpdate.forEach(field => {
    if (data[field] !== undefined) product[field] = data[field];
  });

  await product.save();
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product không tồn tại');

  await product.deleteOne();
  return true;
}

async function getProductById(id) {
  const product = await Product.findById(id)
    .populate('category_id', 'category_name')
    .populate({
      path: 'publisher_id',
      select: 'name address contact_info'
    })
    .populate('discount_category_id', 'name discount_percentage');

  if (!product) throw new Error('Product không tồn tại');
  
  const productObject = product.toObject();
  productObject.page_count = product.page;

  return productObject;
}

async function getProductList(page = 1, limit = 0) {
  const skip = (page - 1) * limit;
  const products = await Product.find()
    .populate('category_id', 'category_name')
    .populate({
      path: 'publisher_id',
      select: 'name address contact_info'
    })
    .populate('discount_category_id', 'name discount_percentage')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Chuyển đổi sang plain object và thêm page_count
  const processedProducts = products.map(product => {
    const productObject = product.toObject();
    productObject.page_count = product.page;
    return productObject;
  });

  const total = await Product.countDocuments();
  return {
    products: processedProducts,
    totalRecords: total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Thêm hàm tìm kiếm sản phẩm theo barcode
async function findProductByBarcode(barcode) {
  const product = await Product.findOne({ barcode })
    .populate('category_id', 'category_name')
    .populate({
      path: 'publisher_id',
      select: 'name address contact_info'
    })
    .populate('discount_category_id', 'name discount_percentage');

  if (!product) throw new Error('Không tìm thấy sản phẩm');
  
  const productObject = product.toObject();
  productObject.page_count = product.page;
  
  return productObject;
}

async function reduceProductQuantity(productId, quantity) {
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  // Kiểm tra số lượng còn lại
  if (product.stock_quantity < quantity) {
    throw new Error(`Sản phẩm ${product.title} không đủ số lượng. Chỉ còn ${product.stock_quantity} sản phẩm.`);
  }

  // Giảm số lượng
  product.stock_quantity -= quantity;
  await product.save();

  return product;
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductList,
  findProductByBarcode,
  reduceProductQuantity
};

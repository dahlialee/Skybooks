const { body, param, validationResult } = require('express-validator');

// Middleware kiểm tra kết quả validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation cho sản phẩm
const productValidation = {
  create: [
    body('barcode')
      .notEmpty().withMessage('Mã vạch không được để trống')
      .isString().withMessage('Mã vạch phải là chuỗi'),
    
    body('title')
      .notEmpty().withMessage('Tiêu đề không được để trống')
      .isLength({ min: 3, max: 255 }).withMessage('Tiêu đề phải từ 3-255 ký tự'),
    
    body('author')
      .notEmpty().withMessage('Tác giả không được để trống')
      .isLength({ min: 2, max: 100 }).withMessage('Tên tác giả phải từ 2-100 ký tự'),
    
    body('category_id')
      .notEmpty().withMessage('Danh mục không được để trống')
      .isMongoId().withMessage('ID danh mục không hợp lệ'),
    
    body('price')
      .notEmpty().withMessage('Giá không được để trống')
      .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    
    body('stock_quantity')
      .notEmpty().withMessage('Số lượng tồn kho không được để trống')
      .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên dương'),
    
    validate
  ],

  update: [
    param('id').isMongoId().withMessage('ID sản phẩm không hợp lệ'),
    
    body('title')
      .optional()
      .isLength({ min: 3, max: 255 }).withMessage('Tiêu đề phải từ 3-255 ký tự'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    
    body('stock_quantity')
      .optional()
      .isInt({ min: 0 }).withMessage('Số lượng tồn kho phải là số nguyên dương'),
    
    validate
  ]
};

// Validation cho người dùng
const userValidation = {
  register: [
    body('email')
      .notEmpty().withMessage('Email không được để trống')
      .isEmail().withMessage('Email không hợp lệ'),
    
    body('password')
      .notEmpty().withMessage('Mật khẩu không được để trống')
      .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    
    body('fullName')
      .notEmpty().withMessage('Tên không được để trống')
      .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
    
    validate
  ],

  login: [
    body('email')
      .notEmpty().withMessage('Email không được để trống')
      .isEmail().withMessage('Email không hợp lệ'),
    
    body('password')
      .notEmpty().withMessage('Mật khẩu không được để trống'),
    
    validate
  ]
};

module.exports = {
  productValidation,
  userValidation
}; 
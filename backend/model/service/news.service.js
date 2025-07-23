const News = require('../entity/news.schema');
const Employee = require('../entity/employee.schema')
const Customer = require('../entity/customer.schema')

async function createNews(data) {
  const {
    title,
    content,
    image,
    employee_id,
    status = 'Bản nháp',
    scheduled_date
  } = data

  if(!title || !content) throw new Error('Tiêu đề và nội dung là bắt buộc');

  const employee = await Employee.findById(employee_id);
  if(!employee) throw new Error('Nhân viên không tồn tại.');

  const newNews = new News({
    title,
    content,
    image,
    employee_id,
    status,
    scheduled_date: status === 'Đã lên lịch' ? scheduled_date: undefined
  });

  await newNews.save();
  return newNews;
}

async function updateNews(id, data) {
  const news = await News.findById(id);
  if(!news) throw new Error('Bài viết không tồn tại');

  const fields = ['title', 'content', 'image', 'status', 'scheduled_date'];
  fields.forEach(field => {
    if (data[field] !== undefined) {
      news[field] = data[field];
    }
  });

  await news.save();
  return news;
}

async function deleteNews(id) {
  const news = await News.findById(id);
  if(!news) throw new Error ('Bài viết không tồn tại.')
  await news.deleteOne();
  return true;
}

async function getNewsById(id) {
  const news = await News.findById(id)
    .populate('employee_id', 'name')
    .populate('comments.customer_id', 'name');
  if(!news) throw new Error('Bài viết không tồn tại');
  return news;
}

// Hàm mới cho user - chỉ lấy tin tức đã đăng
async function getPublishedNewsById(id) {
  const news = await News.findOne({ _id: id, status: 'Đã đăng' })
    .populate('employee_id', 'name')
    .populate('comments.customer_id', 'name');
  if(!news) throw new Error('Bài viết không tồn tại hoặc chưa được đăng');
  return news;
}

async function getNewsList(page = 1, limit = 0, search = '') {
  const skip = (page - 1) * limit;

  // Điều kiện tìm kiếm chỉ lấy tin đã đăng
  const searchQuery = {
    status: 'Đã đăng'
  };

  // Nếu có từ khóa tìm kiếm, thêm điều kiện
  if (search) {
    searchQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const list = await News.find(searchQuery)
    .sort({ publish_date: -1 })
    .skip(skip)
    .limit(limit || 0)
    .populate('employee_id', 'name');
  
  const total = await News.countDocuments(searchQuery);

  return {
    data: list,
    totalRecords: total,
    page,
    totalPages: Math.ceil(total / (limit || total)),
    limit
  };
}

// Hàm mới cho admin - lấy tất cả tin tức (mọi trạng thái)
async function getAllNewsList(page = 1, limit = 0, search = '') {
  const skip = (page - 1) * limit;

  // Điều kiện tìm kiếm - không lọc theo trạng thái
  const searchQuery = {};

  // Nếu có từ khóa tìm kiếm, thêm điều kiện
  if (search) {
    searchQuery.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const list = await News.find(searchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit || 0)
    .populate('employee_id', 'name');
  
  const total = await News.countDocuments(searchQuery);

  return {
    data: list,
    totalRecords: total,
    page,
    totalPages: Math.ceil(total / (limit || total)),
    limit
  };
}

async function addComment(newsId, customerId, commentContent) {
  const news = await News.findById(newsId);
  if(!news) throw new Error('Bài viết không tồn tại');

  const customer = await Customer.findById(customerId);
  if(!customer) throw new Error('Khách hàng không tồn tại');

  news.comments.push({
    customer_id: customerId,
    content: commentContent
  });

  await news.save();
  return news;
}

async function incrementView(newsId) {
  await News.findByIdAndUpdate(newsId, {$inc: {views: 1}});
}

async function incrementReact(newsId) {
  await News.findByIdAndUpdate(newsId, {$inc: {reacts: 1}});
}

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  getNewsById,
  getNewsList,
  getAllNewsList,
  addComment,
  incrementView,
  incrementReact,
  getPublishedNewsById
};
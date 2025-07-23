const Publisher = require('../entity/publisher.schema');

// Lấy danh sách nhà xuất bản với phân trang & tìm kiếm
const getAllPublishers = async ({ page = 1, limit = 0, search = "" }) => {
  const query = search
    ? { name: { $regex: search, $options: 'i' } }
    : {};

  const total = await Publisher.countDocuments(query);
  const publishers = await Publisher.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    data: publishers,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total
  };
};

// Lấy chi tiết 1 nhà xuất bản
const getPublisherById = async (id) => {
  return await Publisher.findById(id);
};

// Thêm nhà xuất bản
const createPublisher = async (data) => {
  const newPublisher = new Publisher(data);
  return await newPublisher.save();
};

// Cập nhật nhà xuất bản
const updatePublisher = async (id, data) => {
  return await Publisher.findByIdAndUpdate(id, data, { new: true });
};

// Xoá nhà xuất bản
const deletePublisher = async (id) => {
  return await Publisher.findByIdAndDelete(id);
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
};

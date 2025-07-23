const newsService = require('../model/service/news.service');

const createNews = async (req, res) => {
  try {
    const newsData = req.body;
    const newNews = await newsService.createNews(newsData);
    res.status(201).json({
      success: true,
      message: 'Tạo tin tức thành công',
      data: newNews,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const updatedNews = await newsService.updateNews(req.params.id, req.body);
    if (!updatedNews) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
    }
    res.json({
      success: true,
      message: 'Cập nhật tin tức thành công',
      data: updatedNews,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const deleted = await newsService.deleteNews(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
    }
    res.json({ success: true, message: 'Xóa tin tức thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await newsService.getNewsById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getNewsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const result = await newsService.getNewsList(page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller mới cho admin - lấy tất cả tin tức
const getAllNewsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const search = req.query.search || '';
    const result = await newsService.getAllNewsList(page, limit, search);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Controller mới cho user - chỉ lấy tin tức đã đăng
const getPublishedNewsById = async (req, res) => {
  try {
    const news = await newsService.getPublishedNewsById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tức' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Tăng lượt xem tin tức
const incrementView = async (req, res) => {
  try {
    await newsService.incrementView(req.params.id);
    res.json({ success: true, message: 'Đã tăng lượt xem' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNews,
  updateNews,
  deleteNews,
  getNewsById,
  getNewsList,
  getAllNewsList,
  getPublishedNewsById,
  incrementView,
};

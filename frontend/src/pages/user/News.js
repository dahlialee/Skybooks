import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNews } from '../../services/newsAPI';
import { 
  FaNewspaper, 
  FaSearch, 
  FaSpinner, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaClock 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils';

const NewsCard = ({ news, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
    >
      {/* Hình ảnh */}
      <div className="relative">
        <img 
          src={`/image/${news.image || 'default.jpg'}`} 
          alt={news.title} 
          className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity"
        />
        
        {/* Ngày đăng */}
        <div className="absolute top-4 left-4 bg-white/80 rounded-full px-3 py-1 text-sm flex items-center gap-2">
          <FaClock className="text-gray-600" />
          {formatDate(news.publish_date)}
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
          {news.title}
        </h3>
        
        {/* Thống kê */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
          <div className="flex items-center gap-2">
            <FaEye />
            <span>{news.views || 0} lượt xem</span>
          </div>
          <div className="flex items-center gap-2">
            <FaHeart className="text-red-500" />
            <span>{news.reacts || 0} lượt thích</span>
          </div>
          <div className="flex items-center gap-2">
            <FaComment className="text-blue-500" />
            <span>{news.comments?.length || 0} bình luận</span>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <p className="text-gray-600 line-clamp-3 mb-4">
          {news.content.substring(0, 150)}...
        </p>

        {/* Nút đọc thêm */}
        <div className="text-right">
          <span className="text-blue-600 font-semibold hover:underline">
            Đọc chi tiết →
          </span>
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Tải danh sách tin tức
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await fetchNews(page, 6, searchQuery);
        
        setNews(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error('Không thể tải tin tức. Vui lòng thử lại.');
        console.error('Lỗi tải tin tức:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [page, searchQuery]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Chuyển đến trang chi tiết tin tức
  const handleNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  // Render phân trang
  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-4 py-2 mx-1 rounded-lg transition-all duration-300
            ${page === i 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:shadow-md'
            }
          `}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-4">
            <FaNewspaper className="text-blue-600" />
            Tin Tức Mới Nhất
          </h1>
          <p className="text-gray-600 mt-4">Cập nhật thông tin và kiến thức</p>
        </div>

        {/* Thanh tìm kiếm */}
        <form 
          onSubmit={handleSearch} 
          className="mb-12 flex items-center justify-center"
        >
          <div className="relative w-full max-w-2xl">
            <input 
              type="text" 
              placeholder="Tìm kiếm tin tức..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        {/* Danh sách tin tức */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-6xl text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((newsItem) => (
              <div 
                key={newsItem._id} 
                onClick={() => handleNewsClick(newsItem._id)}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
              >
                <div className="relative">
                  <img 
                    src={`/image/${newsItem.image || 'default.jpg'}`} 
                    alt={newsItem.title} 
                    className="w-full h-56 object-cover group-hover:opacity-90 transition-opacity"
                  />
                  
                  {/* Ngày đăng */}
                  <div className="absolute top-4 left-4 bg-white/80 rounded-full px-3 py-1 text-sm flex items-center gap-2">
                    <FaClock className="text-gray-600" />
                    {formatDate(newsItem.publish_date)}
                  </div>
                </div>

                {/* Nội dung */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {newsItem.title}
                  </h3>
                  
                  {/* Thống kê */}
                  <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <FaEye />
                      <span>{newsItem.views || 0} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaHeart className="text-red-500" />
                      <span>{newsItem.reacts || 0} lượt thích</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaComment className="text-blue-500" />
                      <span>{newsItem.comments?.length || 0} bình luận</span>
                    </div>
                  </div>

                  {/* Mô tả ngắn */}
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {newsItem.content.substring(0, 150)}...
                  </p>

                  {/* Nút đọc thêm - giờ đây chỉ để trang trí */}
                  <div className="text-right">
                    <span className="text-blue-600 font-semibold hover:underline">
                      Đọc chi tiết →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              {renderPagination()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;

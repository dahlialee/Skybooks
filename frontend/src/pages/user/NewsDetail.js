import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublishedNewsById, fetchNews, incrementNewsViews } from '../../services/newsAPI';
import { 
  FaArrowLeft, 
  FaClock, 
  FaUser, 
  FaEye, 
  FaHeart, 
  FaComment, 
  FaSpinner 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils';

const RelatedNewsCard = ({ news, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
    >
      <img 
        src={`/image/${news.image || 'default.jpg'}`} 
        alt={news.title} 
        className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = '/image/default.jpg' 
        }}
      />
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
          {news.title}
        </h4>
        <div className="flex items-center justify-between text-gray-600 text-xs">
          <div className="flex items-center gap-1">
            <FaClock className="text-gray-500" />
            {formatDate(news.publish_date)}
          </div>
          <div className="flex items-center gap-1">
            <FaEye className="text-blue-500" />
            {news.views || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsDetail = () => {
  const [newsDetail, setNewsDetail] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchPublishedNewsById(id);
        
        // Kiểm tra và xử lý dữ liệu trả về
        const newsData = response.data.success 
          ? response.data.data 
          : null;
        
        setNewsDetail(newsData);
        
        // Log để debug
        console.log('Chi tiết tin tức:', newsData);

        // Tăng lượt xem
        if (newsData) {
          try {
            await incrementNewsViews(id);
          } catch (error) {
            console.error('Lỗi tăng lượt xem:', error);
          }
        }

        // Lấy tin tức liên quan
        const relatedResponse = await fetchNews(1, 4);
        setRelatedNews(
          relatedResponse.data.data.filter(news => news._id !== id)
        );
      } catch (error) {
        console.error('Lỗi tải chi tiết tin tức:', error);
        toast.error('Không thể tải chi tiết tin tức');
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };

    loadNewsDetail();
  }, [id, navigate]);

  // Quay lại trang tin tức
  const handleGoBack = () => {
    navigate('/news');
  };

  // Chuyển đến chi tiết tin tức khác
  const handleRelatedNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-6xl text-blue-500" />
      </div>
    );
  }

  // Không tìm thấy tin tức
  if (!newsDetail) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-gray-600">
        Không tìm thấy tin tức
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Nút quay lại */}
        <button 
          onClick={handleGoBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Quay lại danh sách tin tức
        </button>

        {/* Khung tin tức chính */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Phần trên: Hình ảnh và thông tin */}
          <div className="flex flex-col lg:flex-row items-stretch">
            {/* Cột hình ảnh */}
            <div className="w-full lg:w-1/3 p-4">
              <img 
                src={newsDetail.image ? `/image/${newsDetail.image}` : '/image/default-cover.png'} 
                alt={newsDetail.title} 
                className="w-full h-64 lg:h-full object-cover rounded-xl"
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = '/image/default-cover.png' 
                }}
              />
            </div>

            {/* Cột thông tin */}
            <div className="w-full lg:w-2/3 p-6 space-y-4">
              {/* Tiêu đề */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                {newsDetail.title}
              </h1>

              {/* Thông tin meta */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-700 space-x-3">
                  <FaUser className="text-blue-500 text-xl" />
                  <span className="font-semibold">
                    {newsDetail.employee_id?.name || 'Skybooks'}
                  </span>
                </div>
                <div className="flex items-center text-gray-700 space-x-3">
                  <FaClock className="text-green-500 text-xl" />
                  <span>
                    {formatDate(newsDetail.publish_date)}
                  </span>
                </div>
                
                {/* Thống kê */}
                <div className="flex flex-wrap justify-between items-center bg-blue-50 p-4 rounded-lg gap-4">
                  <div className="flex items-center gap-2">
                    <FaEye className="text-blue-500" />
                    <span>{newsDetail.views || 0} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    <span>{newsDetail.reacts || 0} lượt thích</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComment className="text-green-500" />
                    <span>{newsDetail.comments?.length || 0} bình luận</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phần dưới: Nội dung */}
          <div className="p-6 bg-gray-50 border-t">
            {/* Nội dung chính */}
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
              {newsDetail.content}
            </div>
          </div>
        </div>

        {/* Tin tức liên quan */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Tin Tức Khác
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedNews.map((news) => (
              <RelatedNewsCard 
                key={news._id} 
                news={news} 
                onClick={() => handleRelatedNewsClick(news._id)} 
              />
            ))}
          </div>
          {relatedNews.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Không có tin tức liên quan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;

import React, { useEffect, useState, useContext } from 'react';
import BannerBackground from '../../components/user/Banner';
import { fetchProducts } from '../../services/productAPI';
import { FaBook, FaStar, FaNewspaper, FaQuoteRight, FaEye, FaShoppingCart, FaRegHeart, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { addItemToCart } from '../../services/cartAPI';
import { fetchNews } from '../../services/newsAPI';
import { fetchInvoices } from '../../services/invoiceAPI';
import { formatCurrency, formatDate } from '../../utils';
import { UserContext } from '../../context/UserContext';

const Home = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [likedBooks, setLikedBooks] = useState({});
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserContext);

  // Lấy sản phẩm từ API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Log chi tiết từng bước
        console.log('Bắt đầu tải dữ liệu');
        
        // Lấy sản phẩm mới nhất
        const newProductsResponse = await fetchProducts(1, 5);
        console.log('Dữ liệu sản phẩm mới:', newProductsResponse);
        
        // Lấy tin tức
        const newsResponse = await fetchNews();
        console.log('Dữ liệu tin tức:', newsResponse);

        // Lấy hóa đơn để tính sản phẩm nổi bật
        const invoicesResponse = await fetchInvoices();
        console.log('Dữ liệu hóa đơn:', invoicesResponse);

        // Xử lý sản phẩm nổi bật dựa trên tổng số lượng bán
        const productSales = {};
        
        // Kiểm tra và log từng bước
        if (invoicesResponse && invoicesResponse.data) {
          console.log('Cấu trúc dữ liệu hóa đơn:', Object.keys(invoicesResponse.data));
          
          const invoiceData = invoicesResponse.data.data || invoicesResponse.data;
          console.log('Dữ liệu hóa đơn chi tiết:', invoiceData);
          
          if (Array.isArray(invoiceData)) {
            invoiceData.forEach(invoice => {
              console.log('Từng hóa đơn:', invoice);
              
              if (invoice.products && Array.isArray(invoice.products)) {
                invoice.products.forEach(item => {
                  console.log('Từng sản phẩm trong hóa đơn:', item);
                  productSales[item.product_id] = (productSales[item.product_id] || 0) + (item.quantity || 0);
                });
              }
            });
          }
        }

        console.log('Tổng doanh số sản phẩm:', productSales);

        // Lấy tất cả sản phẩm để tìm sản phẩm nổi bật
        const allProductsResponse = await fetchProducts();
        console.log('Tất cả sản phẩm:', allProductsResponse);

        const featuredProducts = allProductsResponse.data.products
          .map(product => ({
            ...product,
            totalSales: productSales[product._id] || 0
          }))
          .filter(product => product.totalSales > 0)
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 2);

        console.log('Sản phẩm nổi bật:', featuredProducts);

        // Cập nhật state
        setNewProducts(newProductsResponse.data.products || []);
        setFeaturedNews(newsResponse.data.data || []);
        setFeaturedProducts(featuredProducts);
        
      } catch (error) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const toggleLike = (bookId, e) => {
    e.stopPropagation();
    setLikedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };


  const addToCartHandler = async (book, e) => {
    e.stopPropagation();

    try {
      // Đồng bộ với server trước
      const response = await addItemToCart({
        product_id: book._id,
        quantity: 1,
        customer_id: user?.id || null
      });

      // Chỉ thêm vào context sau khi server thành công
      const cartItem = {
        id: book._id,
        name: book.title,
        price: book.price - (book.price * (book.discount_percent || 0)) / 100,
        quantity: 1,
        image: `/image/${book.cover_image || 'default.jpg'}`,
        product_id: book
      };

      // Thêm vào giỏ hàng context
      addToCart(cartItem);

      // Log full response for debugging
      console.log('Thêm vào giỏ hàng - Phản hồi từ server:', response);

      toast.success(`✅ Đã thêm "${book.title}" vào giỏ hàng!`);
    } catch (err) {
      // Chi tiết hơn về lỗi
      if (err.response) {
        // Lỗi từ phía server
        console.error("Lỗi server khi thêm vào giỏ hàng:", err.response.data);
        toast.error(`❌ ${err.response.data.message || 'Thêm vào giỏ hàng thất bại!'}`);
      } else if (err.request) {
        // Lỗi kết nối
        console.error("Lỗi kết nối khi thêm vào giỏ hàng:", err.request);
        toast.error("❌ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        // Lỗi khác
        console.error("Lỗi không xác định khi thêm vào giỏ hàng:", err.message);
        toast.error("❌ Đã xảy ra lỗi không xác định.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative h-[500px] mb-12">
        <BannerBackground />
        
      </div>

      {/* Sản Phẩm Mới */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center mb-6">
          <FaBook className="mr-3 text-blue-500 text-2xl" />
          <h2 className="text-3xl font-semibold text-gray-800">Sách Mới Nhất</h2>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-5 gap-6 px-4">
          {newProducts.map(book => (
            <div
              key={book._id}
              className="relative border rounded-lg bg-white shadow-sm hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col"
              onClick={() => navigate(`/product/${book._id}`)}
            >
              <img
                src={`/image/${book.cover_image || 'default.jpg'}`}
                alt={book.title}
                className="w-full h-52 object-cover rounded-t-lg"
                loading="lazy"
              />
              <div className="p-3 flex-grow flex flex-col">
                <h3 className="font-semibold text-base line-clamp-2">{book.title}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">{book.author}</p>
                <div className="text-red-600 font-bold mt-auto text-lg">{formatCurrency(book.price)}</div>
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition duration-300 z-10" />
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition duration-300 z-20">
                <button
                  onClick={(e) => toggleLike(book._id, e)}
                  className="bg-white p-2 rounded-full text-red-500 shadow hover:scale-110 transition"
                  title={likedBooks[book._id] ? 'Bỏ yêu thích' : 'Yêu thích'}
                >
                  {likedBooks[book._id] ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button
                  onClick={(e) => navigate(`/product/${book._id}`)}
                  className="bg-white p-2 rounded-full text-blue-600 shadow hover:scale-110 transition"
                  title="Xem chi tiết"
                >
                  <FaEye />
                </button>
                <button
                  onClick={(e) => addToCartHandler(book, e)}
                  className="bg-green-500 p-2 rounded-full text-white shadow hover:bg-green-600 hover:scale-110 transition"
                  title="Thêm vào giỏ hàng"
                >
                  <FaShoppingCart />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sản Phẩm Tiêu Biểu */}
      {/* <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center mb-6">
          <FaStar className="mr-3 text-yellow-500 text-2xl" />
          <h2 className="text-3xl font-semibold text-gray-800">Sách Nổi Bật</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featuredProducts.map(product => (
            <div 
              key={product._id} 
              className="bg-white rounded-lg shadow-md flex overflow-hidden hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img 
                src={`/image/${product.cover_image || 'default-book.jpg'}`} 
                alt={product.title} 
                className="w-1/3 object-cover"
              />
              <div className="p-4 w-2/3">
                <h3 className="font-semibold text-gray-800 mb-2">{product.title}</h3>
                <p className="text-blue-600 font-bold mb-2">{product.author}</p>
                <p className="text-green-600 mb-4">Đã bán: {product.totalSales || 0}</p>
                <p className="text-red-600 font-bold mb-4">{formatCurrency(product.price)}</p>
                <button 
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  Xem Chi Tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Tin Tức */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center mb-6">
          <FaNewspaper className="mr-3 text-green-500 text-2xl" />
          <h2 className="text-3xl font-semibold text-gray-800">Tin Tức Mới</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredNews.slice(0, 3).map(news => (
            <div 
              key={news._id} 
              className="relative bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => navigate(`/news/${news._id}`)}
            >
              <div className="relative">
                <img 
                  src={`/image/${news.image || 'default-cover.png'}`} 
                  alt={news.title} 
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <p className="text-gray-500 text-sm mb-2">{formatDate(news.createdAt)}</p>
                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{news.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">{news.description}</p>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                  <button 
                    className="bg-white text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors"
                    onClick={() => navigate(`/news/${news._id}`)}
                  >
                    Đọc Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Đánh Giá Mới Nhất */}
      {/* <section className="container mx-auto px-4 mb-12">
        <div className="flex items-center mb-6">
          <FaQuoteRight className="mr-3 text-purple-500 text-2xl" />
          <h2 className="text-3xl font-semibold text-gray-800">Đánh Giá Gần Đây</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map(review => (
            <div 
              key={review.id} 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="inline text-yellow-400 mr-1" />
                  ))}
                </div>
                <h3 className="font-semibold text-gray-800">{review.name}</h3>
              </div>
              <p className="text-gray-600 italic">"{review.content}"</p>
            </div>
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default Home;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../services/productAPI';
import { addItemToCart } from '../../services/cartAPI';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext';
import { FaBook, FaUser, FaBuilding, FaWeight, FaLanguage, FaRulerCombined } from 'react-icons/fa';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const productResponse = await fetchProductById(id);
        setProduct(productResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm');
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [id]);

  const addToCartHandler = async (e) => {
    e.preventDefault();
    
    if (!product || !product.data) {
      toast.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    const book = product.data;

    try {
      const cartItem = {
        id: book._id,
        name: book.title,
        price: book.price - (book.price * (book.discount_percent || 0)) / 100,
        quantity: quantity,
        image: `/image/${book.cover_image || 'default.jpg'}`,
        product_id: book
      };

      addToCart(cartItem);

      const response = await addItemToCart({
        product_id: book._id,
        quantity: quantity
      });

      console.log('Thêm vào giỏ hàng - Phản hồi từ server:', response);

      toast.success(`✅ Đã thêm "${book.title}" vào giỏ hàng!`);
    } catch (err) {
      if (err.response) {
        console.error("Lỗi server khi thêm vào giỏ hàng:", err.response.data);
        toast.error(`❌ ${err.response.data.message || 'Thêm vào giỏ hàng thất bại!'}`);
      } else if (err.request) {
        console.error("Lỗi kết nối khi thêm vào giỏ hàng:", err.request);
        toast.error("❌ Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        console.error("Lỗi không xác định khi thêm vào giỏ hàng:", err.message);
        toast.error("❌ Đã xảy ra lỗi không xác định.");
      }
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    
    if (!product || !product.data) {
      toast.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    const book = product.data;

    try {
      // Chuẩn bị dữ liệu sản phẩm để chuyển sang trang checkout
      const selectedItem = {
        id: book._id,
        name: book.title,
        price: book.price - (book.price * (book.discount_percent || 0)) / 100,
        quantity: quantity,
        image: `/image/${book.cover_image || 'default.jpg'}`,
        stock_quantity: book.stock_quantity
      };

      // Chuyển hướng đến trang checkout với thông tin sản phẩm
      navigate('/checkout', { 
        state: { 
          directPurchase: true,
          selectedItems: [selectedItem] 
        } 
      });
    } catch (err) {
      console.error('Lỗi khi chuyển đến trang thanh toán:', err);
      toast.error('Không thể chuyển đến trang thanh toán');
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, product?.data?.stock_quantity || 1)));
  };

  const handleQuantityInput = (e) => {
    const inputValue = parseInt(e.target.value);
    const maxQuantity = product?.data?.stock_quantity || 1;
    
    if (!isNaN(inputValue) && inputValue > 0) {
      setQuantity(Math.min(inputValue, maxQuantity));
    } else if (e.target.value === '') {
      setQuantity(1);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!product) return <div className="text-center mt-10">Không tìm thấy sản phẩm</div>;

  const productData = product.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Hình ảnh sản phẩm */}
        <div className="flex justify-center items-center">
          <img 
            src={`/image/${productData.cover_image || 'default.jpg'}`} 
            alt={productData.title} 
            className="max-w-full h-auto object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Thông tin chi tiết sản phẩm */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{productData.title}</h1>
          
          {/* Thông tin cơ bản */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-semibold text-green-600">
                {productData.price ? productData.price.toLocaleString() : 'Liên hệ'} VND
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                productData.stock_quantity > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
              }`}>
                {productData.stock_quantity > 0 ? `Còn hàng: ${productData.stock_quantity}` : 'Hết hàng'}
              </span>
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <FaUser className="mr-2 text-blue-500" />
                <span>Tác giả: {productData.author || 'Không rõ'}</span>
              </div>
              <div className="flex items-center">
                <FaBuilding className="mr-2 text-blue-500" />
                <span>NXB: {productData.publisher_id?.name || productData.publisher || 'Không rõ'}</span>
              </div>
              <div className="flex items-center">
                <FaWeight className="mr-2 text-blue-500" />
                <span>Khối lượng: {productData.weight || 'Không rõ'} g</span>
              </div>
              <div className="flex items-center">
                <FaLanguage className="mr-2 text-blue-500" />
                <span>Ngôn ngữ: {productData.language || 'Không rõ'}</span>
              </div>
              <div className="flex items-center">
                <FaBook className="mr-2 text-blue-500" />
                <span>Số trang: {productData.page_count || productData.page || 'Không rõ'}</span>
              </div>
              <div className="flex items-center">
                <FaRulerCombined className="mr-2 text-blue-500" />
                <span>Kích thước: {productData.dimensions || 'Không rõ'}</span>
              </div>
            </div>

            {/* Điều chỉnh số lượng */}
            <form onSubmit={addToCartHandler} className="flex items-center space-x-4">
              <div className="flex items-center">
                <button 
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className={`bg-gray-200 px-3 py-1 rounded-md ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product?.data?.stock_quantity || 1}
                  value={quantity}
                  onChange={handleQuantityInput}
                  className="w-16 text-center mx-4 border border-gray-300 rounded-md"
                />
                <button 
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product?.data?.stock_quantity || 1)}
                  className={`bg-gray-200 px-3 py-1 rounded-md ${quantity >= (product?.data?.stock_quantity || 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                >
                  +
                </button>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit"
                  disabled={productData.stock_quantity === 0}
                  className={`px-6 py-2 rounded-md text-white ${
                    productData.stock_quantity > 0 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Thêm vào giỏ hàng
                </button>
                <button 
                  type="button"
                  onClick={handleBuyNow}
                  disabled={productData.stock_quantity === 0}
                  className={`px-6 py-2 rounded-md text-white ${
                    productData.stock_quantity > 0 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Mua Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mô tả sản phẩm</h2>
            <p className="text-gray-700 leading-relaxed">
              {productData.description || 'Không có mô tả chi tiết'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
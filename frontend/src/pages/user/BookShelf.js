import React, { useState, useEffect, useContext } from 'react';
import { FaHeart, FaRegHeart, FaEye, FaShoppingCart } from 'react-icons/fa';
import { fetchPublishers } from '../../services/publisherAPI';
import { fetchCategoryProducts } from '../../services/categoryProductAPI';
import { fetchProducts } from '../../services/productAPI';
import { addItemToCart } from '../../services/cartAPI';
import { toast } from 'react-toastify';
import { CartContext } from '../../context/CartContext';
import { UserContext } from '../../context/UserContext';
import { formatCurrency } from '../../utils';

function BookshelfPage() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [publisher, setPublisher] = useState('');
  const [price, setPrice] = useState(1000000);
  const [page, setPage] = useState(1);
  const [likedBooks, setLikedBooks] = useState({});

  useEffect(() => {
    fetchCategoryProducts()
      .then(res => setCategories(res.data.data))
      .catch(err => console.error('Category fetch error:', err));

    fetchPublishers()
      .then(res => setPublishers(res.data.data))
      .catch(err => console.error('Publisher fetch error:', err));

    fetchProducts()
      .then(res => setBooks(res.data.products))
      .catch(err => console.error('Books fetch error:', err));
  }, []);

  const filteredBooks = books
    .filter(b =>
      (!publisher || b.publisher_id?.name === publisher) &&
      (!activeCategory || b.category_id?.category_name === activeCategory) &&
      b.price <= price &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.description?.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'bestseller': return b.sold - a.sold;
        default: return 0;
      }
    });

  const booksPerPage = 10;
  const pageCount = Math.ceil(filteredBooks.length / booksPerPage);
  const currentBooks = filteredBooks.slice((page - 1) * booksPerPage, page * booksPerPage);

  const toggleLike = (bookId, e) => {
    e.stopPropagation();
    setLikedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  const goToBook = (bookId, e) => {
    e?.stopPropagation();
    window.location.href = `/product/${bookId}`;
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
    <div className="overflow-auto relative px-5 py-6 bg-gray-50 min-h-screen">
      {/* Categories */}
      <h2 className="mb-4 text-2xl text-center">Danh mục kệ sách</h2>
      <div className="grid grid-cols-5 gap-4 p-4 mb-6">
        {categories.map(cat => (
          <div
            key={cat._id || cat.id}
            className={`text-center border rounded-lg py-3 cursor-pointer transition
              ${activeCategory === cat.category_name
                ? 'bg-blue-600 text-white font-semibold shadow-lg'
                : 'bg-white hover:bg-blue-100 hover:text-blue-700'}`}
            onClick={() => setActiveCategory(cat.category_name)}
          >
            {cat.category_name}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
        <select
          className="border border-gray-300 rounded px-3 py-2 shadow-sm"
          onChange={(e) => setPublisher(e.target.value)}
          value={publisher}
        >
          <option value="">-- Chọn NXB --</option>
          {publishers.map(pub => (
            <option key={pub._id || pub.id} value={pub.name}>{pub.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Giá tối đa:</span>
          <input
            type="range"
            min="0"
            max="1000000"
            value={price}
            onChange={(e) => setPrice(+e.target.value)}
            className="cursor-pointer"
          />
          <span className="text-sm font-semibold">{formatCurrency(price)}</span>
        </div>

        <select
          className="border border-gray-300 rounded px-3 py-2 shadow-sm"
          onChange={(e) => setSort(e.target.value)}
          value={sort}
        >
          <option value="">-- Sắp xếp --</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
          <option value="newest">Mới nhất</option>
          <option value="bestseller">Bán chạy</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
        </select>

        <input
          type="search"
          placeholder="Tìm kiếm theo tên, tác giả, mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 shadow-sm w-64"
        />
      </div>

      {/* Breadcrumb */}
      <div className="px-4 mb-4 text-gray-600 text-sm select-none">
        <span 
          className={`cursor-pointer hover:text-blue-600 ${activeCategory === null && !publisher ? 'font-medium text-gray-600' : ''}`}
          onClick={() => {
            setActiveCategory(null);
            setPublisher('');
          }}
        >
          Tất cả sản phẩm
        </span>
        {activeCategory && (
          <span className="ml-2">
            <span 
              className={`cursor-pointer hover:text-blue-600 ${activeCategory !== null ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setPublisher('');
              }}
            >
              / {activeCategory}
            </span>
          </span>
        )}
        {publisher && (
          <span className="ml-2">
            / {publisher}
          </span>
        )}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-5 gap-6 px-4">
        {currentBooks.map(book => (
          <div
            key={book._id}
            className="relative border rounded-lg bg-white shadow-sm hover:shadow-lg cursor-pointer group overflow-hidden flex flex-col"
            onClick={() => goToBook(book._id)}
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
                onClick={(e) => goToBook(book._id, e)}
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

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">
        <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
          &laquo;
        </button>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">
          &lsaquo;
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`px-3 py-1 border rounded ${n === page ? 'bg-blue-600 text-white' : ''}`}
          >
            {n}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-3 py-1 border rounded disabled:opacity-50">
          &rsaquo;
        </button>
        <button onClick={() => setPage(pageCount)} disabled={page === pageCount} className="px-3 py-1 border rounded disabled:opacity-50">
          &raquo;
        </button>
      </div>
    </div>
  );
}

export default BookshelfPage;

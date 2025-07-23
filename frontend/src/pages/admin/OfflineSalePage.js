import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../../services/productAPI';
import { fetchCategoryProducts } from '../../services/categoryProductAPI';
import { addInvoice, createOfflineInvoice } from '../../services/invoiceAPI';
import { formatCurrency } from '../../utils';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';

// CSS cho line-clamp
const lineClampStyle = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const OfflineSalePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ context (cho user thường)
  const { user } = useContext(UserContext);

  // Lấy thông tin admin từ localStorage
  useEffect(() => {
    const storedAdminUser = localStorage.getItem('adminUser');
    if (storedAdminUser) {
      try {
        const adminData = JSON.parse(storedAdminUser);
        setAdminUser(adminData);
        console.log('Thông tin admin:', adminData);
      } catch (error) {
        console.error('Lỗi khi parse thông tin admin:', error);
      }
    } else {
      // Nếu không có thông tin admin, chuyển về trang đăng nhập
      toast.error('Vui lòng đăng nhập để sử dụng trang bán hàng');
      navigate('/admin/login');
    }
  }, [navigate]);

  // Lấy thông tin employee hiện tại (ưu tiên admin, sau đó là user)
  const currentEmployee = adminUser;
  console.log('currentEmployee', currentEmployee)

  // Tải danh sách sản phẩm và danh mục ban đầu
  useEffect(() => {
    const loadData = async () => {
      try {
        // Bắt đầu trạng thái loading
        setIsLoading(true);

        // Gọi API song song
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchProducts(1, 0, ''),
          fetchCategoryProducts(1, 0, '')
        ]);

        // Xử lý dữ liệu sản phẩm
        const fetchedProducts = productsResponse.data?.products || [];

        // Xử lý dữ liệu danh mục
        const fetchedCategories = categoriesResponse.data?.data || [];

        // Kiểm tra và làm sạch dữ liệu
        const validProducts = fetchedProducts.filter(product => 
          product && product.barcode && product.title && product.author
        );

        const validCategories = fetchedCategories.filter(category => 
          category && category.category_name
        ).map((category, index) => ({
          ...category,
          id: category._id || `category_${index}`
        }));

        // Cập nhật state
        setProducts(validProducts);
        setCategories(validCategories);

        // Thông báo nếu không có dữ liệu
        if (validProducts.length === 0) {
          toast.warning('Không tìm thấy sản phẩm nào');
        }

        if (validCategories.length === 0) {
          toast.warning('Không tìm thấy danh mục nào');
        }

      } catch (error) {
        // Xử lý lỗi chi tiết
        console.error('Chi tiết lỗi tải dữ liệu:', error);
        
        // Thông báo lỗi cụ thể
        toast.error(
          error.response?.data?.message || 
          'Không thể tải danh sách sản phẩm và danh mục'
        );
      } finally {
        // Luôn tắt trạng thái loading
        setIsLoading(false);
      }
    };

    // Gọi hàm load data
    loadData();
  }, []); // Dependency array rỗng để chỉ chạy một lần khi component mount

  // Lọc và tìm kiếm sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery.trim() === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Log chi tiết để debug
      console.log('Product category_id:', product.category_id);
      console.log('Selected Category:', selectedCategory);

      // Xử lý trường hợp category_id là object
      const productCategoryId = product.category_id?._id || product.category_id;
      
      const matchesCategory = selectedCategory === '' || 
        productCategoryId === selectedCategory;
      
      console.log('Matches Category:', matchesCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    // Tìm sản phẩm trong giỏ hàng
    const existingItem = cartItems.find(item => item._id === product._id);
    
    if (existingItem) {
      // Nếu sản phẩm đã tồn tại, chỉ tăng số lượng
      setCartItems(cartItems.map(item => 
        item._id === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
      
      // Thông báo tăng số lượng
      toast.info(`Đã tăng số lượng ${product.title}`);
    } else {
      // Nếu sản phẩm chưa có trong giỏ, thêm mới với số lượng 1
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
      
      // Thông báo thêm sản phẩm mới
      toast.success(`Đã thêm ${product.title} vào giỏ hàng`);
    }
  };

  // Thay đổi số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      // Xóa sản phẩm khỏi giỏ hàng nếu số lượng = 0
      setCartItems(cartItems.filter(item => item._id !== productId));
    } else {
      setCartItems(cartItems.map(item => 
        item._id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    if (cartItems.length > 0) {
      if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
        setCartItems([]);
        toast.info('Đã xóa toàn bộ giỏ hàng');
      }
    }
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('adminUser');
      toast.info('Đã đăng xuất');
      navigate('/admin/login');
    }
  };

  // Tính toán chi tiết tiền
  const calculateTaxAndTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxRate = 0.1; // Thuế 10%
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total
    };
  };

  // Lưu đơn hàng offline
  const saveOfflineOrder = async () => {
    try {
      // Kiểm tra xem có sản phẩm trong giỏ hàng không
      if (cartItems.length === 0) {
        toast.warning('Giỏ hàng trống. Vui lòng thêm sản phẩm.');
        return;
      }

      // Kiểm tra thông tin người dùng
      if (!currentEmployee || !currentEmployee.id) {
        toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        return;
      }

      // Bắt đầu xử lý thanh toán
      setIsProcessingPayment(true);

      // Chuẩn bị dữ liệu hóa đơn với thông tin bổ sung
      const invoiceData = {
        total_amount: calculateTaxAndTotal().total,
        details: cartItems.map(item => ({
          product_id: item._id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.quantity * item.price,
          discount: 0
        })),
        // Thêm thông tin khách hàng mặc định
        shipping_info: {
          fullName: 'Khách hàng tại quầy',
          email: 'guest@skybooks.com',
          phone: '',
          address: '',
          note: 'Bán hàng tại quầy'
        },
        payment_method: 'COD',
        payment_status: 'Đã thanh toán',
        shipping_status: 'Đã giao',
        employee_id: currentEmployee.id, // ID của nhân viên tạo hóa đơn
        is_guest_order: true
      };

      console.log('Dữ liệu hóa đơn offline:', invoiceData);

      const response = await createOfflineInvoice(invoiceData);
      
      // Xử lý sau khi tạo hóa đơn thành công
      toast.success(`Tạo hóa đơn offline thành công! Mã hóa đơn: ${response.data.data._id}`);
      
      // Reset giỏ hàng
      setCartItems([]);
      
      // Log thông tin hóa đơn
      console.log('Hóa đơn đã tạo:', response.data);
      
    } catch (error) {
      console.error('Chi tiết lỗi:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Không thể tạo hóa đơn offline');
    } finally {
      // Kết thúc xử lý thanh toán
      setIsProcessingPayment(false);
    }
  };

  // Hiển thị loading nếu đang tải sản phẩm
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px - 40px)" }}>
      {/* CSS cho line-clamp */}
      <style>{lineClampStyle}</style>
      
      {/* Header với thông tin nhân viên */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bán Hàng Tại Quầy</h1>
            <div className="text-gray-600">
              <p>
                <span className="font-semibold">Nhân viên:</span> {currentEmployee?.name || 'Chưa xác định'} | 
                <span className="font-semibold"> ID:</span> {currentEmployee?.id || 'N/A'}
              </p>
              {currentEmployee?.role && (
                <p>
                  <span className="font-semibold">Vai trò:</span> {currentEmployee.role} | 
                  <span className="font-semibold"> Email:</span> {currentEmployee.email || 'N/A'}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
            <p className="text-sm text-gray-500">Giờ: {new Date().toLocaleTimeString('vi-VN')}</p>
            {/* {!currentEmployee && (
              <p className="text-xs text-red-500 mt-1">⚠️ Chưa đăng nhập</p>
            )}
            {currentEmployee && (
              <button 
                onClick={handleLogout}
                className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
              >
                Đăng xuất
              </button>
            )} */}
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="flex flex-1">
        {/* Nửa bên trái - Tìm kiếm và danh sách sản phẩm */}
        <div className="w-2/3 p-6 bg-gray-50 overflow-y-auto">
          <div className="mb-6">
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Danh mục sản phẩm */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                key="all-categories"
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Tất cả
              </button>
              {categories.map((category, index) => {
                // Sử dụng _id làm key và để chọn danh mục
                const categoryKey = category._id ? `${category._id}` : `${index}`;
                
                return (
                  <button
                    key={categoryKey}
                    onClick={() => {
                      console.log('Clicked category:', category);
                      // Chắc chắn sử dụng _id
                      setSelectedCategory(category._id || '');
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    {category.category_name || `Danh mục ${index + 1}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="grid grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="bg-white border rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition-all group"
                onClick={() => addToCart(product)}
              >
                <img 
                  src={`/image/${product.cover_image || 'default.jpg'}`} 
                  alt={product.title} 
                  className="w-full h-40 object-cover rounded-md mb-2"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = '/image/default.jpg' 
                  }}
                />
                <p className="font-semibold text-gray-800 mb-1 text-sm line-clamp-2">{product.title}</p>
                <p className="text-blue-600 font-bold mb-1">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Còn lại: {product.stock_quantity || 0}
                </p>
                <button 
                  className="mt-2 w-full bg-blue-500 text-white py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  disabled={!product.stock_quantity || product.stock_quantity <= 0}
                >
                  {!product.quantity || product.quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nửa bên phải - Giỏ hàng và thanh toán */}
        <div className="w-1/3 bg-white p-6 border-l shadow-lg flex flex-col">
          {/* Phần trên: Danh sách sản phẩm trong giỏ */}
          <div className="flex-grow overflow-y-auto mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-center">Danh Sách Sản Phẩm</h2>
              {cartItems.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                Giỏ hàng trống
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div 
                    key={item._id} 
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center">
                      <img 
                        src={`/image/${item.cover_image || 'default.jpg'}`} 
                        alt={item.title} 
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-gray-500 text-xs">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 bg-gray-200 rounded-l"
                      >
                        <FaMinus className="text-sm" />
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly
                        className="w-10 text-center border-t border-b text-sm"
                      />
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 bg-gray-200 rounded-r"
                      >
                        <FaPlus className="text-sm" />
                      </button>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần dưới: Thanh toán */}
          <div className="border-t pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng số lượng:</span>
                <span className="font-semibold">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền hàng:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateTaxAndTotal().subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế (10%):</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(calculateTaxAndTotal().tax)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-lg font-semibold">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(calculateTaxAndTotal().total)}
                </span>
              </div>
            </div>

            {/* Nút thanh toán */}
            <button 
              onClick={saveOfflineOrder}
              disabled={cartItems.length === 0 || isProcessingPayment || !currentEmployee}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center transition-colors"
            >
              {isProcessingPayment ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : !currentEmployee ? (
                'Vui lòng đăng nhập'
              ) : (
                `Thanh Toán (${currentEmployee.name})`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineSalePage; 
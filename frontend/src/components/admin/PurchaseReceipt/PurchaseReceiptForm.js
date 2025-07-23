import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { formatCurrency } from "../../../utils";
import { findProductByBarcode, addProduct } from "../../../services/productAPI";
import { fetchPublishers, addPublisher } from "../../../services/publisherAPI";
import ProductForm from "../Product/ProductForm";
import PublisherForm from "../Publisher/PublisherForm";

function PurchaseReceiptForm({ 
  isOpen, 
  onSubmit, 
  onCancel, 
  editData, 
  publisherList, 
  productList,
  categoryList,
  discountList,
  viewMode = false,
  displayMode = 'edit',
  onProductAdded
}) {
  // State cho form
  const [receiptCode, setReceiptCode] = useState("");
  const [publisher, setPublisher] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Mới");
  const [note, setNote] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isPublisherFormOpen, setIsPublisherFormOpen] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);
  const [currentBarcode, setCurrentBarcode] = useState("");
  const [publisherOptions, setPublisherOptions] = useState([]);
  const [isLoadingPublishers, setIsLoadingPublishers] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(displayMode === 'detail');
  
  // State cho dropdown tìm kiếm sản phẩm
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [isClickingDropdown, setIsClickingDropdown] = useState(false);

  // Tải danh sách nhà xuất bản
  const loadPublishers = async (searchTerm = "") => {
    try {
      setIsLoadingPublishers(true);
      const response = await fetchPublishers(1, 50, searchTerm);
      setPublisherOptions(response.data.data || []);
    } catch (error) {
      toast.error("Lỗi tải danh sách nhà xuất bản");
      console.error(error);
    } finally {
      setIsLoadingPublishers(false);
    }
  };

  // Tải danh sách nhà xuất bản khi component mount
  useEffect(() => {
    loadPublishers();
  }, []);

  // Lọc sản phẩm theo nhà xuất bản và từ khóa tìm kiếm
  const filterProducts = (searchTerm) => {
    console.log('Filtering products:', {
      searchTerm,
      publisher,
      productListLength: productList.length,
      itemsLength: items.length
    });

    // Debug: Kiểm tra cấu trúc dữ liệu sản phẩm đầu tiên
    if (productList.length > 0) {
      console.log('Sample product structure:', {
        product: productList[0],
        publisher_id: productList[0].publisher_id,
        publisher_id_type: typeof productList[0].publisher_id,
        publisher_id_id: productList[0].publisher_id?._id
      });
    }

    if (!searchTerm.trim()) {
      // Nếu không có từ khóa, hiển thị tất cả sản phẩm của nhà xuất bản đã chọn
      if (publisher) {
        const filtered = productList.filter(product => {
          // Xử lý cả trường hợp publisher_id là object và string
          const productPublisherId = typeof product.publisher_id === 'object' 
            ? product.publisher_id._id 
            : product.publisher_id;
          
          const matchesPublisher = productPublisherId === publisher;
          const notInList = !items.some(item => item.productId === product._id);
          
          console.log('Product filter:', {
            productId: product._id,
            productTitle: product.title,
            productPublisherId: productPublisherId,
            selectedPublisher: publisher,
            matchesPublisher,
            notInList
          });
          
          return matchesPublisher && notInList;
        });
        console.log('Filtered products (no search term):', filtered.length);
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts([]);
      }
    } else {
      // Nếu có từ khóa, tìm kiếm theo barcode hoặc tên sản phẩm
      const filtered = productList.filter(product => {
        const matchesSearch = product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Xử lý cả trường hợp publisher_id là object và string
        const productPublisherId = typeof product.publisher_id === 'object' 
          ? product.publisher_id._id 
          : product.publisher_id;
        
        const matchesPublisher = !publisher || productPublisherId === publisher;
        const notInList = !items.some(item => item.productId === product._id);
        
        console.log('Product search filter:', {
          productId: product._id,
          productTitle: product.title,
          productBarcode: product.barcode,
          searchTerm,
          matchesSearch,
          productPublisherId,
          selectedPublisher: publisher,
          matchesPublisher,
          notInList
        });
        
        return matchesSearch && matchesPublisher && notInList;
      });
      console.log('Filtered products (with search term):', filtered.length);
      setFilteredProducts(filtered);
    }
  };

  // Cập nhật danh sách sản phẩm khi thay đổi từ khóa tìm kiếm
  useEffect(() => {
    if (showProductDropdown && currentBarcode.trim()) {
      const timeoutId = setTimeout(() => {
        filterProducts(currentBarcode);
      }, 300); // Debounce 300ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentBarcode, publisher, productList, items]);

  // Cập nhật danh sách sản phẩm khi thay đổi nhà xuất bản
  useEffect(() => {
    if (publisher && showProductDropdown) {
      // Chỉ cập nhật khi đang hiển thị dropdown
      filterProducts(currentBarcode);
    }
  }, [publisher, productList, items]);

  // Xử lý thêm nhà xuất bản mới
  const handleAddPublisher = async (publisherData) => {
    try {
      const response = await addPublisher(publisherData);
      
      // Kiểm tra dữ liệu trả về
      const newPublisher = response.data;
      
      if (newPublisher && newPublisher._id) {
        // Cập nhật danh sách nhà xuất bản
        setPublisherOptions(prev => [...prev, newPublisher]);
        
        // Chọn nhà xuất bản mới được thêm
        setPublisher(newPublisher._id);
        
        // Đóng form
        setIsPublisherFormOpen(false);
        
        toast.success("Thêm nhà xuất bản thành công");
      } else {
        toast.error("Không thể thêm nhà xuất bản");
      }
    } catch (error) {
      toast.error("Lỗi khi thêm nhà xuất bản mới");
      console.error(error);
    }
  };

  // Tìm kiếm nhà xuất bản
  const handlePublisherSearch = (e) => {
    const searchTerm = e.target.value;
    loadPublishers(searchTerm);
  };

  // Reset form khi mở
  useEffect(() => {
    if (editData) {
      // Nếu đang chỉnh sửa
      setReceiptCode(editData.receiptCode || "");
      setPublisher(editData.publisher || "");
      setReceiptDate(editData.receiptDate ? 
        new Date(editData.receiptDate).toISOString().split('T')[0] : 
        ""
      );
      
      // Điều chỉnh cách lấy thông tin sản phẩm
      const formattedItems = editData.items.map(item => {
        return {
          barcode: item.productId.barcode,
          productId: item.productId._id,
          productName: item.productId.title,
          cover_image: item.productId.cover_image || 'default.jpg',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          _id: item._id
        };
      });
      
      setItems(formattedItems);
      setStatus(editData.status || "Mới");
      setNote(editData.note || "");
      
      // Tự động chuyển sang chế độ xem nếu viewMode là true
      setIsReadOnly(viewMode);
    } else {
      // Nếu thêm mới
      resetForm();
      setIsReadOnly(false);
    }
  }, [editData, viewMode]);

  // Reset form
  const resetForm = () => {
    // Tự động tạo mã phiếu nhập
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const autoReceiptCode = `PN${year}${month}${day}${random}`;
    
    setReceiptCode(autoReceiptCode);
    setPublisher("");
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setItems([]);
    setStatus("Mới");
    setNote("");
  };

  // Thêm sản phẩm vào phiếu nhập
  const addItem = () => {
    setItems([...items, { 
      barcode: "", 
      productId: "", 
      productName: "",
      quantity: 1, 
      unitPrice: 0 
    }]);
  };

  // Tìm kiếm sản phẩm theo mã
  const findProductByCode = async (index, barcode) => {
    if (!barcode.trim()) {
      toast.warning("Vui lòng nhập mã sản phẩm");
      return;
    }

    try {
      const response = await findProductByBarcode(barcode);
      
      // Kiểm tra xem sản phẩm có tồn tại không
      if (response.data && response.data.data) {
        const product = response.data.data;
        
        // Kiểm tra xem sản phẩm đã có trong danh sách chưa
        const existingIndex = items.findIndex(item => item.productId === product._id);
        if (existingIndex !== -1) {
          toast.warning(`Sản phẩm "${product.title}" đã có trong danh sách!`);
          return;
        }
        
        // Cập nhật thông tin sản phẩm vào dòng hiện tại
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          productId: product._id,
          productName: product.title,
          barcode: product.barcode,
          cover_image: product.cover_image || 'default-cover.png',
          unitPrice: product.price || 0,
          quantity: 1
        };
        
        setItems(newItems);
        toast.success(`Đã thêm sản phẩm "${product.title}" vào danh sách`);
      } else {
        // Không tìm thấy sản phẩm, mở form thêm mới
        setCurrentProductIndex(index);
        setCurrentBarcode(barcode);
        setIsProductFormOpen(true);
        toast.info(`Không tìm thấy sản phẩm với mã "${barcode}". Vui lòng thêm sản phẩm mới.`);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      
      // Nếu lỗi 404 (không tìm thấy), mở form thêm mới
      if (error.response && error.response.status === 404) {
        setCurrentProductIndex(index);
        setCurrentBarcode(barcode);
        setIsProductFormOpen(true);
        toast.info(`Không tìm thấy sản phẩm với mã "${barcode}". Vui lòng thêm sản phẩm mới.`);
      } else {
        toast.error("Lỗi khi tìm kiếm sản phẩm: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Xử lý khi thay đổi từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setCurrentBarcode(value);
    setSelectedProductIndex(-1);
    
    if (value.trim()) {
      setShowProductDropdown(true);
      // Gọi filterProducts ngay lập tức để hiển thị kết quả
      filterProducts(value);
    } else {
      // Nếu không có từ khóa và đã chọn nhà xuất bản, hiển thị tất cả sản phẩm
      if (publisher) {
        setShowProductDropdown(true);
        filterProducts('');
      } else {
        setShowProductDropdown(false);
        setFilteredProducts([]);
      }
    }
  };

  // Xử lý khi focus vào ô tìm kiếm
  const handleSearchFocus = () => {
    if (currentBarcode.trim()) {
      // Nếu có từ khóa, tìm kiếm theo từ khóa
      filterProducts(currentBarcode);
    } else if (publisher) {
      // Nếu không có từ khóa nhưng đã chọn nhà xuất bản, hiển thị tất cả sản phẩm
      filterProducts('');
    }
    setShowProductDropdown(true);
  };

  // Xử lý khi blur khỏi ô tìm kiếm
  const handleSearchBlur = () => {
    // Delay để cho phép click vào dropdown
    setTimeout(() => {
      if (!isClickingDropdown) {
        setShowProductDropdown(false);
      }
    }, 200);
  };

  // Xử lý khi nhấn phím trong ô tìm kiếm
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProductIndex >= 0 && filteredProducts[selectedProductIndex]) {
        // Chọn sản phẩm được highlight
        selectProduct(filteredProducts[selectedProductIndex]);
      } else if (currentBarcode.trim()) {
        // Tìm kiếm theo mã sản phẩm
        findProductByCode(items.length, currentBarcode);
        setCurrentBarcode('');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProductIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProductIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowProductDropdown(false);
      setSelectedProductIndex(-1);
    }
  };

  // Chọn sản phẩm từ dropdown
  const selectProduct = (product) => {
    console.log('selectProduct called with:', product);
    
    // Kiểm tra xem sản phẩm đã có trong danh sách chưa
    const existingIndex = items.findIndex(item => item.productId === product._id);
    if (existingIndex !== -1) {
      toast.warning(`Sản phẩm "${product.title}" đã có trong danh sách!`);
      return;
    }

    // Thêm sản phẩm vào danh sách
    const newItems = [...items];
    newItems.push({
      productId: product._id,
      productName: product.title,
      barcode: product.barcode,
      cover_image: product.cover_image || 'default-cover.png',
      unitPrice: product.price || 0,
      quantity: 1
    });
    
    console.log('New items array:', newItems);
    setItems(newItems);
    setCurrentBarcode('');
    setShowProductDropdown(false);
    setSelectedProductIndex(-1);
    setFilteredProducts([]);
    setIsClickingDropdown(false);
    
    toast.success(`Đã thêm sản phẩm "${product.title}" vào danh sách`);
  };

  // Xử lý khi thay đổi nhà xuất bản
  const handlePublisherChange = (e) => {
    const newPublisher = e.target.value;
    setPublisher(newPublisher);
    
    // Cập nhật danh sách sản phẩm khi thay đổi nhà xuất bản
    if (newPublisher && currentBarcode.trim()) {
      filterProducts(currentBarcode);
    } else if (newPublisher) {
      filterProducts('');
    } else {
      setFilteredProducts([]);
    }
  };

  // Cập nhật sản phẩm trong phiếu nhập
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Xóa sản phẩm khỏi phiếu nhập
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Tính tổng giá trị phiếu nhập
  const totalValue = items.reduce((total, item) => 
    total + (item.quantity * item.unitPrice), 0);

  // Xử lý thêm sản phẩm mới
  const handleProductSubmit = async (productData) => {
    try {
      const response = await addProduct(productData);
      const newProduct = response.data;
      
      if (newProduct && newProduct._id) {
        // Cập nhật item trong danh sách
        const newItems = [...items];
        newItems[currentProductIndex] = {
          ...newItems[currentProductIndex],
          barcode: newProduct.barcode,
          productId: newProduct._id,
          productName: newProduct.title,
          cover_image: newProduct.cover_image || 'default-cover.png',
          unitPrice: newProduct.price || 0,
          quantity: 1 // Mặc định số lượng là 1
        };
        
        setItems(newItems);
        setIsProductFormOpen(false);
        setCurrentProductIndex(null);
        setCurrentBarcode('');
        
        // Thông báo thành công
        toast.success(`Đã thêm sản phẩm "${newProduct.title}" thành công!`);
        
        // Cập nhật danh sách sản phẩm trong parent component nếu có callback
        if (onProductAdded) {
          onProductAdded(newProduct);
        }
      }
    } catch (error) {
      toast.error("Lỗi khi thêm sản phẩm mới: " + (error.response?.data?.message || error.message));
      console.error(error);
    }
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    // Ngăn submit nếu ở chế độ chỉ đọc
    if (isReadOnly) {
      e.preventDefault();
      return;
    }

    // Validate
    if (!receiptCode.trim()) {
      toast.warning("Mã phiếu nhập không được để trống");
      return;
    }
    if (!publisher) {
      toast.warning("Vui lòng chọn nhà xuất bản");
      return;
    }
    if (!receiptDate) {
      toast.warning("Ngày nhập không được để trống");
      return;
    }
    if (items.length === 0) {
      toast.warning("Phải có ít nhất một sản phẩm trong phiếu nhập");
      return;
    }

    // Kiểm tra các sản phẩm
    const invalidItems = items.some(item => 
      !item.productId || item.quantity <= 0 || item.unitPrice < 0
    );
    if (invalidItems) {
      toast.warning("Thông tin sản phẩm không hợp lệ");
      return;
    }

    // Dữ liệu submit
    const submitData = {
      receiptCode,
      publisher,
      receiptDate,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      status,
      note,
      totalValue
    };

    // Gọi hàm submit
    onSubmit(submitData);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-hidden">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-8 w-full max-w-[1000px] max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-center flex-grow">
              {displayMode === 'detail' ? "Chi Tiết Phiếu Nhập" : 
               (editData ? "Chỉnh Sửa Phiếu Nhập" : "Thêm Phiếu Nhập Mới")}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
              <label className="block mb-4">
                <span className="block mb-1 font-medium text-gray-700">Mã Phiếu Nhập</span>
                <input
                  type="text"
                  value={receiptCode}
                  onChange={(e) => setReceiptCode(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập mã phiếu nhập"
                  disabled={displayMode === 'detail'}
                />
              </label>

              <label className="block mb-4">
                <span className="block mb-1 font-medium text-gray-700 flex justify-between items-center">
                  Nhà Xuất Bản
                </span>
                <select
                  value={publisher}
                  onChange={handlePublisherChange}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={displayMode === 'detail'}
                >
                  <option value="">Chọn nhà xuất bản</option>
                  {publisherList.map((pub) => (
                    <option key={pub._id} value={pub._id}>
                      {pub.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block mb-4">
                <span className="block mb-1 font-medium text-gray-700">Ngày Nhập</span>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={displayMode === 'detail'}
                />
              </label>

              <label className="block mt-4">
                <span className="block mb-1 font-medium text-gray-700">Trạng Thái</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={displayMode === 'detail'}
                >
                  <option value="Mới">Mới</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </label>

              <label className="block mt-4">
                <span className="block mb-1 font-medium text-gray-700">Ghi Chú</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập ghi chú (nếu có)"
                  rows="3"
                  disabled={displayMode === 'detail'}
                />
              </label>
            </div>

            <div className="col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Sách Sản Phẩm</h2>
                {displayMode === 'edit' && (
                  <div className="relative">
                    <div className="flex items-center space-x-4">
                      <div className="flex-grow relative">
                        <input
                          type="text"
                          value={currentBarcode}
                          onChange={handleSearchChange}
                          onFocus={handleSearchFocus}
                          onBlur={handleSearchBlur}
                          onKeyDown={handleSearchKeyDown}
                          className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={publisher ? "Nhập mã sản phẩm hoặc tên sản phẩm..." : "Vui lòng chọn nhà xuất bản trước"}
                          disabled={!publisher}
                        />
                        
                        {/* Dropdown danh sách sản phẩm */}
                        {showProductDropdown && filteredProducts.length > 0 && (
                          <div 
                            className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setIsClickingDropdown(true);
                            }}
                            onMouseUp={() => {
                              setTimeout(() => setIsClickingDropdown(false), 100);
                            }}
                          >
                            {filteredProducts.map((product, index) => (
                              <div
                                key={product._id}
                                className={`p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                  index === selectedProductIndex ? 'bg-blue-100' : ''
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Clicking product:', product);
                                  selectProduct(product);
                                }}
                                onMouseEnter={() => setSelectedProductIndex(index)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-16 flex-shrink-0">
                                    <img
                                      src={`/image/${product.cover_image || 'default-cover.png'}`}
                                      alt={product.title}
                                      className="w-full h-full object-cover rounded"
                                      onError={(e) => {
                                        e.target.src = '/image/default-cover.png';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {product.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Mã: {product.barcode}
                                    </div>
                                    <div className="text-sm text-green-600 font-medium">
                                      {formatCurrency(product.price || 0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Thông báo không có sản phẩm */}
                        {showProductDropdown && filteredProducts.length === 0 && currentBarcode.trim() && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3">
                            <div className="text-gray-500 text-center">
                              Không tìm thấy sản phẩm phù hợp
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentProductIndex(items.length);
                                setCurrentBarcode(currentBarcode);
                                setIsProductFormOpen(true);
                                setShowProductDropdown(false);
                              }}
                              className="mt-2 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Thêm sản phẩm mới với mã "{currentBarcode}"
                            </button>
                          </div>
                        )}
                        
                        {/* Thông báo khi chưa chọn nhà xuất bản */}
                        {showProductDropdown && !publisher && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3">
                            <div className="text-gray-500 text-center">
                              Vui lòng chọn nhà xuất bản trước khi tìm kiếm sản phẩm
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (currentBarcode.trim()) {
                            findProductByCode(items.length, currentBarcode);
                            setCurrentBarcode('');
                          } else {
                            toast.warning("Vui lòng nhập mã sản phẩm");
                          }
                        }}
                        className="bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 transition-colors"
                        disabled={!publisher}
                      >
                        Tìm kiếm
                      </button>
                    </div>
                    
                    {/* Hướng dẫn sử dụng */}
                    <div className="mt-2 text-xs text-gray-500">
                      💡 <strong>Hướng dẫn:</strong> 
                      {publisher ? (
                        <>
                          Nhập mã sản phẩm hoặc tên sản phẩm để tìm kiếm. 
                          Sử dụng phím ↑↓ để di chuyển, Enter để chọn, Esc để đóng.
                        </>
                      ) : (
                        "Vui lòng chọn nhà xuất bản trước khi tìm kiếm sản phẩm."
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-2 border-gray-200 rounded-lg">
                <div className="bg-gray-100 p-3 font-semibold text-gray-700">
                  Sản Phẩm Đã Chọn ({items.length})
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                      Chưa có sản phẩm nào được chọn
                    </div>
                  ) : (
                    <div className="space-y-4 p-4">
                      {items.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-white border rounded-md p-4 relative shadow-sm hover:shadow-md transition-shadow"
                        >
                          {displayMode === 'edit' && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}

                          <div className="grid grid-cols-5 gap-4">
                            <div className="col-span-2">
                              <label className="block mb-2 text-sm text-gray-600">Mã Sản Phẩm</label>
                              <input
                                type="text"
                                value={item.barcode || ""}
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100 h-[42px]"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block mb-2 text-sm text-gray-600">Tên Sản Phẩm</label>
                              <input
                                type="text"
                                value={item.productName || ""}
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100 text-xs h-[42px]"
                              />
                            </div>

                            <div className="col-span-1 row-span-2 flex items-stretch">
                              <div className="w-full border rounded-md overflow-hidden">
                                <img 
                                  src={`/image/${item.cover_image || 'default-cover.png'}`} 
                                  alt={item.productName || "Ảnh bìa sách"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/image/default-cover.png';
                                  }}
                                />
                              </div>
                            </div>

                            <div className="col-span-2 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block mb-2 text-sm text-gray-600">Số Lượng</label>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index] = { 
                                      ...newItems[index], 
                                      quantity: Number(e.target.value) 
                                    };
                                    setItems(newItems);
                                  }}
                                  min="1"
                                  className="w-full p-2 border rounded-md"
                                  disabled={displayMode === 'detail'}
                                />
                              </div>

                              <div>
                                <label className="block mb-2 text-sm text-gray-600">Đơn Giá</label>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index] = { 
                                      ...newItems[index], 
                                      unitPrice: Number(e.target.value) 
                                    };
                                    setItems(newItems);
                                  }}
                                  min="0"
                                  className="w-full p-2 border rounded-md"
                                  disabled={displayMode === 'detail'}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 text-right">
                <span className="font-semibold text-lg">
                  Tổng Giá Trị: {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Đóng
            </button>
            {displayMode === 'edit' && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editData ? "Lưu Thay Đổi" : "Tạo Phiếu Nhập"}
              </button>
            )}
          </div>
        </form>
      </div>

      {isPublisherFormOpen && (
        <PublisherForm
          isOpen={isPublisherFormOpen}
          onSubmit={handleAddPublisher}
          onCancel={() => setIsPublisherFormOpen(false)}
        />
      )}

      {isProductFormOpen && (
        <ProductForm
          isOpen={isProductFormOpen}
          onSubmit={handleProductSubmit}
          onCancel={() => setIsProductFormOpen(false)}
          categoryList={categoryList}
          publisherList={publisherList}
          discountList={discountList}
          editData={{
            barcode: currentBarcode
          }}
        />
      )}
    </>
  );
}

export default PurchaseReceiptForm; 
import React, { useEffect, useState, useCallback } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaPlus,
  FaFileExcel
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ProductForm from "../../components/admin/Product/ProductForm";
import ProductTable from "../../components/admin/Product/ProductTable";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productAPI";
import { fetchCategoryProducts } from "../../services/categoryProductAPI";
import { fetchPublishers } from "../../services/publisherAPI";

function ProductPage() {
  useEffect(() => {
    document.title = "Quản lý Sản phẩm - Skybooks";
  }, []);

  const [products, setProducts] = useState([]);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: '',
    limit: 5,
    category: '',
    publisher: ''
  });
  const [categoryList, setCategoryList] = useState([]); // State lưu danh mục
  const [publisherList, setPublisherList] = useState([]); 

  // Lấy danh mục từ API khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategoryProducts();
        // Lấy toàn bộ thông tin danh mục
        const categoriesWithDetails = res.data.data || [];
        setCategoryList(categoriesWithDetails);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setCategoryList([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadPublishers = async () => {
      try {
        const res = await fetchPublishers();
        setPublisherList(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setPublisherList([]);
      }
    };
    loadPublishers();
  }, []);

  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const res = await fetchProducts(1, 1000, filters.search);
      
      // Kiểm tra cấu trúc dữ liệu an toàn
      if (!res || !res.data) {
        console.warn('Dữ liệu sản phẩm không hợp lệ');
        setProducts([]);
        setTotalRecords(0);
        return;
      }

      // Lấy toàn bộ dữ liệu từ API
      let productsData = res.data.products || [];
      
      // Lọc theo danh mục
      let filteredProducts = productsData;
      if (filters.category) {
        filteredProducts = filteredProducts.filter(
          product => product.category_id?._id === filters.category
        );
      }

      // Lọc theo nhà xuất bản
      if (filters.publisher) {
        filteredProducts = filteredProducts.filter(
          product => product.publisher_id?._id === filters.publisher
        );
      }
      
      // Sắp xếp sản phẩm
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.name.localeCompare(b.name);
            case 'name-desc': 
              return b.name.localeCompare(a.name);
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            default: 
              return 0;
          }
        });
      }

      // Cập nhật tổng số lượng
      setTotalRecords(filteredProducts.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedProducts = filteredProducts.slice(
        startIndex, 
        startIndex + filters.limit
      );

      setProducts(paginatedProducts);
      
      console.log('Tổng số sản phẩm:', filteredProducts.length);
      console.log('Sản phẩm hiện tại:', paginatedProducts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      
      // Xử lý chi tiết lỗi
      if (error.response) {
        console.error('Chi tiết lỗi:', error.response.data);
        console.error('Mã lỗi:', error.response.status);
        
        if (error.response.status === 403) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      } else if (error.request) {
        alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }

      // Đặt về trạng thái mặc định
      setProducts([]);
      setTotalRecords(0);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit, filters.category, filters.publisher]);

  // Nhãn sắp xếp
  const sortLabels = {
    'name-asc': 'Tên A-Z',
    'name-desc': 'Tên Z-A', 
    'price-asc': 'Giá tăng dần',
    'price-desc': 'Giá giảm dần',
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất'
  };

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await updateProduct(editData._id, data);
      } else {
        await addProduct(data);
      }
      setEditData(null);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu sản phẩm:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này không?")) {
      try {
        await deleteProduct(id);
        loadData();
      } catch (error) {
        console.error("Lỗi khi xoá sản phẩm:", error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditData(product);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditData(null);
    setIsFormOpen(false);
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalRecords / filters.limit);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const totalPages = Math.ceil(totalRecords / filters.limit);

  const handleView = (product) => {
    setDetailData(product);
    setIsFormOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailData(null);
    setIsFormOpen(false);
  };

  const exportToExcel = async () => {
    try {
      const res = await fetchProducts(1, 1000, filters.search);
      
      if (!res || !res.data) {
        console.warn('Dữ liệu sản phẩm không hợp lệ');
        return;
      }

      let productsData = res.data.products || [];
      
      // Lọc theo danh mục
      if (filters.category) {
        productsData = productsData.filter(
          product => product.category_id?._id === filters.category
        );
      }

      // Lọc theo nhà xuất bản
      if (filters.publisher) {
        productsData = productsData.filter(
          product => product.publisher_id?._id === filters.publisher
        );
      }
      
      // Sắp xếp sản phẩm
      if (filters.sortBy) {
        productsData.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.name.localeCompare(b.name);
            case 'name-desc': 
              return b.name.localeCompare(a.name);
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            default: 
              return 0;
          }
        });
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = productsData.map(product => ({
        'Tên sản phẩm': product.name,
        'Danh mục': product.category_id?.category_name || 'Không xác định',
        'Nhà xuất bản': product.publisher_id?.name || 'Không xác định',
        'Giá': product.price ? `${product.price.toLocaleString('vi-VN')} VNĐ` : '',
        'Số lượng tồn kho': product.stock_quantity || 0,
        'Mô tả': product.description || '',
        'Ngày tạo': new Date(product.createdAt).toLocaleDateString('vi-VN')
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "Danh_sách_sản_phẩm.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-gray-100"
      style={{ height: "calc(100vh - 120px - 40px)" }}
    >
      {/* Layout chính */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar lọc */}
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          
          <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  search: e.target.value
                }));
                setPage(1);
              }}
            />

            <select
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.category}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  category: e.target.value
                }));
                setPage(1);
              }}
            >
              <option value="">-- Chọn danh mục --</option>
              {categoryList.map(category => (
                <option 
                  key={category._id} 
                  value={category._id}
                >
                  {category.category_name} {category.parent_id ? `(${category.parent_id.category_name})` : ''}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.publisher}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  publisher: e.target.value
                }));
                setPage(1);
              }}
            >
              <option value="">-- Chọn nhà xuất bản --</option>
              {publisherList.map(publisher => (
                <option key={publisher._id} value={publisher._id}>
                  {publisher.name}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.sortBy}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  sortBy: e.target.value
                }));
                setPage(1);
              }}
            >
              <option value="">-- Sắp xếp --</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>

            <select
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.limit}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  limit: Number(e.target.value)
                }));
                setPage(1);
              }}
            >
              <option value={5}>5 bản ghi</option>
              <option value={10}>10 bản ghi</option>
              <option value={20}>20 bản ghi</option>
              <option value={50}>50 bản ghi</option>
            </select>

            <button 
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5,
                  category: '',
                  publisher: ''
                });
                setPage(1);
              }}
              className="w-full p-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Breadcrumb hiển thị bộ lọc */}
          <div className="px-4 mb-4 text-gray-600 text-sm select-none">
            <span 
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy && !filters.category && !filters.publisher ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5,
                  category: '',
                  publisher: ''
                });
                setPage(1);
              }}
            >
              {(() => {
                const filterParts = [];
                
                if (filters.search) {
                  filterParts.push(`Tìm: "${filters.search}"`);
                }
                
                if (filters.sortBy) {
                  filterParts.push(`Sắp xếp: ${sortLabels[filters.sortBy]}`);
                }

                if (filters.category) {
                  const selectedCategory = categoryList.find(cat => cat._id === filters.category);
                  const categoryName = selectedCategory 
                    ? (selectedCategory.parent_id 
                      ? `${selectedCategory.category_name} (${selectedCategory.parent_id.category_name})` 
                      : selectedCategory.category_name)
                    : '';
                  filterParts.push(`Danh mục: ${categoryName}`);
                }

                if (filters.publisher) {
                  const publisherName = publisherList.find(pub => pub._id === filters.publisher)?.name;
                  filterParts.push(`NXB: ${publisherName}`);
                }

                return filterParts.length > 0 
                  ? filterParts.join(' • ') 
                  : 'Tất cả sản phẩm';
              })()}
            </span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden relative">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý sản phẩm
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToExcel}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <FaFileExcel /> Xuất Excel
              </button>
              <button
                onClick={() => {
                  setEditData(null);
                  setIsFormOpen(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus /> Thêm sản phẩm
              </button>
            </div>
          </div>

          <ProductTable
            data={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {/* Phân trang */}
          <div className="flex items-center gap-4 mt-6 absolute bottom-[7px]">
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaAngleLeft />
            </button>
            <span className="font-medium text-gray-700 text-sm">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <FaAngleDoubleRight />
            </button>
            <span className="text-gray-600 ml-4 text-sm">
              Hiển thị {products.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <ProductForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCloseDetailModal}
          editData={detailData || editData}
          categoryList={categoryList} 
          publisherList={publisherList}
          mode={detailData ? "view" : (editData ? "edit" : "create")}
        />
      )}

    </div>
  );
}

export default ProductPage;

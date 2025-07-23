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
import CategoryProductForm from "../../components/admin/categoryProduct/CategoryProductForm";
import CategoryProductTable from "../../components/admin/categoryProduct/CategoryProductTable";
import {
  fetchCategoryProducts,
  addCategoryProduct,
  updateCategoryProduct,
  deleteCategoryProduct,
} from "../../services/categoryProductAPI";

function CategoryProductPage() {
  useEffect(() => {
    document.title = "Quản lý Danh mục - Skybooks";
  }, []);

  const [categories, setCategories] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: '',
    limit,
  });

  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const res = await fetchCategoryProducts(1, 1000, filters.search);
      
      let processedCategories = res.data.data || [];
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        processedCategories.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.category_name.localeCompare(b.category_name);
            case 'name-desc': 
              return b.category_name.localeCompare(a.category_name);
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'product-asc':
              return (a.product_count || 0) - (b.product_count || 0);
            case 'product-desc':
              return (b.product_count || 0) - (a.product_count || 0);
            default: 
              return 0;
          }
        });
      }

      // Cập nhật tổng số lượng
      setTotalRecords(processedCategories.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedCategories = processedCategories.slice(
        startIndex, 
        startIndex + filters.limit
      );

      setCategories(paginatedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
      setTotalRecords(0);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await updateCategoryProduct(editData._id, data);
      } else {
        await addCategoryProduct(data);
      }
      // setIsFormOpen(false);
      setEditData(null);
      loadData();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá danh mục này?")) {
      await deleteCategoryProduct(id);
      loadData();
    }
  };

  const handleEdit = (cat) => {
    setEditData(cat);
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

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit]);

  const totalPages = Math.ceil(totalRecords / filters.limit);

  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: '',
      limit: 5
    });
    setPage(1);
  };

  // Breadcrumb hiển thị bộ lọc
  const renderFilterBreadcrumb = () => {
    const filterParts = [];
    
    if (filters.search) {
      filterParts.push(`Tìm: "${filters.search}"`);
    }
    
    if (filters.sortBy) {
      const sortLabels = {
        'name-asc': 'Tên A-Z',
        'name-desc': 'Tên Z-A', 
        'newest': 'Mới nhất',
        'oldest': 'Cũ nhất',
        'product-asc': 'Số SP tăng dần',
        'product-desc': 'Số SP giảm dần'
      };
      filterParts.push(`Sắp xếp: ${sortLabels[filters.sortBy]}`);
    }

    return filterParts.length > 0 
      ? filterParts.join(' • ') 
      : 'Tất cả danh mục';
  };

  const exportToExcel = async () => {
    try {
      const res = await fetchCategoryProducts(1, 1000, filters.search);
      const data = res.data.data || [];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh mục sản phẩm");

      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "Danh_mục_sản_phẩm.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 120px - 40px)' }}>
      {/* Layout giữa */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
            {/* <input
              type="search"
              placeholder="Tìm kiếm danh mục..."
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  search: e.target.value
                }));
                setPage(1);
              }}
            /> */}

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
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="product-asc">Số SP tăng dần</option>
              <option value="product-desc">Số SP giảm dần</option>
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
              onClick={resetFilters}
              className="w-full p-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Breadcrumb hiển thị bộ lọc */}
          <div className="px-4 mb-4 text-gray-600 text-sm select-none">
            <span 
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy ? 'font-medium text-gray-600' : ''}`}
              onClick={resetFilters}
            >
              {renderFilterBreadcrumb()}
            </span>
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý danh mục sản phẩm
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
                <FaPlus /> Thêm danh mục
              </button>
            </div>
          </div>
  
          <CategoryProductTable
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
  
          {/* Pagination */}
          <div className="flex items-center gap-4 mt-6 absolute bottom-[70px]">
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleLeft />
            </button>
            <span className="font-medium text-gray-700 text-sm">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleDoubleRight />
            </button>
            <span className="text-gray-600 ml-4 text-sm">
              Hiển thị {categories.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>
  
      {/* Modal Form */}
      {isFormOpen && (
        <CategoryProductForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editData={editData}
        />
      )}
    </div>
  );  
}

export default CategoryProductPage;

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
import NewsForm from "../../components/admin/News/NewsForm";
import NewsTable from "../../components/admin/News/NewsTable";
import {
  fetchAllNews,
  addNews,
  updateNews,
  deleteNews,
} from "../../services/newsAPI";
import {
  fetchEmployees,
} from "../../services/employeeAPI"

function NewsPage() {
  useEffect(() => {
    document.title = "Quản lý Tin tức - Skybooks";
  }, []);

  const [newsList, setNewsList] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: '',
    limit: 5,
    author: '',
    status: ''
  });
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
      const loadEmployees = async () => {
        try {
          const res = await fetchEmployees();
          setEmployeeList(res.data.data || []);
        } catch (error) {
          console.error("Lỗi khi lấy danh mục:", error);
          setEmployeeList([]);
        }
      };
      loadEmployees();
    }, []);

  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const res = await fetchAllNews(1, 1000, filters.search);
      let processedNews = res.data.data || [];
      
      // Lọc theo tác giả nếu có
      if (filters.author) {
        processedNews = processedNews.filter(
          news => news.employee_id?._id === filters.author
        );
      }
      
      // Lọc theo trạng thái nếu có
      if (filters.status) {
        processedNews = processedNews.filter(
          news => news.status === filters.status
        );
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        processedNews.sort((a, b) => {
          switch(filters.sortBy) {
            case 'title-asc': 
              return a.title.localeCompare(b.title);
            case 'title-desc': 
              return b.title.localeCompare(a.title);
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
      setTotalRecords(processedNews.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedNews = processedNews.slice(
        startIndex, 
        startIndex + filters.limit
      );

      setNewsList(paginatedNews);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tin tức:", error);
      setNewsList([]);
      setTotalRecords(0);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit, filters.author, filters.status]);

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await updateNews(editData._id, data);
      } else {
        await addNews(data);
      }
      setEditData(null);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu tin tức:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá tin tức này không?")) {
      try {
        await deleteNews(id);
        loadData();
      } catch (error) {
        console.error("Lỗi khi xoá tin tức:", error);
      }
    }
  };

  const handleEdit = (news) => {
    setEditData(news);
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

  // Nhãn sắp xếp
  const sortLabels = {
    'title-asc': 'Tiêu đề A-Z',
    'title-desc': 'Tiêu đề Z-A', 
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất'
  };

  const totalPages = Math.ceil(totalRecords / filters.limit);

  const exportToExcel = async () => {
    try {
      const res = await fetchAllNews(1, 1000, filters.search);
      let data = res.data.data || [];
      
      // Lọc theo tác giả nếu có
      if (filters.author) {
        data = data.filter(
          news => news.employee_id?._id === filters.author
        );
      }
      
      // Lọc theo trạng thái nếu có
      if (filters.status) {
        data = data.filter(
          news => news.status === filters.status
        );
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        data.sort((a, b) => {
          switch(filters.sortBy) {
            case 'title-asc': 
              return a.title.localeCompare(b.title);
            case 'title-desc': 
              return b.title.localeCompare(a.title);
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
      const excelData = data.map(news => ({
        'Tiêu đề': news.title,
        'Tác giả': news.employee_id?.name || 'Không xác định',
        'Nội dung': news.content,
        'Trạng thái': news.status,
        'Ngày tạo': new Date(news.createdAt).toLocaleDateString('vi-VN')
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tin tức");

      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "Danh_sách_tin_tức.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-gray-100"
      style={{ height: "calc(100vh - 120px - 40px)" }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar lọc */}
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          
          <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
            {/* <input
              type="search"
              placeholder="Tìm kiếm tin tức..."
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
              value={filters.author}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  author: e.target.value
                }));
                setPage(1);
              }}
            >
              <option value="">-- Chọn tác giả --</option>
              {employeeList.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
              value={filters.status}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  status: e.target.value
                }));
                setPage(1);
              }}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="Đã đăng">Đã đăng</option>
              <option value="Đã lên lịch">Đã lên lịch</option>
              <option value="Bản nháp">Bản nháp</option>
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
              <option value="title-asc">Tiêu đề A-Z</option>
              <option value="title-desc">Tiêu đề Z-A</option>
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
                  author: '',
                  status: ''
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
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy && !filters.author && !filters.status ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5,
                  author: '',
                  status: ''
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

                if (filters.author) {
                  const authorName = employeeList.find(emp => emp._id === filters.author)?.name;
                  filterParts.push(`Tác giả: ${authorName}`);
                }

                if (filters.status) {
                  filterParts.push(`Trạng thái: ${filters.status}`);
                }

                return filterParts.length > 0 
                  ? filterParts.join(' • ') 
                  : 'Tất cả tin tức';
              })()}
            </span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden relative">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Tin tức</h1>
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
                <FaPlus /> Thêm tin tức
              </button>
            </div>
          </div>

          <NewsTable data={newsList} onEdit={handleEdit} onDelete={handleDelete} />

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
              Hiển thị {newsList.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <NewsForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editData={editData}
          employeeList={employeeList}
        />
      )}
    </div>
  );
}

export default NewsPage;

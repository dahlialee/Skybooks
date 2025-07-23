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
import PurchaseReceiptForm from "../../components/admin/PurchaseReceipt/PurchaseReceiptForm";
import PurchaseReceiptTable from "../../components/admin/PurchaseReceipt/PurchaseReceiptTable";
import {
  getPurchaseReceipts,
  createPurchaseReceipt,
  updatePurchaseReceipt,
  deletePurchaseReceipt
} from "../../services/purchaseReceiptAPI";
import {
  fetchPublishers,
} from "../../services/publisherAPI";
import {
  fetchProducts,
} from "../../services/productAPI";
import { fetchCategoryProducts } from "../../services/categoryProductAPI";
import { toast } from "react-toastify";

function PurchaseReceiptPage() {
  useEffect(() => {
    document.title = "Quản lý Phiếu Nhập - Skybooks";
  }, []);

  const [receiptList, setReceiptList] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "",
    limit: 5,
    publisher: "",
    startDate: "",
    endDate: ""
  });
  const [publisherList, setPublisherList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Nhãn sắp xếp
  const sortLabels = {
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất',
    'total-asc': 'Tổng tiền tăng dần',
    'total-desc': 'Tổng tiền giảm dần'
  };

  // Tạo ánh xạ nhà xuất bản
  const publisherMap = React.useMemo(() => {
    return publisherList.reduce((map, publisher) => {
      map[publisher._id] = publisher.name;
      return map;
    }, {});
  }, [publisherList]);

  // Tải dữ liệu phụ (nhà xuất bản, sản phẩm, danh mục, khuyến mãi)
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        const [publisherRes, productRes, categoryRes] = await Promise.all([
          fetchPublishers(),
          fetchProducts(),
          fetchCategoryProducts()
        ]);
        setPublisherList(publisherRes.data.data || []);
        setProductList(productRes.data.products || []);
        setCategoryList(categoryRes.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    loadAdditionalData();
  }, []);

  // Tải danh sách phiếu nhập
  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const res = await getPurchaseReceipts(1, 1000, filters.search);
      let processedReceipts = res.data || [];
      
      // Lọc theo nhà xuất bản
      if (filters.publisher) {
        processedReceipts = processedReceipts.filter(
          receipt => receipt.publisher === filters.publisher
        );
      }

      // Lọc theo ngày tháng
      if (filters.startDate || filters.endDate) {
        processedReceipts = processedReceipts.filter(receipt => {
          const receiptDate = new Date(receipt.createdAt);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;

          if (startDate && endDate) {
            return receiptDate >= startDate && receiptDate <= endDate;
          } else if (startDate) {
            return receiptDate >= startDate;
          } else if (endDate) {
            return receiptDate <= endDate;
          }
          return true;
        });
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        processedReceipts.sort((a, b) => {
          switch(filters.sortBy) {
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'total-asc':
              return (a.total_amount || 0) - (b.total_amount || 0);
            case 'total-desc':
              return (b.total_amount || 0) - (a.total_amount || 0);
            default: 
              return 0;
          }
        });
      }

      // Cập nhật tổng số lượng
      setTotalRecords(processedReceipts.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedReceipts = processedReceipts.slice(
        startIndex, 
        startIndex + filters.limit
      );

      // Thêm tên nhà xuất bản vào danh sách phiếu nhập
      const receiptsWithPublisherName = paginatedReceipts.map(receipt => ({
        ...receipt,
        publisherName: publisherMap[receipt.publisher] || 'Không xác định'
      }));

      setReceiptList(receiptsWithPublisherName);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
      setReceiptList([]);
      setTotalRecords(0);
    }
  }, [page, filters, publisherMap]);

  // Tự động tải dữ liệu khi thay đổi trang, giới hạn, tìm kiếm
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit, filters.publisher, filters.startDate, filters.endDate]);

  // Xử lý thêm/sửa phiếu nhập
  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await updatePurchaseReceipt(editData._id, data);
        toast.success("Cập nhật phiếu nhập thành công!");
      } else {
        await createPurchaseReceipt(data);
        toast.success("Tạo phiếu nhập thành công! Số lượng sản phẩm đã được cập nhật.");
      }
      setEditData(null);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu phiếu nhập:", error);
      toast.error("Lỗi khi xử lý phiếu nhập: " + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý khi thêm sản phẩm mới từ form
  const handleProductAdded = (newProduct) => {
    // Cập nhật danh sách sản phẩm
    setProductList(prev => [...prev, newProduct]);
  };

  // Xử lý xóa phiếu nhập
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập này?")) {
      try {
        await deletePurchaseReceipt(id);
        loadData();
      } catch (error) {
        console.error("Lỗi khi xóa phiếu nhập:", error);
      }
    }
  };

  // Xử lý hiển thị chi tiết phiếu nhập
  const handleDetailReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setEditData(receipt);
    setIsFormOpen(true);
  };

  // Chỉnh sửa phiếu nhập
  const handleEdit = (receipt) => {
    setSelectedReceipt(null);
    setEditData(receipt);
    setIsFormOpen(true);
  };

  // Hủy form
  const handleCancel = () => {
    setEditData(null);
    setSelectedReceipt(null);
    setIsFormOpen(false);
  };

  // Thay đổi trang
  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalRecords / filters.limit);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalRecords / filters.limit);

  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setSelectedReceipt(null);
  };

  const exportToExcel = async () => {
    try {
      const res = await getPurchaseReceipts(1, 1000, filters.search);
      let data = res.data || [];
      
      // Lọc theo nhà xuất bản
      if (filters.publisher) {
        data = data.filter(
          receipt => receipt.publisher === filters.publisher
        );
      }

      // Lọc theo ngày tháng
      if (filters.startDate || filters.endDate) {
        data = data.filter(receipt => {
          const receiptDate = new Date(receipt.createdAt);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;

          if (startDate && endDate) {
            return receiptDate >= startDate && receiptDate <= endDate;
          } else if (startDate) {
            return receiptDate >= startDate;
          } else if (endDate) {
            return receiptDate <= endDate;
          }
          return true;
        });
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        data.sort((a, b) => {
          switch(filters.sortBy) {
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'total-asc':
              return (a.total_amount || 0) - (b.total_amount || 0);
            case 'total-desc':
              return (b.total_amount || 0) - (a.total_amount || 0);
            default: 
              return 0;
          }
        });
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = data.map(receipt => ({
        'Mã phiếu nhập': receipt.receipt_id || '',
        'Nhà xuất bản': publisherMap[receipt.publisher] || 'Không xác định',
        'Tổng tiền': receipt.total_amount ? `${receipt.total_amount.toLocaleString('vi-VN')} VNĐ` : '',
        'Ngày tạo': new Date(receipt.createdAt).toLocaleDateString('vi-VN'),
        'Ghi chú': receipt.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Phiếu nhập");

      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "Danh_sách_phiếu_nhập.xlsx");
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
              placeholder="Tìm kiếm phiếu nhập..."
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

            <div className="w-full">
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev, 
                      startDate: e.target.value
                    }));
                    setPage(1);
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev, 
                      endDate: e.target.value
                    }));
                    setPage(1);
                  }}
                />
              </div>
            </div>

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
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="total-asc">Tổng tiền tăng dần</option>
              <option value="total-desc">Tổng tiền giảm dần</option>
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
                  publisher: '',
                  startDate: '',
                  endDate: ''
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
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy && !filters.publisher && !filters.startDate && !filters.endDate ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5,
                  publisher: '',
                  startDate: '',
                  endDate: ''
                });
                setPage(1);
              }}
            >
              {(() => {
                const filterParts = [];
                
                if (filters.search) {
                  filterParts.push(`Tìm: "${filters.search}"`);
                }
                
                if (filters.publisher) {
                  const publisherName = publisherList.find(p => p._id === filters.publisher)?.name;
                  filterParts.push(`NXB: ${publisherName}`);
                }

                if (filters.startDate || filters.endDate) {
                  const dateRange = `${filters.startDate ? `Từ ${filters.startDate}` : ''} ${filters.endDate ? `đến ${filters.endDate}` : ''}`.trim();
                  filterParts.push(`Ngày: ${dateRange}`);
                }
                
                if (filters.sortBy) {
                  filterParts.push(`Sắp xếp: ${sortLabels[filters.sortBy]}`);
                }

                return filterParts.length > 0 
                  ? filterParts.join(' • ') 
                  : 'Tất cả phiếu nhập';
              })()}
            </span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden relative">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Phiếu Nhập</h1>
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
                <FaPlus /> Thêm Phiếu Nhập
              </button>
            </div>
          </div>

          <PurchaseReceiptTable 
            data={receiptList} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetail={handleDetailReceipt}
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
              Hiển thị {receiptList.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <PurchaseReceiptForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editData={editData}
          publisherList={publisherList}
          productList={productList}
          categoryList={categoryList}
          viewMode={false}
          displayMode={selectedReceipt ? 'detail' : 'edit'}
          onProductAdded={handleProductAdded}
        />
      )}
    </div>
  );
}

export default PurchaseReceiptPage;
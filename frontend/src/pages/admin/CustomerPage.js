import React, { useEffect, useState, useCallback } from "react";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaPlus } from "react-icons/fa";
import CustomerForm from "../../components/admin/Customer/CustomerForm";
import CustomerTable from "../../components/admin/Customer/CustomerTable";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerAPI";

function CustomerPage() {
  useEffect(() => {
    document.title = "Quản lý khách hàng - Skybooks";
  }, []);

  const [customers, setCustomers] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: '',
    limit: 5
  });

  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const res = await fetchCustomers(1, 1000, filters.search);
      let processedCustomers = res.data.data || [];
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        processedCustomers.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.name.localeCompare(b.name);
            case 'name-desc': 
              return b.name.localeCompare(a.name);
            case 'newest':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'order-asc':
              return (a.total_orders || 0) - (b.total_orders || 0);
            case 'order-desc':
              return (b.total_orders || 0) - (a.total_orders || 0);
            default: 
              return 0;
          }
        });
      }

      // Cập nhật tổng số lượng
      setTotalRecords(processedCustomers.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedCustomers = processedCustomers.slice(
        startIndex, 
        startIndex + filters.limit
      );

      setCustomers(paginatedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalRecords(0);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit]);

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await updateCustomer(editData._id, data);
      } else {
        await addCustomer(data);
      }
      setEditData(null);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá khách hàng này?")) {
      await deleteCustomer(id);
      loadData();
    }
  };

  const handleEdit = (customer) => {
    setEditData(customer);
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

  // Nhãn sắp xếp
  const sortLabels = {
    'name-asc': 'Tên A-Z',
    'name-desc': 'Tên Z-A', 
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất',
    'order-asc': 'Số đơn tăng dần',
    'order-desc': 'Số đơn giảm dần'
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 120px - 40px)' }}>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          
          <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
            {/* <input
              type="search"
              placeholder="Tìm kiếm khách hàng..."
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
              <option value="order-asc">Số đơn tăng dần</option>
              <option value="order-desc">Số đơn giảm dần</option>
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
                  limit: 5
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
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5
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

                return filterParts.length > 0 
                  ? filterParts.join(' • ') 
                  : 'Tất cả khách hàng';
              })()}
            </span>
          </div>
        </div>

        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý khách hàng
            </h1>
            <button
              onClick={() => {
                setEditData(null);
                setIsFormOpen(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Thêm khách hàng
            </button>
          </div>

          <CustomerTable
            data={customers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="flex items-center gap-4 mt-6 absolute bottom-[80px]">
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
              Hiển thị {customers.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <CustomerForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editData={editData}
          existingEmails={customers.map(cust => cust.email)}
          existingUsernames={customers.map(cust => cust.username)}
        />
      )}
    </div>
  );
}

export default CustomerPage;

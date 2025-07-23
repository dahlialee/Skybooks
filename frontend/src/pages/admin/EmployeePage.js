import React, { useEffect, useState, useCallback } from "react";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaPlus, FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import EmployeeForm from "../../components/admin/Employee/EmployeeForm";
import EmployeeTable from "../../components/admin/Employee/EmployeeTable";
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../services/employeeAPI";
import { toast } from "react-toastify";

function EmployeePage() {
  useEffect(() => {
    document.title = "Quản lý nhân viên - Skybooks";
  }, []);

  const [employees, setEmployees] = useState([]);
  const [editData, setEditData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: '',
    limit: 5,
    role: ''
  });

  const loadData = useCallback(async () => {
    try {
      // Lấy toàn bộ dữ liệu không phân trang
      const fetchedEmployees = await fetchEmployees(1, 1000, filters.search);
      let processedEmployees = fetchedEmployees.data.data || [];
      
      // Lọc theo vai trò nếu có
      if (filters.role) {
        processedEmployees = processedEmployees.filter(
          emp => emp.role.toLowerCase().trim() === filters.role.toLowerCase().trim()
        );
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        processedEmployees.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.name.localeCompare(b.name);
            case 'name-desc': 
              return b.name.localeCompare(a.name);
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
      setTotalRecords(processedEmployees.length);

      // Phân trang
      const startIndex = (page - 1) * filters.limit;
      const paginatedEmployees = processedEmployees.slice(
        startIndex, 
        startIndex + filters.limit
      );

      setEmployees(paginatedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setTotalRecords(0);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.limit, filters.role]);

  // Nhãn sắp xếp
  const sortLabels = {
    'name-asc': 'Tên A-Z',
    'name-desc': 'Tên Z-A', 
    'newest': 'Mới nhất',
    'oldest': 'Cũ nhất'
  };

  // Danh sách vai trò
  const roleOptions = [
    { value: '', label: '-- Tất cả vai trò --' },
    { value: 'nhân viên', label: 'Nhân viên' },
    { value: 'quản lý', label: 'Quản lý' }
  ];

  const handleSubmit = async (data) => {
    try {
      // Log dữ liệu trước khi gửi
      console.log('Dữ liệu nhân viên sắp gửi:', data);

      if (editData) {
        await updateEmployee(editData._id, data);
      } else {
        // Kiểm tra từng trường dữ liệu
        const requiredFields = ['name', 'username', 'email', 'phone', 'role', 'password'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
          console.error('Thiếu các trường bắt buộc:', missingFields);
          toast.warning(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
          return;
        }

        await addEmployee(data);
      }
      setEditData(null);
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      // Log lỗi chi tiết
      console.error("Submit error:", error);
      console.error("Chi tiết lỗi:", error.response?.data);
      
      // Hiển thị thông báo lỗi chi tiết
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Lỗi khi thêm nhân viên';
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xoá nhân viên này?")) {
      await deleteEmployee(id);
      loadData();
    }
  };

  const handleEdit = (employee) => {
    setEditData(employee);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditData(null);
    setIsFormOpen(false);
  };

  const totalPages = Math.ceil(totalRecords / filters.limit);

  const exportToExcel = async () => {
    try {
      const fetchedEmployees = await fetchEmployees(1, 1000, filters.search);
      let data = fetchedEmployees.data.data || [];
      
      // Lọc theo vai trò nếu có
      if (filters.role) {
        data = data.filter(
          emp => emp.role.toLowerCase().trim() === filters.role.toLowerCase().trim()
        );
      }
      
      // Xử lý sắp xếp nếu có
      if (filters.sortBy) {
        data.sort((a, b) => {
          switch(filters.sortBy) {
            case 'name-asc': 
              return a.name.localeCompare(b.name);
            case 'name-desc': 
              return b.name.localeCompare(a.name);
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
      const excelData = data.map(emp => ({
        'Tên nhân viên': emp.name,
        'Tên đăng nhập': emp.username,
        'Email': emp.email,
        'Số điện thoại': emp.phone,
        'Vai trò': emp.role,
        'Ngày tạo': new Date(emp.createdAt).toLocaleDateString('vi-VN')
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Nhân viên");

      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx"
      });

      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "Danh_sách_nhân_viên.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-gray-100" style={{ height: 'calc(100vh - 120px - 40px)' }}>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          
          <div className="flex flex-wrap gap-4 items-center px-2 mb-6">
            {/* <input
              type="search"
              placeholder="Tìm kiếm nhân viên..."
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
              value={filters.role}
              onChange={(e) => {
                setFilters(prev => ({
                  ...prev, 
                  role: e.target.value
                }));
                setPage(1);
              }}
            >
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
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
                  role: ''
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
              className={`cursor-pointer hover:text-blue-600 ${!filters.search && !filters.sortBy && !filters.role ? 'font-medium text-gray-600' : ''}`}
              onClick={() => {
                setFilters({
                  search: '',
                  sortBy: '',
                  limit: 5,
                  role: ''
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

                if (filters.role) {
                  const roleLabel = roleOptions.find(r => r.value === filters.role)?.label;
                  filterParts.push(`Vai trò: ${roleLabel}`);
                }

                return filterParts.length > 0 
                  ? filterParts.join(' • ') 
                  : 'Tất cả nhân viên';
              })()}
            </span>
          </div>
        </div>

        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý nhân viên
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
                <FaPlus /> Thêm nhân viên
              </button>
            </div>
          </div>

          <EmployeeTable
            data={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="flex items-center gap-4 mt-6 absolute bottom-[60px]">
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleLeft />
            </button>
            <span className="font-medium text-gray-700 text-sm">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out text-sm"
            >
              <FaAngleDoubleRight />
            </button>
            <span className="text-gray-600 ml-4 text-sm">
              Hiển thị {employees.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <EmployeeForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editData={editData}
          existingEmails={employees.map(emp => emp.email)}
          existingUsernames={employees.map(emp => emp.username)}
        />
      )}
    </div>
  );
}

export default EmployeePage;

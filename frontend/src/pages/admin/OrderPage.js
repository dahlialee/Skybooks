import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaFileExcel
} from "react-icons/fa";
import OrderForm from "../../components/admin/Order/OrderForm";
import OrderTable from "../../components/admin/Order/OrderTable";
import * as InvoiceAPI from "../../services/invoiceAPI";
import * as CustomerAPI from "../../services/customerAPI";
import * as ProductAPI from "../../services/productAPI";
import _debounce from 'lodash/debounce';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function OrderPage() {
  useEffect(() => {
    document.title = "Quản lý Đơn hàng - Skybooks";
  }, []);

  const [orderList, setOrderList] = useState([]);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [filters, setFilters] = useState({
    paymentStatus: '',
    shippingStatus: '',
    startDate: '',
    endDate: '',
    customerId: ''
  });

  useEffect(() => {
    console.log('Services:', {
      InvoiceAPI: Object.keys(InvoiceAPI),
      CustomerAPI: Object.keys(CustomerAPI),
      ProductAPI: Object.keys(ProductAPI)
    });

    const loadAdditionalData = async () => {
      try {
        if (!CustomerAPI.fetchCustomers || !ProductAPI.fetchProducts) {
          console.error('Thiếu service để load dữ liệu phụ', {
            fetchCustomers: !!CustomerAPI.fetchCustomers,
            fetchProducts: !!ProductAPI.fetchProducts
          });
          return;
        }

        const [customerRes, productRes] = await Promise.all([
          CustomerAPI.fetchCustomers(),
          ProductAPI.fetchProducts()
        ]);
        
        setCustomerList(customerRes.data?.data || []);
        setProductList(productRes.data?.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phụ:", error);
        setCustomerList([]);
        setProductList([]);
      }
    };

    loadAdditionalData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    console.log('Filter Change:', {
      name: name,
      value: value
    });

    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [name]: value
      };

      console.log('Updated Filters:', newFilters);

      return newFilters;
    });

    setPage(1);
  };

  const loadData = useCallback(async () => {
    try {
      // Loại bỏ khoảng trắng thừa và xử lý từ khóa tìm kiếm
      const trimmedSearch = search.trim();
      
      console.log('Tìm kiếm - Chi tiết:', {
        page,
        limit,
        search: trimmedSearch,
        filters
      });

      if (!InvoiceAPI.fetchInvoices) {
        console.error('fetchInvoices service không tồn tại');
        return;
      }

      const queryParams = {};
      
      // Xử lý tìm kiếm mạnh mẽ hơn
      if (trimmedSearch) {
        queryParams.search = trimmedSearch;
        console.log('Đang tìm kiếm:', trimmedSearch);
      }
      
      // Thêm các bộ lọc
      if (filters.paymentStatus) {
        queryParams.paymentStatus = filters.paymentStatus;
        console.log('Adding Payment Status Filter:', filters.paymentStatus);
      }
      
      if (filters.shippingStatus) {
        queryParams.shippingStatus = filters.shippingStatus;
        console.log('Adding Shipping Status Filter:', filters.shippingStatus);
      }
      
      if (filters.startDate) {
        queryParams.startDate = filters.startDate;
        console.log('Adding Start Date Filter:', filters.startDate);
      }
      
      if (filters.endDate) {
        queryParams.endDate = filters.endDate;
        console.log('Adding End Date Filter:', filters.endDate);
      }
      
      if (filters.customerId) {
        queryParams.customerId = filters.customerId;
        console.log('Adding Customer Filter:', filters.customerId);
      }

      // Gọi API với object tham số
      const res = await InvoiceAPI.fetchInvoices(page, limit, queryParams);
      
      // Log kết quả trả về
      console.log('Invoices Response:', {
        totalRecords: res.data.totalRecords,
        dataCount: res.data.data?.length
      });

      // Điều chỉnh ngày để khắc phục vấn đề múi giờ
      const processedOrders = (res.data.data || []).map(order => {
        if (order.invoice_date) {
          const originalDate = new Date(order.invoice_date);
          return {
            ...order,
            invoice_date: new Date(
              originalDate.getFullYear(), 
              originalDate.getMonth(), 
              originalDate.getDate()
            )
          };
        }
        return order;
      });

      setOrderList(processedOrders);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setOrderList([]);
      setTotalRecords(0);
    }
  }, [page, limit, search, filters]);

  const debouncedLoadData = useMemo(
    () => _debounce(loadData, 500),
    [loadData]
  );

  useEffect(() => {
    debouncedLoadData();
    
    return () => {
      debouncedLoadData.cancel();
    };
  }, [page, limit, search, filters, debouncedLoadData]);

  useEffect(() => {
    setPage(1);
  }, [search, limit, filters]);

  const handleSubmit = async (data) => {
    try {
      if (!InvoiceAPI.addInvoice && !InvoiceAPI.updateInvoice) {
        console.error('Thiếu service để xử lý đơn hàng');
        return;
      }

      if (editData) {
        await InvoiceAPI.updateInvoice(editData._id, data);
      } else {
        await InvoiceAPI.addInvoice(data);
      }
      
      setEditData(null);
      setIsFormOpen(false);
      
      await loadData();
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu đơn hàng:", error);
      alert('Không thể lưu đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleEdit = (order) => {
    if (!order || !order._id) {
      console.error('Dữ liệu đơn hàng không hợp lệ');
      return;
    }

    setEditData(order);
    setIsFormOpen(true);
  };

  const handleView = (order) => {
    if (!order || !order._id) {
      console.error('Dữ liệu đơn hàng không hợp lệ');
      return;
    }

    setDetailData(order);
    setIsFormOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailData(null);
    setIsFormOpen(false);
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(totalRecords / limit);
    
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    } else {
      console.warn(`Trang không hợp lệ: ${newPage}`);
    }
  };

  const totalPages = Math.ceil(totalRecords / limit);

  const paymentStatuses = [
    { value: '', label: 'Tất cả trạng thái TT' },
    { value: 'Chưa thanh toán', label: 'Chưa thanh toán' },
    { value: 'Đã thanh toán', label: 'Đã thanh toán' },
    { value: 'Hoàn tiền', label: 'Hoàn tiền' }
  ];

  const shippingStatuses = [
    { value: '', label: 'Tất cả trạng thái VC' },
    { value: 'Chưa xử lý', label: 'Chưa xử lý' },
    { value: 'Đang giao', label: 'Đang giao' },
    { value: 'Đã giao', label: 'Đã giao' },
    { value: 'Đã hủy', label: 'Đã hủy' }
  ];

  const resetFilters = () => {
    setSearch('');
    setFilters({
      paymentStatus: '',
      shippingStatus: '',
      startDate: '',
      endDate: '',
      customerId: ''
    });
    setLimit(5);
    setPage(1);
  };

  const exportToExcel = async () => {
    try {
      if (!InvoiceAPI.fetchInvoices) {
        console.error('fetchInvoices service không tồn tại');
        return;
      }

      const queryParams = {
        ...filters,
        search: search.trim()
      };

      const res = await InvoiceAPI.fetchInvoices(1, totalRecords, queryParams);

      if (!res.data.data || res.data.data.length === 0) {
        console.error('Không có dữ liệu để xuất ra Excel');
        return;
      }

      // Chuẩn bị dữ liệu cho Excel
      const excelData = res.data.data.map(order => ({
        'Mã đơn hàng': order.invoice_id || '',
        'Khách hàng': order.customer_id?.name || '',
        'Tổng tiền': order.total_amount ? `${order.total_amount.toLocaleString('vi-VN')} VNĐ` : '',
        'Trạng thái thanh toán': order.payment_status || '',
        'Trạng thái vận chuyển': order.shipping_status || '',
        'Ngày đặt hàng': order.invoice_date ? new Date(order.invoice_date).toLocaleDateString('vi-VN') : '',
        'Địa chỉ giao hàng': order.shipping_address || '',
        'Ghi chú': order.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng");

      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx'
      });

      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, "Danh_sách_đơn_hàng.xlsx");
    } catch (error) {
      console.error("Lỗi khi xuất ra Excel:", error);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden bg-gray-100"
      style={{ height: "calc(100vh - 120px - 40px)" }}
    >
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white p-6 pb-6 shadow-md border-r border-gray-200 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>
          
          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Mã đơn, tên khách hàng..."
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
              value={search}
              onChange={(e) => {
                const searchValue = e.target.value;
                console.log('Giá trị tìm kiếm:', searchValue);
                setSearch(searchValue);
                setPage(1);
              }}
            />
          </div> */}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={(e) => {
                handleFilterChange(e);
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            >
              {paymentStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái vận chuyển</label>
            <select
              name="shippingStatus"
              value={filters.shippingStatus}
              onChange={(e) => {
                handleFilterChange(e);
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            >
              {shippingStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
            <select
              name="customerId"
              value={filters.customerId}
              onChange={(e) => {
                handleFilterChange(e);
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            >
              <option value="">Tất cả khách hàng</option>
              {customerList.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={(e) => {
                handleFilterChange(e);
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={(e) => {
                handleFilterChange(e);
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Số bản ghi</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="p-2 border border-gray-300 rounded-md focus:border-blue-500 w-full"
            >
              <option value={5}>5 bản ghi</option>
              <option value={10}>10 bản ghi</option>
              <option value={20}>20 bản ghi</option>
              <option value={50}>50 bản ghi</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="w-full p-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="flex-1 p-8 pb-6 bg-white overflow-hidden relative">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
            <button
              onClick={exportToExcel}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <FaFileExcel /> Xuất Excel
            </button>
          </div>

          <OrderTable 
            data={orderList} 
            onEdit={handleEdit} 
            onView={handleView}
          />

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
              Hiển thị {orderList.length} bản ghi trên tổng {totalRecords} bản ghi
            </span>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <OrderForm
          isOpen={isFormOpen}
          onSubmit={handleSubmit}
          onCancel={handleCloseDetailModal}
          editData={detailData || editData}
          mode={detailData ? "view" : (editData ? "edit" : "create")}
          customerList={customerList}
          productList={productList}
        />
      )}
    </div>
  );
}

export default OrderPage;

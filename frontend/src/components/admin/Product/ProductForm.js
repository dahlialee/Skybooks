import React, { useState, useEffect } from "react";

function ProductForm({
  isOpen,
  onSubmit,
  onCancel,
  editData,
  categoryList = [],
  publisherList = [],
  discountList = [],
  mode = "edit",
}) {
  const [barcode, setBarcode] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [discountId, setDiscountId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [language, setLanguage] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [page, setPage] = useState("");

  const [isEditable, setIsEditable] = useState(mode !== "view");

  useEffect(() => {
    setIsEditable(mode !== "view");

    if (editData) {
      console.log('editData', editData)
      setBarcode(editData.barcode || "");
      setTitle(editData.title || "");
      setAuthor(editData.author || "");
      setCategoryId(editData.category_id?._id || "");
      setPublisherId(editData.publisher_id?._id || "");
      setDiscountId(editData.discount_category_id?._id || "");
      setCoverImage(editData.cover_image || "");
      setImageFile(null);
      setPrice(editData.price || "");
      setDescription(editData.description || "");
      setStockQuantity(editData.stock_quantity || "");
      setLanguage(editData.language || "");
      setWeight(editData.weight || "");
      setDimensions(editData.dimensions || "");
      setPage(editData.page || "");
    } else {
      // Reset trạng thái
      setBarcode("");
      setTitle("");
      setAuthor("");
      setCategoryId("");
      setPublisherId("");
      setDiscountId("");
      setCoverImage("");
      setImageFile(null);
      setPrice("");
      setDescription("");
      setStockQuantity("");
      setLanguage("");
      setWeight("");
      setDimensions("");
      setPage("");
    }
  }, [editData, categoryList, publisherList, mode]);

  const handleFileChange = (e) => {
    if (!isEditable) return;
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setCoverImage(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditable) return;
    
    const data = {
      barcode,
      title,
      author,
      categoryId,
      publisherId,
      discountId,
      cover_image: coverImage,
      price: Number(price),
      description,
      stock_quantity: Number(stockQuantity),
      language,
      weight: Number(weight),
      dimensions,
      page: Number(page),
      imageFile,
    };
    onSubmit(data);
  };

  const handleToggleEdit = () => {
    setIsEditable(!isEditable);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            {mode === "create" ? "Thêm sản phẩm" : 
             mode === "view" ? "Chi tiết sản phẩm" : 
             "Chỉnh sửa sản phẩm"}
          </h2>
          {mode === "view" && (
            <button 
              onClick={handleToggleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditable ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Mã sách</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập mã"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Tên sách</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập tên sách"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Tác giả</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập tên tác giả"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Danh mục</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Chọn danh mục --</option>
              {categoryList.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Nhà xuất bản</label>
            <select
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              required
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Chọn NXB --</option>
              {publisherList.map((pub) => (
                <option key={pub._id} value={pub._id}>
                  {pub.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Loại khuyến mãi</label>
            <select
              value={discountId}
              onChange={(e) => setDiscountId(e.target.value)}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Không khuyến mãi --</option>
              {discountList.map((dis) => (
                <option key={dis._id} value={dis._id}>
                  {dis.name} ({dis.discount_percentage}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Ảnh bìa</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={!isEditable}
              className={`w-full text-gray-600 
                ${!isEditable ? 'cursor-not-allowed opacity-50' : ''}`}
            />
            {coverImage && (
              <img
                src={editData && !imageFile ? `/image/${coverImage}` : URL.createObjectURL(imageFile)}
                alt="Ảnh bìa"
                className="mt-2 w-32 h-44 object-cover border"
              />
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Giá</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={!isEditable}
              min="0"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập giá tiền"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Số lượng</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
              disabled={!isEditable}
              min="0"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập số lượng tồn kho"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Ngôn ngữ</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ví dụ: Tiếng Việt, English..."
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Khối lượng (gram)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={!isEditable}
              min="0"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập khối lượng sách"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Kích thước</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Ví dụ: 20x30 cm"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Số trang</label>
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              disabled={!isEditable}
              min="0"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập số trang"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={!isEditable}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none 
                ${!isEditable ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Nhập mô tả chi tiết sản phẩm"
            />
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold"
            >
              Đóng
            </button>
            {(mode === "create" || isEditable) && (
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {mode === "create" ? "Thêm mới" : "Cập nhật"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

ProductForm.defaultProps = {
  categoryList: [],
  publisherList: [],
  discountList: [],
  mode: "edit",
};

export default ProductForm;
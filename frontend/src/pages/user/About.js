import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Tiêu đề chính */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 pb-2 border-b-4 border-blue-500 inline-block">
          Cửa Hàng Văn Hóa Đọc Skybooks
        </h1>
      </div>

      {/* Phần giới thiệu với hình ảnh */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="w-full md:w-1/2">
          <img 
            src="/image/skybook.jpg" 
            alt="Skybooks Bookstore" 
            className="rounded-lg shadow-lg object-cover w-full h-auto"
          />
        </div>
        
        <div className="w-full md:w-1/2 bg-gray-100 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thông Tin Liên Hệ</h2>
          <div className="space-y-2">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Số 87, Yên Xá, Thanh Trì, Thanh Xuân, Hà Nội</span>
            </p>
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>0376390962</span>
            </p>
          </div>
        </div>
      </div>

      {/* Về chúng tôi */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
          Về Chúng Tôi
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Skybooks là một điểm đến thân thiện dành cho những người yêu sách và trân trọng tri thức. 
          Là mô hình nhà sách quy mô cỡ vừa, chúng tôi mang sứ mệnh lan tỏa văn hóa đọc, 
          truyền cảm hứng sống tích cực và nuôi dưỡng tâm hồn qua từng cuốn sách chất lượng.
        </p>
      </div>

      {/* Bộ sưu tập sách */}
      <div className="bg-gray-50 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
          Bộ Sưu Tập Sách
        </h2>
        <p className="text-gray-600 mb-4">
          Tại Skybooks, độc giả có thể tìm thấy những đầu sách được chọn lọc kỹ lưỡng, 
          nổi bật với các dòng sách dành cho giới trẻ như:
        </p>
        <ul className="space-y-2 pl-5">
          {[
            'Văn học hiện đại',
            'Sách kỹ năng sống',
            'Sách truyền cảm hứng',
            'Tác phẩm quốc tế bản quyền'
          ].map((item, index) => (
            <li 
              key={index} 
              className="flex items-center text-gray-700"
            >
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Sứ mệnh */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4">
          Sứ Mệnh Của Chúng Tôi
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Bên cạnh việc cung cấp sách, Skybooks còn là không gian kết nối – 
          nơi độc giả có thể khám phá, trò chuyện và chia sẻ niềm yêu thích với sách. 
          Chúng tôi cam kết mang đến cho khách hàng những ấn phẩm hợp pháp, 
          giá trị cùng một không gian thoải mái, chất lượng cho việc đọc.
        </p>
      </div>
    </div>
  );
};

export default About;

import React, { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const UserFooter = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Kiểm tra xem người dùng đã cuộn đến gần cuối trang chưa
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Nếu cuộn đến gần cuối trang (trong khoảng 100px cuối)
      if (scrolled + windowHeight >= documentHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Thêm sự kiện lắng nghe cuộn trang
    window.addEventListener('scroll', toggleVisibility);

    // Dọn dẹp sự kiện khi component bị hủy
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <footer 
      className={`
        bg-gray-800 text-white py-12 transition-all duration-500 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
        fixed bottom-0 left-0 right-0 z-50
      `}
    >
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Thông tin liên hệ */}
        <div>
          <h3 className="text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2">
            Skybooks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-3 text-blue-400" />
              <span>Số 87, Yên Xá, Thanh Trì, Hà Nội</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-3 text-blue-400" />
              <span>0376 390 962</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-3 text-blue-400" />
              <span>contact@skybooks.vn</span>
            </div>
          </div>
        </div>

        {/* Bản đồ Google Maps */}
        <div>
          <h3 className="text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2">
            Vị Trí Của Chúng Tôi
          </h3>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            {/* Placeholder cho Google Maps Embed */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.596579603586!2d105.79438737430426!3d20.968709989840182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad0656979ba5%3A0xa612230ebf81dbda!2zODcgxJAuIFnDqm4gWMOhLCBUw6JuIFRyaeG7gXUsIFRoYW5oIFRyw6wsIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1749323260625!5m2!1svi!2s" 
              width="300" 
              height="250" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy"
              title="Skybooks Location on Google Maps"
            ></iframe>
          </div>
        </div>

        {/* Liên kết mạng xã hội */}
        <div>
          <h3 className="text-2xl font-bold mb-4 border-b-2 border-blue-500 pb-2">
            Kết Nối Với Chúng Tôi
          </h3>
          <div className="flex space-x-4">
            <a 
              href="https://www.facebook.com/skybooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-3xl hover:text-blue-400 transition-colors"
            >
              <FaFacebook />
            </a>
            <a 
              href="https://www.instagram.com/skybooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-3xl hover:text-pink-400 transition-colors"
            >
              <FaInstagram />
            </a>
          </div>
          
          {/* Đăng ký nhận tin */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3">Đăng Ký Nhận Tin</h4>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="w-full px-3 py-2 rounded-l-lg text-gray-800"
              />
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bản quyền */}
      <div className="text-center mt-8 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          © 2024 Skybooks. Bản quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
};

export default UserFooter;

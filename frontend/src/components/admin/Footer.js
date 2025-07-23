import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-t from-blue-500/50 to-transparent py-2 px-6 text-center">
        <p className="text-xs text-gray-700 font-light">
          © {currentYear} Skybook. Bản quyền thuộc về Nhóm Phát Triển Skybook. 
          Đã đăng ký bản quyền.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

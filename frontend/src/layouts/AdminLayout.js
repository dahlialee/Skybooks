import React from 'react';
import TopHeader from '../components/admin/TopHeader';
import SubHeader from '../components/admin/SubHeader';
import { Outlet } from 'react-router-dom';
import Footer from '../components/admin/Footer';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Cố định TopHeader */}
      <div className="sticky top-0 z-20 bg-white h-[70px] shadow-md">
        <TopHeader />
      </div>

      {/* Cố định SubHeader */}
      <div className="sticky top-[70px] z-10 bg-white h-[48px] shadow-md">
        <SubHeader />
      </div>

      {/* Phần nội dung chính */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-100" style={{ height: 'calc(100vh - 120px)' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;

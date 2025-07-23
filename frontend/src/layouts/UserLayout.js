import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from '../components/user/UserHeader';
import UserFooter from '../components/user/UserFooter';

const UserLayout = () => {
  return (
    <div className="flex flex-col h-screen relative">
      {/* Header cố định */}
      <div className="sticky top-0 z-20">
        <UserHeader />
      </div>

      {/* Gradient đầu trang (overlay) */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 z-10">
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(181, 221, 240, 0.8), rgba(236, 72, 153, 0))',
          }}
        />
      </div>

      {/* Gradient giữa màn hình */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse at left center, rgba(181, 221, 240, 0.4), transparent 70%),
              radial-gradient(ellipse at right center, rgba(181, 221, 240, 0.4), transparent 70%)
            `,
          }}
        />
      </div>


      {/* Nội dung cuộn được */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <Outlet />
      </main>

      {/* Gradient dưới cùng */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 z-10">
        <div
          className="w-full h-full"
          style={{
            background:
              'linear-gradient(to top, rgba(181, 221, 240, 0.8), rgba(236, 72, 153, 0))',
          }}
        />
      </div>
      <div className="bottom-0 z-20">
        <UserFooter />
      </div>

    </div>
  );
};

export default UserLayout;

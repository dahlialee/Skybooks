import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from '../components/PrivateRoute';
import AdminLogin from '../pages/admin/AdminLogin';

// Lazy load các trang
const Home = lazy(() => import('../pages/user/Home'));
const BookshelfPage = lazy(() => import('../pages/user/BookShelf'));
const AboutPage = lazy(() => import('../pages/user/About'));
const LoginPage = lazy(() => import('../pages/user/Login'));
const RegisterPage = lazy(() => import('../pages/user/Register'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/user/ProfileEdit'));
const ChangePasswordPage = lazy(() => import('../pages/user/ChangePassword'));
const CartPage = lazy(() => import('../pages/user/CartPage'));
const CheckoutPage = lazy(() => import('../pages/user/CheckoutPage'));
const UserOrderPage = lazy(() => import('../pages/user/UserOrderPage'));
const ProductDetailPage = lazy(() => import('../pages/user/ProductDetailPage').then(module => ({ default: module.default })));
const News = lazy(() => import('../pages/user/News'));
const NewsDetailPage = lazy(() => import('../pages/user/NewsDetail'));
const PaymentResultPage = lazy(() => import('../pages/user/PaymentResultPage'));
const ThankYouPage = lazy(() => import('../pages/user/ThankYouPage'));
const OrderDetailPage = lazy(() => import('../pages/user/OrderDetailPage'));

// Admin Pages
const adminPages = {
  Dashboard: lazy(() => import('../pages/admin/Dashboard')),
  CategoryProduct: lazy(() => import('../pages/admin/CategoryProductPage')),
  Product: lazy(() => import('../pages/admin/ProductPage')),
  Employee: lazy(() => import('../pages/admin/EmployeePage')),
  Customer: lazy(() => import('../pages/admin/CustomerPage')),
  Publisher: lazy(() => import('../pages/admin/PublisherPage')),
  News: lazy(() => import('../pages/admin/NewsPage')),
  Order: lazy(() => import('../pages/admin/OrderPage')),
  PurchaseReceipt: lazy(() => import('../pages/admin/PurchaseReceiptPage')),
  OfflineSale: lazy(() => import('../pages/admin/OfflineSalePage'))
};

// Fallback Loading Component
const FallbackLoading = () => <div>Loading...</div>;

// Ghi chú: Component bảo vệ route admin
const PrivateAdminRoute = ({ children }) => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser ? children : <Navigate to="/admin/login" />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<FallbackLoading />}>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="bookshelf" element={<BookshelfPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          
          {/* Protected User Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/edit" element={<ProfileEditPage />} />
            <Route path="profile/change-password" element={<ChangePasswordPage />} />
            <Route path="user/orders" element={<UserOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>
          
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="payment-result" element={<PaymentResultPage />} />
        </Route>

        {/* Admin Login - Độc lập */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes - Yêu cầu đăng nhập */}
        <Route 
          path="/admin" 
          element={
            <PrivateAdminRoute>
              <AdminLayout />
            </PrivateAdminRoute>
          }
        >
          {Object.entries(adminPages).map(([path, Component]) => (
            <Route 
              key={path} 
              path={path.toLowerCase()} 
              element={
                <PrivateAdminRoute>
                  <Component />
                </PrivateAdminRoute>
              } 
            />
          ))}
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<div>Không tìm thấy trang</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeProvider';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import ComboPackDetail from './pages/ComboPackDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import CheckoutTest from './pages/CheckoutTest';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import WalletDashboard from './components/Wallet/WalletDashboard';
import ReferralVisitTracker from './components/Referral/ReferralVisitTracker';
import * as walletNotifications from './utils/walletNotifications';
// Admin Components
import Admin from './admin/pages/Admin';
import AdminProducts from './admin/pages/AdminProducts';
import AdminOrders from './admin/pages/AdminOrders';
import AdminOrderDetail from './admin/pages/AdminOrderDetail';
import AdminUsers from './admin/pages/AdminUsers';
import AdminCoupons from './admin/pages/AdminCoupons';
import AdminComboPacks from './admin/pages/AdminComboPacks';
import AdminBanners from './admin/pages/AdminBanners';
import AdminSidebar from './admin/components/AdminSidebar';

import './App.css';

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 admin-layout">
      <AdminSidebar />
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: 'var(--sidebar-width, 0px)',
          width: 'calc(100% - var(--sidebar-width, 0px))'
        }}
      >
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .admin-layout > div {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Check if user is admin
const isAdmin = () => {
  const userType = localStorage.getItem('userType');
  return userType === 'admin';
};

function App() {
  // Make wallet notifications available globally
  useEffect(() => {
    window.walletNotifications = walletNotifications;
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#f8faf8]">
          <Toaster position="top-right" />
          <ReferralVisitTracker />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminLayout>
                <Admin />
              </AdminLayout>
            } />
            <Route path="/admin/products" element={
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            } />
            <Route path="/admin/orders" element={
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            } />
            <Route path="/admin/orders/:orderId" element={
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            } />
            <Route path="/admin/coupons" element={
              <AdminLayout>
                <AdminCoupons />
              </AdminLayout>
            } />
            <Route path="/admin/combo-packs" element={
              <AdminLayout>
                <AdminComboPacks />
              </AdminLayout>
            } />
            <Route path="/admin/banners" element={
              <AdminLayout>
                <AdminBanners />
              </AdminLayout>
            } />
            
            {/* User Routes */}
            <Route path="/*" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/combo-packs/:id" element={<ComboPackDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/checkout-test" element={<CheckoutTest />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:orderId" element={<OrderDetail />} />
                    <Route path="/wallet" element={<WalletDashboard />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

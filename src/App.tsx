/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import ScrollToTop from './components/utils/ScrollToTop';

// Public Pages
import Home from './pages/public/Home';
import Menu from './pages/public/Menu';
import About from './pages/public/About';
import Reservations from './pages/public/Reservations';
import Blog from './pages/public/Blog';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsAndConditions from './pages/public/TermsAndConditions';
import TrackOrder from './pages/public/TrackOrder';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import ReservationsAdmin from './pages/admin/Reservations';
import MenuEditor from './pages/admin/MenuEditor';
import BlogEditor from './pages/admin/BlogEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import NavigationEditor from './pages/admin/NavigationEditor';
import SiteSettings from './pages/admin/SiteSettings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="about" element={<About />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="blog" element={<Blog />} />
                <Route path="contact" element={<Contact />} />
                <Route path="track/:type/:id" element={<TrackOrder />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-and-conditions" element={<TermsAndConditions />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="reservations" element={<ReservationsAdmin />} />
                <Route path="menu" element={<MenuEditor />} />
                <Route path="blog" element={<BlogEditor />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="navigation" element={<NavigationEditor />} />
                <Route path="settings" element={<SiteSettings />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

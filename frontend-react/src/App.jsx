
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import Terms from './pages/Terms';
import ContactUs from './pages/ContactUs';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  
  return (
    <>
      <ScrollToTop />
      <PromoBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/tracking/:id" element={<Tracking />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
      <Footer />

      {/* Floating WhatsApp Support */}
      <a
        href={`https://wa.me/91${settings.store_phone?.replace(/[^0-9]/g, '').slice(-10)}?text=Hello ${encodeURIComponent(settings.store_name)}! I have a question about my order.`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </>
  );
}

export default App;
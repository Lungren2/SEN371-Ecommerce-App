import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import './shopping.css';
import './responsive.css';
import './adaptive-shell.css';
import { CartProvider } from './cart/CartProvider';
import AdaptiveShell from './components/navigation/AdaptiveShell';
import HomePage from './pages/home/HomePage';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import LoadingScreen from './pages/LoadingScreen';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import Orders from './pages/Orders';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="main-content fade-page" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/boards" element={<Catalog title="The Master's Collection" categoryName="boards" />} />
        <Route path="/clocks" element={<Catalog title="Precision Clocks" categoryName="clocks" />} />
        <Route path="/books" element={<Catalog title="Chess Literature" categoryName="books" />} />
        <Route path="/bespoke" element={<Catalog title="Bespoke Custom Sets" categoryName="bespoke" />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<section className="shop-page shop-state">
          <h1>Page not found</h1><Link to="/boards" className="btn-primary">Browse the collection</Link>
        </section>} />
      </Routes>
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-newsletter">
          <Link to="/" className="logo-group">
            <div className="logo-icon"></div>
            <span className="logo-text">The Grandmaster's Hub</span>
          </Link>
          <p>Subscribe to receive exclusive access to bespoke collection drops, design history, and masterclass tactical guides.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 The Grandmaster's Hub. All Rights Reserved.</span>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>White Glove Courier</span>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router basename="/SEN371-Ecommerce-App">
      <CartProvider>
        <AdaptiveShell footer={<SiteFooter />}>
          <AnimatedRoutes />
        </AdaptiveShell>
      </CartProvider>
    </Router>
  );
}

export default App;

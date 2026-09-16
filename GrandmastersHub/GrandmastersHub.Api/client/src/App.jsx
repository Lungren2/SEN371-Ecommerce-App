import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom';
import './index.css';
import './shopping.css';
import './responsive.css';
import './mobile-menu.css';
import { CartProvider, useCart } from './cart/CartProvider';
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

function CartCount() {
  const { cart, loading, error, isAuthenticated } = useCart();
  const count = isAuthenticated && (loading || error) ? null : cart.totalQuantity;
  return <span aria-live="polite">Cart{count === null ? '' : ` (${count})`}</span>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="main-content fade-page" key={location.pathname}>
      <Routes location={location}>
        <Route
          path="/"
          element={
            <section className="hero-section fade-page">
              <div className="hero-content">
                <div>
                  <div className="eyebrow">
                    <div className="eyebrow-line"></div>
                    <span>The Ultimate Standard of Play</span>
                  </div>
                  <h1 className="hero-title">Master Your Strategy</h1>
                  <p className="hero-desc">
                    Hand-carved premium equipment crafted from rare hardwoods,
                    volcanic obsidian, and fine Italian marble.
                  </p>
                  <div className="hero-actions">
                    <Link to="/boards" className="btn-primary">Shop Now</Link>
                    <Link to="/bespoke" className="btn-secondary">The Heritage</Link>
                  </div>
                </div>
              </div>
              <div className="hero-image-placeholder">
                <img src="/images/Main-Page-Lander.png" alt="Welcome" />
              </div>
            </section>
          }
        />
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

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={`main-header${menuOpen ? ' menu-open' : ''}`}>
      <Link to="/" className="logo-group" onClick={closeMenu}>
        <div className="logo-icon"></div>
        <span className="logo-text">The Grandmaster's Hub</span>
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="menu-toggle-icon" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <nav
        id="primary-navigation"
        className={`nav-links${menuOpen ? ' is-open' : ''}`}
        aria-label="Primary navigation"
      >
        <Link to="/boards" onClick={closeMenu}>Boards</Link>
        <Link to="/clocks" onClick={closeMenu}>Clocks</Link>
        <Link to="/books" onClick={closeMenu}>Books</Link>
        <Link to="/bespoke" onClick={closeMenu}>Bespoke Sets</Link>
        <div className="nav-divider"></div>
        <Link to="/cart" className="cart-button" onClick={closeMenu}>
          <svg
            className="cart-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4H5L7 14H17L20 7H8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="19" r="1.5" fill="currentColor" />
            <circle cx="17" cy="19" r="1.5" fill="currentColor" />
          </svg>
          <CartCount />
        </Link>
        <Link to="/profile" onClick={closeMenu}>Account</Link>
      </nav>
    </header>
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
        <div className="app-container">
          <SiteHeader />

          <AnimatedRoutes />

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
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;

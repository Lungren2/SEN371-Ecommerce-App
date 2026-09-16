import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../cart/CartProvider';
import useAdaptiveLayout, { LayoutMode } from '../../hooks/useAdaptiveLayout';

const SHOP_PATHS = ['/boards', '/clocks', '/books', '/bespoke'];
const FOCUSED_PATHS = ['/checkout', '/login', '/register'];

const isShopPath = (pathname) => (
  SHOP_PATHS.includes(pathname) || pathname.startsWith('/product/')
);

const isAccountPath = (pathname) => (
  pathname === '/profile'
  || pathname === '/orders'
  || pathname.startsWith('/orders/')
  || pathname === '/login'
  || pathname === '/register'
);

const isFocusedPath = (pathname) => FOCUSED_PATHS.includes(pathname);

function CartLabel({ compact = false }) {
  const { cart, loading, error, isAuthenticated } = useCart();
  const count = isAuthenticated && (loading || error) ? null : cart.totalQuantity;

  if (compact) {
    if (!count) return null;
    return <span className="adaptive-nav-badge" aria-label={`${count} items in cart`}>{count > 99 ? '99+' : count}</span>;
  }

  return <span aria-live="polite">Cart{count === null ? '' : ` (${count})`}</span>;
}

function NavIcon({ name }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.75v-6.25h-5.5V21H3.5a.5.5 0 0 1-.5-.5v-9.7Z" />
      </svg>
    );
  }

  if (name === 'shop') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8.25h16l-1.2-4.5H5.2L4 8.25Zm1 2.5V20h14v-9.25M9 20v-5.25h6V20" />
      </svg>
    );
  }

  if (name === 'cart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 4h2l2 10h10l3-7H8M9 19h.01M17 19h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.6-4.2 3-6.5 7-6.5s6.4 2.3 7 6.5" />
    </svg>
  );
}

const navItems = [
  { key: 'home', label: 'Home', to: '/', icon: 'home' },
  { key: 'shop', label: 'Shop', to: '/boards', icon: 'shop' },
  { key: 'cart', label: 'Cart', to: '/cart', icon: 'cart' },
  { key: 'account', label: 'Account', to: '/profile', icon: 'account' },
];

const isItemActive = (key, pathname) => {
  if (key === 'home') return pathname === '/';
  if (key === 'shop') return isShopPath(pathname);
  if (key === 'cart') return pathname === '/cart' || pathname === '/checkout';
  return isAccountPath(pathname);
};

function AdaptiveDestinations({ variant }) {
  const { pathname } = useLocation();

  return (
    <nav className={`adaptive-primary-nav adaptive-primary-nav-${variant}`} aria-label="Primary navigation">
      {navItems.map((item) => {
        const active = isItemActive(item.key, pathname);
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`adaptive-nav-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="adaptive-nav-icon">
              <NavIcon name={item.icon} />
              {item.key === 'cart' && <CartLabel compact />}
            </span>
            <span className="adaptive-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopHeader() {
  return (
    <header className="main-header">
      <Link to="/" className="logo-group">
        <div className="logo-icon"></div>
        <span className="logo-text">The Grandmaster's Hub</span>
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        <Link to="/boards">Boards</Link>
        <Link to="/clocks">Clocks</Link>
        <Link to="/books">Books</Link>
        <Link to="/bespoke">Bespoke Sets</Link>
        <div className="nav-divider"></div>
        <Link to="/cart" className="cart-button">
          <svg
            className="cart-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
          <CartLabel />
        </Link>
        <Link to="/profile">Account</Link>
      </nav>
    </header>
  );
}

const getTopBarContext = (pathname) => {
  if (pathname === '/') return { title: "The Grandmaster's Hub", branded: true };
  if (SHOP_PATHS.includes(pathname)) return { title: 'Shop' };
  if (pathname.startsWith('/product/')) return { title: 'Product', backTo: '/boards', backLabel: 'Shop' };
  if (pathname === '/cart') return { title: 'Cart' };
  if (pathname === '/checkout') return { title: 'Checkout', backTo: '/cart', backLabel: 'Cart' };
  if (pathname === '/profile') return { title: 'Account' };
  if (pathname === '/orders') return { title: 'Orders', backTo: '/profile', backLabel: 'Account' };
  if (pathname.startsWith('/orders/')) return { title: 'Order', backTo: '/orders', backLabel: 'Orders' };
  if (pathname === '/login') return { title: 'Sign in', backTo: '/profile', backLabel: 'Account' };
  if (pathname === '/register') return { title: 'Create account', backTo: '/login', backLabel: 'Sign in' };
  return { title: "The Grandmaster's Hub", branded: true };
};

function ContextTopBar() {
  const { pathname } = useLocation();
  const context = getTopBarContext(pathname);

  if (context.branded) {
    return (
      <header className="adaptive-topbar">
        <Link to="/" className="adaptive-brand">
          <span className="logo-icon" aria-hidden="true"></span>
          <span>{context.title}</span>
        </Link>
      </header>
    );
  }

  return (
    <header className="adaptive-topbar">
      {context.backTo && (
        <Link to={context.backTo} className="adaptive-back-button" aria-label={`Back to ${context.backLabel}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </Link>
      )}
      <div className="adaptive-topbar-title">{context.title}</div>
    </header>
  );
}

export default function AdaptiveShell({ children, footer }) {
  const layout = useAdaptiveLayout();
  const { pathname } = useLocation();
  const focused = isFocusedPath(pathname);

  if (layout === LayoutMode.EXPANDED) {
    return (
      <div className="app-container">
        <DesktopHeader />
        {children}
        {footer}
      </div>
    );
  }

  return (
    <div
      className={`app-container adaptive-shell adaptive-${layout}`}
      data-global-nav={focused ? 'hidden' : 'visible'}
    >
      <ContextTopBar />

      <div className={`adaptive-shell-body${focused ? ' focused-flow' : ''}`}>
        {layout === LayoutMode.MEDIUM && !focused && (
          <aside className="adaptive-navigation-rail">
            <AdaptiveDestinations variant="rail" />
          </aside>
        )}
        <div className="adaptive-shell-content">{children}</div>
      </div>

      {layout === LayoutMode.COMPACT && !focused && (
        <div className="adaptive-bottom-navigation">
          <AdaptiveDestinations variant="bottom" />
        </div>
      )}
    </div>
  );
}

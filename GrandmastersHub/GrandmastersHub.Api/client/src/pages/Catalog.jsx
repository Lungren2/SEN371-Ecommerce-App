import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { catalogApi } from '../api/client';
import ProductCard from './ProductCard';

const CATEGORY_IMAGES = {
  boards: '/images/Shopping-plain-chess-board.jpg',
  clocks: '/images/Shopping-clock-1.png',
  books: '/images/book-1.png',
  bespoke: '/images/Volcanic.png',
};

const CATEGORY_LINKS = [
  { to: '/boards', label: 'Boards' },
  { to: '/clocks', label: 'Clocks' },
  { to: '/books', label: 'Books' },
  { to: '/bespoke', label: 'Bespoke' },
];

const normalize = (value = '') => value.trim().toLowerCase();

const Catalog = ({ title, categoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const loadProducts = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await catalogApi.getProducts(controller.signal);
        setProducts(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (requestError?.name !== 'AbortError') {
          setProducts([]);
          setError(requestError instanceof Error
            ? requestError.message
            : 'Unable to load the catalog.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [reloadKey]);

  const requestedCategory = normalize(categoryName);
  const displayProducts = products
    .filter((product) => !requestedCategory
      || normalize(product.categoryName).includes(requestedCategory))
    .map((product) => ({
      ...product,
      id: product.productId,
      category: product.categoryName || categoryName,
      imageUrl: product.imageUrl || CATEGORY_IMAGES[requestedCategory],
    }));

  return (
    <section className="catalog-container catalog-adaptive" aria-busy={loading}>
      <header className="adaptive-catalog-header">
        <span className="adaptive-catalog-eyebrow">Collection</span>
        <h1 className="adaptive-catalog-title">{title}</h1>
        <nav className="adaptive-category-nav" aria-label="Shop categories">
          {CATEGORY_LINKS.map((category) => (
            <NavLink
              key={category.to}
              to={category.to}
              className={({ isActive }) => `adaptive-category-link${isActive ? ' is-active' : ''}`}
            >
              {category.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <h1 className="section-title adaptive-catalog-desktop-title">{title}</h1>

      {loading && <div className="catalog-state" role="status">Loading the collection...</div>}

      {!loading && error && (
        <div className="catalog-state catalog-error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn-secondary" onClick={loadProducts}>Try Again</button>
        </div>
      )}

      {!loading && !error && displayProducts.length === 0 && (
        <div className="catalog-state">No products are available in this collection yet.</div>
      )}

      {!loading && !error && displayProducts.length > 0 && (
        <div className="product-grid">
          {displayProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
};

export default Catalog;

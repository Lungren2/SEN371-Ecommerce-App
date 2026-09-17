import { Link } from 'react-router-dom';
import AdaptiveView from '../../components/adaptive/AdaptiveView';
import './home.css';

const collections = [
  {
    to: '/boards',
    label: 'Boards',
    eyebrow: 'Tournament & heirloom',
    image: '/images/Shopping-plain-chess-board.jpg',
  },
  {
    to: '/clocks',
    label: 'Clocks',
    eyebrow: 'Precision timing',
    image: '/images/Shopping-clock-1.png',
  },
  {
    to: '/books',
    label: 'Books',
    eyebrow: 'Study & strategy',
    image: '/images/book-1.png',
  },
  {
    to: '/bespoke',
    label: 'Bespoke',
    eyebrow: 'Made to commission',
    image: '/images/Volcanic.png',
  },
];

function CompactHome() {
  return (
    <div className="home-compact">
      <section className="home-compact-hero">
        <img
          className="home-compact-hero-image"
          src="/images/Main-Page-Lander.png"
          alt="Black chess piece on a premium chess board"
        />
        <div className="home-compact-hero-scrim" aria-hidden="true"></div>
        <div className="home-compact-hero-copy">
          <div className="home-kicker">The ultimate standard of play</div>
          <h1>Master your strategy.</h1>
          <p>
            Exceptional chess equipment, books, clocks, and bespoke sets selected for serious play.
          </p>
          <Link to="/boards" className="home-primary-action">Explore the collection</Link>
        </div>
      </section>

      <section className="home-compact-section" aria-labelledby="compact-collections-title">
        <div className="home-section-heading">
          <div>
            <span className="home-kicker">Shop</span>
            <h2 id="compact-collections-title">Collections</h2>
          </div>
          <Link to="/boards" className="home-text-action">View all</Link>
        </div>

        <div className="home-collection-scroller">
          {collections.map((collection) => (
            <Link key={collection.to} to={collection.to} className="home-collection-card">
              <img src={collection.image} alt="" />
              <span className="home-collection-scrim" aria-hidden="true"></span>
              <span className="home-collection-copy">
                <small>{collection.eyebrow}</small>
                <strong>{collection.label}</strong>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-compact-feature">
        <span className="home-kicker">Bespoke service</span>
        <h2>Built around the way you play.</h2>
        <p>
          Commission materials, proportions, and details for a set with a character of its own.
        </p>
        <Link to="/bespoke" className="home-secondary-action">Discover bespoke</Link>
      </section>
    </div>
  );
}

function MediumHome() {
  return (
    <div className="home-medium">
      <section className="home-medium-hero">
        <div className="home-medium-copy">
          <span className="home-kicker">The ultimate standard of play</span>
          <h1>Master your strategy.</h1>
          <p>
            Hand-picked equipment and literature for players who care as much about the object as the game.
          </p>
          <div className="home-medium-actions">
            <Link to="/boards" className="home-primary-action">Shop collection</Link>
            <Link to="/bespoke" className="home-secondary-action">Bespoke service</Link>
          </div>
        </div>
        <div className="home-medium-media">
          <img src="/images/Main-Page-Lander.png" alt="Black chess piece on a premium chess board" />
        </div>
      </section>

      <section className="home-medium-collections" aria-labelledby="medium-collections-title">
        <div className="home-section-heading">
          <div>
            <span className="home-kicker">Shop</span>
            <h2 id="medium-collections-title">Collections</h2>
          </div>
        </div>
        <div className="home-medium-grid">
          {collections.map((collection) => (
            <Link key={collection.to} to={collection.to} className="home-medium-card">
              <img src={collection.image} alt="" />
              <div>
                <small>{collection.eyebrow}</small>
                <strong>{collection.label}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExpandedHome() {
  return (
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
  );
}

export default function HomePage() {
  return (
    <AdaptiveView
      compact={<CompactHome />}
      medium={<MediumHome />}
      expanded={<ExpandedHome />}
    />
  );
}

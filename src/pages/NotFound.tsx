import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import './NotFound.css';

export const NotFound: React.FC = () => {
  useSEO({
    title: 'Page Not Found | ChatParser',
    canonical: '',
    noindex: true
  });

  return (
    <div className="not-found">
      <div className="not-found__bg-decoration">404</div>

      <main className="not-found__content">
        <div className="not-found__card">
          <div className="not-found__icon-wrapper">
            <div className="not-found__icon-bg">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <h1 className="not-found__title">404</h1>
          <h2 className="not-found__subtitle">Oops! Page not found</h2>
          <p className="not-found__description">
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>

          <div className="not-found__actions">
            <Link to="/" className="not-found__button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

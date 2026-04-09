import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const NotFound: React.FC = () => {
  useEffect(() => {
    // 1. Manage robots tag
    const existingRobots = document.querySelector('meta[name="robots"]');
    const originalRobots = existingRobots ? existingRobots.getAttribute('content') : null;
    
    if (existingRobots) {
      existingRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      meta.id = 'temp-robots';
      document.head.appendChild(meta);
    }

    // 2. Manage canonical tag
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = existingCanonical ? existingCanonical.getAttribute('href') : null;
    if (existingCanonical) {
      existingCanonical.setAttribute('href', ''); // Disable canonical for 404
    }

    // 3. Update page title
    const prevTitle = document.title;
    document.title = 'Page Not Found | ChatParser';

    return () => {
      // Restore original tags
      if (existingRobots && originalRobots) {
        existingRobots.setAttribute('content', originalRobots);
      } else {
        const temp = document.getElementById('temp-robots');
        if (temp) temp.remove();
      }

      if (existingCanonical && originalCanonical) {
        existingCanonical.setAttribute('href', originalCanonical);
      }

      document.title = prevTitle;
    };
  }, []);

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

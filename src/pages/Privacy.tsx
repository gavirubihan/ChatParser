import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import './Privacy.css';


export const Privacy: React.FC = () => {
  // (Scroll to top now handled globally by ScrollToTop component in App.tsx)

  return (
    <div className="privacy-page">
      {/* NAV (reused from Landing for consistency) */}
      <nav className="landing__nav" aria-label="Main navigation" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div className="landing__nav-inner">
          <Link to="/" className="landing__nav-logo">
            <div className="landing__nav-logo-icon">
              <img src="/chatparser.svg" alt="ChatParser Logo" width="32" height="32" style={{ borderRadius: '8px' }} />
            </div>
            <span className="landing__nav-logo-text">Chat<span className="logo-gradient">Parser</span></span>
          </Link>

          <div className="landing__nav-links">
            <Link to="/" className="landing__nav-link">Home</Link>
            <Link to="/chat" className="landing__nav-link">Chats</Link>
            <Link to="/privacy" className="landing__nav-link active">Privacy</Link>
            <Link to="/about" className="landing__nav-link">About</Link>
          </div>

          <div className="landing__nav-actions">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="privacy-page__content">
        <header className="privacy-page__header">
          <span className="privacy-page__last-updated">Last Updated: April 10, 2026</span>
          <h1 className="privacy-page__title">Privacy Policy</h1>
          <p className="privacy-page__text">
            At ChatParser (owned by <a href="https://neovise.me" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>neovise.me</a>), your privacy is our core value. This policy explains how we handle your data and what services we use to improve your experience.
          </p>
        </header>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">1. Your Chat Data (Privacy First)</h2>
          <div className="privacy-page__card">
            <p className="privacy-page__text">
              <strong className="privacy-page__highlight">ChatParser does not upload your WhatsApp chat exports to any server.</strong>
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">All parsing, processing, and rendering of your chat messages happens <strong>locally</strong> in your browser.</li>
              <li className="privacy-page__list-item">Your messages, photos, videos, and documents never leave your device.</li>
              <li className="privacy-page__list-item">We use browser-based storage (IndexedDB) to save your sessions locally, so you can access them later without re-uploading.</li>
            </ul>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">2. Analytics & Usage Tracking</h2>
          <p className="privacy-page__text">
            To understand how users interact with ChatParser and to improve our service, we use the following third-party analytics tools:
          </p>

          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Google Analytics</h3>
            <p className="privacy-page__text">
              We use Google Analytics to collect information about how often users visit our site, what pages they visit, and what other sites they used prior to coming to our site. This helps us optimize performance and user experience.
            </p>
          </div>

          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Microsoft Clarity</h3>
            <p className="privacy-page__text">
              We partner with Microsoft Clarity and Microsoft Advertising to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve and market our products/services.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">3. Advertising Services</h2>
          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Adsterra</h3>
            <p className="privacy-page__text">
              To keep ChatParser free and support development, we display advertisements provided by Adsterra. These ads are served through an iframe and may collect cookies or other identifiers to provide relevant advertising.
              <br /><br />
              <strong className="privacy-page__highlight">Important:</strong> Adsterra does not have access to your chat data, as all chat processing occurs in a separate local environment.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">4. Cookies</h2>
          <p className="privacy-page__text">
            Cookies are small pieces of data stored on your device. We use cookies to:
          </p>
          <ul className="privacy-page__list">
            <li className="privacy-page__list-item">Persist your theme preference (Dark or Light mode).</li>
            <li className="privacy-page__list-item">Enable analytics and advertising functionality as described above.</li>
          </ul>
          <p className="privacy-page__text">
            You can choose to disable cookies through your browser settings, though this may affect some features of the site.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">5. Changes to This Policy</h2>
          <p className="privacy-page__text">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">6. Contact Us</h2>
          <p className="privacy-page__text">
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us through our GitHub repository or official channels.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

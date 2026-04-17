import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="landing__footer">
      <div className="landing__footer-inner">
        <div className="landing__footer-brand">
          <Link to="/" className="landing__footer-logo">
            <img src="/chatparser.svg" alt="ChatParser Logo" width="24" height="24" style={{ borderRadius: '6px' }} />
            <span>Chat<span className="logo-gradient">Parser</span></span>
          </Link>
          <p className="landing__footer-tagline">
            A private and seamless way to view WhatsApp chat exports.
          </p>
        </div>

        <div className="landing__footer-col">
          <h4 className="landing__footer-col-title">Quick Links</h4>
          <div className="landing__footer-links">
            <Link to="/" className="landing__footer-link">Home</Link>
            <Link to="/chat" className="landing__footer-link">Chats</Link>
            <Link to="/about" className="landing__footer-link">About</Link>
            <Link to="/privacy" className="landing__footer-link">Privacy Policy</Link>
            <Link to="/contact" className="landing__footer-link">Contact Us</Link>
          </div>
        </div>

        <div className="landing__footer-col">
          <h4 className="landing__footer-col-title">Connect</h4>
          <div className="landing__footer-links">
            <a href="mailto:contact@chatparser.online" className="landing__footer-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              contact@chatparser.online
            </a>
            <a href="https://web.facebook.com/chatparser" target="_blank" rel="noopener noreferrer" className="landing__footer-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
              Facebook
            </a>
            <a href="https://www.linkedin.com/company/chatparser" target="_blank" rel="noopener noreferrer" className="landing__footer-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </a>
            <a href="https://github.com/gavirubihan/ChatParser" target="_blank" rel="noopener noreferrer" className="landing__footer-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="landing__footer-col">
          <h4 className="landing__footer-col-title">Settings</h4>
          <div className="landing__footer-links">
            <button
              className="landing__footer-settings-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('chatparser:show-cookie-consent'))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <circle cx="12" cy="12" r="1" />
              </svg>
              Cookie Settings
            </button>
          </div>
        </div>
      </div>

      <div className="landing__footer-bottom">
        <p className="landing__footer-copy">
          © {new Date().getFullYear()} ChatParser · Owned by <a href="https://neovise.me" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>neovise.me</a> · Built for privacy · No data ever leaves your device
        </p>
      </div>
    </footer>
  );
};

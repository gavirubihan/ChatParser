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
            <a href="https://github.com/gavirubihan/ChatParser" target="_blank" rel="noopener noreferrer" className="landing__footer-link">Source Code</a>
          </div>
        </div>

        <div className="landing__footer-col">
          <h4 className="landing__footer-col-title">Support</h4>
          <div className="landing__footer-links">
            <a href="mailto:contact@chatparser.online" className="landing__footer-link">
              contact@chatparser.online
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
          © {new Date().getFullYear()} ChatParser · Built for privacy · No data ever leaves your device
        </p>
      </div>
    </footer>
  );
};

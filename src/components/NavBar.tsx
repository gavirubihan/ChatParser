import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './NavBar.css';

export const NavBar: React.FC = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHidden(true);
        setIsMenuOpen(false); // Close menu when scrolling away
      } else {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isHidden ? 'navbar--hidden' : ''}`} aria-label="Main navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="ChatParser home" onClick={() => setIsMenuOpen(false)}>
          <div className="navbar__logo-icon">
            <img src="/chatparser.svg" alt="ChatParser Logo" width="32" height="32" style={{ borderRadius: '8px' }} />
          </div>
          <span className="navbar__logo-text">Chat<span className="logo-gradient">Parser</span></span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`navbar__burger ${isMenuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span /><span /><span />
        </button>

        <div className={`navbar__menu ${isMenuOpen ? 'navbar__menu--open' : ''}`}>
          <div className="navbar__links">
            <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/chat" className={`navbar__link ${location.pathname.startsWith('/chat') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Chats</Link>
            <Link to="/privacy" className={`navbar__link ${location.pathname === '/privacy' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Privacy</Link>
            <Link to="/about" className={`navbar__link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/contact" className={`navbar__link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>Contact</Link>
          </div>

          <div className="navbar__divider" aria-hidden="true" />

          <div className="navbar__actions">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

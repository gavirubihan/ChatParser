import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CookieConsent.css';

const COOKIE_CONSENT_KEY = 'chatparser_cookie_consent';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Listener for manually re-opening the settings
    const handleShowSettings = () => {
      setIsVisible(true);
      // Wait for next tick to ensure smooth transition if it was just hidden
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 10);
    };

    window.addEventListener('chatparser:show-cookie-consent', handleShowSettings);
    return () => window.removeEventListener('chatparser:show-cookie-consent', handleShowSettings);
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setIsVisible(false);
    
    // In a real scenario, you would trigger the enabling/disabling 
    // of Google Analytics or MS Clarity here.
    console.log(`User choice: ${choice}`);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-consent__banner">
        <div className="cookie-consent__content">
          <h3 className="cookie-consent__title">
            <svg className="cookie-consent__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
            Cookie Preferences
          </h3>
          <p className="cookie-consent__text">
            We use cookies to improve your experience, analyze site usage, and support development through advertising. 
            View our <a onClick={() => navigate('/privacy')} className="cookie-consent__link" style={{ cursor: 'pointer' }}>Privacy Policy</a> for more details.
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button 
            className="cookie-consent__btn cookie-consent__btn--decline"
            onClick={() => handleChoice('declined')}
          >
            Decline
          </button>
          <button 
            className="cookie-consent__btn cookie-consent__btn--accept"
            onClick={() => handleChoice('accepted')}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

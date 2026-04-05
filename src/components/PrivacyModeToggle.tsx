import React, { useState } from 'react';
import { usePrivacyMode } from '../hooks/usePrivacyMode';
import './PrivacyModeToggle.css';

export const PrivacyModeToggle: React.FC = () => {
  const { mode, changeMode } = usePrivacyMode();
  const [showInfo, setShowInfo] = useState(false);

  const isSession = mode === 'session';

  return (
    <div className="privacy-toggle">
      <div className="privacy-toggle__row">
        {/* Icon + label */}
        <div className="privacy-toggle__label">
          <div className={`privacy-toggle__icon ${isSession ? 'privacy-toggle__icon--session' : 'privacy-toggle__icon--persist'}`}>
            {isSession ? (
              // Shield with X
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.41 11L9 10.41 10.41 9 12 10.59 13.59 9 15 10.41l-1.59 1.59L15 13.59 13.59 15 12 13.41 10.41 15 9 13.59l1.59-1.59z"/>
              </svg>
            ) : (
              // Shield with check
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            )}
          </div>
          <div className="privacy-toggle__text">
            <span className="privacy-toggle__title">
              {isSession ? 'Session mode' : 'Persistent storage'}
            </span>
            <span className="privacy-toggle__sub">
              {isSession ? 'Data clears on tab close' : 'Data kept between sessions'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="privacy-toggle__controls">
          <button
            className="privacy-toggle__info-btn"
            onClick={() => setShowInfo(v => !v)}
            aria-label="Privacy mode info"
            title="Learn more"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>

          {/* Toggle switch */}
          <button
            className={`privacy-toggle__switch ${isSession ? 'privacy-toggle__switch--on' : ''}`}
            onClick={() => changeMode(isSession ? 'persistent' : 'session')}
            role="switch"
            aria-checked={isSession}
            aria-label="Toggle session mode"
            id="privacy-mode-toggle"
          >
            <span className="privacy-toggle__thumb" />
          </button>
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="privacy-toggle__info-panel" role="note">
          <div className="privacy-toggle__info-grid">
            <div className="privacy-toggle__info-item">
              <span className="privacy-toggle__info-icon privacy-toggle__info-icon--green">✓</span>
              <span><strong>Persistent</strong> — data stays until you delete it manually. Best for regular use.</span>
            </div>
            <div className="privacy-toggle__info-item">
              <span className="privacy-toggle__info-icon privacy-toggle__info-icon--orange">✕</span>
              <span><strong>Session</strong> — all chat data is wiped the next time you open this page. Refresh keeps data; closing the tab clears it.</span>
            </div>
          </div>
          <p className="privacy-toggle__info-note">
            Applies from the next fresh tab open. Current session data is unaffected.
          </p>
        </div>
      )}
    </div>
  );
};

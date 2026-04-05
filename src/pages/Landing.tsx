import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { ThemeToggle } from '../components/ThemeToggle';
import type { ProcessResult } from '../lib/zipHandler';
import './Landing.css';

// Feature cards data
const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'All Message Types',
    desc: 'Text, images, videos, audio, stickers, GIFs, documents, contacts, and locations — all rendered beautifully.',
    color: '#00a884',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: 'Smart Search',
    desc: 'Search messages by keyword and filter by date range. Navigate results instantly with Prev / Next.',
    color: '#3b82f6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <rect x="7" y="7" width="3" height="9"/><rect x="14" y="7" width="3" height="5"/>
      </svg>
    ),
    title: 'Group Chat Support',
    desc: 'Supports both private and group chats. Coloured sender names and avatars for every participant.',
    color: '#8b5cf6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '100% Private',
    desc: 'All processing happens in your browser. Nothing is uploaded to any server. Your chats stay on your device.',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    title: 'Persistent Storage',
    desc: 'Uploaded chats are saved locally in your browser. Access them any time without re-uploading.',
    color: '#ec4899',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: 'Dark & Light Mode',
    desc: 'Fully themed dark and light modes that respect your system preference. Switch instantly.',
    color: '#14b8a6',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Export from WhatsApp',
    desc: 'Open any chat → Menu → More → Export Chat. Choose "Include media" for a ZIP file or "Without media" for a text file.',
  },
  {
    step: '02',
    title: 'Upload here',
    desc: 'Drag & drop your .txt or .zip file onto the upload area, or click to browse. Supports Android & iOS exports.',
  },
  {
    step: '03',
    title: 'Browse & Search',
    desc: 'Your chat is instantly rendered with all messages, media, and timestamps. Use search to find any moment.',
  },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleUploadSuccess = (result: ProcessResult) => {
    navigate(`/chat/${result.sessionId}`);
  };

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="landing">
      {/* ===== NAV ===== */}
      <nav className="landing__nav" aria-label="Main navigation">
        <div className="landing__nav-inner">
          <a href="/" className="landing__nav-logo" aria-label="ChatVault home">
            <div className="landing__nav-logo-icon">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#00a884"/>
                <path d="M16 6C10.477 6 6 10.477 6 16c0 1.854.506 3.591 1.39 5.085L6 26l5.09-1.33A9.954 9.954 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6z" fill="white"/>
              </svg>
            </div>
            <span className="landing__nav-logo-text">ChatVault</span>
          </a>
          <div className="landing__nav-actions">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        {/* ===== HERO ===== */}
        <section className="landing__hero" aria-labelledby="hero-title">
          {/* Background blobs */}
          <div className="landing__blob landing__blob--1" aria-hidden="true" />
          <div className="landing__blob landing__blob--2" aria-hidden="true" />
          <div className="landing__blob landing__blob--3" aria-hidden="true" />

          <div className="landing__hero-content">
            {/* Badge */}
            <div className="landing__badge animate-fade-in-up">
              <span className="landing__badge-dot" />
              100% Private · No Server · Open Source
            </div>

            <h1 id="hero-title" className="landing__hero-title animate-fade-in-up delay-100">
              View Your WhatsApp
              <span className="landing__hero-gradient"> Chat History</span>
              <br />Like Never Before
            </h1>

            <p className="landing__hero-subtitle animate-fade-in-up delay-200">
              Upload your WhatsApp export file and explore your conversation history
              with a beautiful, feature-rich viewer. Search messages, view media,
              and more — all privately on your device.
            </p>

            <div className="landing__hero-actions animate-fade-in-up delay-300">
              <button className="landing__cta-btn" onClick={scrollToUpload} id="hero-upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Chat Now
              </button>
              <button className="landing__secondary-btn" onClick={scrollToUpload}>
                See How It Works ↓
              </button>
            </div>

            {/* Stats */}
            <div className="landing__stats animate-fade-in-up delay-400">
              <div className="landing__stat">
                <span className="landing__stat-value">Android & iOS</span>
                <span className="landing__stat-label">Both supported</span>
              </div>
              <div className="landing__stat-divider" />
              <div className="landing__stat">
                <span className="landing__stat-value">100k+</span>
                <span className="landing__stat-label">Messages handled</span>
              </div>
              <div className="landing__stat-divider" />
              <div className="landing__stat">
                <span className="landing__stat-value">0 uploads</span>
                <span className="landing__stat-label">To any server</span>
              </div>
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="landing__mockup animate-fade-in-up delay-200" aria-hidden="true">
            <div className="landing__mockup-window">
              <div className="landing__mockup-header">
                <div className="landing__mockup-avatar">A</div>
                <div className="landing__mockup-header-info">
                  <span className="landing__mockup-name">Amara & Jake</span>
                  <span className="landing__mockup-status">2 participants · 1,247 messages</span>
                </div>
                <div className="landing__mockup-dots">
                  <span /><span /><span />
                </div>
              </div>
              <div className="landing__mockup-chat">
                <div className="landing__mockup-date-sep">Today</div>
                <div className="landing__mockup-msg landing__mockup-msg--in">
                  <div className="landing__mockup-bubble">
                    Hey! Did you see the photos from last night? 😄
                    <span className="landing__mockup-time">10:23 am</span>
                  </div>
                </div>
                <div className="landing__mockup-msg landing__mockup-msg--out">
                  <div className="landing__mockup-bubble">
                    Yes!! They turned out amazing 🔥
                    <span className="landing__mockup-time">10:25 am</span>
                  </div>
                </div>
                <div className="landing__mockup-msg landing__mockup-msg--in">
                  <div className="landing__mockup-bubble landing__mockup-bubble--img">
                    <div className="landing__mockup-img-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                    </div>
                    <span className="landing__mockup-caption">IMG-20240320.jpg</span>
                    <span className="landing__mockup-time">10:26 am</span>
                  </div>
                </div>
                <div className="landing__mockup-msg landing__mockup-msg--out">
                  <div className="landing__mockup-bubble">
                    Send me the others too!
                    <span className="landing__mockup-time">10:28 am</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== UPLOAD SECTION ===== */}
        <section className="landing__upload-section" id="upload" ref={uploadRef} aria-labelledby="upload-title">
          <div className="landing__section-inner">
            <div className="landing__section-label">Get Started</div>
            <h2 id="upload-title" className="landing__section-title">Upload Your Chat Export</h2>
            <p className="landing__section-subtitle">
              Drag & drop or click to browse. Supports <strong>.txt</strong> and <strong>.zip</strong> exports from Android and iOS.
            </p>
            <UploadZone onSuccess={handleUploadSuccess} />
            <div className="landing__upload-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Your data never leaves your device. All processing happens locally in your browser.
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="landing__features" aria-labelledby="features-title">
          <div className="landing__section-inner">
            <div className="landing__section-label">Features</div>
            <h2 id="features-title" className="landing__section-title">Everything You Need</h2>
            <p className="landing__section-subtitle">
              A complete WhatsApp chat viewer with all the features that matter.
            </p>
            <div className="landing__feature-grid" role="list">
              {FEATURES.map((f, i) => (
                <article
                  key={f.title}
                  className={`landing__feature-card animate-fade-in-up delay-${Math.min(i * 100, 500)}`}
                  role="listitem"
                >
                  <div className="landing__feature-icon" style={{ '--feature-color': f.color } as React.CSSProperties}>
                    {f.icon}
                  </div>
                  <h3 className="landing__feature-title">{f.title}</h3>
                  <p className="landing__feature-desc">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="landing__how" aria-labelledby="how-title">
          <div className="landing__section-inner landing__section-inner--narrow">
            <div className="landing__section-label">How It Works</div>
            <h2 id="how-title" className="landing__section-title">Three Simple Steps</h2>
            <div className="landing__steps">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="landing__step animate-fade-in-up">
                  <div className="landing__step-number">{step.step}</div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="landing__step-connector" aria-hidden="true" />
                  )}
                  <div className="landing__step-content">
                    <h3 className="landing__step-title">{step.title}</h3>
                    <p className="landing__step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="landing__cta-section" aria-labelledby="cta-title">
          <div className="landing__cta-inner">
            <h2 id="cta-title" className="landing__cta-title">Ready to explore your chats?</h2>
            <p className="landing__cta-sub">Upload your WhatsApp export and start browsing in seconds.</p>
            <button className="landing__cta-btn landing__cta-btn--large" onClick={scrollToUpload} id="cta-upload-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Your Chat
            </button>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-logo">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#00a884"/>
              <path d="M16 6C10.477 6 6 10.477 6 16c0 1.854.506 3.591 1.39 5.085L6 26l5.09-1.33A9.954 9.954 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6z" fill="white"/>
            </svg>
            <span>ChatVault</span>
          </div>
          <p className="landing__footer-copy">
            © {new Date().getFullYear()} ChatVault · Built for privacy · All data stays on your device
          </p>
        </div>
      </footer>
    </div>
  );
};

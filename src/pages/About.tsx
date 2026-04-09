import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import './About.css';


export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about">
      {/* ===== NAV ===== */}
      <nav className="landing__nav" aria-label="Main navigation">
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
            <Link to="/privacy" className="landing__nav-link">Privacy</Link>
            <Link to="/about" className="landing__nav-link active">About</Link>
          </div>

          <div className="landing__nav-actions">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="about__main">
        {/* ===== HERO ===== */}
        <section className="about__hero">
          <div className="landing__blob landing__blob--1" />
          <div className="about__hero-content">
            <div className="about__label animate-fade-in">Our Mission</div>
            <h1 className="about__hero-title animate-fade-in-up">
              Relive your memories, <br />
              <span className="landing__whatsapp-gradient">privately.</span>
            </h1>
            <p className="about__hero-subtitle animate-fade-in-up delay-100">
              WhatsApp provides a convenient way to export and share your chat history, but lacks a built-in tool to actually view and navigate those exports.
              <strong>ChatParser was built to bridge that gap</strong>—bringing your raw conversations back to life in a beautiful, readable, and 100% private format.
            </p>
          </div>
        </section>

        {/* ===== PRIVACY SECTION ===== */}
        <section className="about__section">
          <div className="about__section-inner">
            <div className="about__grid">
              <div className="about__content">
                <div className="about__label">The Privacy Pillar</div>
                <h2 className="about__title">Your Data, Your Device. Always.</h2>
                <p className="about__text">
                  Unlike other tools, ChatParser uses a <strong>Zero-Server Architecture</strong>. This means that when you "upload" a chat,
                  nothing actually leaves your computer.
                </p>
                <p className="about__text">
                  Our parsing engine runs entirely within your browser's memory. We don't have a backend database for your chats
                  because your privacy isn't just a policy—it's built into the code.
                </p>
              </div>
              <div className="about__tech-card animate-scale-in">
                <div className="landing__feature-icon" style={{ backgroundColor: 'rgba(0, 168, 132, 0.1)', color: '#00a884', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: '12px' }}>Client-Side Only</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                  We leverage modern Web APIs to process large ZIP files and text logs instantly without ever touching a network.
                  Even if you disconnect your internet, ChatParser keeps working.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TECH SECTION ===== */}
        <section className="about__section" style={{ background: 'var(--bg-surface)' }}>
          <div className="about__section-inner">
            <div className="about__grid" style={{ direction: 'rtl' }}>
              <div className="about__content" style={{ direction: 'ltr' }}>
                <div className="about__label">Engineering</div>
                <h2 className="about__title">High Performance for High Memory.</h2>
                <p className="about__text">
                  Digital lifetimes are long. Some of the chats we support contain over 500,000 messages and thousands of media files.
                </p>
                <p className="about__text">
                  We use advanced <strong>Virtual List rendering</strong> and <strong>Concurrent Processing</strong> to ensure that
                  scrolling through a 10-year-old conversation feels as smooth as a fresh one. No lag, no crashing, just speed.
                </p>
              </div>
              <div className="about__feature-display animate-scale-in">
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  <div className="about__feature-name">60 FPS Scrolling</div>
                  <div className="about__feature-desc">Virtualization handles massive lists with ease</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="about__feature-name">Media Rendering</div>
                  <div className="about__feature-desc">Native support for ALL WhatsApp media types</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" />
                    </svg>
                  </div>
                  <div className="about__feature-name">Local Storage</div>
                  <div className="about__feature-desc">IndexedDB saves your sessions locally for later</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <div className="about__feature-name">Open Source</div>
                  <div className="about__feature-desc">Fully transparent code for total peace of mind</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="about__cta">
          <div className="about__hero-content">
            <h2 className="about__cta-title">Ready to take a look?</h2>
            <p className="about__cta-text">
              Relive your favorite moments in a beautiful interface without ever compromising your security.
            </p>
            <button className="landing__cta-btn" onClick={() => navigate('/')}>
              Start Viewing Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

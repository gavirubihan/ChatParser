import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import './About.css';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about">
      {/* ===== NAV ===== */}
      <nav className="landing__nav" aria-label="Main navigation">
        <div className="landing__nav-inner">
          <div className="landing__nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="landing__nav-logo-icon">
              <img src="/chatparser.svg" alt="ChatParser Logo" width="32" height="32" style={{ borderRadius: '8px' }} />
            </div>
            <span className="landing__nav-logo-text">Chat<span className="logo-gradient">Parser</span></span>
          </div>

          <div className="landing__nav-links">
            <a onClick={() => navigate('/')} className="landing__nav-link" style={{ cursor: 'pointer' }}>Home</a>
            <a onClick={() => navigate('/chat')} className="landing__nav-link" style={{ cursor: 'pointer' }}>Chats</a>
            <a onClick={() => navigate('/privacy')} className="landing__nav-link" style={{ cursor: 'pointer' }}>Privacy</a>
            <a className="landing__nav-link active">About</a>
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
              ChatParser was built to solve a simple problem: WhatsApp chat exports are hard to read and easy to lose. 
              We provide a beautiful, high-performance, and 100% private way to preserve your digital conversations.
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div className="about__feature-name">60 FPS Scrolling</div>
                  <div className="about__feature-desc">Virtualization handles massive lists with ease.</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  </div>
                  <div className="about__feature-name">Media Rendering</div>
                  <div className="about__feature-desc">Native support for ALL WhatsApp media types.</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/></svg>
                  </div>
                  <div className="about__feature-name">Local Storage</div>
                  <div className="about__feature-desc">IndexedDB saves your sessions locally for later.</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  </div>
                  <div className="about__feature-name">Open Source</div>
                  <div className="about__feature-desc">Fully transparent code for total peace of mind.</div>
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

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <div className="landing__footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src="/chatparser.svg" alt="ChatParser Logo" width="24" height="24" style={{ borderRadius: '6px' }} />
              <span>Chat<span className="logo-gradient">Parser</span></span>
            </div>
            <p className="landing__footer-tagline">
              The world's most private and beautiful WhatsApp chat export viewer.
            </p>
          </div>

          <div className="landing__footer-col">
            <h4 className="landing__footer-col-title">Quick Links</h4>
            <div className="landing__footer-links">
              <a onClick={() => navigate('/')} className="landing__footer-link">Home</a>
              <a onClick={() => navigate('/chat')} className="landing__footer-link">Chats</a>
              <a className="landing__footer-link active">About</a>
              <a onClick={() => navigate('/privacy')} className="landing__footer-link">Privacy Policy</a>
              <a href="https://github.com/gavirubihan/WhatsApp-chat-export-viewer" target="_blank" rel="noopener noreferrer" className="landing__footer-link">Source Code</a>
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
    </div>
  );
};

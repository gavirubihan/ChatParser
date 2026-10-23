import React from 'react';
import { Link } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import './About.css';

export const About: React.FC = () => {
  useSEO({
    title: 'About Us | Private WhatsApp Chat Viewer | ChatParser',
    description: 'Learn more about ChatParser, the private WhatsApp chat export viewer built and maintained by Neovise. Fast, local-only parsing with zero cloud uploads.',
    canonical: '/about',
    breadcrumbs: [
      { name: 'Home', item: 'https://chatparser.online/' },
      { name: 'About', item: 'https://chatparser.online/about' },
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About ChatParser',
      url: 'https://chatparser.online/about',
      description: 'ChatParser is a private client-side WhatsApp chat export viewer built, maintained, and owned by Neovise.',
      publisher: {
        '@type': 'Organization',
        name: 'Neovise',
        url: 'https://neovise.me',
      },
    },
  });

  return (
    <div className="about">
      {/* ===== NAV ===== */}
      <NavBar />

      <main className="about__main">
        {/* ===== HERO ===== */}
        <section className="about__hero" aria-labelledby="about-hero-title">
          <div className="landing__blob landing__blob--1" />
          <div className="about__hero-content">
            <div className="about__label animate-fade-in">Our Mission</div>
            <h1 id="about-hero-title" className="about__hero-title animate-fade-in-up">
              Relive your memories, <br />
              <span className="landing__whatsapp-gradient">privately.</span>
            </h1>
            <p className="about__hero-subtitle animate-fade-in-up delay-100">
              WhatsApp provides a convenient way to export and share your chat history, but lacks a built-in tool to actually view and navigate those exports.{' '}
              <strong>ChatParser was built to bridge that gap</strong>—bringing your raw conversations back to life in a beautiful, readable format where your chats stay on your device.
            </p>
          </div>
        </section>

        {/* ===== PRIVACY SECTION ===== */}
        <section className="about__section" aria-labelledby="about-privacy-title">
          <div className="about__section-inner">
            <div className="about__grid">
              <div className="about__content">
                <div className="about__label">The Privacy Pillar</div>
                <h2 id="about-privacy-title" className="about__title">Your Data, Your Device. Always.</h2>
                <p className="about__text">
                  Unlike cloud-based tools, ChatParser parses your chats locally in your browser. When you drop in a chat export,
                  your messages and media stay on your device.
                </p>
                <p className="about__text">
                  Our parsing engine runs entirely within your browser's memory. We don't store your conversations on any server
                  because your chats belong to you.
                </p>
              </div>
              <div className="about__tech-card animate-scale-in">
                <div className="landing__feature-icon" style={{ backgroundColor: 'rgba(0, 168, 132, 0.1)', color: '#00a884', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: '12px' }}>Client-Side Only</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                  We use modern Web APIs to process large ZIP files and text logs in your browser. Your chat
                  content is never uploaded to our servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS SECTION ===== */}
        <section className="about__section" style={{ background: 'var(--bg-surface)' }} aria-labelledby="about-how-title">
          <div className="about__section-inner">
            <div className="about__label">Guide</div>
            <h2 id="about-how-title" className="about__title">How our WhatsApp chat viewer works</h2>
            <ol className="about__text" style={{ paddingLeft: 'var(--space-6)', lineHeight: '2' }}>
              <li>In WhatsApp, open a chat and choose <strong>Export Chat</strong> (with or without media).</li>
              <li>Drop the <strong>.zip</strong> or <strong>.txt</strong> file into ChatParser. Parsing happens directly in your browser.</li>
              <li>Browse, search, bookmark, and add notes. Your sessions are saved locally in IndexedDB for fast access anytime.</li>
            </ol>
          </div>
        </section>

        {/* ===== TECH SECTION ===== */}
        <section className="about__section" aria-labelledby="about-tech-title">
          <div className="about__section-inner">
            <div className="about__grid about__grid--reverse">
              <div className="about__content">
                <div className="about__label">Engineering</div>
                <h2 id="about-tech-title" className="about__title">High Performance for High Memory.</h2>
                <p className="about__text">
                  Digital lifetimes are long. Some of the chats we support contain very large message histories and media archives.
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
                  <div className="about__feature-name">Smooth Scrolling</div>
                  <div className="about__feature-desc">Virtualization handles very large chats with ease</div>
                </div>
                <div className="about__feature-item">
                  <div className="about__feature-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div className="about__feature-name">Media Rendering</div>
                  <div className="about__feature-desc">Images, video, audio, and documents</div>
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
                  <div className="about__feature-desc">
                    <a
                      href="https://github.com/gavirubihan/ChatParser"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'underline' }}
                    >
                      View source code on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT NEOVISE / BRAND SECTION ===== */}
        <section className="about__section" style={{ background: 'var(--bg-surface)' }} aria-labelledby="about-brand-title">
          <div className="about__section-inner">
            <div className="about__label">Brand & Origin</div>
            <h2 id="about-brand-title" className="about__title">Built and Owned by Neovise</h2>
            <p className="about__text">
              ChatParser is built, maintained, and owned by <a href="https://neovise.me" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Neovise</a>.
              We focus on building privacy-first web utilities and tools that operate entirely client-side, giving users complete control over their personal data.
              Source code is available on <a href="https://github.com/gavirubihan/ChatParser" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>GitHub</a>.
            </p>
            <p className="about__text">
              ChatParser is free to use and supported by advertising. Ads are served separately and never
              have access to your chat content.
            </p>
            <p className="about__text">
              Questions or feedback? <a href="mailto:contact@chatparser.online" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Email us</a> or see our{' '}
              <Link to="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="about__cta">
          <div className="about__hero-content">
            <h2 className="about__cta-title">Ready to take a look?</h2>
            <p className="about__cta-text">
              Relive your favorite moments in a beautiful interface with your chats staying on your device.
            </p>
            <Link
              to="/chat"
              className="landing__cta-btn"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              Start Viewing Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

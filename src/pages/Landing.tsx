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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'All Message Types',
    desc: 'Text, images, videos, audio, stickers, GIFs, documents, contacts, and locations — all rendered beautifully.',
    color: '#00a884',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Smart Search',
    desc: 'Search messages by keyword and filter by date range. Navigate results instantly with Prev / Next.',
    color: '#3b82f6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <rect x="7" y="7" width="3" height="9" /><rect x="14" y="7" width="3" height="5" />
      </svg>
    ),
    title: 'Group Chat Support',
    desc: 'Supports both private and group chats. Coloured sender names and avatars for every participant.',
    color: '#8b5cf6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: '100% Private',
    desc: 'All processing happens in your browser. Nothing is uploaded to any server. Your chats stay on your device.',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: 'Persistent Storage',
    desc: 'Uploaded chats are saved locally in your browser. Access them any time without re-uploading.',
    color: '#ec4899',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
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
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Export from WhatsApp',
    desc: 'Open any chat → Menu → More → Export Chat. Choose "Include media" for a ZIP file or "Without media" for a text file.',
  },
  {
    step: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    title: 'Upload here',
    desc: 'Drag & drop your .txt or .zip file onto the upload area, or click to browse. Supports Android & iOS exports.',
  },
  {
    step: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Browse & Search',
    desc: 'Your chat is instantly rendered with all messages, media, and timestamps. Use search to find any moment.',
  },
];

const FAQS = [
  {
    q: "Is my WhatsApp chat data safe?",
    a: "Yes, your data is 100% private and secure. All parsing and viewing happens locally inside your browser. Absolutely zero data is uploaded to any cloud or external servers."
  },
  {
    q: "Can I view both Android and iOS exports?",
    a: "Yes, the viewer is fully compatible with chat exports from both Android and iOS WhatsApp applications. We support both plain .txt files and media .zip archives."
  },
  {
    q: "Are images, videos, and voice notes supported?",
    a: "Absolutely! If you choose 'Attach Media' when exporting your WhatsApp chat (generating a ZIP file), the viewer will seamlessly render your photos, videos, audio, and documents directly in the chat timeline."
  },
  {
    q: "Is this tool free and open source?",
    a: "Yes, ChatParser is completely free and 100% open source. You can inspect the codebase for complete peace of mind, or run it on your own hardware."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

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
          <a href="/" className="landing__nav-logo" aria-label="ChatParser home">
            <div className="landing__nav-logo-icon">
              <img src="/chatparser.svg" alt="ChatParser Logo" width="32" height="32" style={{ borderRadius: '8px' }} />
            </div>
            <span className="landing__nav-logo-text">Chat<span className="logo-gradient">Parser</span></span>
          </a>

          <div className="landing__nav-links">
            <a href="/" className="landing__nav-link active">Home</a>
            <a href="/chat" className="landing__nav-link">Chats</a>
            <button className="landing__nav-link" onClick={() => {
              document.getElementById('features-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>About</button>
          </div>

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
              Secure · Open Source · Local Storage Only
            </div>

            <h1 id="hero-title" className="landing__hero-title animate-fade-in-up delay-100">
              View Exported WhatsApp
              <span className="landing__hero-gradient"> Chats</span>
              <br />In A Better Way
            </h1>

            <p className="landing__hero-subtitle animate-fade-in-up delay-200">
              Upload your exported WhatsApp chats from Android or iOS and view them in a beautiful, feature-rich interface.
              Search messages, view media, and navigate easily — all privately on your device.
            </p>

            <div className="landing__hero-actions animate-fade-in-up delay-300">
              <button className="landing__cta-btn" onClick={scrollToUpload} id="hero-upload-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Chat Now
              </button>
              <button className="landing__secondary-btn" onClick={scrollToUpload}>
                See How It Works ↓
              </button>
            </div>

            {/* Security Promise */}
            <div className="landing__trust-badges animate-fade-in-up delay-400">
              <div className="landing__trust-badge">
                <div className="landing__trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <span><strong>Secure:</strong> Only Store Data On Your Device</span>
              </div>
              <div className="landing__trust-badge">
                <div className="landing__trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                </div>
                <span><strong>Transparent:</strong> 100% Open Source</span>
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
          <div className="landing__section-inner">
            <div className="landing__section-label">How It Works</div>
            <h2 id="how-title" className="landing__section-title">Three Simple Steps</h2>
            <div className="landing__steps-grid">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className={`landing__step-card animate-fade-in-up delay-${Math.min(i * 100, 500)}`}>
                  <div className="landing__step-icon-wrap">
                    <div className="landing__step-icon">{step.icon}</div>
                    <div className="landing__step-number">{step.step}</div>
                  </div>
                  <h3 className="landing__step-title">{step.title}</h3>
                  <p className="landing__step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ SECTION ===== */}
        <section className="landing__faq" aria-labelledby="faq-title">
          <div className="landing__section-inner landing__section-inner--narrow">
            <div className="landing__section-label">FAQ</div>
            <h2 id="faq-title" className="landing__section-title">Frequently Asked Questions</h2>
            <div className="landing__faq-list">
              {FAQS.map((faq, i) => (
                <details key={i} className={`landing__faq-item animate-fade-in-up delay-${Math.min((i + 1) * 100, 500)}`}>
                  <summary className="landing__faq-q">
                    {faq.q}
                    <span className="landing__faq-icon">+</span>
                  </summary>
                  <p className="landing__faq-a">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="landing__cta-section" aria-labelledby="cta-title">
          <div className="landing__cta-inner">
            <h2 id="cta-title" className="landing__cta-title">Ready to view your exported chats?</h2>
            <p className="landing__cta-sub">Upload your Android or iOS WhatsApp export and start browsing in seconds.</p>
            <button className="landing__cta-btn landing__cta-btn--large" onClick={scrollToUpload} id="cta-upload-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
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
            <img src="/chatparser.svg" alt="ChatParser Logo" width="20" height="20" style={{ borderRadius: '5px' }} />
            <span>Chat<span className="logo-gradient">Parser</span></span>
          </div>
          <p className="landing__footer-copy">
            © {new Date().getFullYear()} ChatParser · Built for privacy · All data stays on your device
          </p>
        </div>
      </footer>

      {/* Structured SEO Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
};

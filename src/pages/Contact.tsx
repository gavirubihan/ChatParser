import React from 'react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { FeedbackForm } from '../components/FeedbackForm';
import { useSEO } from '../hooks/useSEO';
import './Contact.css';

export const Contact: React.FC = () => {
  useSEO({
    title: 'Contact & Support | ChatParser',
    description: 'Get in touch with the ChatParser team. Send us feedback, report bugs, or reach out to us directly via email at contact@chatparser.online.',
    canonical: '/contact'
  });

  return (
    <div className="contact-page">
      <NavBar />

      <main className="contact-page__main">
        {/* ===== HERO ===== */}
        <section className="contact-page__hero">
          <div className="landing__blob landing__blob--2" />
          <div className="contact-page__hero-content">
            <div className="about__label animate-fade-in">Support & Feedback</div>
            <h1 className="about__hero-title animate-fade-in-up">
              Get in <span className="landing__whatsapp-gradient">Touch.</span>
            </h1>
            <p className="about__hero-subtitle animate-fade-in-up delay-100">
              Whether you have a feature request, found a bug, or just want to say hello—we'd love to hear from you. 
              Drop us a message below or reach out via email.
            </p>
          </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section className="contact-page__section">
          <div className="contact-page__section-inner">
            <div className="contact-page__grid">
              
              {/* Left Column: Direct Info */}
              <div className="contact-page__info animate-scale-in">
                <div className="contact-page__info-card">
                  <div className="contact-page__icon-wrapper">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <h3>Email Us Directly</h3>
                  <p>
                    For general inquiries, partnerships, or to send us sample chat exports for debugging, you can email us at:
                  </p>
                  <a href="mailto:contact@chatparser.online" className="contact-page__email-link">
                    contact@chatparser.online
                  </a>
                </div>

                <div className="contact-page__info-card contact-page__info-card--alt">
                  <div className="contact-page__icon-wrapper">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <h3>Privacy First</h3>
                  <p>
                    Remember, ChatParser runs entirely in your browser. We do <strong>not</strong> have access to your parsed chat history unless you explicitly attach and email a sample file to us.
                  </p>
                </div>
              </div>

              {/* Right Column: Feedback Form */}
              <div className="contact-page__form-container animate-fade-in-up delay-200">
                <div className="contact-page__form-glass">
                  <h2>Send a Message</h2>
                  <FeedbackForm />
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

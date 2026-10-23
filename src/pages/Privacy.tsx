import React from 'react';

import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import './Privacy.css';


export const Privacy: React.FC = () => {
  useSEO({
    title: 'Privacy Policy | ChatParser',
    description: 'ChatParser Privacy Policy. Your WhatsApp chat exports are processed locally in your browser and never uploaded. Learn how analytics, cookies, and ads work.',
    canonical: '/privacy',
    breadcrumbs: [
      { name: 'Home', item: 'https://chatparser.online/' },
      { name: 'Privacy Policy', item: 'https://chatparser.online/privacy' },
    ],
  });

  return (
    <div className="privacy-page">
      {/* NAV (reused from Landing for consistency) */}
      <NavBar />

      <main className="privacy-page__content">
        <header className="privacy-page__header">
          <span className="privacy-page__last-updated">Last Updated: October 23, 2026</span>
          <h1 className="privacy-page__title">Privacy Policy</h1>
          <p className="privacy-page__text">
            At ChatParser (owned by <a href="https://neovise.me" target="_blank" rel="noopener noreferrer">neovise.me</a>), your privacy is our core value. This policy explains how we handle your data, our client-side architecture, and the advertising and analytics services we use to keep this tool free.
          </p>
        </header>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">1. Your Chat Data (Processed Locally)</h2>
          <div className="privacy-page__card">
            <p className="privacy-page__text">
              <strong className="privacy-page__highlight">ChatParser does not upload your WhatsApp chat exports to any server.</strong>
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">All parsing, processing, and rendering of your chat messages happens <strong>locally</strong> in your browser.</li>
              <li className="privacy-page__list-item">Your messages, photos, videos, voice notes, and documents never leave your device or touch our servers.</li>
              <li className="privacy-page__list-item">We use browser-based storage (IndexedDB) to save your sessions locally on your machine, so you can access them later without re-uploading. You can delete them at any time.</li>
            </ul>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">2. Analytics & Usage Tracking</h2>
          <p className="privacy-page__text">
            To understand how users interact with ChatParser and to improve our service, we use the following third-party analytics tools:
          </p>

          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Google Analytics</h3>
            <p className="privacy-page__text">
              We use Google Analytics to collect aggregate information about how often users visit our site, what pages they visit, and basic browser/device types. This helps us optimize site performance and user experience. No chat content or personal communication data is ever shared with Google.
            </p>
          </div>

          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Microsoft Clarity</h3>
            <p className="privacy-page__text">
              We use Microsoft Clarity to understand how visitors interact with our website through
              behavioral metrics, heatmaps, and session recordings. Session recordings mask on-screen
              chat content, so your messages are not captured. Clarity may still collect technical data
              such as your device type, browser, and interaction patterns. Learn more in{' '}
              <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">
                Microsoft's Privacy Statement
              </a>.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">3. Advertising</h2>
          <div className="privacy-page__card">
            <p className="privacy-page__text">
              ChatParser is free and supported by advertising. We show ads from third-party networks,
              including Google AdSense and A-ADS.
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">
                Third-party vendors, including Google, use cookies to serve ads based on your prior visits
                to this and other websites.
              </li>
              <li className="privacy-page__list-item">
                Google's advertising cookies let Google and its partners show you ads based on your visits
                to our site and other sites on the internet.
              </li>
              <li className="privacy-page__list-item">
                You can opt out of personalized advertising at{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>, or opt out of
                some third-party vendors' personalized ads at{' '}
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
              </li>
              <li className="privacy-page__list-item">
                Learn how Google uses data from sites that use its services:{' '}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.
              </li>
            </ul>
            <p className="privacy-page__text">
              <strong className="privacy-page__highlight">Your chat content is separate from ads.</strong>{' '}
              Chats are processed locally in your browser and are never sent to our servers or to
              advertisers. Ad providers may still see standard technical data such as your IP address,
              browser type, and cookie identifiers when an ad loads.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">4. Cookies & Consent</h2>
          <p className="privacy-page__text">We and our partners use cookies and similar technologies to:</p>
          <ul className="privacy-page__list">
            <li className="privacy-page__list-item">Remember your theme preference (dark or light mode).</li>
            <li className="privacy-page__list-item">Measure traffic and usage (Google Analytics, Microsoft Clarity).</li>
            <li className="privacy-page__list-item">Serve and measure advertising (Google AdSense, A-ADS).</li>
          </ul>
          <p className="privacy-page__text">
            If you are in the EEA, the UK, or Switzerland, we request your consent before using
            non-essential cookies where required by law. You can also block or delete cookies in your
            browser settings, though some features may be affected.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">5. Your Rights</h2>
          <p className="privacy-page__text">
            Depending on where you live (for example under the GDPR or the CCPA/CPRA), you may have the
            right to access, correct, delete, or restrict the use of your personal data, and to opt out of
            the sale or sharing of personal information for advertising. Because we do not store your chats
            or account data on our servers, most of your data lives only in your browser: clear it anytime
            by deleting sessions in the app or clearing site data. For other requests, email us at the
            address below.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">6. Children's Privacy</h2>
          <p className="privacy-page__text">
            ChatParser is not directed at children under 13, and we do not knowingly collect personal
            information from them.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">7. Changes to This Policy</h2>
          <p className="privacy-page__text">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">8. Contact Us</h2>
          <p className="privacy-page__text">
            Questions about this policy? You can reach us directly via email:
          </p>
          <p className="privacy-page__text">
            <a href="mailto:contact@chatparser.online" className="privacy-page__email-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              contact@chatparser.online
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

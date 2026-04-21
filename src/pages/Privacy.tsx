import React from 'react';

import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import './Privacy.css';


export const Privacy: React.FC = () => {
  useSEO({
    title: 'Privacy Policy | ChatParser',
    description: 'Read our Privacy Policy. ChatParser is a private WhatsApp chat viewer that processes all your data locally in your browser without any cloud uploads.',
    canonical: '/privacy'
  });

  return (
    <div className="privacy-page">
      {/* NAV (reused from Landing for consistency) */}
      <NavBar />

      <main className="privacy-page__content">
        <header className="privacy-page__header">
          <span className="privacy-page__last-updated">Last Updated: April 10, 2026</span>
          <h1 className="privacy-page__title">Privacy Policy</h1>
          <p className="privacy-page__text">
            At ChatParser (owned by <a href="https://neovise.me" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'underline' }}>neovise.me</a>), your privacy is our core value. This policy explains how we handle your data and what services we use to improve your experience.
          </p>
        </header>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">1. Your Chat Data (Privacy First)</h2>
          <div className="privacy-page__card">
            <p className="privacy-page__text">
              <strong className="privacy-page__highlight">ChatParser does not upload your WhatsApp chat exports to any server.</strong>
            </p>
            <ul className="privacy-page__list">
              <li className="privacy-page__list-item">All parsing, processing, and rendering of your chat messages happens <strong>locally</strong> in your browser.</li>
              <li className="privacy-page__list-item">Your messages, photos, videos, and documents never leave your device.</li>
              <li className="privacy-page__list-item">We use browser-based storage (IndexedDB) to save your sessions locally, so you can access them later without re-uploading.</li>
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
              We use Google Analytics to collect information about how often users visit our site, what pages they visit, and what other sites they used prior to coming to our site. This helps us optimize performance and user experience.
            </p>
          </div>

          <div className="privacy-page__card">
            <h3 className="privacy-page__section-title" style={{ fontSize: 'var(--font-size-xl)' }}>Microsoft Clarity</h3>
            <p className="privacy-page__text">
              We partner with Microsoft Clarity and Microsoft Advertising to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay to improve and market our products/services.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">3. Advertising Services</h2>
          <div className="privacy-page__card">
            <p className="privacy-page__text">
              Currently, we do not use any advertising networks on ChatParser. This feature will be added in the future.
              <br /><br />
              <strong className="privacy-page__highlight">100% Privacy Saved:</strong> We guarantee your privacy is 100% secure. Any future advertising integration will never be able to access your chat data, as all chat processing occurs strictly within your local device.
            </p>
          </div>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">4. Cookies</h2>
          <p className="privacy-page__text">
            Cookies are small pieces of data stored on your device. We use cookies to:
          </p>
          <ul className="privacy-page__list">
            <li className="privacy-page__list-item">Persist your theme preference (Dark or Light mode).</li>
            <li className="privacy-page__list-item">Enable analytics and advertising functionality as described above.</li>
          </ul>
          <p className="privacy-page__text">
            You can choose to disable cookies through your browser settings, though this may affect some features of the site.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">5. Changes to This Policy</h2>
          <p className="privacy-page__text">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
          </p>
        </section>

        <section className="privacy-page__section">
          <h2 className="privacy-page__section-title">6. Contact Us</h2>
          <p className="privacy-page__text">
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us through our GitHub repository or official channels.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

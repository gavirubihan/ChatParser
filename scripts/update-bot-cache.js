/**
 * update-bot-cache.js
 * 
 * Generates static HTML snapshots for SEO bots from your local source files.
 * 
 * APPROACH: Since this is a client-side React SPA (no SSR), we build the bot
 * cache HTML manually from local source files. This gives bots real, rich HTML
 * content instead of the empty <div id="root"></div> shell.
 * 
 * Run with: npm run update-seo
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('src/bot-cache');
const INDEX_HTML_PATH = path.resolve('index.html');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Read the base <head> from index.html
// ─────────────────────────────────────────────────────────────────────────────
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
const headMatch = indexHtml.match(/<head>([\s\S]*?)<\/head>/i);
if (!headMatch) {
  console.error('❌ Could not find <head> in index.html');
  process.exit(1);
}
// Remove the vite module script (only relevant in browser, not for bots)
const baseHead = headMatch[1].replace(/<script type="module"[^>]*><\/script>/gi, '');

// Shared navbar HTML (simplified static version for bots)
const NAVBAR_HTML = `
<nav class="navbar" aria-label="Main navigation">
  <div class="navbar__inner">
    <a class="navbar__logo" aria-label="ChatParser home" href="/">
      <div class="navbar__logo-icon"><img alt="ChatParser Logo" width="32" height="32" src="/chatparser.svg" style="border-radius: 8px;"></div>
      <span class="navbar__logo-text">Chat<span class="logo-gradient">Parser</span></span>
    </a>
    <div class="navbar__menu">
      <div class="navbar__links">
        <a class="navbar__link" href="/">Home</a>
        <a class="navbar__link" href="/chat">Chats</a>
        <a class="navbar__link" href="/privacy">Privacy</a>
        <a class="navbar__link" href="/about">About</a>
        <a class="navbar__link" href="/contact">Contact</a>
      </div>
    </div>
  </div>
</nav>`;

// Shared footer HTML
const FOOTER_HTML = `
<footer class="landing__footer">
  <div class="landing__footer-inner">
    <div class="landing__footer-brand">
      <a class="landing__footer-logo" href="/"><img alt="ChatParser Logo" width="24" height="24" src="/chatparser.svg" style="border-radius: 6px;"><span>Chat<span class="logo-gradient">Parser</span></span></a>
      <p class="landing__footer-tagline">A private and seamless way to view WhatsApp chat exports.</p>
    </div>
    <div class="landing__footer-col">
      <h4 class="landing__footer-col-title">Quick Links</h4>
      <div class="landing__footer-links">
        <a class="landing__footer-link" href="/">Home</a>
        <a class="landing__footer-link" href="/about">About</a>
        <a class="landing__footer-link" href="/privacy">Privacy Policy</a>
        <a class="landing__footer-link" href="/contact">Contact Us</a>
      </div>
    </div>
    <div class="landing__footer-col">
      <h4 class="landing__footer-col-title">Connect</h4>
      <div class="landing__footer-links">
        <a href="mailto:contact@chatparser.online" class="landing__footer-link">contact@chatparser.online</a>
        <a href="https://web.facebook.com/chatparser" target="_blank" rel="noopener noreferrer" class="landing__footer-link">Facebook</a>
        <a href="https://www.linkedin.com/company/chatparser" target="_blank" rel="noopener noreferrer" class="landing__footer-link">LinkedIn</a>
        <a href="https://github.com/gavirubihan/ChatParser" target="_blank" rel="noopener noreferrer" class="landing__footer-link">GitHub</a>
      </div>
    </div>
  </div>
  <div class="landing__footer-bottom">
    <p class="landing__footer-copy">© 2026 ChatParser · A product by <a href="https://neovise.me" target="_blank" rel="noopener" style="color: inherit; text-decoration: underline;">Neovise</a> · Built for privacy</p>
  </div>
</footer>`;

// ─────────────────────────────────────────────────────────────────────────────
// Define page-specific heads & bodies
// ─────────────────────────────────────────────────────────────────────────────
const PAGES = [
  {
    pathname: '/',
    name: 'home',
    title: 'WhatsApp Chat Viewer Online (Free & Private) | ChatParser',
    description: 'Free WhatsApp chat viewer to open exported chats instantly. Upload .txt or .zip files and explore your chat history privately in your browser.',
    canonical: 'https://chatparser.online/',
    body: `
<div class="landing">
  ${NAVBAR_HTML}
  <main>
    <section class="landing__hero" aria-labelledby="hero-title">
      <div class="landing__hero-inner">
        <div class="landing__hero-content">
          <div class="landing__badge"><span class="landing__badge-dot"></span>Secure | Open Source | Local Storage Only</div>
          <h1 id="hero-title" class="landing__hero-title">Secure <span class="landing__whatsapp-gradient">WhatsApp Chat Export Viewer</span><br>Fast, Free &amp; Private</h1>
          <p class="landing__hero-subtitle">Wondering <strong>how to read WhatsApp exported chat</strong> files? ChatParser is a <strong>private WhatsApp chat viewer online</strong> that turns messy .txt and .zip backups into a beautiful, familiar interface. Securely <strong>open WhatsApp exported chat files</strong> directly in your local browser—with full media support and absolutely zero cloud uploads.</p>
          <div class="landing__hero-actions">
            <a href="/#upload" class="landing__cta-btn">Upload Chat Now</a>
          </div>
        </div>
      </div>
    </section>

    <section class="landing__features" aria-labelledby="features-title">
      <div class="landing__section-inner">
        <div class="landing__section-label">Features</div>
        <h2 id="features-title" class="landing__section-title">Everything You Need</h2>
        <p class="landing__section-subtitle">A complete WhatsApp chat viewer with all the features that matter.</p>
        <div class="landing__feature-grid" role="list">
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">All Message Types</h3><p class="landing__feature-desc">Text, images, videos, audio, stickers, GIFs, documents, contacts, and locations — all rendered beautifully.</p></article>
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">Smart Search</h3><p class="landing__feature-desc">Search by keyword, filter by date, or instantly isolate media types like Images, Voice, and Documents.</p></article>
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">Group Chat Support</h3><p class="landing__feature-desc">Supports both private and group chats. Coloured sender names and avatars for every participant.</p></article>
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">100% Private</h3><p class="landing__feature-desc">All processing happens in your browser. Nothing is uploaded to any server. Your chats stay on your device.</p></article>
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">Persistent Storage</h3><p class="landing__feature-desc">Uploaded chats are saved locally in your browser. Access them any time without re-uploading.</p></article>
          <article class="landing__feature-card" role="listitem"><h3 class="landing__feature-title">Dark &amp; Light Mode</h3><p class="landing__feature-desc">Fully themed dark and light modes that respect your system preference. Switch instantly.</p></article>
        </div>
      </div>
    </section>

    <section class="landing__how" aria-labelledby="how-title">
      <div class="landing__section-inner">
        <div class="landing__section-label">How It Works</div>
        <h2 id="how-title" class="landing__section-title">Three Simple Steps</h2>
        <div class="landing__steps-grid">
          <div class="landing__step-card"><div class="landing__step-number">01</div><h3 class="landing__step-title">Export from WhatsApp</h3><p class="landing__step-desc">Open any chat → Menu → More → Export Chat. Choose "Include media" for a ZIP file or "Without media" for a text file.</p></div>
          <div class="landing__step-card"><div class="landing__step-number">02</div><h3 class="landing__step-title">Upload here</h3><p class="landing__step-desc">Drag &amp; drop your .txt or .zip file onto the upload area, or click to browse. Supports Android &amp; iOS exports.</p></div>
          <div class="landing__step-card"><div class="landing__step-number">03</div><h3 class="landing__step-title">Browse &amp; Search</h3><p class="landing__step-desc">Your chat is instantly rendered with all messages, media, and timestamps. Use search to find any moment.</p></div>
        </div>
      </div>
    </section>

    <section class="landing__faq" aria-labelledby="faq-title">
      <div class="landing__section-inner landing__section-inner--narrow">
        <div class="landing__section-label">FAQ</div>
        <h2 id="faq-title" class="landing__section-title">Frequently Asked Questions</h2>
        <div class="landing__faq-list">
          <details class="landing__faq-item"><summary class="landing__faq-q">Is my WhatsApp chat data safe?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Yes, your data is 100% private and secure. All parsing and viewing happens locally inside your browser. Absolutely zero data is uploaded to any cloud or external servers.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Can I view both Android and iOS exports?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Yes, the viewer is fully compatible with chat exports from both Android and iOS WhatsApp applications. We support both plain .txt files and media .zip archives.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Are images, videos, and voice notes supported?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Absolutely! If you choose 'Attach Media' when exporting your WhatsApp chat (generating a ZIP file), the viewer will seamlessly render your photos, videos, audio, and documents directly in the chat timeline.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Is this tool free and open source?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Yes, ChatParser is completely free and 100% open source. You can inspect the codebase for complete peace of mind, or run it on your own hardware.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">How do I export a WhatsApp chat history?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Open WhatsApp, go to the chat you want to export, tap the 'More' menu (three dots or name), choose 'Export Chat', and select 'Include Media' to generate a ZIP file that you can upload here.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Does ChatParser work offline?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">Yes! Once the app is loaded, you can disconnect from the internet. All chat parsing and media rendering happen locally on your computer. Your privacy is guaranteed.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Is there a limit on the message count?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">No, ChatParser is built with high-performance virtualization. Whether your chat has 100 messages or 100,000, it will load smoothly and quickly without slowing down your browser.</p></details>
          <details class="landing__faq-item"><summary class="landing__faq-q">Why was ChatParser created?<span class="landing__faq-icon">+</span></summary><p class="landing__faq-a">WhatsApp allows you to export your chat history into raw text or ZIP files, but it doesn't provide a built-in way to actually read or search those exports. We created ChatParser to provide a beautiful, intuitive, and private way to relive your memories without needing a server.</p></details>
        </div>
      </div>
    </section>
  </main>
  ${FOOTER_HTML}
</div>`
  },
  {
    pathname: '/about',
    name: 'about',
    title: 'About Us | ChatParser',
    description: 'Learn more about ChatParser, the mission behind our private WhatsApp viewer, and how we handle massive chat exports with high performance.',
    canonical: 'https://chatparser.online/about',
    body: `
<div class="about">
  ${NAVBAR_HTML}
  <main class="about__main">
    <section class="about__hero">
      <div class="about__hero-content">
        <div class="about__label">Our Mission</div>
        <h1 class="about__hero-title">Relive your memories, <br><span class="landing__whatsapp-gradient">privately.</span></h1>
        <p class="about__hero-subtitle">WhatsApp provides a convenient way to export and share your chat history, but lacks a built-in tool to actually view and navigate those exports. <strong>ChatParser was built to bridge that gap</strong>—bringing your raw conversations back to life in a beautiful, readable, and 100% private format.</p>
      </div>
    </section>
    <section class="about__section">
      <div class="about__section-inner">
        <div class="about__grid">
          <div class="about__content">
            <div class="about__label">The Privacy Pillar</div>
            <h2 class="about__title">Your Data, Your Device. Always.</h2>
            <p class="about__text">Unlike other tools, ChatParser uses a <strong>Zero-Server Architecture</strong>. This means that when you "upload" a chat, nothing actually leaves your computer.</p>
            <p class="about__text">Our parsing engine runs entirely within your browser's memory. We don't have a backend database for your chats because your privacy isn't just a policy—it's built into the code.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="about__section">
      <div class="about__section-inner">
        <div class="about__grid">
          <div class="about__content">
            <div class="about__label">Engineering</div>
            <h2 class="about__title">High Performance for High Memory.</h2>
            <p class="about__text">Digital lifetimes are long. Some of the chats we support contain over 500,000 messages and thousands of media files.</p>
            <p class="about__text">We use advanced <strong>Virtual List rendering</strong> and <strong>Concurrent Processing</strong> to ensure that scrolling through a 10-year-old conversation feels as smooth as a fresh one.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="about__cta">
      <div class="about__hero-content">
        <h2 class="about__cta-title">Ready to take a look?</h2>
        <p class="about__cta-text">Relive your favorite moments in a beautiful interface without ever compromising your security.</p>
        <a href="/" class="landing__cta-btn">Start Viewing Now</a>
      </div>
    </section>
  </main>
  ${FOOTER_HTML}
</div>`
  },
  {
    pathname: '/privacy',
    name: 'privacy',
    title: 'Privacy Policy | ChatParser',
    description: 'Read our Privacy Policy. ChatParser is a private WhatsApp chat viewer that processes all your data locally in your browser without any cloud uploads.',
    canonical: 'https://chatparser.online/privacy',
    body: `
<div class="privacy-page">
  ${NAVBAR_HTML}
  <main class="privacy-page__content">
    <header class="privacy-page__header">
      <span class="privacy-page__last-updated">Last Updated: April 10, 2026</span>
      <h1 class="privacy-page__title">Privacy Policy</h1>
      <p class="privacy-page__text">At ChatParser (owned by <a href="https://neovise.me" target="_blank" rel="noopener">neovise.me</a>), your privacy is our core value. This policy explains how we handle your data and what services we use to improve your experience.</p>
    </header>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">1. Your Chat Data (Privacy First)</h2>
      <div class="privacy-page__card">
        <p class="privacy-page__text"><strong>ChatParser does not upload your WhatsApp chat exports to any server.</strong></p>
        <ul class="privacy-page__list">
          <li class="privacy-page__list-item">All parsing, processing, and rendering of your chat messages happens <strong>locally</strong> in your browser.</li>
          <li class="privacy-page__list-item">Your messages, photos, videos, and documents never leave your device.</li>
          <li class="privacy-page__list-item">We use browser-based storage (IndexedDB) to save your sessions locally, so you can access them later without re-uploading.</li>
        </ul>
      </div>
    </section>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">2. Analytics &amp; Usage Tracking</h2>
      <p class="privacy-page__text">To understand how users interact with ChatParser and to improve our service, we use the following third-party analytics tools:</p>
      <div class="privacy-page__card"><h3>Google Analytics</h3><p class="privacy-page__text">We use Google Analytics to collect information about how often users visit our site, what pages they visit, and what other sites they used prior to coming to our site.</p></div>
      <div class="privacy-page__card"><h3>Microsoft Clarity</h3><p class="privacy-page__text">We partner with Microsoft Clarity to capture how you use and interact with our website through behavioral metrics, heatmaps, and session replay.</p></div>
    </section>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">3. Advertising Services</h2>
      <div class="privacy-page__card"><p class="privacy-page__text">Currently, we do not use any advertising networks on ChatParser. <strong>100% Privacy Saved:</strong> We guarantee your privacy is 100% secure.</p></div>
    </section>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">4. Cookies</h2>
      <p class="privacy-page__text">Cookies are small pieces of data stored on your device. We use cookies to persist your theme preference and enable analytics functionality.</p>
    </section>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">5. Changes to This Policy</h2>
      <p class="privacy-page__text">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
    </section>
    <section class="privacy-page__section">
      <h2 class="privacy-page__section-title">6. Contact Us</h2>
      <p class="privacy-page__text">If you have any questions or suggestions about our Privacy Policy, please <a href="/contact">contact us</a>.</p>
    </section>
  </main>
  ${FOOTER_HTML}
</div>`
  },
  {
    pathname: '/contact',
    name: 'contact',
    title: 'Contact & Support | ChatParser',
    description: 'Get in touch with the ChatParser team. Send us feedback, report bugs, or reach out to us directly via email at contact@chatparser.online.',
    canonical: 'https://chatparser.online/contact',
    body: `
<div class="contact-page">
  ${NAVBAR_HTML}
  <main class="contact-page__main">
    <section class="contact-page__hero">
      <div class="contact-page__hero-content">
        <div class="about__label">Support &amp; Feedback</div>
        <h1 class="about__hero-title">Get in <span class="landing__whatsapp-gradient">Touch.</span></h1>
        <p class="about__hero-subtitle">Whether you have a feature request, found a bug, or just want to say hello—we'd love to hear from you. Drop us a message below or reach out via email.</p>
      </div>
    </section>
    <section class="contact-page__section">
      <div class="contact-page__section-inner">
        <div class="contact-page__grid">
          <div class="contact-page__info">
            <div class="contact-page__info-card">
              <h3>Email Us Directly</h3>
              <p>For general inquiries, partnerships, or to send us sample chat exports for debugging, you can email us at:</p>
              <a href="mailto:contact@chatparser.online" class="contact-page__email-link">contact@chatparser.online</a>
            </div>
            <div class="contact-page__info-card contact-page__info-card--alt">
              <h3>Privacy First</h3>
              <p>Remember, ChatParser runs entirely in your browser. We do <strong>not</strong> have access to your parsed chat history unless you explicitly attach and email a sample file to us.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  ${FOOTER_HTML}
</div>`
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Generate the cache files
// ─────────────────────────────────────────────────────────────────────────────
console.log('🚀 Building SEO Bot Cache from source files...\n');

for (const page of PAGES) {
  // Build a page-specific head by overriding the title, description and canonical
  const pageHead = baseHead
    .replace(/<title>[^<]*<\/title>/i, `<title>${page.title}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/i, `$1${page.description}$2`)
    .replace(/(<meta name="description"\s*\n?\s+content=")[^"]*(")/i, `$1${page.description}$2`)
    .replace(/(<link rel="canonical"\s+href=")[^"]*(")/i, `$1${page.canonical}$2`);

  const fullHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
${pageHead}
</head>
<body>
${page.body}
</body>
</html>`;

  const filePath = path.join(CACHE_DIR, `${page.name}.ts`);
  const content = `/**
 * Pre-rendered HTML for ${page.pathname}
 * Generated by scripts/update-bot-cache.js (static source build)
 */
export const html = ${JSON.stringify(fullHtml)};
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Built ${page.name}.ts (${(fullHtml.length / 1024).toFixed(1)} KB)`);
}

// Generate the index.ts barrel file
const indexContent = `/**
 * SEO Bot Cache Index
 * Generated by scripts/update-bot-cache.js
 */
${PAGES.map(p => `import { html as ${p.name}Html } from './${p.name}.js';`).join('\n')}

export const BOT_CACHE: Record<string, string> = {
${PAGES.map(p => `  "${p.pathname}": ${p.name}Html,`).join('\n')}
};
`;

fs.writeFileSync(path.join(CACHE_DIR, 'index.ts'), indexContent);
console.log('\n✨ DONE! Static bot cache built from source files.');
console.log('📝 Bots will now see real page content instead of <div id="root"></div>');

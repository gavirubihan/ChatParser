/**
 * scripts/prerender.mjs
 *
 * Build-time static prerenderer for ChatParser.
 * Runs after `vite build`:  "build": "tsc -b && vite build && node scripts/prerender.mjs"
 *
 * Flow:
 *  1. Guard: dist/index.html must be a FRESH build (empty #root).
 *  2. Save the untouched SPA shell as dist/app-shell.html (for /chat and other client routes).
 *  3. Start `vite preview` (production build, no HMR) and launch a headless browser.
 *  4. Render each public route, block analytics/ads, capture #root + page-specific <head> tags.
 *  5. Keep ALL results in memory, stop browser + server, THEN write files to dist/.
 *  6. Any failure exits with code 1 so the empty shell never ships.
 */

import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import { preview } from 'vite';

// ─── Config ─────────────────────────────────────────────────────────────────

const DIST = path.resolve('dist');
const HOST = '127.0.0.1'; // why: 'localhost' can resolve to IPv6 (::1) on Windows / newer Node
const PREVIEW_PORT = 4173;
const MIN_ROOT_LENGTH = 2000; // characters; anything shorter means a failed render

/** Routes to prerender. /chat is intentionally excluded (served by app-shell.html). */
const ROUTES = ['/', '/about', '/privacy', '/contact'];

/** Blocked during the scrape so deploys don't create fake analytics/ad events. */
const BLOCKED_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'clarity.ms',
  'googlesyndication.com',
  'doubleclick.net',
  'a-ads.com',
  'adservice.google.com',
];

const EMPTY_ROOT_RE = /<div id="root">\s*<\/div>/;

// ─── Browser resolution ─────────────────────────────────────────────────────

async function resolveBrowser() {
  if (process.env.CHROME_PATH) {
    console.log(`🔍 Using CHROME_PATH: ${process.env.CHROME_PATH}`);
    return { executablePath: process.env.CHROME_PATH, args: ['--no-sandbox'] };
  }

  if (process.env.VERCEL) {
    // Vercel build container has no Chrome; use the serverless-optimised build.
    console.log('☁️  Vercel detected: using @sparticuz/chromium');
    const chromium = (await import('@sparticuz/chromium')).default;
    return { executablePath: await chromium.executablePath(), args: chromium.args };
  }

  const localPath = chromeLauncher.Launcher.getFirstInstallation();
  if (localPath) {
    console.log(`🔍 Local browser: ${localPath}`);
    return { executablePath: localPath, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  }

  throw new Error('No Chrome/Edge found. Set CHROME_PATH, install Chrome, or build on Vercel.');
}

// ─── HTML helpers ───────────────────────────────────────────────────────────

/** Remove tags that get re-injected per page, so we never output duplicates. */
function sanitizeTemplate(html) {
  return html
    .replace(/<title[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s[^>]*(?:name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>\s*/gi, '')
    .replace(/<meta\s[^>]*name="robots"[^>]*>\s*/gi, '')
    .replace(/<link\s[^>]*rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<script\s[^>]*type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, '');
}

/** App shell keeps generic tags, but drops homepage-specific canonical + structured data. */
function buildAppShell(html) {
  return html
    .replace(/<link\s[^>]*rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<script\s[^>]*type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, '');
}

// ─── Shutdown (shared by success path and error path) ───────────────────────

let server = null;
let browser = null;

async function shutdown() {
  if (browser) {
    try { await browser.close(); } catch { /* ignore */ }
    browser = null;
  }
  if (server) {
    try {
      server.httpServer.closeAllConnections?.(); // why: idle keep-alive sockets can block close() forever
      await new Promise((resolve) => server.httpServer.close(resolve));
    } catch { /* ignore */ }
    server = null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // 1. Read template + guard against a stale/already-prerendered dist/
  const templateHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');

  // why: on a re-run, dist/index.html is already the prerendered homepage → the root swap would
  // silently do nothing and app-shell.html would contain the homepage. Fail loudly instead.
  if (!EMPTY_ROOT_RE.test(templateHtml) || !templateHtml.includes('</head>')) {
    throw new Error(
      'dist/index.html is not a fresh build (#root is not empty). Run `vite build` before prerendering.'
    );
  }

  // 2. Save the clean SPA shell for client-only routes
  await fs.writeFile(path.join(DIST, 'app-shell.html'), buildAppShell(templateHtml));
  console.log('📄 Saved dist/app-shell.html');

  const cleanTemplate = sanitizeTemplate(templateHtml);

  // 3. Start preview server (production build) + browser
  console.log(`\n🚀 Starting vite preview on http://${HOST}:${PREVIEW_PORT}`);
  server = await preview({
    preview: { host: HOST, port: PREVIEW_PORT, strictPort: true, open: false },
  });

  const { executablePath, args } = await resolveBrowser();
  browser = await puppeteer.launch({ executablePath, headless: true, args });
  console.log('🌐 Browser launched\n');

  // 4. Scrape every route into memory
  const results = [];

  for (const route of ROUTES) {
    const url = `http://${HOST}:${PREVIEW_PORT}${route}`;
    console.log(`🕷️  Scraping ${route}`);
    const page = await browser.newPage();

    try {
      // Block analytics + ads
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (BLOCKED_DOMAINS.some((d) => req.url().includes(d))) req.abort();
        else req.continue();
      });

      // Avoid capturing mid-animation state
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

      page.on('pageerror', (err) => console.log(`   [page error ${route}] ${err.message}`));

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // networkidle can fire before React paints (App.tsx has an async startup gate)
      await page.waitForSelector('main h1', { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1000)); // let deferred state updates settle

      const { rootHtml, headTags } = await page.evaluate(() => {
        const root = document.getElementById('root');
        // Only page-specific SEO tags; GA/Clarity/ad scripts must NOT be copied into static HTML
        const selectors = [
          'title',
          'meta[name="description"]',
          'meta[property^="og:"]',
          'meta[name^="twitter:"]',
          'meta[name="robots"]',
          'link[rel="canonical"]',
          'script[type="application/ld+json"]',
        ];
        const tags = [...document.head.querySelectorAll(selectors.join(', '))]
          .map((n) => n.outerHTML)
          .join('\n');
        return { rootHtml: root ? root.innerHTML : '', headTags: tags };
      });

      if (rootHtml.length < MIN_ROOT_LENGTH) {
        throw new Error(
          `Prerender of ${route} looks empty (${rootHtml.length} < ${MIN_ROOT_LENGTH} chars). Aborting build.`
        );
      }

      // why function replacers: a string replacement treats `$&`, `$'`, `$1` specially, which
      // would corrupt any page text / JSON-LD containing a "$".
      const html = cleanTemplate
        .replace('</head>', () => `${headTags}\n</head>`)
        .replace(EMPTY_ROOT_RE, () => `<div id="root">${rootHtml}</div>`);

      results.push({ route, html });
      console.log(`  ✅ captured (${rootHtml.length.toLocaleString()} chars in #root)`);
    } finally {
      await page.close();
    }
  }

  // 5. Stop everything BEFORE writing (preview server caches file sizes → truncated responses)
  console.log('\n🛑 Stopping browser and preview server...');
  await shutdown();

  // 6. Write prerendered pages
  for (const { route, html } of results) {
    const outPath =
      route === '/'
        ? path.join(DIST, 'index.html')
        : path.join(DIST, route.slice(1), 'index.html');

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html, 'utf8');
    console.log(`📝 ${path.relative(DIST, outPath)}`);
  }

  console.log('\n✨ Prerender complete');
}

main().catch(async (err) => {
  console.error('\n❌ Prerender failed:', err.message);
  await shutdown(); // why: a dangling preview server would hang the build
  process.exit(1);
});

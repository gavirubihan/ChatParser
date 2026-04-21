/**
 * update-bot-cache.js
 * 
 * Generates static HTML snapshots for SEO bots by spinning up a local
 * development server and using Headless Microsoft Edge to scrape the
 * fully rendered React DOM (including structured JSON-LD and dynamically
 * evaluated meta tags).
 * 
 * Run with: npm run update-seo
 */

import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import * as chromeLauncher from 'chrome-launcher';
import { spawn } from 'child_process';
import http from 'http';

const CACHE_DIR = path.resolve('src/bot-cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility to wait for local server to boot before scraping
// ─────────────────────────────────────────────────────────────────────────────
async function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 404) resolve();
          else reject(new Error('not ready'));
        });
        req.on('error', reject);
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

const PAGES = [
  { pathname: '/', name: 'home' },
  { pathname: '/about', name: 'about' },
  { pathname: '/privacy', name: 'privacy' },
  { pathname: '/contact', name: 'contact' },
];

async function main() {
  console.log('🚀 Starting background local server for scraping...');
  
  // We use npx vite directly instead of npm so it's easier to kill across OSes
  const serverProcess = spawn('npx.cmd', ['vite', '--port', '5174', '--strictPort'], {
    shell: true,
    stdio: 'ignore', // Ignoring vite outputs to keep console clean
    detached: false 
  });

  const baseUrl = 'http://localhost:5174';
  
  console.log(`⏳ Waiting for ${baseUrl} to become ready...`);
  const ready = await waitForServer(baseUrl);
  
  if (!ready) {
    console.error('❌ Failed to start local Vite server.');
    serverProcess.kill();
    process.exit(1);
  }

  // Find Microsoft Edge dynamically so we don't have to download bulky Chromium
  console.log('🔍 Locating Microsoft Edge on your system...');
  const installations = chromeLauncher.Launcher.getInstallations();
  
  // Prioritize Microsoft Edge explicitly, fallback to conventional Chrome.
  let executablePath = installations.find(i => i.toLowerCase().includes('edge'));
  if (!executablePath) {
    executablePath = installations[0]; // fallback to whatever it finds
  }

  if (!executablePath && process.platform === 'win32') {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (fs.existsSync(edgePath)) {
      executablePath = edgePath;
    }
  }

  if (!executablePath) {
    console.error('❌ Could not find a Chromium-based browser (Edge/Chrome).');
    serverProcess.kill();
    process.exit(1);
  }
  
  console.log(`✅ Using browser at: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true, // Run invisibly safely
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('\n🕷️ Scraping fully rendered React site directly...\n');
  
  for (const page of PAGES) {
    const pageUrl = `${baseUrl}${page.pathname}`;
    const bPage = await browser.newPage();
    
    // Pass errors safely
    bPage.on('pageerror', (err) => console.log(`   [PAGE ERROR - ${page.pathname}]: ${err.message}`));

    try {
      // Navigate and wait for the network to quiet down (meaning React fetches/renders are mostly done)
      await bPage.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Additional brief wait to ensure full layout paints & dynamic hooks resolve
      await new Promise(r => setTimeout(r, 1000));
      
      // Scrape the DOM
      let html = await bPage.evaluate(() => document.documentElement.outerHTML);
      
      // Inject standard DOCTYPE safely
      const fullHtml = `<!DOCTYPE html>\n${html}`;

      const filePath = path.join(CACHE_DIR, `${page.name}.ts`);
      const content = `/**\n * Pre-rendered HTML for ${page.pathname}\n * Generated dynamically by scripts/update-bot-cache.js\n */\nexport const html = ${JSON.stringify(fullHtml)};\n`;
      fs.writeFileSync(filePath, content);
      
      console.log(`✅ Scraped and saved   -> ${page.name}.ts`);
    } catch (e) {
      console.error(`❌ Failed to scrape ${page.pathname}`, e);
    } finally {
      await bPage.close();
    }
  }

  await browser.close();
  serverProcess.kill();

  // Generate exporting Barrel Module
  const indexContent = `/**\n * SEO Bot Cache Index\n */\n${PAGES.map(p => `import { html as ${p.name}Html } from './${p.name}.js';`).join('\n')}\n\nexport const BOT_CACHE: Record<string, string> = {\n${PAGES.map(p => `  "${p.pathname}": ${p.name}Html,`).join('\n')}\n};\n`;
  fs.writeFileSync(path.join(CACHE_DIR, 'index.ts'), indexContent);
  
  console.log('\n✨ DONE! Static bot cache built from live application locally.');
}

main();

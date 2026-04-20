import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DOMAIN = 'https://chatparser.online';
const PAGES = {
  '/': 'home',
  '/about': 'about',
  '/privacy': 'privacy',
  '/contact': 'contact'
};
const BOT_USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const CACHE_DIR = path.resolve('src/bot-cache');
const INDEX_HTML_PATH = path.resolve('index.html');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Extract base structured data from index.html as a fallback
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
const structuredDataMatch = indexHtml.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi);
const baseStructuredData = structuredDataMatch ? structuredDataMatch.join('\n') : '';

async function updateCache() {
  console.log('🚀 Starting SEO Bot Cache Update (Structured Data Aware)...');
  
  const pageNames = [];

  for (const [pathname, name] of Object.entries(PAGES)) {
    const url = `${TARGET_DOMAIN}${pathname}`;
    console.log(`\n📄 Fetching rendered HTML for: ${url}...`);

    try {
      // Use bypass header if middleware is already live
      const html = execSync(`curl.exe -s -H "X-SEO-Bypass: true" -A "${BOT_USER_AGENT}" ${url}`, { encoding: 'utf-8' });

      if (!html || html.length < 500) {
        throw new Error('Received suspiciously small HTML.');
      }

      // Cleanup: Remove all scripts EXCEPT for structured data (LD+JSON)
      let cleanedHtml = html.replace(/<script\b(?![^>]*application\/ld\+json)[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Safeguard: If structured data is missing (due to stale cache fetch), inject from index.html
      if (!cleanedHtml.includes('application/ld+json') && pathname === '/') {
        console.log('⚠️ Structured data missing in fetch. Injecting from index.html...');
        cleanedHtml = cleanedHtml.replace('</head>', `${baseStructuredData}\n</head>`);
      }

      const filePath = path.join(CACHE_DIR, `${name}.ts`);
      const content = `/**
 * Pre-rendered HTML for ${pathname}
 * Generated automatically by scripts/update-bot-cache.js
 */
export const html = ${JSON.stringify(cleanedHtml)};
`;
      
      fs.writeFileSync(filePath, content);
      pageNames.push({ pathname, name });
      console.log(`✅ Saved ${name}.ts (${(cleanedHtml.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`❌ Failed to fetch ${pathname}:`, err.message);
    }
  }

  // Generate index.ts for easy importing
  const indexContent = `/**
 * SEO Bot Cache Index
 * Generated automatically by scripts/update-bot-cache.js
 */
${pageNames.map(p => `import { html as ${p.name}Html } from './${p.name}.js';`).join('\n')}

export const BOT_CACHE: Record<string, string> = {
${pageNames.map(p => `  "${p.pathname}": ${p.name}Html,`).join('\n')}
};
`;

  fs.writeFileSync(path.join(CACHE_DIR, 'index.ts'), indexContent);
  console.log('\n✨ DONE! Bot cache updated with Structured Data preserved.');
}

updateCache();

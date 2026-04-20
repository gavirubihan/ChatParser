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

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

async function updateCache() {
  console.log('🚀 Starting SEO Bot Cache Update (Separate Files)...');
  
  const pageNames = [];

  for (const [pathname, name] of Object.entries(PAGES)) {
    const url = `${TARGET_DOMAIN}${pathname}`;
    console.log(`\n📄 Fetching rendered HTML for: ${url}...`);

    try {
      const html = execSync(`curl.exe -s -A "${BOT_USER_AGENT}" ${url}`, { encoding: 'utf-8' });

      if (!html || html.length < 500) {
        throw new Error('Received suspiciously small HTML.');
      }

      // Cleanup
      const cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
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
${pageNames.map(p => `import { html as ${p.name}Html } from './${p.name}';`).join('\n')}

export const BOT_CACHE: Record<string, string> = {
${pageNames.map(p => `  "${p.pathname}": ${p.name}Html,`).join('\n')}
};
`;

  fs.writeFileSync(path.join(CACHE_DIR, 'index.ts'), indexContent);
  console.log('\n✨ DONE! src/bot-cache/ index and files updated.');
  console.log('You can now push this to Vercel.');
}

updateCache();

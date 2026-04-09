import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
// Format: YYYY-MM-DDTHH:mm:ssZ (removing milliseconds for cleaner SEO look)
const now = new Date().toISOString().split('.')[0] + 'Z';

try {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found at ${sitemapPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(sitemapPath, 'utf8');
  
  // Replace all <lastmod>...</lastmod> with current ISO 8601 timestamp
  const updatedContent = content.replace(
    /<lastmod>.*?<\/lastmod>/g, 
    `<lastmod>${now}</lastmod>`
  );

  fs.writeFileSync(sitemapPath, updatedContent);
  console.log(`\x1b[32m✓\x1b[0m Successfully updated sitemap timestamp: ${now}`);
} catch (error) {
  console.error('\x1b[31m✗\x1b[0m Failed to update sitemap:', error.message);
  process.exit(1);
}

import { BOT_CACHE } from './src/bot-cache/index';

export const config = {
  matcher: ['/', '/about', '/privacy', '/contact']
}

const BOT_AGENTS = [
  'bingbot',
  'googlebot', 
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebot',
  'twitterbot',
  'facebookexternalhit',
  'linkedinbot',
  'ia_archiver'
];

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent')?.toLowerCase() ?? '';
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot));

  // Normalize pathname: remove trailing slash (except for root) to match BOT_CACHE keys
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // If it's a bot and we have a cached version of this page
  if (isBot && BOT_CACHE[pathname]) {
    console.log(`[Middleware] Serving cached HTML for bot: ${pathname}`);
    
    return new Response(BOT_CACHE[pathname], {
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'X-Bot-Prerender': 'local-cache',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  }

  // Returning nothing tells Vercel to continue to the standard Vite SPA
}

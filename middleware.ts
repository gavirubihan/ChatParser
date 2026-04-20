export const config = {
  matcher: ['/', '/about', '/privacy', '/contact', '/chat']
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
  const ua = request.headers.get('user-agent')?.toLowerCase() ?? '';
  const isBot = BOT_AGENTS.some(bot => ua.includes(bot));

  if (isBot) {
    // request.url is the full actual URL strings (e.g., https://chatparser.com/about)
    const prerenderUrl = `https://service.prerender.io/${request.url}`;
    
    // Reverse proxy the request directly to prerender.io since we are on the Edge
    return fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': process.env.PRERENDER_TOKEN ?? '',
        // Always good practice to forward the bot's User-Agent to Prerender
        'User-Agent': request.headers.get('user-agent') ?? '',
      }
    });
  }

  // Returning nothing tells Vercel to continue to the standard Vite SPA
}

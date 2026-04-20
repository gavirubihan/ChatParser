/**
 * SEO Bot Cache Index
 * Generated automatically by scripts/update-bot-cache.js
 */
import { html as homeHtml } from './home';
import { html as aboutHtml } from './about';
import { html as privacyHtml } from './privacy';
import { html as contactHtml } from './contact';

export const BOT_CACHE: Record<string, string> = {
  "/": homeHtml,
  "/about": aboutHtml,
  "/privacy": privacyHtml,
  "/contact": contactHtml,
};

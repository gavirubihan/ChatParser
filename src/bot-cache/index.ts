/**
 * SEO Bot Cache Index
 */
import { html as homeHtml } from './home.ts';
import { html as aboutHtml } from './about.ts';
import { html as privacyHtml } from './privacy.ts';
import { html as contactHtml } from './contact.ts';

export const BOT_CACHE: Record<string, string> = {
  "/": homeHtml,
  "/about": aboutHtml,
  "/privacy": privacyHtml,
  "/contact": contactHtml,
};

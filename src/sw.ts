/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Share Target POST request
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method === 'POST' &&
    url.pathname === '/chat'
  ) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const chatFile = formData.get('chat_export');

          if (chatFile instanceof File) {
            // Open a cache and store the file
            const cache = await caches.open('shared-files');
            
            // Create a response that includes the original filename in a header
            const response = new Response(chatFile);
            const headers = new Headers(response.headers);
            headers.set('x-file-name', encodeURIComponent(chatFile.name));
            
            await cache.put('/shared-file', new Response(chatFile, { headers }));
            
            // Redirect to the chat page with a flag (use absolute URL)
            return Response.redirect(new URL('/chat?share=true', self.location.origin).href, 303);
          }
        } catch (err) {
          console.error('Service Worker: Share Target error', err);
        }

        return Response.redirect(new URL('/chat', self.location.origin).href, 303);
      })()
    );
  }
});

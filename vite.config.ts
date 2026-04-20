import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import prerender from 'vite-plugin-prerender-esm-fix'

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/', '/privacy', '/about', '/contact'],
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['chatparser.svg', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'ChatParser',
        short_name: 'ChatParser',
        description: 'A private and seamless way to view WhatsApp chat exports.',
        theme_color: '#00a884',
        background_color: '#ffffff',
        display: 'standalone',
        id: '/chat',
        start_url: '/chat',
        share_target: {
          action: '/chat',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [
              {
                name: 'chat_export',
                accept: ['.txt', '.zip', 'text/plain', 'application/zip', 'application/x-zip-compressed']
              }
            ]
          }
        },
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
})

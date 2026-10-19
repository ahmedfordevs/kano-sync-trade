import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Kano-Sync Trade POS',
        short_name: 'KanoSync',
        description: 'Professional offline-first POS and inventory management for local traders',
        theme_color: '#059669', // Emerald green fintech theme
        background_color: '#f8fafc',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Ensure all JS, CSS, HTML, and Dexie assets are cached for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});
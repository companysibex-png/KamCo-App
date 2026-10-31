import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// When building for GitHub Pages the workflow sets GITHUB_PAGES=true so assets
// resolve under /KamCo-App/. Locally (and inside Capacitor) base stays '/'.
const isGHPages = process.env.GITHUB_PAGES === 'true'
const repoBase = isGHPages ? '/KamCo-App/' : '/'

export default defineConfig({
  base: repoBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.png'],
      manifest: {
        name: 'KamCo Store',
        short_name: 'KamCo',
        description: 'KamCo e-commerce storefront — installable PWA for web, Android, iOS and Windows',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: repoBase,
        scope: repoBase,
        icons: [
          { src: `${repoBase}icons/pwa-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${repoBase}icons/pwa-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${repoBase}icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${repoBase}index.html`,
        runtimeCaching: [
          {
            // Cache product/category images and any HTTP resources at runtime
            urlPattern: /^https?:\/\/.+\.(png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
})

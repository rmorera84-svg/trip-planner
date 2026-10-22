import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Si cambias el nombre del repo, cambia también BASE.
const BASE = '/trip-planner/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'sample-trip.json'],
      manifest: {
        name: 'Trip Planner',
        short_name: 'Trip',
        description: 'Itinerario de viaje offline con datos en vivo',
        lang: 'es',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b1020',
        theme_color: '#0b1020',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json,webmanifest}'],
        navigateFallback: BASE + 'index.html',
        // Guarda los mapas ya vistos para usarlos sin señal
        runtimeCaching: [{
          urlPattern: /^https:\/\/[abc]?\.?tile\.openstreetmap\.org\/.*/,
          handler: 'CacheFirst',
          options: { cacheName: 'osm-tiles', expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 60 } }
        }]
      }
    })
  ]
})

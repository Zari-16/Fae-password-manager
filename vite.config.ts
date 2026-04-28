import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/Fae-password-manager/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fae-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Fae Password Manager',
        short_name: 'Fae Vault',
        description: 'Your magical vault for passwords — encrypted, private, and stored under your control.',
        theme_color: '#9333ea',
        background_color: '#0f0a1e',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'utilities'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'Open Vault', url: '/#/dashboard', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Add Credential', url: '/#/dashboard', icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          ui: ['lucide-react'],
          crypto: ['idb'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          state: ['zustand'],
        },
      },
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand', 'idb'],
  },
})

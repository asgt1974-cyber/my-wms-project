import { defineConfig } from 'vite';
import react from '@vitejs/react-devtools';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Warehouse Management System',
        short_name: 'WMS',
        description: 'Inventory and LPN Tracking',
        theme_color: '#2563eb', // This matches your blue header
        background_color: '#ffffff',
        display: 'standalone', // THIS removes the browser bars
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
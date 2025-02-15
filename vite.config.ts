import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5175,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5175
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react'
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Change Tracker',
        short_name: 'Change Tracker',
        description: 'Track cash change for delivery drivers',
        theme_color: '#0066FF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        start_url: '/'
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
}); 
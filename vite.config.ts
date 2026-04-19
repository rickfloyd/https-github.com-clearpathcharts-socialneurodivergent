import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.json',
        devOptions: {
          enabled: false
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'CLEARPATH INTELLIGENCE',
          short_name: 'Clr Path',
          description: 'Institutional-grade digital news publication featuring real-time analysis',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          icons: [
            {
              src: 'https://i.postimg.cc/vZjBsKfY/Chat-GPT-Image-Feb-26-2026-02-21-28-PM.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://i.postimg.cc/vZjBsKfY/Chat-GPT-Image-Feb-26-2026-02-21-28-PM.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'https://i.postimg.cc/vZjBsKfY/Chat-GPT-Image-Feb-26-2026-02-21-28-PM.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          // Simplified output for stability
        }
      },
      chunkSizeWarningLimit: 2000
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
    },
  };
});

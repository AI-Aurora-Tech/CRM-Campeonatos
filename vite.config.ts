import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        manifest: {
          name: 'GESTOR FC — CRM Campeonatos',
          short_name: 'Gestor FC',
          description: 'Gestão de campeonatos amadores',
          theme_color: '#0f172a',
          background_color: '#fafafa',
          display: 'standalone',
          start_url: '/',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

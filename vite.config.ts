import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // If deploying to GitHub Pages, set base to your repository name, e.g., '/FWQ_chaxun/'
  // base: '/FWQ_chaxun/',
  plugins: [react(), tailwindcss()],
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});

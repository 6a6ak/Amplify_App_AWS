import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single ESM config for Vite with /api proxy to local backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
});

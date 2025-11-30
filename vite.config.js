import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxy: forward /api requests to the local backend on :3333
// This avoids the frontend dev server returning its index.html for /api/* (which caused HTML where JSON expected).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});

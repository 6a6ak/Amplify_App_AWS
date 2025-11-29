import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ESM config to avoid CJS/ESM interop issues on Windows
export default defineConfig({
  plugins: [react()],
})

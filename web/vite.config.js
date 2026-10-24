import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})

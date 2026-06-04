import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/auth': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: false,
      },
      '/spotify': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: false,
      },
    }
  }
})  
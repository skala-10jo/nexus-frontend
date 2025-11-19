import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    global: 'globalThis'  // Fix for sockjs-client
  },
  server: {
    port: 5173,
    host: true,
    https: false,
    allowedHosts: [
      'nonsubversively-contributable-florine.ngrok-free.dev',
      '18b115e54257.ngrok-free.app'
    ],
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // Proxy WebSocket to backend
      '/ws': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})

/// <reference types="vitest" />
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setupTests.ts',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://api:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

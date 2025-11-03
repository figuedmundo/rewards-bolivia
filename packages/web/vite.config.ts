/// <reference types="vitest" />
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, mergeConfig } from "vite"
import { defineConfig as defineVitestConfig } from "vitest/config";

const viteConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});

export default mergeConfig(viteConfig, vitestConfig);

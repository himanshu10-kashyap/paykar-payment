import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** Our own API. Paykar is only ever called server-side. */
const API_TARGET = process.env.API_TARGET || 'http://localhost:4000'

const proxy = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'test' ? [] : [tailwindcss()])],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
  // Vitest transforms the test files itself, so JSX needs the modern runtime
  // there. The app build uses oxc via @vitejs/plugin-react and needs nothing.
  ...(mode === 'test' ? { esbuild: { jsx: 'automatic', jsxImportSource: 'react' } } : {}),
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    css: false,
    restoreMocks: true,
    unstubGlobals: true,
  },
}))
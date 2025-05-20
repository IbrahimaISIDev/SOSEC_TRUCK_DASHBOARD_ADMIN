import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    ...configDefaults,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@popperjs/core',
      '@mui/material',
      '@mui/x-date-pickers',
      'date-fns'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      '@popperjs/core': '@popperjs/core/dist/umd/popper.js',
    },
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
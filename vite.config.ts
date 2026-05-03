/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        unsafe: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        popup: path.resolve(__dirname, 'public/popup.html'),
        background: path.resolve(__dirname, 'service-worker.js'),
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'background' ? 'service-worker.js' : 'assets/[name]-[hash].js';
        },
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-ui': ['framer-motion', 'lucide-react', '@heroicons/react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});

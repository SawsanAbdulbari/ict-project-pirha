import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React strict mode
      jsxRuntime: 'automatic',
    }),
    nodePolyfills({
      include: ['buffer', 'stream', 'util'], // pdfkit needs these
    }),
    tailwindcss(),
  ],
  base: process.env.VITE_BASE_PATH || "/ict-project-pirha",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      'buffer': 'buffer',
      'process': 'process/browser.js',
      'global': 'window',
    },
  },
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog'],
          'utils-vendor': ['jspdf', 'html2canvas', 'framer-motion'],
        },
        // Optimize chunk names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    // Enable compression
    reportCompressedSize: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  // Preview server configuration
  preview: {
    port: 3000,
    host: true,
  },

  // CSS optimization
  css: {
    devSourcemap: false,
  },
})

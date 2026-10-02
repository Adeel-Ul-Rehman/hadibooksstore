import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          react: ['react', 'react-dom'],
          chartjs: ['chart.js', 'react-chartjs-2'],
          router: ['react-router-dom'],
        },
      },
    },
  },

  // Server configuration
  server: {
    port: 5173,
    strictPort: true, // Exit if port is in use
  },

  // Preview configuration
  preview: {
    port: 5173,
    strictPort: true,
  },

  // Base path configuration
  base: '/', // Works for both root domain and subpaths

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'chart.js',
      'react-chartjs-2'
    ],
  },
});
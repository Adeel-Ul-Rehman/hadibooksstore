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
          animations: ['framer-motion'],
          icons: ['react-icons'],
          notifications: ['react-toastify'],
        },
      },
    },
  },

  // Server configuration with proxy - UPDATED
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false, // Changed to false for Render.com compatibility
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api prefix for backend
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
        },
      },
    },
  },

  // Preview configuration
  preview: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // Base path configuration
  base: '/',

  // Optimize dependencies - UPDATED
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'chart.js',
      'react-chartjs-2',
      'framer-motion',
      'react-icons',
      'react-toastify',
      'axios',
      'validator',
    ],
    exclude: [],
  },

  // Resolve configuration
  resolve: {
    alias: {
      // Add any necessary aliases here
    },
  },
});
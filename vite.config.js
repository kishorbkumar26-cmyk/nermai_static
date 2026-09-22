import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Split large chunks so browsers cache vendor libs separately from app code
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase SDKs — rarely change, cached long-term by browser
          'firebase-core': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          // React core — almost never changes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    },
    // Warn if any chunk exceeds 600KB
    chunkSizeWarningLimit: 600,
  },

  // Enable dependency pre-bundling for faster dev starts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/firestore']
  }
})

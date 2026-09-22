import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Split large chunks so browsers cache vendor libs separately from app code
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'firebase-core';
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'react-vendor';
          }
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

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { cleanExpiredCache, installImageCaptureObserver } from './utils/imageCache'

// Run TTL cleanup on startup without blocking the initial render
if (typeof window !== 'undefined') {
  const cleanup = () => {
    cleanExpiredCache().catch(() => {})
    installImageCaptureObserver()
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(cleanup, { timeout: 5000 })
  } else {
    setTimeout(cleanup, 3000)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

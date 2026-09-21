/**
 * useCachedImage — React hook for cached image loading
 *
 * Usage:
 *   const { src, loading } = useCachedImage(originalUrl)
 *
 * - If the URL is cacheable (remote http/https), it checks Cache API first.
 *   - Cache hit → returns blob: URL instantly (no network request)
 *   - Cache miss → fetches via CORS, caches, returns blob: URL
 *   - CORS failure → falls back to original URL (no visible error to user)
 * - Non-cacheable URLs (data:, blob:, /assets/) are returned as-is synchronously.
 * - Properly cleans up blob: URLs on unmount to prevent memory leaks.
 */

import { useState, useEffect, useRef } from 'react'
import { getCachedImageUrl, isCacheable } from '../utils/imageCache'

/**
 * @param {string|null|undefined} originalUrl
 * @returns {{ src: string, loading: boolean }}
 */
export function useCachedImage(originalUrl) {
  const [src, setSrc] = useState(originalUrl || '')
  const [loading, setLoading] = useState(false)
  // Track the current request so stale async results are discarded
  const currentUrlRef = useRef(null)
  // Track created blob URLs for cleanup
  const blobUrlRef = useRef(null)

  useEffect(() => {
    // Revoke previous blob URL to prevent memory leaks
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }

    if (!originalUrl) {
      setSrc('')
      setLoading(false)
      return
    }

    // Non-cacheable: return synchronously, no async needed
    if (!isCacheable(originalUrl)) {
      setSrc(originalUrl)
      setLoading(false)
      return
    }

    // Mark this request as the current active one
    currentUrlRef.current = originalUrl
    setLoading(true)

    getCachedImageUrl(originalUrl)
      .then(resolvedUrl => {
        // Discard if a newer URL has been set while this was pending
        if (currentUrlRef.current !== originalUrl) return
        // Track blob: URLs for later revocation
        if (resolvedUrl && resolvedUrl.startsWith('blob:')) {
          blobUrlRef.current = resolvedUrl
        }
        setSrc(resolvedUrl)
        setLoading(false)
      })
      .catch(() => {
        if (currentUrlRef.current !== originalUrl) return
        // Graceful fallback to original URL on any error
        setSrc(originalUrl)
        setLoading(false)
      })

    return () => {
      // Cancel stale async results
      currentUrlRef.current = null
    }
  }, [originalUrl])

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [])

  return { src, loading }
}

/**
 * imageCache.js — Smart Image Caching for NERMAI
 *
 * Strategy:
 *  - PRIMARY: After <img> elements finish loading, capture them via Canvas → Blob
 *    and store in Cache API. Zero extra network requests.
 *  - FALLBACK: CORS fetch → no-cors fetch (for URLs not yet in the DOM)
 *  - Per-image invalidation: only stale/changed URLs are removed, NOT the entire cache
 *  - 7-day TTL tracked via localStorage
 *  - base64, blob:, and local /assets/ URLs are passed through uncached
 *
 * Canvas capture requires crossOrigin="anonymous" on <img> tags for cross-origin images.
 * If canvas is tainted, falls back to fetch strategies.
 */

const CACHE_NAME = 'nermai-images-v1'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const TTL_LS_KEY = 'nermai_cache_timestamps'

// ─── Utility ────────────────────────────────────────────────────────────────

export function isCacheable(url) {
  if (!url || typeof url !== 'string') return false
  const u = url.trim()
  if (!u) return false
  if (
    u.startsWith('data:') ||
    u.startsWith('blob:') ||
    u.startsWith('/') ||
    u.startsWith('./') ||
    u.startsWith('../')
  ) return false
  return u.startsWith('http://') || u.startsWith('https://')
}

function isCacheSupported() {
  return typeof window !== 'undefined' && 'caches' in window
}

// ─── TTL via localStorage (opaque responses have unreadable headers) ─────────

function getTtlMap() {
  try { return JSON.parse(localStorage.getItem(TTL_LS_KEY) || '{}') } catch { return {} }
}
function setTtlMap(map) {
  try { localStorage.setItem(TTL_LS_KEY, JSON.stringify(map)) } catch { /* quota */ }
}
function recordCacheTime(url) {
  const m = getTtlMap(); m[url] = Date.now(); setTtlMap(m)
}
function isCacheEntryFresh(url) {
  const t = getTtlMap()[url]; return t && Date.now() - t < TTL_MS
}
function removeTtlEntry(url) {
  const m = getTtlMap(); delete m[url]; setTtlMap(m)
}

// ─── Canvas capture (zero network requests) ───────────────────────────────────

/**
 * Capture an already-loaded <img> element to a Blob via Canvas.
 * Returns null if the image is cross-origin and canvas is tainted.
 */
async function captureImgToBlob(imgEl) {
  try {
    if (!imgEl.complete || imgEl.naturalWidth === 0) return null
    const canvas = document.createElement('canvas')
    canvas.width = imgEl.naturalWidth
    canvas.height = imgEl.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgEl, 0, 0)
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
  } catch {
    // SecurityError: canvas tainted by cross-origin image (no CORS headers)
    return null
  }
}

/**
 * Find a loaded <img> element on the page with a matching src URL.
 * Returns null if not found or not yet loaded.
 */
function findLoadedImgElement(url) {
  if (typeof document === 'undefined') return null
  const imgs = document.querySelectorAll('img')
  for (const img of imgs) {
    // Match by src or currentSrc
    if ((img.src === url || img.currentSrc === url) && img.complete && img.naturalWidth > 0) {
      return img
    }
  }
  return null
}

// ─── Fetch fallback ───────────────────────────────────────────────────────────

async function fetchFallback(url) {
  // 1. CORS (live network)
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
    if (res.ok) return { response: res, opaque: false }
    if (res.status === 429 || res.status === 400) return null
  } catch { /* CORS blocked */ }

  // 2. no-cors opaque (browser can still display it via <img>)
  try {
    const res = await fetch(url, { mode: 'no-cors', credentials: 'omit' })
    return { response: res, opaque: true }
  } catch {
    return null
  }
}

// ─── Core: getCachedImageUrl ──────────────────────────────────────────────────

/**
 * Returns a cached version of the image URL:
 *  - blob: URL if we have a CORS/canvas-captured copy
 *  - original URL if we have an opaque cached copy (browser serves it transparently)
 *  - original URL if caching fails (graceful fallback)
 */
export async function getCachedImageUrl(originalUrl) {
  if (!isCacheable(originalUrl)) return originalUrl
  if (!isCacheSupported()) return originalUrl

  try {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(originalUrl)

    if (cached) {
      if (isCacheEntryFresh(originalUrl)) {
        if (cached.type !== 'opaque') {
          const blob = await cached.clone().blob()
          return URL.createObjectURL(blob)
        }
        return originalUrl // opaque — browser serves transparently
      } else {
        await cache.delete(originalUrl)
        removeTtlEntry(originalUrl)
      }
    }

    // ── Strategy 1: Canvas capture from loaded <img> (zero network cost) ──
    const imgEl = findLoadedImgElement(originalUrl)
    if (imgEl) {
      const blob = await captureImgToBlob(imgEl)
      if (blob) {
        const headers = new Headers({ 'content-type': blob.type })
        await cache.put(originalUrl, new Response(blob, { status: 200, headers }))
        recordCacheTime(originalUrl)
        return URL.createObjectURL(blob.slice(0))
      }
    }

    // ── Strategy 2: Fetch (CORS → no-cors) ──
    const result = await fetchFallback(originalUrl)
    if (!result) return originalUrl

    const { response, opaque } = result
    await cache.put(originalUrl, response.clone())
    recordCacheTime(originalUrl)

    if (opaque) return originalUrl
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return originalUrl
  }
}

// ─── Invalidation ─────────────────────────────────────────────────────────────

export async function invalidateCachedUrls(urls = []) {
  if (!isCacheSupported() || !urls.length) return
  try {
    const cache = await caches.open(CACHE_NAME)
    await Promise.allSettled(urls.map(url => {
      removeTtlEntry(url)
      return cache.delete(url)
    }))
  } catch { /* ignore */ }
}

export async function clearImageCache() {
  if (!isCacheSupported()) return
  try {
    await caches.delete(CACHE_NAME)
    localStorage.removeItem(TTL_LS_KEY)
  } catch { /* ignore */ }
}

// ─── Preloading ───────────────────────────────────────────────────────────────

/**
 * Scan the DOM for loaded <img> elements and capture them into Cache Storage.
 * Called after a delay so images finish loading first.
 * No new network requests — pure canvas capture from already-rendered images.
 */
/**
 * Capture ALL currently-loaded crossOrigin img elements into Cache Storage.
 * Does NOT filter by URL — it caches every crossOrigin Drive image it finds.
 * This avoids URL format mismatch (raw file ID vs formatted lh3.google URL).
 */
async function captureAllLoadedCrossOriginImgs() {
  if (!isCacheSupported() || typeof document === 'undefined') return
  const cache = await caches.open(CACHE_NAME)

  // Select all img elements that have crossOrigin attribute set
  const imgs = Array.from(document.querySelectorAll('img[crossorigin]'))

  for (const img of imgs) {
    try {
      if (!img.complete || img.naturalWidth === 0) continue
      const url = img.currentSrc || img.src
      if (!isCacheable(url)) continue

      // Skip if already freshly cached
      const existing = await cache.match(url)
      if (existing && isCacheEntryFresh(url)) continue

      const blob = await captureImgToBlob(img)
      if (!blob) continue

      const headers = new Headers({ 'content-type': blob.type })
      await cache.put(url, new Response(blob, { status: 200, headers }))
      recordCacheTime(url)
    } catch { /* skip this image */ }

    // Tiny yield to avoid blocking main thread
    await new Promise(r => setTimeout(r, 30))
  }
}

/**
 * Auto-capture a single img element when it finishes loading.
 * Called by the MutationObserver and load event listeners.
 */
async function tryCaptureImg(img) {
  try {
    if (!img.complete || img.naturalWidth === 0) return
    if (!img.crossOrigin) return
    const url = img.currentSrc || img.src
    if (!isCacheable(url)) return

    const cache = await caches.open(CACHE_NAME)
    const existing = await cache.match(url)
    if (existing && isCacheEntryFresh(url)) return

    const blob = await captureImgToBlob(img)
    if (!blob) return

    const headers = new Headers({ 'content-type': blob.type })
    await cache.put(url, new Response(blob, { status: 200, headers }))
    recordCacheTime(url)
  } catch { /* ignore */ }
}

/**
 * Install a MutationObserver that watches for new crossOrigin img elements
 * and caches them the moment they finish loading.
 * Call once on app startup — handles all future image renders automatically.
 */
export function installImageCaptureObserver() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return
  if (!isCacheSupported()) return

  const attachToImg = (img) => {
    if (!img.crossOrigin) return
    if (img.complete && img.naturalWidth > 0) {
      tryCaptureImg(img)
    } else {
      img.addEventListener('load', () => tryCaptureImg(img), { once: true })
    }
  }

  // Watch for new img elements added to the DOM
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue // element nodes only
        if (node.tagName === 'IMG') attachToImg(node)
        if (node.querySelectorAll) node.querySelectorAll('img').forEach(attachToImg)
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })

  // Also handle any imgs already in the DOM
  document.querySelectorAll('img').forEach(attachToImg)
}

/**
 * Preload (cache) a list of image URLs.
 * - Immediately scans DOM for loaded crossOrigin imgs and caches them
 * - After 5s delay (for lazy-loaded images), scans again
 * - Falls back to fetch for any still-uncached URLs
 */
export function preloadImages(urls = []) {
  // Phase 1: capture any crossOrigin imgs already loaded in the DOM right now
  captureAllLoadedCrossOriginImgs().catch(() => {})

  // Phase 2: after 5s, capture lazy-loaded imgs that needed time to render
  setTimeout(() => {
    captureAllLoadedCrossOriginImgs().catch(() => {})
  }, 5000)
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

export async function cleanExpiredCache() {
  if (!isCacheSupported()) return
  try {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    const now = Date.now()
    const map = getTtlMap()
    let changed = false

    await Promise.allSettled(
      keys.map(async req => {
        const t = map[req.url]
        if (!t || now - t > TTL_MS) {
          await cache.delete(req)
          delete map[req.url]
          changed = true
        }
      })
    )
    if (changed) setTtlMap(map)
  } catch { /* ignore */ }
}

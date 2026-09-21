/**
 * imageCacheVersion.js — Per-section image version tracking for NERMAI
 *
 * Strategy:
 *  - Tracks per-section fingerprints in localStorage under "nermai_img_versions"
 *  - Each section stores: { fingerprint, items: [{ url, updatedAt }], urls: [] }
 *  - On snapshot: compute new fingerprint. If changed, return the list of
 *    stale URLs (old URLs no longer present, or same URL but different updatedAt)
 *  - Callers then pass stale URLs to invalidateCachedUrls() for surgical invalidation
 *
 * Sections:  'hero' | 'toppers' | 'gallery' | 'testimonials' | 'about' | 'journey'
 */

const VERSION_KEY = 'nermai_img_versions'

/** Load the full version map from localStorage. */
function getStoredVersions() {
  try {
    return JSON.parse(localStorage.getItem(VERSION_KEY) || '{}')
  } catch {
    return {}
  }
}

/** Persist the full version map to localStorage. */
function setStoredVersions(data) {
  try {
    localStorage.setItem(VERSION_KEY, JSON.stringify(data))
  } catch {
    // Ignore quota errors
  }
}

/**
 * Compute a fingerprint string for a section's image items.
 * Items are sorted by URL so order changes don't cause false invalidations.
 *
 * @param {Array<{ url: string, updatedAt?: string|number }>} items
 * @returns {string}
 */
function computeFingerprint(items) {
  const sorted = [...items]
    .filter(i => i && i.url)
    .sort((a, b) => a.url.localeCompare(b.url))
  return sorted.map(i => `${i.url}@${i.updatedAt || ''}`).join('|')
}

/**
 * Check if a section's image set has changed compared to the locally stored version.
 * If changed, update localStorage and return the list of stale URLs to invalidate.
 *
 * @param {string} section - e.g. 'hero', 'gallery', 'toppers'
 * @param {Array<{ url: string, updatedAt?: string|number }>} newItems
 *   Each item should have at minimum a `url`. Optionally include `updatedAt` (Firestore
 *   serverTimestamp converted to a string/ms number) so content changes at the same URL
 *   are also detected.
 * @returns {{ changed: boolean, staleUrls: string[] }}
 */
export function checkSectionVersion(section, newItems = []) {
  const validItems = newItems.filter(i => i && i.url && typeof i.url === 'string' && i.url.trim())
  const newFingerprint = computeFingerprint(validItems)

  const versions = getStoredVersions()
  const stored = versions[section]

  if (!stored || stored.fingerprint !== newFingerprint) {
    // Determine which specific URLs became stale:
    // 1. URLs that existed before but are no longer in the new set (deleted/replaced)
    const oldUrls = stored?.urls || []
    const newUrls = validItems.map(i => i.url)
    const removedUrls = oldUrls.filter(u => !newUrls.includes(u))

    // 2. URLs that still exist but whose updatedAt timestamp changed (content updated)
    const oldItemsMap = {}
    ;(stored?.items || []).forEach(i => { if (i.url) oldItemsMap[i.url] = i.updatedAt || '' })
    const contentChangedUrls = validItems
      .filter(item => oldItemsMap[item.url] !== undefined && oldItemsMap[item.url] !== (item.updatedAt || ''))
      .map(i => i.url)

    const staleUrls = [...new Set([...removedUrls, ...contentChangedUrls])]

    // Persist the new version
    versions[section] = {
      fingerprint: newFingerprint,
      urls: newUrls,
      items: validItems,
      storedAt: Date.now()
    }
    setStoredVersions(versions)

    return { changed: true, staleUrls }
  }

  return { changed: false, staleUrls: [] }
}

/**
 * Clear a specific section's stored version (forces re-validation on next snapshot).
 * @param {string} section
 */
export function clearSectionVersion(section) {
  const versions = getStoredVersions()
  delete versions[section]
  setStoredVersions(versions)
}

/**
 * Clear all stored section versions.
 */
export function clearAllVersions() {
  try {
    localStorage.removeItem(VERSION_KEY)
  } catch {
    // Ignore
  }
}

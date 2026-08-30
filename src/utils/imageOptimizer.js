/**
 * Image optimization, Google Drive URL conversion, and Multi-Node CDN Load Balancing.
 * Ported from Construction project — same battle-tested logic.
 */

// Extract Google Drive File ID from various URL formats
export function extractGoogleDriveId(urlOrId) {
  if (!urlOrId) return ''
  const str = urlOrId.trim()
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(str)) return str
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ]
  for (const pattern of patterns) {
    const match = str.match(pattern)
    if (match && match[1]) return match[1]
  }
  return ''
}

const GOOGLE_CDN_NODES = [
  'https://lh3.googleusercontent.com/d/',
  'https://lh4.googleusercontent.com/d/',
  'https://lh5.googleusercontent.com/d/',
  'https://lh6.googleusercontent.com/d/'
]

export function getGoogleDriveCDNUrl(urlOrId, width = 1600) {
  const fileId = extractGoogleDriveId(urlOrId)
  if (!fileId) return urlOrId
  let hash = 0
  for (let i = 0; i < fileId.length; i++) {
    hash = (hash << 5) - hash + fileId.charCodeAt(i)
    hash |= 0
  }
  const nodeIndex = Math.abs(hash % GOOGLE_CDN_NODES.length)
  return `${GOOGLE_CDN_NODES[nodeIndex]}${fileId}=w${width}`
}

export function getGoogleDriveDirectUrl(urlOrId) {
  const fileId = extractGoogleDriveId(urlOrId)
  if (!fileId) return urlOrId
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

export function compressImage(file, options = {}) {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85, mimeType = 'image/webp' } = options
  return new Promise((resolve, reject) => {
    function processCanvas(img, originalSize) {
      let width = img.width
      let height = img.height
      if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth }
      if (height > maxHeight) { width = Math.round((width * maxHeight) / height); height = maxHeight }
      const maxFileBytes = 358400
      let currentQuality = quality, currentWidth = width, currentHeight = height
      let dataUrl = '', compressedSize = 0, iteration = 0
      const outputType = (mimeType === 'image/webp' || mimeType === 'image/jpeg') ? mimeType : 'image/webp'
      while (iteration < 4) {
        const canvas = document.createElement('canvas')
        canvas.width = currentWidth; canvas.height = currentHeight
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, currentWidth, currentHeight)
        dataUrl = canvas.toDataURL(outputType, currentQuality)
        compressedSize = Math.round((dataUrl.length - 22) * 3 / 4)
        if (compressedSize <= maxFileBytes || iteration === 3) break
        currentWidth = Math.max(1000, Math.round(currentWidth * 0.85))
        currentHeight = Math.max(1000, Math.round(currentHeight * 0.85))
        currentQuality = Math.max(0.65, currentQuality * 0.85)
        iteration++
      }
      let blob = null
      try { blob = dataURLtoBlob(dataUrl) } catch (e) { console.error('dataURL→blob failed', e) }
      resolve({ dataUrl, blob, width: currentWidth, height: currentHeight, originalSize, compressedSize, savedPercent: Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) })
    }
    if (typeof file === 'string' && file.startsWith('data:')) {
      const img = new Image(); img.onload = () => processCanvas(img, file.length); img.onerror = reject; img.src = file; return
    }
    if (file instanceof File || file instanceof Blob) {
      const reader = new FileReader()
      reader.onload = (e) => { const img = new Image(); img.onload = () => processCanvas(img, file.size); img.onerror = reject; img.src = e.target.result }
      reader.onerror = reject; reader.readAsDataURL(file); return
    }
    reject(new Error('Unsupported file type'))
  })
}

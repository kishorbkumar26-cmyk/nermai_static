/**
 * Drive Storage Service for NERMAI
 * Priority: Google Apps Script → Drive REST API → Firestore base64
 * Ported from Construction project driveStorage.js
 */
import { compressImage, extractGoogleDriveId, getGoogleDriveCDNUrl } from '../utils/imageOptimizer'
import { fbFirestore } from '../firebase/firestore'

const DRIVE_CONFIG_KEY = 'nermai_drive_config'

const DEFAULT_DRIVE_CONFIG = {
  appsScriptUrl: '',
  folderId: '',
  accessToken: '',
  maxWidth: 1600,
  quality: 0.85
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function fileToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const driveStorage = {
  getConfig() {
    try {
      const raw = localStorage.getItem(DRIVE_CONFIG_KEY)
      return raw ? { ...DEFAULT_DRIVE_CONFIG, ...JSON.parse(raw) } : DEFAULT_DRIVE_CONFIG
    } catch {
      return DEFAULT_DRIVE_CONFIG
    }
  },

  saveConfig(config) {
    try {
      const current = this.getConfig()
      const updated = { ...current, ...config }
      localStorage.setItem(DRIVE_CONFIG_KEY, JSON.stringify(updated))
      fbFirestore.updateSettings({ driveConfig: updated }).catch(() => {})
      return updated
    } catch (e) {
      console.error('Failed to save Drive config', e)
      return DEFAULT_DRIVE_CONFIG
    }
  },

  async processAndUploadImage(file, options = {}) {
    const config = this.getConfig()
    let compressedBlob = null, dataUrl = null, reductionPct = 0

    if (file instanceof File || file instanceof Blob) {
      try {
        const result = await compressImage(file, {
          maxWidth: options.maxWidth || config.maxWidth,
          quality: options.quality || config.quality
        })
        compressedBlob = result.blob
        dataUrl = result.dataUrl
        reductionPct = result.savedPercent || 0
      } catch (err) {
        console.warn('Compression skipped:', err)
      }
    }

    const uploadBlob = compressedBlob || file
    const cleanName = (file.name || `img_${Date.now()}`).replace(/\.\w+$/, '') + '.jpg'

    // 1. Try Google Apps Script Web App (actual Google Drive upload)
    if (config.appsScriptUrl) {
      try {
        const base64Data = dataUrl ? dataUrl.split(',')[1] : await blobToBase64(file)
        const rawSubFolder = options.subFolderName || ''
        const subFolderName = rawSubFolder.replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80)

        const response = await fetch(config.appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            filename: cleanName,
            mimeType: 'image/jpeg',
            base64: base64Data,
            folderId: config.folderId,
            ...(subFolderName ? { subFolderName } : {})
          })
        })

        if (response.ok) {
          const resData = await response.json()
          if (resData.status === 'success' && resData.fileId) {
            return {
              url: getGoogleDriveCDNUrl(resData.fileId),
              driveUrl: `https://drive.google.com/file/d/${resData.fileId}/view`,
              fileId: resData.fileId,
              storageType: 'google_drive',
              reductionPct
            }
          }
        }
      } catch (err) {
        console.error('Apps Script upload failed, trying Drive API:', err)
      }
    }

    // 2. Try Google Drive REST API (requires OAuth token)
    if (config.accessToken && uploadBlob) {
      try {
        const metadata = { name: cleanName, parents: [config.folderId || ''] }
        const formData = new FormData()
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        formData.append('file', uploadBlob)

        const res = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
          { method: 'POST', headers: { Authorization: `Bearer ${config.accessToken}` }, body: formData }
        )
        if (res.ok) {
          const data = await res.json()
          return {
            url: getGoogleDriveCDNUrl(data.id),
            driveUrl: data.webViewLink,
            fileId: data.id,
            storageType: 'google_drive',
            reductionPct
          }
        }
      } catch (err) {
        console.error('Drive API failed, falling back to base64:', err)
      }
    }

    // 3. Fallback: base64 data URL in Firestore (works on all devices)
    if (dataUrl) return { url: dataUrl, storageType: 'local_base64', reductionPct }
    const fallbackDataUrl = await fileToDataUrl(file)
    return { url: fallbackDataUrl, storageType: 'local_base64', reductionPct }
  },

  formatImageUrl(url) {
    if (!url || typeof url !== 'string') return null
    const trimmed = url.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('assets/')) return trimmed
    const driveId = extractGoogleDriveId(trimmed)
    if (driveId) return getGoogleDriveCDNUrl(driveId)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    return null
  },

  handleImageError(event, fallbackUrl = '/nermai-logo.svg') {
    const imgEl = event.target
    if (!imgEl) return
    const currentSrc = imgEl.src || ''
    const driveId = extractGoogleDriveId(currentSrc)
    if (driveId && currentSrc.includes('googleusercontent.com') && !imgEl.dataset.triedUc) {
      imgEl.dataset.triedUc = 'true'
      imgEl.src = `https://drive.google.com/uc?export=view&id=${driveId}`
      return
    }
    imgEl.src = fallbackUrl
  }
}

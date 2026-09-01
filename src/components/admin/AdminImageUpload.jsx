import { useState, useRef } from 'react'
import { driveStorage } from '../../services/driveStorage'
import { extractGoogleDriveId, getGoogleDriveCDNUrl } from '../../utils/imageOptimizer'

/**
 * Universal Admin Image Uploader
 * Provides 3 full options on every image field:
 * 1. Direct File Upload (Uploads to Google Drive if configured, else Firestore base64 with compression)
 * 2. Google Drive URL / Direct Web Image URL Input
 * 3. Live Image Preview with Link Test & Format Detection
 */
export default function AdminImageUpload({
  value = '',
  onChange,
  label = 'Image',
  subFolderName = 'nermai-uploads',
  maxWidth = 1600,
  quality = 0.85,
  hint = '',
  placeholder = 'Paste Google Drive URL / File ID or Web Image URL...',
  previewHeight = 140,
  aspectRatio = 'auto',
  toast
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const config = driveStorage.getConfig()
  const isDriveConfigured = !!config.appsScriptUrl || !!config.accessToken

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      if (toast) toast.error('Please select a valid image file (PNG, JPG, WebP)')
      return
    }
    setUploading(true)
    setProgress(20)
    setImgError(false)

    try {
      const result = await driveStorage.processAndUploadImage(file, {
        subFolderName,
        maxWidth,
        quality
      })
      setProgress(90)
      onChange(result.url)
      
      const storageLabel = result.storageType === 'google_drive' ? 'Google Drive' : 'Local Storage'
      if (toast) {
        toast.success(`Image uploaded to ${storageLabel}! (${result.reductionPct || 0}% compressed)`)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      if (toast) toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (e) => {
    const rawVal = e.target.value
    setImgError(false)
    onChange(rawVal)
  }

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (toast) toast.info('Image URL copied to clipboard')
  }

  const handleClear = () => {
    onChange('')
    setImgError(false)
  }

  // Format preview URL
  const previewUrl = driveStorage.formatImageUrl(value) || value
  const driveId = extractGoogleDriveId(value)
  const isDriveLink = !!driveId
  const isBase64 = typeof value === 'string' && value.startsWith('data:')

  // Direct test link for user to verify
  let testUrl = value
  if (driveId) {
    testUrl = `https://drive.google.com/file/d/${driveId}/view`
  }

  return (
    <div className="ap-image-upload-wrapper" style={{
      background: 'var(--gray-50, #f8fafc)',
      border: '1.5px solid var(--gray-200, #e2e8f0)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.25rem'
    }}>
      {/* Header with Label & Dimension / Source Hints */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-image" style={{ color: 'var(--maroon, #7b1b2e)', fontSize: '0.9rem' }} />
          <strong style={{ fontSize: '0.85rem', color: 'var(--ink, #1e293b)' }}>{label}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hint && (
            <span style={{
              fontSize: '0.7rem',
              background: 'rgba(0,0,0,0.06)',
              color: 'var(--gray-600, #475569)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: 500
            }}>
              {hint}
            </span>
          )}

          <span style={{
            fontSize: '0.7rem',
            background: isDriveConfigured ? '#dcfce7' : '#fef3c7',
            color: isDriveConfigured ? '#166534' : '#92400e',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <i className={isDriveConfigured ? 'fa-brands fa-google-drive' : 'fa-solid fa-floppy-disk'} />
            {isDriveConfigured ? 'Drive Auto-Upload' : 'Firestore Base64'}
          </span>
        </div>
      </div>

      {/* Option 1: File Drop Zone */}
      <div
        className={`ap-file-drop ${dragOver ? 'drag-over' : ''}`}
        style={{
          border: '2px dashed var(--gray-300, #cbd5e1)',
          borderRadius: '6px',
          padding: '1rem 0.75rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(230, 92, 0, 0.05)' : '#ffffff',
          transition: 'all 0.2s ease',
          marginBottom: '0.75rem'
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0])
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}
          style={{ fontSize: '1.4rem', color: uploading ? 'var(--saffron, #e65c00)' : 'var(--gray-400, #94a3b8)', marginBottom: '0.35rem', display: 'block' }}
        />
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink, #1e293b)' }}>
          {uploading ? `Uploading & Optimizing... ${progress}%` : '📁 Click to Browse or Drag Photo Here'}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400, #94a3b8)', marginTop: '2px' }}>
          {isDriveConfigured ? 'Directly uploads to Google Drive with automatic CDN link' : 'Uploads & compresses into instant local storage'}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files?.[0]) handleFileUpload(e.target.files[0])
          }}
        />

        {uploading && (
          <div className="ap-upload-progress" style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: '0.5rem', overflow: 'hidden' }}>
            <div className="ap-upload-progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #e65c00, #7b1b2e)', transition: 'width 0.3s' }} />
          </div>
        )}
      </div>

      {/* Option 2: Google Drive / Image URL Input */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600, #475569)' }}>
            🔗 Or Paste Google Drive Link / Web URL / File ID:
          </label>
          {isDriveLink && (
            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>
              <i className="fa-solid fa-circle-check" /> Google Drive Link Detected
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="ap-input"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder={placeholder}
            style={{ fontSize: '0.82rem', flex: 1 }}
          />
          {value && (
            <button
              type="button"
              className="ap-btn ap-btn-danger ap-btn-sm"
              onClick={handleClear}
              title="Clear Image"
              style={{ padding: '0 0.6rem' }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* Option 3: Live Image & Link Preview */}
      {value ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--gray-200, #e2e8f0)',
          borderRadius: '6px',
          padding: '0.75rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Image Thumbnail Box */}
          <div style={{
            width: aspectRatio === '16/5' ? '140px' : (aspectRatio === '3/4' ? '75px' : '90px'),
            height: previewHeight,
            maxHeight: previewHeight,
            borderRadius: '4px',
            overflow: 'hidden',
            background: '#f1f5f9',
            border: '1px solid var(--gray-300, #cbd5e1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0
          }}>
            {!imgError ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: aspectRatio === 'contain' ? 'contain' : 'cover' }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '0.5rem', color: '#dc2626' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.65rem' }}>Failed to load</div>
              </div>
            )}
          </div>

          {/* Details & Action Controls */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: imgError ? '#dc2626' : '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <i className={`fa-solid ${imgError ? 'fa-circle-xmark' : 'fa-circle-check'}`} />
                {imgError ? 'Image Not Accessible' : 'Image Active & Ready'}
              </span>

              {isDriveLink && (
                <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  Google Drive CDN
                </span>
              )}
              {isBase64 && (
                <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                  Base64 Data
                </span>
              )}
            </div>

            {/* URL String Snippet */}
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--gray-500, #64748b)',
              fontFamily: 'var(--font-mono, monospace)',
              wordBreak: 'break-all',
              maxHeight: '38px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '0.6rem'
            }}>
              {value.startsWith('data:') ? `data:image/... (${Math.round(value.length / 1024)} KB)` : value}
            </div>

            {/* Actions: Open in new tab + Copy */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {!value.startsWith('data:') && (
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ap-btn ap-btn-ghost ap-btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                  Test / Open Link
                </a>
              )}

              <button
                type="button"
                className="ap-btn ap-btn-ghost ap-btn-sm"
                onClick={handleCopy}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400, #94a3b8)', fontStyle: 'italic', padding: '0.25rem 0' }}>
          No image uploaded yet. Use the upload zone or paste a link above.
        </div>
      )}
    </div>
  )
}

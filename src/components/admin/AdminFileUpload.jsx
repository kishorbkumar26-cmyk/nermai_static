import { useState, useRef } from 'react'
import { driveStorage } from '../../services/driveStorage'
import { extractGoogleDriveId, getGoogleDriveCDNUrl } from '../../utils/imageOptimizer'

/**
 * Universal Admin File Uploader
 * 1. Direct File Upload (Uploads to Google Drive if configured, else local base64)
 * 2. Google Drive URL / Direct Web URL Input
 */
export default function AdminFileUpload({
  value = '',
  onChange,
  label = 'File',
  subFolderName = 'nermai-uploads',
  hint = '',
  placeholder = 'Paste Google Drive URL / File ID or Web URL...',
  toast
}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const config = driveStorage.getConfig()
  const isDriveConfigured = !!config.appsScriptUrl || !!config.accessToken

  const handleFileUpload = async (file) => {
    if (!file) return
    setUploading(true)
    setProgress(20)
    setFileError(false)

    try {
      const result = await driveStorage.processAndUploadFile(file, {
        subFolderName
      })
      setProgress(90)
      onChange(result.url)
      if (toast) toast.success('File uploaded and linked successfully!')
    } catch (err) {
      console.error(err)
      if (toast) toast.error('Upload failed: ' + err.message)
    } finally {
      setProgress(100)
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleUrlChange = (e) => {
    const rawVal = e.target.value
    setFileError(false)
    onChange(rawVal)
  }

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (toast) toast.info('URL copied to clipboard')
  }

  const handleClear = () => {
    onChange('')
    setFileError(false)
  }

  const driveId = extractGoogleDriveId(value)
  const isDriveLink = !!driveId
  const isBase64 = typeof value === 'string' && value.startsWith('data:')

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-file" style={{ color: 'var(--maroon, #7b1b2e)', fontSize: '0.9rem' }} />
          <strong style={{ fontSize: '0.85rem', color: 'var(--ink, #1e293b)' }}>{label}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {hint && (
            <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.06)', color: 'var(--gray-600, #475569)', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
              {hint}
            </span>
          )}
          <span style={{
            fontSize: '0.7rem', background: isDriveConfigured ? '#dcfce7' : '#fef3c7', color: isDriveConfigured ? '#166534' : '#92400e',
            padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px'
          }}>
            <i className={isDriveConfigured ? 'fa-brands fa-google-drive' : 'fa-solid fa-floppy-disk'} />
            {isDriveConfigured ? 'Drive Auto-Upload' : 'Firestore Base64'}
          </span>
        </div>
      </div>

      <div
        className={`ap-file-drop ${dragOver ? 'drag-over' : ''}`}
        style={{
          border: '2px dashed var(--gray-300)', borderRadius: '6px',
          padding: '0', textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(230,92,0,0.05)' : 'var(--white)',
          transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
        onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} style={{ display: 'none' }} />
        {uploading ? (
          <div style={{ padding: '2rem' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--saffron)', fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
            <div>Uploading... {progress}%</div>
          </div>
        ) : (
          <div style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--saffron)' }}>
              <i className="fa-regular fa-folder-open"></i>
            </div>
            <div style={{ fontWeight: 600 }}>Click to Browse or Drag File Here</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
              {isDriveConfigured ? 'Directly uploads to Google Drive with automatic link' : 'Saves file in database as base64'}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <i className="fa-solid fa-link" style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}></i>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)' }}>Or Paste Google Drive Link / Web URL / File ID:</span>
          {isDriveLink && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600 }}>Google Drive Link Detected</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input className="ap-input" style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }} placeholder={placeholder} value={value} onChange={handleUrlChange} />
          {value && (
            <button className="ap-btn ap-btn-danger" style={{ padding: '0 1rem' }} onClick={handleClear} title="Clear Image">
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {value && (
        <div style={{ marginTop: '0.75rem', padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: '6px', background: 'var(--white)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-regular fa-file-lines" style={{ fontSize: '2rem', color: 'var(--gray-500)' }}></i>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-check-circle"></i> File Linked Successfully
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', wordBreak: 'break-all', fontFamily: 'monospace', marginBottom: '1rem' }}>
                {value}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="ap-btn ap-btn-outline ap-btn-sm" onClick={() => window.open(testUrl, '_blank')}>
                  Test / Open Link
                </button>
                <button className="ap-btn ap-btn-outline ap-btn-sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function NoticesTicker() {
  const [notices, setNotices] = useState([])
  const trackRef = useRef(null)

  useEffect(() => {
    const unsub = fbFirestore.onNoticesChanged(items => setNotices(items))
    return () => unsub()
  }, [])

  if (!notices.length) return null

  // Duplicate for seamless loop
  const doubled = [...notices, ...notices]

  return (
    <div className="notice-ticker" aria-label="Latest notices">
      <div className="notice-ticker-label">
        <i className="fa-solid fa-bell"></i>
        Notices
      </div>
      <div className="notice-ticker-track">
        <div className="notice-ticker-inner" ref={trackRef}>
          {doubled.map((n, idx) => (
            <span key={`${n.id}-${idx}`} className="notice-ticker-item">
              <span className="notice-ticker-dot"></span>
              {n.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function NoticesBoard() {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    const unsub = fbFirestore.onNoticesChanged(items => setNotices(items))
    return () => unsub()
  }, [])

  return (
    <section className="notices-section section" id="notices">
      <div className="container">
        <div className="notices-grid">
          {/* Sidebar */}
          <div className="notices-sidebar reveal">
            <span className="eyebrow">📢 Notices</span>
            <h2 className="heading-xl" style={{ marginTop: '0.75rem' }}>
              Latest<br />
              <span style={{ color: 'var(--gold-light)' }}>Announcements</span>
            </h2>
            <p style={{ marginTop: '1rem' }}>
              Latest notifications, cut-off marks, and important information for TNPSC, UPSC and all government job exams.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-saffron">
                <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', marginRight: '4px' }}></i>
                High Priority
              </span>
              <span className="badge badge-gold">Normal</span>
            </div>
          </div>

          {/* Notices list */}
          <div className="notices-list reveal" style={{ transitionDelay: '0.1s' }}>
            {notices.length === 0 ? (
              <div style={{ color: 'rgba(253,246,236,0.4)', textAlign: 'center', padding: '3rem' }}>
                <i className="fa-solid fa-bell" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
                <p>Add announcements via Admin panel</p>
              </div>
            ) : (
              notices.map(notice => (
                <article key={notice.id} className="notice-card">
                  <div
                    className={`notice-priority-bar notice-priority-${notice.priority || 'normal'}`}
                  ></div>
                  <div className="notice-card-body">
                    <h3 className="notice-card-title">{notice.title}</h3>
                    {notice.content && (
                      <p className="notice-card-content">{notice.content}</p>
                    )}
                    {notice.date && (
                      <div className="notice-card-date">
                        <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>
                        {notice.date}
                      </div>
                    )}
                  </div>
                  {notice.priority === 'high' && (
                    <i className="fa-solid fa-fire" style={{ color: 'var(--saffron)', fontSize: '1.1rem', flexShrink: 0 }}></i>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

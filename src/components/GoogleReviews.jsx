import { useEffect } from 'react'
import './GoogleReviews.css'

// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR ELFSIGHT WIDGET ID HERE
// Get it free at: https://elfsight.com/google-reviews-widget/
// It looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
// ─────────────────────────────────────────────────────────────────────────────
const ELFSIGHT_WIDGET_ID = '443dda56-77aa-4319-a3ad-fed0f60d388d'

export default function GoogleReviews() {
  useEffect(() => {
    // Load Elfsight platform script once
    if (!document.querySelector('script[src*="elfsightcdn.com"]')) {
      const script = document.createElement('script')
      script.src   = 'https://elfsightcdn.com/platform.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Don't render until the widget ID is configured
  if (!ELFSIGHT_WIDGET_ID || ELFSIGHT_WIDGET_ID === 'YOUR_WIDGET_ID_HERE') {
    return null
  }

  return (
    <section
      className="google-reviews-section"
      id="google-reviews"
      aria-label="Google Reviews for Nermai IAS Academy"
    >
      <div className="container" style={{ maxWidth: '1280px' }}>

        {/* Section Header */}
        <div className="gr-header">
          <div className="gr-top-tag">
            <span className="tag-line" />
            <span className="tag-text">STUDENT REVIEWS</span>
            <span className="tag-line" />
          </div>
          <h2 className="gr-main-title">What Our Students Say</h2>
          <p className="gr-subtitle">
            Real reviews from real aspirants — verified on Google.
          </p>
        </div>

        {/* Elfsight Google Reviews Widget */}
        <div className="gr-widget-wrap">
          <div
            className={`elfsight-app-${ELFSIGHT_WIDGET_ID}`}
            data-elfsight-app-lazy
          />
        </div>

      </div>
    </section>
  )
}

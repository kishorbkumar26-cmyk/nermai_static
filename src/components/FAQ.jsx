import React, { useState } from 'react'

const FAQS = [
  {
    q: 'Nermai எந்த தேர்வுகளுக்கான பயிற்சி வழங்குகிறது?',
    a: 'TNPSC (Group I, II, IV), UPSC, TN Police (SI, PC), மற்றும் Banking (IBPS, SBI) போன்ற போட்டித் தேர்வுகளுக்கான விரிவான பயிற்சி வழங்கப்படுகிறது.'
  },
  {
    q: 'வகுப்புகள் ஆன்லைனிலா?',
    a: 'ஆம், Nermai Class Platform மூலம் சிறந்த ஆன்லைன் learning experience வழங்கப்படுகிறது. நீங்கள் எங்கிருந்தும் வகுப்புகளில் கலந்து கொள்ளலாம்.'
  },
  {
    q: 'எப்படி சேருவது?',
    a: 'இணையதளத்தில் உள்ள "JOIN NERMAI" button மூலம் Class Platform-க்கு சென்று உங்களை பதிவு செய்து கொள்ளலாம்.'
  },
  {
    q: 'Study materials கிடைக்குமா?',
    a: 'ஆம், உங்கள் தேர்வுக்கேற்ப பிரத்யேகமான learning materials, handouts மற்றும் revision notes வழங்கப்படும்.'
  }
]

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section className="faq-section section" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="container-narrow">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 className="section-title">அடிக்கடி கேட்கப்படும் கேள்விகள்</h2>
        </div>

        <div className="faq-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="faq-item reveal"
              style={{ 
                backgroundColor: 'var(--white)', 
                border: '1px solid var(--gray-200)', 
                borderRadius: 'var(--radius)',
                overflow: 'hidden'
              }}
            >
              <button 
                className="faq-question"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: 'var(--space-5)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: openIdx === i ? 'var(--saffron)' : 'var(--ink)'
                }}
              >
                {faq.q}
                <i className={`fa-solid fa-chevron-${openIdx === i ? 'up' : 'down'}`} style={{ color: 'var(--gray-400)' }}></i>
              </button>
              
              <div 
                className="faq-answer"
                style={{
                  maxHeight: openIdx === i ? '200px' : '0',
                  padding: openIdx === i ? '0 var(--space-5) var(--space-5)' : '0 var(--space-5)',
                  opacity: openIdx === i ? 1 : 0,
                  transition: 'all 0.3s ease',
                  color: 'var(--gray-600)',
                  lineHeight: 1.6
                }}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

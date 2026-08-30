import React, { useState } from 'react'

export const HOME_FAQS = [
  {
    q: 'Nermai எந்த தேர்வுகளுக்கான பயிற்சி வழங்குகிறது?',
    a: 'TNPSC (Group I, II, IV, VAO), UPSC Civil Services, TN Police (SI, PC), Banking (IBPS, SBI, RBI), Puducherry Government Exams மற்றும் SSC போன்ற போட்டித் தேர்வுகளுக்கான விரிவான பயிற்சி வழங்கப்படுகிறது.'
  },
  {
    q: 'வகுப்புகள் ஆன்லைனிலா, offline-லா?',
    a: 'Nermai Class Platform மூலம் சிறந்த ஆன்லைன் learning experience வழங்கப்படுகிறது. நீங்கள் எங்கிருந்தும், எந்த நேரமும் வகுப்புகளில் கலந்து கொள்ளலாம்.'
  },
  {
    q: 'எப்படி சேருவது?',
    a: 'தலைப்பில் உள்ள "Enroll / Login" button மூலம் Class Platform-க்கு சென்று பதிவு செய்து கொள்ளலாம். எந்த ஒரு கேள்வியும் இருந்தால் WhatsApp அல்லது Contact Us பக்கம் மூலம் தொடர்பு கொள்ளவும்.'
  },
  {
    q: 'Study materials கிடைக்குமா?',
    a: 'ஆம். உங்கள் தேர்வுக்கேற்ப பிரத்யேகமான study materials, handouts, previous year papers மற்றும் revision notes வழங்கப்படும்.'
  },
  {
    q: 'கட்டணம் எவ்வளவு?',
    a: 'கட்டணம் course மற்றும் batch-ஐ பொறுத்து மாறுபடும். விரிவான கட்டண விவரங்களுக்கு எங்கள் Class Platform-ஐ பார்வையிடவும் அல்லது நேரடியாக தொடர்பு கொள்ளவும்.'
  },
]

export default function FAQ({ faqs = HOME_FAQS, eyebrow = 'FAQ', title = <>அடிக்கடி கேட்கப்படும்<br />கேள்விகள்</> }) {
  const [openIdx, setOpenIdx] = useState(0)

  if (!faqs || faqs.length === 0) return null

  return (
    <section className="faq-section section" style={{ background: 'var(--cream)' }}>
      <div className="container-narrow">
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="section-title" style={{ marginTop: 'var(--space-3)' }}>
            {title}
          </h2>
        </div>

        <div className="faq-list-v2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item-v2${openIdx === i ? ' open' : ''}`}
            >
              <button
                className="faq-q-v2"
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                aria-expanded={openIdx === i}
              >
                <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q-text">{faq.q}</span>
                <span className="faq-toggle-icon">
                  <i className={`fa-solid fa-${openIdx === i ? 'minus' : 'plus'}`} />
                </span>
              </button>
              <div className="faq-a-v2" style={{ maxHeight: openIdx === i ? '400px' : '0' }}>
                <div className="faq-a-inner">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

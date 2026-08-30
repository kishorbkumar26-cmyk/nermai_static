import { useState } from 'react'

const EXAM_DATA = {
  'TNPSC': [
    { icon: '🏛️', title: 'Group I', sub: 'Deputy Collector', desc: 'IAS/IPS-நிலையிலான தமிழ்நாடு அரசு பதவிகளுக்கான முதல்நிலை தேர்வு. Mains + Interview.', batches: '2 batches open' },
    { icon: '⚖️', title: 'Group II', sub: 'Revenue Officer', desc: 'Revenue Officer, Sub-Registrar, Commercial Tax Inspector போன்ற பதவிகள். Direct Recruitment.', batches: '3 batches open' },
    { icon: '📋', title: 'Group IV', sub: 'Junior Assistant', desc: 'வாலியாஸ், Typist, Steno-Typist, Junior Assistant பதவிகள். அதிக வேலைவாய்ப்பு.', batches: '5 batches open' },
    { icon: '🧑‍💼', title: 'CCSE', sub: 'Combined Civil Services', desc: 'Group I, II, IIA, IV அனைத்தையும் உள்ளடக்கிய கூட்டு தேர்வு. Comprehensive preparation.', batches: '2 batches open' }
  ],
  'UPSC': [
    { icon: '🇮🇳', title: 'CSE Prelims', sub: 'Civil Services', desc: 'IAS, IPS, IFS மற்றும் மத்திய அரசு சேவைகளுக்கான ஆரம்ப தேர்வு. GS + CSAT.', batches: '2 batches open' },
    { icon: '📚', title: 'CSE Mains', sub: 'Written Exam', desc: 'தமிழ் மொழி வழியில் GS Papers I-IV, Essay, Optional Subject preparation.', batches: '1 batch open' },
    { icon: '🎤', title: 'Interview', sub: 'Personality Test', desc: 'Mock interview, current affairs briefing, personality development training.', batches: 'Rolling' }
  ],
  'TN Police': [
    { icon: '👮', title: 'Constable', sub: 'TN Police', desc: 'உடல் தகுதி + Written Exam. GK, Tamil, Maths, Science coverage.', batches: '4 batches open' },
    { icon: '🌟', title: 'Sub Inspector', sub: 'SI Exam', desc: 'Sub Inspector of Police தேர்வுக்கான intensive preparation with Physical Training guidance.', batches: '2 batches open' }
  ],
  'Banking': [
    { icon: '🏦', title: 'IBPS PO/Clerk', sub: 'Bank Exams', desc: 'Quantitative Aptitude, Reasoning, English, GK preparation. Daily mock tests.', batches: '3 batches open' },
    { icon: '💳', title: 'SBI Exams', sub: 'State Bank', desc: 'SBI PO, SBI Clerk, SBI SO — all-in-one banking exam preparation module.', batches: '2 batches open' }
  ]
}

export default function ExamCategories() {
  const [activeTab, setActiveTab] = useState('TNPSC')
  const cards = EXAM_DATA[activeTab] || []

  return (
    <section className="exams-section section" id="exams">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">📖 தேர்வு வகைகள்</span>
          <h2 className="section-title">எந்த தேர்வுக்கு<br />தயாராகிறீர்கள்?</h2>
          <p className="section-desc">
            TNPSC முதல் UPSC வரை — அனைத்து அரசு வேலை தேர்வுகளுக்கும்
            தமிழ் வழியில் தரமான பயிற்சி.
          </p>
        </div>

        {/* Tabs */}
        <div className="exam-tabs" role="tablist">
          {Object.keys(EXAM_DATA).map(tab => (
            <button
              key={tab}
              className={`exam-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="exam-grid">
          {cards.map((card, i) => (
            <div
              key={i}
              className="exam-card reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="exam-card-icon">{card.icon}</div>
              <div className="exam-card-title">{card.title}</div>
              <div className="exam-card-subtitle">{card.sub}</div>
              <p className="exam-card-desc">{card.desc}</p>
              <div className="exam-card-footer">
                <span className="exam-card-batches">
                  <i className="fa-solid fa-users" style={{ marginRight: '4px' }}></i>
                  {card.batches}
                </span>
                <button className="btn btn-outline btn-sm">
                  பதிவு செய் <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'

const EXAM_DATA = {
  'TNPSC': [
    { icon: '🏛️', title: 'Group I', sub: 'Deputy Collector', desc: 'Premier Tamil Nadu state civil services examination. Prelims, Mains & Interview preparation.', batches: '2 batches open' },
    { icon: '⚖️', title: 'Group II', sub: 'Revenue Officer', desc: 'Revenue Officer, Sub-Registrar, Commercial Tax Inspector posts. Direct Recruitment & Mains.', batches: '3 batches open' },
    { icon: '📋', title: 'Group IV', sub: 'Junior Assistant', desc: 'VAO, Typist, Steno-Typist, Junior Assistant posts. High vacancy career entry point.', batches: '5 batches open' },
    { icon: '🧑‍💼', title: 'CCSE', sub: 'Combined Civil Services', desc: 'Combined exam covering Group I, II, IIA & IV. Comprehensive structured syllabus coverage.', batches: '2 batches open' }
  ],
  'UPSC': [
    { icon: '🇮🇳', title: 'CSE Prelims', sub: 'Civil Services', desc: 'Preliminary exam for IAS, IPS, IFS & Central Civil Services. Comprehensive GS & CSAT modules.', batches: '2 batches open' },
    { icon: '📚', title: 'CSE Mains', sub: 'Written Exam', desc: 'Comprehensive GS Papers I-IV, Essay writing, and Optional Subject mentoring.', batches: '1 batch open' },
    { icon: '🎤', title: 'Interview', sub: 'Personality Test', desc: 'Mock interview panels, current affairs briefing & personality development sessions.', batches: 'Rolling' }
  ],
  'TN Police': [
    { icon: '👮', title: 'Constable', sub: 'TN Police', desc: 'Physical fitness guidance & written exam prep covering GK, General Science, Maths & Reasoning.', batches: '4 batches open' },
    { icon: '🌟', title: 'Sub Inspector', sub: 'SI Exam', desc: 'Sub Inspector of Police exam intensive preparation with physical test mentorship.', batches: '2 batches open' }
  ],
  'Banking': [
    { icon: '🏦', title: 'IBPS PO/Clerk', sub: 'Bank Exams', desc: 'Quantitative Aptitude, Reasoning, English & Banking Awareness. Daily mock test practice.', batches: '3 batches open' },
    { icon: '💳', title: 'SBI Exams', sub: 'State Bank', desc: 'SBI PO, SBI Clerk & SBI SO — complete all-in-one banking exam preparation program.', batches: '2 batches open' }
  ]
}

export default function ExamCategories() {
  const [activeTab, setActiveTab] = useState('TNPSC')
  const cards = EXAM_DATA[activeTab] || []

  return (
    <section className="exams-section section" id="exams">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">📖 Exam Categories</span>
          <h2 className="section-title">Which exam are you<br />preparing for?</h2>
          <p className="section-desc">
            From TNPSC to UPSC — for all government exams
            Quality training in Tamil medium.
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
                  Enroll <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

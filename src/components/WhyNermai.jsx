import React from 'react'

const REASONS = [
  { num: '01', title: 'Tamil Medium Training', desc: 'Competitive exam preparation uniquely designed and delivered for Tamil-medium aspirants to ensure crystal-clear conceptual understanding. Your language is your strength — we build on it.' },
  { num: '02', title: 'Structured Curriculum', desc: 'Highly structured learning modules strictly based on the latest examination requirements and syllabus updates. Every session is mapped to the exam blueprint so no time is wasted.' },
  { num: '03', title: 'Rigorous Exam Practice', desc: 'Regular full-length mock tests, daily practice sets, and granular post-test evaluations to consistently measure and sharpen your preparation across every section.' },
  { num: '04', title: 'Continuous Guidance', desc: 'Consistent academic guidance, personal mentorship, and psychological support throughout your demanding preparation journey. You are never alone in this process.' }
]

export default function WhyNermai() {
  return (
    <section className="why-section section" id="why-nermai" style={{ backgroundColor: 'var(--maroon-deep)', color: 'var(--cream)' }}>
      <div className="container">
        <div style={{ marginBottom: 'clamp(3rem,6vw,6rem)' }}>
          <span className="eyebrow" style={{ color: 'var(--saffron)', display: 'block', marginBottom: '1rem' }}>THE DIFFERENCE</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4.5rem)', color: '#fff', lineHeight: 1.1, margin: 0, maxWidth: '14ch' }}>
            Why Choose<br /><em style={{ fontStyle: 'normal', color: 'var(--saffron)' }}>Nermai?</em>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {REASONS.map((r, i) => (
            <div key={r.num} className="reveal why-editorial-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem,4vw,5rem)', padding: 'clamp(2.5rem,4vw,4rem) 0', borderTop: '1px solid rgba(255,255,255,0.1)', alignItems: 'center', position: 'relative' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: i % 2 === 0 ? '-0.1em' : 'auto', right: i % 2 !== 0 ? '-0.1em' : 'auto', transform: 'translateY(-50%)', fontSize: 'clamp(6rem,14vw,12rem)', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                {r.num}
              </div>
              <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--saffron)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>{r.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,3vw,2.75rem)', color: '#fff', margin: 0, lineHeight: 1.2 }}>{r.title}</h3>
              </div>
              <div style={{ order: i % 2 === 0 ? 1 : 0 }}>
                <p style={{ fontSize: 'clamp(1rem,1.2vw,1.15rem)', color: 'rgba(253,246,236,0.65)', lineHeight: 1.8, margin: 0, maxWidth: '480px' }}>{r.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) {
          .why-editorial-row { grid-template-columns: 1fr !important; }
          .why-editorial-row > div { order: unset !important; }
        }
      `}</style>
    </section>
  )
}

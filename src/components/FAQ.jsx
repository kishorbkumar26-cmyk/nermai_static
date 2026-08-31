import React, { useState } from 'react'

export const HOME_FAQS = [
  {
    q: 'What exams does Nermai provide training for?',
    a: 'We provide comprehensive training for competitive exams like TNPSC (Group I, II, IV, VAO), UPSC Civil Services, TN Police (SI, PC), Banking (IBPS, SBI, RBI), Puducherry Government Exams, and SSC.'
  },
  {
    q: 'Are the classes online or offline?',
    a: 'Nermai provides a great online learning experience through our Class Platform. You can attend classes from anywhere, at any time.'
  },
  {
    q: 'How to enroll?',
    a: 'You can register by going to the Class Platform via the "Enroll / Login" button at the top. For any queries, contact us via WhatsApp or the Contact Us page.'
  },
  {
    q: 'Will study materials be provided?',
    a: 'Yes. Exclusive study materials, handouts, previous year papers, and revision notes tailored to your exam will be provided.'
  },
  {
    q: 'What are the fees?',
    a: 'Fees vary depending on the course and batch. Visit our Class Platform or contact us directly for detailed fee structures.'
  },
]

export default function FAQ({ faqs = HOME_FAQS, eyebrow = 'FAQ', title = <>Frequently Asked<br />Questions</> }) {
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

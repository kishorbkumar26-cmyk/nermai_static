import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { fbFirestore } from '../firebase/firestore'

const DEFAULT_FAQS = [
  {
    id: 'general',
    topic: 'General',
    items: [
      { q: 'What exams does Nermai provide training for?', a: 'We provide comprehensive training for TNPSC (Group I, II, IV, VAO), UPSC Civil Services, TN Police (SI, PC), Banking (IBPS, SBI, RBI), Puducherry Government Exams, and SSC.' },
      { q: 'Are the classes online or offline?', a: 'Nermai provides both online and offline learning experiences. You can attend classes from our center or via our digital platform anytime.' },
      { q: 'How to enroll?', a: 'Click the "Enroll / Login" button at the top to access our Class Platform. For queries, contact us via WhatsApp or the Contact Us page.' },
    ]
  },
  {
    id: 'courses',
    topic: 'Courses & Fees',
    items: [
      { q: 'Will study materials be provided?', a: 'Yes. Exclusive study materials, handouts, previous year papers, and revision notes tailored to your exam will be provided.' },
      { q: 'What are the fees?', a: 'Fees vary depending on the course and batch. Visit our Class Platform or contact us directly for detailed fee structures.' },
      { q: 'Are there any scholarships available?', a: 'Yes, merit-based fee concessions are available. Please contact us directly for details.' },
    ]
  },
  {
    id: 'logistics',
    topic: 'Batches & Schedule',
    items: [
      { q: 'What are the batch timings?', a: 'We offer morning and evening batches to accommodate working professionals and students. Specific timings are published on our platform.' },
      { q: 'Can I switch batches?', a: 'Yes, batch transfers are possible based on availability. Please contact the admin at our center.' },
    ]
  },
]

/* ── Accordion Item ─────────────────────────────────────────── */
function AccordionItem({ faq, isOpen, onToggle, index }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
          padding: 'clamp(1.25rem,2vw,1.75rem) 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            fontWeight: 700,
            color: isOpen ? 'var(--saffron)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            transition: 'color 0.3s',
            flexShrink: 0,
            minWidth: '2em',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontSize: 'clamp(1rem,1.5vw,1.15rem)',
            fontWeight: 600,
            color: isOpen ? '#fff' : 'rgba(253,246,236,0.8)',
            transition: 'color 0.3s',
            lineHeight: 1.4,
          }}>
            {faq.q}
          </span>
        </div>
        <span style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `1.5px solid ${isOpen ? 'var(--saffron)' : 'rgba(255,255,255,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.3s',
          background: isOpen ? 'var(--saffron)' : 'transparent',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
        }}>
          <i className="fa-solid fa-plus" style={{ fontSize: '0.7rem', color: isOpen ? '#fff' : 'rgba(255,255,255,0.5)' }} />
        </span>
      </button>
      <div
        ref={bodyRef}
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <p style={{
          fontSize: '0.97rem',
          lineHeight: 1.85,
          color: 'rgba(253,246,236,0.6)',
          padding: '0 0 1.75rem calc(2em + 1.25rem)',
          margin: 0,
        }}>
          {faq.a}
        </p>
      </div>
    </div>
  )
}

/* ── FAQ Page ───────────────────────────────────────────────── */
export default function FaqPage() {
  const [topics, setTopics] = useState(DEFAULT_FAQS)
  const [activeTopic, setActiveTopic] = useState(null)
  const [openIdx, setOpenIdx] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fbFirestore.getFaqs().then(data => {
      if (data && data.length > 0) {
        setTopics(data)
        setActiveTopic(data[0]?.id || null)
      } else {
        setActiveTopic(DEFAULT_FAQS[0].id)
      }
      setLoading(false)
    }).catch(() => {
      setActiveTopic(DEFAULT_FAQS[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (topics.length > 0 && !activeTopic) {
      setActiveTopic(topics[0]?.id)
    }
  }, [topics])

  const activeTopicData = topics.find(t => t.id === activeTopic)

  return (
    <>
      <Header />
      <main style={{ paddingTop: '72px', background: 'var(--maroon-deep)', minHeight: '100svh' }}>

        {/* ── Hero ── */}
        <section style={{ padding: 'clamp(4rem,8vw,8rem) 1.5rem clamp(3rem,5vw,5rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: 'var(--saffron)',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}>
              HELP CENTER
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem,6vw,5rem)',
              color: '#fff',
              margin: '0 0 1.5rem',
              lineHeight: 1.1,
            }}>
              Frequently Asked<br />
              <em style={{ fontStyle: 'normal', color: 'rgba(253,246,236,0.4)' }}>Questions.</em>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(253,246,236,0.55)', lineHeight: 1.75, margin: 0, maxWidth: 560 }}>
              Everything you need to know about Nermai IAS Academy, our courses, and the enrollment process.
            </p>
          </div>
        </section>

        {/* ── Body ── */}
        <section style={{ padding: 'clamp(3rem,5vw,5rem) 1.5rem clamp(4rem,8vw,8rem)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }} />
              </div>
            ) : (
              <>
                {/* Topic Pills */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  marginBottom: '3rem',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                }}>
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => { setActiveTopic(topic.id); setOpenIdx(null) }}
                      style={{
                        flexShrink: 0,
                        padding: '0.5rem 1.25rem',
                        borderRadius: '100px',
                        border: activeTopic === topic.id
                          ? '1.5px solid var(--saffron)'
                          : '1.5px solid rgba(255,255,255,0.15)',
                        background: activeTopic === topic.id
                          ? 'var(--saffron)'
                          : 'rgba(255,255,255,0.04)',
                        color: activeTopic === topic.id ? 'var(--maroon-deep)' : 'rgba(255,255,255,0.6)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {topic.topic}
                    </button>
                  ))}
                </div>

                {/* Topic Header */}
                {activeTopicData && (
                  <>
                    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', margin: 0 }}>
                        {activeTopicData.topic}
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', margin: '0.4rem 0 0' }}>
                        {activeTopicData.items.length} question{activeTopicData.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Accordion */}
                    <div>
                      {activeTopicData.items.map((faq, i) => (
                        <AccordionItem
                          key={i}
                          faq={faq}
                          index={i}
                          isOpen={openIdx === i}
                          onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                        />
                      ))}
                      {activeTopicData.items.length === 0 && (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', padding: '2rem 0' }}>No questions in this topic yet.</p>
                      )}
                    </div>
                  </>
                )}

                {/* CTA */}
                <div style={{ marginTop: '4rem', padding: '2.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem', fontSize: '0.97rem' }}>
                    Couldn't find what you're looking for?
                  </p>
                  <Link to="/contact" className="btn btn-primary" style={{ borderRadius: '100px' }}>
                    <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} />
                    Contact Us
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}


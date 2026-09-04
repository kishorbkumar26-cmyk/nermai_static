import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Courses from '../components/Courses'

export default function CoursesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', paddingBottom: '5rem', background: 'var(--color-bg, #FAF9F7)' }}>
        
        {/* Page Hero */}
        <section className="page-hero" style={{ 
          background: 'linear-gradient(135deg, var(--maroon, #7B1B2E) 0%, var(--maroon-deep, #4A0E1C) 100%)',
          color: '#FFFFFF',
          borderBottom: '3px solid var(--gold, #D4AF37)',
          boxShadow: '0 10px 30px rgba(123, 27, 46, 0.3)'
        }}>
          <div className="container" style={{ padding: '4.5rem 1.5rem 6.5rem 1.5rem', textAlign: 'center' }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', 
              marginBottom: '1.25rem', padding: '0.35rem 1.2rem', borderRadius: '100px',
              backgroundColor: 'rgba(212, 175, 55, 0.18)', border: '1px solid var(--gold, #D4AF37)',
              color: 'var(--gold-light, #F5D061)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}>
              ✨ ACADEMIC PROGRAMS & COURSES
            </span>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', color: '#FFFFFF' }}>
              Choose Your Path to Government Service
            </h1>
            <p style={{ maxWidth: '680px', margin: '0 auto', opacity: 0.9, lineHeight: 1.65, fontSize: '1.05rem' }}>
              Renowned coaching for UPSC (Civil Services), Puducherry UDC, LDC, Sub-Inspector, Deputy Tahsildar, TNPSC Group I/II/IV and other competitive examinations.
            </p>
          </div>
        </section>

        {/* Embedded Horizontal Courses Component */}
        <div style={{ marginTop: '-4.5rem' }}>
          <Courses hideHeader={true} layout="horizontal" />
        </div>
        
      </main>
      <Footer />
    </>
  )
}

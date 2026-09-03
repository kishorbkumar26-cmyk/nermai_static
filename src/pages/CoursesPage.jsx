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
      <main style={{ paddingTop: '80px', paddingBottom: '4rem', background: 'var(--color-bg, #FAF9F7)' }}>
        
        {/* Page Hero */}
        <section className="page-hero" style={{ backgroundColor: 'var(--color-primary, #A00001)', color: 'var(--color-surface, #fff)' }}>
          <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Choose Your Path to Government Service</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.85, lineHeight: 1.6 }}>Renowned coaching for UPSC (Civil Services), Puducherry UDC, LDC, Sub-Inspector, Deputy Tahsildar, TNPSC Group II and other competitive examinations.</p>
          </div>
        </section>

        {/* Embedded Courses Component */}
        <div style={{ marginTop: '-4rem' }}>
          <Courses hideHeader={true} />
        </div>
        
      </main>
      <Footer />
    </>
  )
}

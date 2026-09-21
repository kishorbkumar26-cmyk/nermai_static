import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CoursesHero from '../components/CoursesHero'
import Courses from '../components/Courses'

export default function CoursesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <Header />
      <main style={{ paddingTop: '75px', background: '#FFFDF9', minHeight: '100vh' }}>
        
        {/* Replicated High-Prestige Academic Courses Hero Banner */}
        <CoursesHero />

        {/* Course Filter Tabs & Course Cards (Preserves 100% course card design and filter logic) */}
        <div style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
          <Courses hideHeader={true} layout="horizontal" />
        </div>
        
      </main>
      <Footer />
    </>
  )
}

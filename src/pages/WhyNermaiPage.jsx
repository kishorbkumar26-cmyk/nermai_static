import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import WhyNermaiCard from '../components/WhyNermaiCard'
import { fbFirestore, DEFAULT_WHY_NERMAI } from '../firebase/firestore'

export default function WhyNermaiPage() {
  const [data, setData] = useState(DEFAULT_WHY_NERMAI)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Subscribe to real-time settings updates
    const unsubscribe = fbFirestore.onSettingsChanged((settings) => {
      if (settings?.whyNermai) {
        const storedPillars = Array.isArray(settings.whyNermai.pillars) && settings.whyNermai.pillars.length > 0
          ? settings.whyNermai.pillars
          : (Array.isArray(settings.whyNermai.points) && settings.whyNermai.points.length > 0
              ? settings.whyNermai.points.map(p => ({
                  id: p.id,
                  number: p.number,
                  icon: 'Trophy',
                  title: p.title,
                  desc: p.desc
                }))
              : DEFAULT_WHY_NERMAI.pillars)

        setData({
          ...DEFAULT_WHY_NERMAI,
          ...settings.whyNermai,
          pillars: storedPillars
        })
      } else {
        setData(DEFAULT_WHY_NERMAI)
      }
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  return (
    <>
      <Header />
      <main style={{ 
        paddingTop: '80px', 
        minHeight: 'calc(100vh - 350px)', 
        backgroundColor: '#FAF6EE', 
        width: '100%',
        margin: 0,
        padding: '80px 0 0 0',
        overflow: 'hidden'
      }}>
        <WhyNermaiCard data={data} />
      </main>
      <Footer />
    </>
  )
}

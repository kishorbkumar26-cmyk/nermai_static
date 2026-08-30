import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BannerSlide from './BannerSlide';
import BannerIndicators from './BannerIndicators';

// Mock config. This could eventually come from Firestore.
// Content is treated as part of the composition.
const DEFAULT_BANNERS = [
  {
    id: 'results',
    category: 'RESULTS 2026',
    title: 'OUR ASPIRANTS.\nOUR PRIDE.',
    stats: [
      { label: 'AIR 12', name: 'Student Name' },
      { label: 'AIR 47', name: 'Student Name' },
      { label: 'AIR 103', name: 'Student Name' }
    ],
    bgImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
    scene: 'results', // 3D depth on result cards
    layout: 'center' // Typography layout strategy
  },
  {
    id: 'admissions',
    category: 'UPSC CSE 2027',
    title: 'ADMISSIONS OPEN',
    subtitle: 'FOUNDATION PROGRAM\nPRELIMS • MAINS • INTERVIEW',
    ctaLabel: 'Enroll Now',
    ctaLink: '/courses',
    bgImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80',
    scene: 'admissions',
    layout: 'bottom-left'
  },
  {
    id: 'platform',
    category: 'NERMAI CLASS PLATFORM',
    title: 'LEARN. PRACTICE. IMPROVE.',
    subtitle: 'LIVE CLASSES • TESTS • MATERIALS • MENTORSHIP',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    scene: 'none',
    layout: 'center'
  }
];

export default function Hero({ banners = DEFAULT_BANNERS, autoPlayInterval = 8000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval]);

  if (!banners || banners.length === 0) return null;

  return (
    <section 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: 'calc(100vh - 80px)', // Full height minus navbar roughly
        minHeight: '600px',
        borderBottom: '4px solid var(--n-ink)',
        overflow: 'hidden'
      }}
    >
      <AnimatePresence mode="wait">
        <BannerSlide 
          key={banners[currentIndex].id} 
          banner={banners[currentIndex]} 
          isActive={true} 
        />
      </AnimatePresence>

      <BannerIndicators 
        total={banners.length} 
        current={currentIndex} 
        onChange={setCurrentIndex} 
      />
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BannerSlide from './BannerSlide';
import BannerIndicators from './BannerIndicators';

// Mock config. This could eventually come from Firestore.
const DEFAULT_BANNERS = [
  {
    id: 'admissions',
    eyebrow: 'UPSC CSE 2027',
    title: 'Admissions Open',
    subtitle: 'Build your preparation with discipline, guidance and purpose. The structured approach to cracking civil services.',
    ctaLabel: 'Enroll Now',
    ctaLink: '/courses',
    bgImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80',
    scene: 'admissions'
  },
  {
    id: 'results',
    eyebrow: 'Results 2026',
    title: 'Our Students. Our Pride.',
    subtitle: 'Consistently producing top ranks with our intensive preparation system.',
    ctaLabel: 'View Results',
    ctaLink: '/results',
    bgImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
    scene: 'results'
  },
  {
    id: 'platform',
    eyebrow: 'Nermai Class Platform',
    title: 'Learn. Practice. Improve.',
    subtitle: 'Experience our digital learning ecosystem designed for serious aspirants.',
    ctaLabel: 'Explore Platform',
    ctaLink: 'https://class.nermai.in',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    scene: 'none' // No 3D scene for this one
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
        height: '100vh',
        minHeight: '600px',
        borderBottom: '4px solid var(--n-ink)'
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

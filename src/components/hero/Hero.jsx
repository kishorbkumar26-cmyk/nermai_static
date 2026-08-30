import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BannerSlide from './BannerSlide';
import BannerIndicators from './BannerIndicators';
import { fbFirestore } from '../../firebase/firestore';
import { driveStorage } from '../../services/driveStorage';

// Fallback banners if admin has not uploaded any
const DEFAULT_BANNERS = [
  {
    id: 'results',
    bgImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
    scene: 'results', // Optional 3D enhancement layer
  },
  {
    id: 'admissions',
    bgImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80',
    scene: 'admissions',
  },
  {
    id: 'platform',
    bgImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80',
    scene: 'none',
  }
];

export default function Hero({ autoPlayInterval = 8000 }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = fbFirestore.onHeroSlidesChanged(items => {
      // Map the admin slides into the format our BannerSlide expects
      const formattedBanners = items.map(item => {
        const desktopUrl = driveStorage.formatImageUrl(item.urlDesktop || item.url);
        const mobileUrl = driveStorage.formatImageUrl(item.urlMobile || item.urlDesktop || item.url);
        return {
          id: item.id,
          bgImage: desktopUrl || mobileUrl,
          bgImageMobile: mobileUrl || desktopUrl,
          scene: item.scene || 'none', // Default to none if not configured in admin yet
          ctaLink: item.ctaLink // For clicking the banner if we want to add that
        };
      });
      setBanners(formattedBanners.length > 0 ? formattedBanners : DEFAULT_BANNERS);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="hero-banner-container">
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

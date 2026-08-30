import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import BannerSlide from './BannerSlide';
import BannerIndicators from './BannerIndicators';
import { fbFirestore } from '../../firebase/firestore';
import { driveStorage } from '../../services/driveStorage';

import HeroCinematicDefault from './HeroCinematicDefault';

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
      setBanners(formattedBanners);
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

  if (!banners || banners.length === 0) {
    return <HeroCinematicDefault />;
  }

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

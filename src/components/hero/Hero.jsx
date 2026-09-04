import React, { useState, useEffect } from 'react';
import BannerSlide from './BannerSlide';
import BannerIndicators from './BannerIndicators';
import { fbFirestore } from '../../firebase/firestore';
import { driveStorage } from '../../services/driveStorage';

import HeroCinematicDefault from './HeroCinematicDefault';

export default function Hero({ autoPlayInterval = 6000 }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = fbFirestore.onHeroSlidesChanged(items => {
      const formattedBanners = items.map(item => {
        const desktopUrl = driveStorage.formatImageUrl(item.urlDesktop || item.url);
        const mobileUrl = driveStorage.formatImageUrl(item.urlMobile || item.urlDesktop || item.url);
        return {
          id: item.id,
          bgImage: desktopUrl || mobileUrl,
          bgImageMobile: mobileUrl || desktopUrl,
          ctaLink: item.ctaLink
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
    <section className="hero-banner-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Only render the active slide — BannerSlide animates in via CSS */}
      <BannerSlide
        key={currentIndex}
        banner={banners[currentIndex]}
        isActive={true}
      />

      <button
        className="hero-arrow hero-arrow--prev"
        onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <button
        className="hero-arrow hero-arrow--next"
        onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <BannerIndicators
        total={banners.length}
        current={currentIndex}
        onChange={setCurrentIndex}
      />
    </section>
  );
}


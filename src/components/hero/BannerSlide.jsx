import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import BannerScene from '../three/BannerScene';

export default function BannerSlide({ banner, isActive }) {
  const containerRef = useRef(null);
  
  // Parallax effect: banner artwork moves slightly when scrolling down
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  if (!isActive) return null;

  return (
    <motion.div 
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--n-ink)',
        overflow: 'hidden'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* 2. 3D Scene Layer (Behind the artwork or subtly integrated) */}
      {/* The 3D scene acts as ambient depth enhancement to the artwork */}
      {banner.scene && banner.scene !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <BannerScene type={banner.scene} />
        </div>
      )}

      {/* 1. Primary Promotional Artwork Layer */}
      {/* All messaging, typography, and stats are baked into this image */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: -10, // slight bleed for parallax/scale
          y: yBg,
          scale: scaleBg,
          zIndex: 2, // Sits above ambient 3D if needed
        }}
        // Subtle Ken Burns entrance
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
      >
        <picture style={{ display: 'block', width: '100%', height: '100%' }}>
          {banner.bgImageMobile && banner.bgImageMobile !== banner.bgImage && (
            <source media="(max-width: 768px)" srcSet={banner.bgImageMobile} />
          )}
          <img 
            src={banner.bgImage} 
            alt="Promotional Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            draggable="false"
          />
        </picture>
      </motion.div>
      
    </motion.div>
  );
}

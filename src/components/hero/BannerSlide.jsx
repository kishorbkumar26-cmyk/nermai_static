import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TextReveal from '../motion/TextReveal';
import BannerCTA from './BannerCTA';
import BannerScene from '../three/BannerScene';

export default function BannerSlide({ banner, isActive }) {
  const containerRef = useRef(null);
  
  // Subtle parallax effect on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Background moves slightly slower than the scroll
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  // Text moves slightly faster
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '600px',
        overflow: 'hidden',
        backgroundColor: 'var(--n-cream)',
      }}
    >
      {/* 1. Background Artwork Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: -20, // slightly larger to allow parallax
          y: yBg,
          backgroundImage: `url(${banner.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.9,
          filter: 'contrast(1.1) brightness(0.95)'
        }}
      />

      {/* 2. 3D Scene Layer (if specified) */}
      {banner.scene && banner.scene !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <BannerScene type={banner.scene} />
        </div>
      )}

      {/* 3. Text Safe Zone Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          y: yText,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 8%',
          pointerEvents: 'none' // let clicks pass through to background/3d if needed
        }}
      >
        <div style={{ maxWidth: '800px', pointerEvents: 'auto' }}>
          {banner.eyebrow && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="brut-label" 
              style={{ color: 'var(--n-saffron)', marginBottom: '1.5rem', display: 'inline-block', background: 'var(--n-cream)', padding: '0.25rem 0.5rem', border: '2px solid var(--n-ink)' }}
            >
              {banner.eyebrow}
            </motion.div>
          )}

          <h1 style={{ 
            fontFamily: 'var(--n-font-display)', 
            fontSize: 'clamp(3rem, 6vw, 6rem)', 
            lineHeight: 1.1,
            textTransform: 'uppercase',
            color: 'var(--n-ink)',
            textShadow: '4px 4px 0px var(--n-cream), 6px 6px 0px var(--n-maroon)',
            margin: '0 0 1.5rem 0'
          }}>
            <TextReveal text={banner.title} delay={0.3} />
          </h1>

          {banner.subtitle && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{
                fontFamily: 'var(--n-font-sans)',
                fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                fontWeight: 500,
                color: 'var(--n-ink)',
                maxWidth: '600px',
                marginBottom: '2.5rem',
                background: 'rgba(253, 251, 247, 0.8)',
                padding: '0.5rem 1rem',
                borderLeft: '4px solid var(--n-saffron)'
              }}
            >
              {banner.subtitle}
            </motion.p>
          )}

          {banner.ctaLabel && banner.ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <BannerCTA label={banner.ctaLabel} link={banner.ctaLink} icon="fa-solid fa-arrow-right" />
            </motion.div>
          )}
        </div>
      </motion.div>

    </div>
  );
}

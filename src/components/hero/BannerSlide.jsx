import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TextReveal from '../motion/TextReveal';
import BannerCTA from './BannerCTA';
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

  // Layout alignment mapping
  const getLayoutStyles = () => {
    switch (banner.layout) {
      case 'bottom-left':
        return { justifyContent: 'flex-end', alignItems: 'flex-start', textAlign: 'left', paddingBottom: '6rem' };
      case 'center':
      default:
        return { justifyContent: 'center', alignItems: 'center', textAlign: 'center' };
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--n-ink)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* 1. Background Artwork Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: -10, // slight bleed for parallax/scale
          y: yBg,
          scale: scaleBg,
          backgroundImage: `url(${banner.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6, // Darken background slightly to ensure text pops
          filter: 'contrast(1.1)'
        }}
        // Subtle Ken Burns entrance
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
      />

      {/* 2. 3D Scene Layer (if specified) */}
      {banner.scene && banner.scene !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <BannerScene type={banner.scene} />
        </div>
      )}

      {/* 3. Integrated Typography Layer */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          padding: '4rem 8%',
          pointerEvents: 'none',
          ...getLayoutStyles()
        }}
      >
        <div style={{ maxWidth: '900px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: banner.layout === 'center' ? 'center' : 'flex-start' }}>
          
          {banner.category && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="brut-label" 
              style={{ 
                color: 'var(--n-gold)', 
                marginBottom: '1rem', 
                background: 'rgba(17, 17, 17, 0.8)', 
                padding: '0.25rem 0.75rem', 
                border: '1px solid var(--n-gold)',
                letterSpacing: '0.15em'
              }}
            >
              {banner.category}
            </motion.div>
          )}

          <h1 style={{ 
            fontFamily: 'var(--n-font-display)', 
            fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: 'var(--n-cream)',
            margin: '0 0 1.5rem 0',
            whiteSpace: 'pre-line' // respects \n in strings
          }}>
            <TextReveal text={banner.title} delay={0.4} />
          </h1>

          {banner.subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{
                fontFamily: 'var(--n-font-sans)',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontWeight: 600,
                color: 'var(--n-cream)',
                marginBottom: '2rem',
                whiteSpace: 'pre-line',
                letterSpacing: '0.05em'
              }}
            >
              {banner.subtitle}
            </motion.p>
          )}

          {/* Stats / Results integration (if present) */}
          {banner.stats && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: banner.layout === 'center' ? 'center' : 'flex-start' }}
            >
              {banner.stats.map((stat, idx) => (
                <div key={idx} style={{ background: 'rgba(253, 251, 247, 0.95)', padding: '0.5rem 1rem', border: '2px solid var(--n-ink)', boxShadow: '4px 4px 0px var(--n-maroon)' }}>
                  <div style={{ fontFamily: 'var(--n-font-display)', fontSize: '1.5rem', color: 'var(--n-ink)', lineHeight: 1 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {banner.ctaLabel && banner.ctaLink && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: 'spring' }}
              style={{ marginTop: banner.stats ? '2rem' : '0' }}
            >
              <BannerCTA label={banner.ctaLabel} link={banner.ctaLink} />
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

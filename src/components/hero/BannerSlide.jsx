import React from 'react';

export default function BannerSlide({ banner, isActive }) {
  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#1a0a0a',
        overflow: 'hidden',
        animation: 'heroSlideIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
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

      <style>{`
        @keyframes heroSlideIn {
          from { transform: translateX(6%); opacity: 0.5; }
          to   { transform: translateX(0);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}


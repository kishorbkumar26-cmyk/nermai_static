import React from 'react';

export default function BannerIndicators({ total, current, onChange }) {

  return (
    <div style={{
      position: 'absolute',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '0.75rem',
      zIndex: 10
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          style={{
            width: current === i ? '2rem' : '0.5rem',
            height: '0.5rem',
            backgroundColor: current === i ? 'var(--n-saffron)' : 'var(--n-cream)',
            border: '1px solid var(--n-ink)',
            borderRadius: '999px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: 0,
          }}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

import React from 'react';
import '../../styles/brutalism.css';

export default function BrutBadge({ label, icon, style = {} }) {
  return (
    <span 
      className="brut-label"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: 'var(--n-gold)',
        color: 'var(--n-ink)',
        border: '2px solid var(--n-ink)',
        boxShadow: '2px 2px 0px var(--n-ink)',
        ...style
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

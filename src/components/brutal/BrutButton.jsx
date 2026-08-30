import React from 'react';
import { motion } from 'framer-motion';
import '../styles/brutalism.css';

export default function BrutButton({ children, onClick, className = '', type = 'button', variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  const baseClasses = 'brut-title ' + (className ? className : '');

  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={onClick}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: isPrimary ? 'var(--n-saffron)' : 'var(--n-cream)',
        color: isPrimary ? 'var(--n-white)' : 'var(--n-ink)',
        border: '3px solid var(--n-ink)',
        cursor: 'pointer',
        fontSize: '1rem',
        boxShadow: isPrimary ? '4px 4px 0px var(--n-maroon)' : '4px 4px 0px var(--n-ink)',
      }}
      whileHover={{ 
        x: -2, y: -2, 
        boxShadow: isPrimary ? '6px 6px 0px var(--n-maroon)' : '6px 6px 0px var(--n-ink)'
      }}
      whileTap={{ 
        x: 4, y: 4, 
        boxShadow: '0px 0px 0px transparent' 
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.button>
  );
}

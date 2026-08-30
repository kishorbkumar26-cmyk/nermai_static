import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/brutalism.css';

export default function BrutCard({ children, className = '', style = {}, hoverLift = true }) {
  const baseClasses = 'brut-box' + (className ? ` ${className}` : '');
  
  // Optional Framer Motion variant for entry
  const entryVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      className={baseClasses}
      style={{ padding: '2rem', ...style }}
      variants={entryVariant}
      whileHover={hoverLift ? { x: -4, y: -4, boxShadow: '8px 8px 0px var(--n-maroon)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

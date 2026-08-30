import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageTransition({ children, locationKey }) {
  const transitionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

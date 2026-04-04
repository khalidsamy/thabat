import React from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedPage Component
 * Provides a standardized fade-in and slide-up transition for page components.
 */
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a premium, snappy feel
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

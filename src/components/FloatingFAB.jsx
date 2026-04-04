import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FloatingFAB = ({ onClick, icon: Icon = Heart, label }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4 pointer-events-none rtl:right-auto rtl:left-8">
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="pointer-events-auto w-16 h-16 bg-amber-500 text-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:shadow-[0_25px_60px_rgba(245,158,11,0.5)] transition-all duration-300 group relative border-2 border-white/20"
          aria-label={label || t('dashboard.floating_action')}
        >
          {/* Amber Glow Pulse */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-amber-400 rounded-3xl blur-2xl -z-10"
          />
          
          <Icon className="h-8 w-8 drop-shadow-md group-hover:scale-110 transition-transform" />
          
          {/* Subtle Sparkle Accents */}
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </AnimatePresence>
    </div>
  );
};

export default FloatingFAB;

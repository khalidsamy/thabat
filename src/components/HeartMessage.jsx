import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HEART_VERSES } from '../utils/heartVerses';
import BasePortal from './BasePortal';

const HeartMessage = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [currentVerse, setCurrentVerse] = useState(
    () => HEART_VERSES[Math.floor(Math.random() * HEART_VERSES.length)] || null,
  );

  const getRandomVerse = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * HEART_VERSES.length);
    setCurrentVerse(HEART_VERSES[randomIndex] || null);
  }, []);

  return (
    <BasePortal targetId="modal-portal">
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            style={{ zIndex: 'var(--z-modal)' }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[3rem] shadow-2xl border border-white/20"
            >
              {/* Premium Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-600" />
              
              {/* Animated Glow Elements */}
              <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" 
              />
              <motion.div 
                  animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" 
              />

              {/* Content Area */}
              <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center text-center text-white">
                <div className="flex items-center justify-between w-full mb-8">
                  <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-xl">
                          <Heart className="h-5 w-5 text-amber-400 fill-amber-400" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">
                          {t('heart.title')}
                      </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-xl group"
                  >
                    <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                <div className="min-h-[250px] flex flex-col justify-center gap-8 py-10 w-full">
                  <AnimatePresence mode="wait">
                    {currentVerse && (
                      <motion.div
                        key={currentVerse.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="space-y-8"
                      >
                        <h2 className="text-4xl sm:text-5xl font-black leading-tight drop-shadow-xl p-4" dir="rtl">
                          « {currentVerse.arabic} »
                        </h2>
                        
                        <div className="space-y-2 opacity-80 italic max-w-lg mx-auto">
                          <p className="text-lg font-medium leading-relaxed">
                            "{currentVerse.english}"
                          </p>
                          <p className="text-xs font-black tracking-widest uppercase text-amber-400">
                            {currentVerse.reference}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getRandomVerse}
                    className="flex-1 w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 py-5 rounded-2xl font-bold transition-all backdrop-blur-xl group"
                  >
                    <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>{t('heart.another_message')}</span>
                  </motion.button>
                </div>
                
                <div className="mt-8 flex items-center gap-2 opacity-40">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    ثَبِّتْنَا عَلَى حِفْظِ كِتَابِكَ
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BasePortal>
  );
};

export default HeartMessage;

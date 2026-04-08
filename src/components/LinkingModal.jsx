import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Eye, Sparkles, X, Quote } from 'lucide-react';
import axios from 'axios';
import BasePortal from './BasePortal';

const LinkingModal = ({ isOpen, onClose, nextSurah }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [ayahData, setAyahData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && nextSurah) {
      setIsRevealed(false);
      setAyahData(null);
      fetchNextAyah();
    }
  }, [isOpen, nextSurah]);

  const fetchNextAyah = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${nextSurah.number}:1/quran-uthmani`);
      setAyahData(res.data.data);
    } catch (err) {
      console.error('Linking Assistant fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!nextSurah) return null;

  return (
    <BasePortal targetId="modal-portal">
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            style={{ zIndex: 'var(--z-modal)' }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card-strong relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-zinc-900 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mt-32" />

              <div className="p-8 sm:p-10 text-center relative z-10">
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <Link2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                      The Linking Assistant
                    </span>
                    <h2 className="text-2xl font-black text-white leading-tight">
                       تحدي الربط (Linking Challenge)
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                   <p className="text-slate-400 text-sm leading-relaxed px-4">
                      Masha'Allah on completing your current recitation! Now, do you remember the first Ayah of the NEXT Surah?
                   </p>

                   <div className="surface-inset p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Quote className="w-12 h-12 text-emerald-500" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-4">
                         Next: {nextSurah.name} ({nextSurah.englishName})
                      </p>

                      <div className="relative min-h-[80px] flex items-center justify-center">
                         {isLoading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500/30 border-t-emerald-500" />
                         ) : (
                            <motion.p 
                              layout
                              className={`text-2xl sm:text-3xl font-bold text-white transition-all duration-700 leading-relaxed ${!isRevealed ? 'blur-md select-none' : 'blur-0'}`}
                              dir="rtl"
                            >
                               {ayahData?.text || '...'}
                            </motion.p>
                         )}
                      </div>
                   </div>

                   {!isRevealed ? (
                      <button
                        onClick={() => setIsRevealed(true)}
                        className="w-full h-16 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        <Eye className="h-5 w-5" />
                        Check Thabat (Reveal)
                      </button>
                   ) : (
                      <button
                        onClick={onClose}
                        className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        Everything is Stable!
                      </button>
                   )}
                </div>

                <div className="mt-10 pt-8 border-t border-white/5">
                   <p className="text-[11px] font-medium italic text-slate-500 leading-relaxed text-center px-6">
                      "The strength of your Hifz is in its ends and beginnings. Master the transitions, and you master the Quran." 
                      <br /><span className="text-emerald-500/50 not-italic font-black mt-2 block uppercase tracking-tighter">— Sheikh Alaa</span>
                   </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BasePortal>
  );
};

export default LinkingModal;

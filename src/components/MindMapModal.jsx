import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Target, Info, ChevronRight, Layout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchSurahMetadata, isAbortedRequest } from '../services/quranApi';
import { getSurahTheme } from '../utils/surahThemes';
import BasePortal from './BasePortal';

const Node = ({ x, y, label, subLabel, isCenter, delay = 0, isArabic }) => (
  <motion.g
// ... (rest of Node component same)
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, type: 'spring' }}
  >
    <circle cx={x} cy={y} r={isCenter ? 55 : 35} fill={isCenter ? 'url(#centerGlow)' : 'url(#nodeGlow)'} className="opacity-40" />
    <rect
      x={x - (isCenter ? 80 : 60)}
      y={y - (isCenter ? 35 : 25)}
      width={isCenter ? 160 : 120}
      height={isCenter ? 70 : 50}
      rx={isCenter ? 20 : 14}
      className={`${isCenter ? 'fill-emerald-500 shadow-xl' : 'fill-[#18181b] border border-white/10'} shadow-2xl transition-all hover:brightness-110`}
      style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
    />
    <text
      x={x}
      y={y - (subLabel ? 5 : 0)}
      textAnchor="middle"
      alignmentBaseline="middle"
      className={`${isCenter ? 'fill-white font-black' : 'fill-emerald-400 font-bold'} text-[12px] sm:text-[14px]`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {label}
    </text>
    {subLabel && (
      <text
        x={x}
        y={y + 15}
        textAnchor="middle"
        alignmentBaseline="middle"
        className={`${isCenter ? 'fill-emerald-100/70' : 'fill-white/40'} text-[9px] font-bold uppercase tracking-widest`}
      >
        {subLabel}
      </text>
    )}
  </motion.g>
);

const Connection = ({ x1, y1, x2, y2, delay = 0 }) => (
// ... (rest of Connection component same)
    <motion.path
      d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
      fill="none"
      stroke="url(#lineGradient)"
      strokeWidth="2"
      strokeDasharray="1000"
      initial={{ strokeDashoffset: 1000 }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ delay, duration: 1.2, ease: "easeInOut" }}
      className="opacity-30"
    />
);

const MindMapModal = ({ isOpen, onClose, pageNumber = 1 }) => {
  const { i18n } = useTranslation();
  const [surahMetadata, setSurahMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = i18n.language === 'ar';

  const getSurahFromPage = (page) => {
    if (page <= 1) return 1;
    if (page <= 50) return 2;
    if (page <= 76) return 3;
    return 1;
  };

  const surahThemes = useMemo(() => {
    const num = getSurahFromPage(pageNumber);
    return getSurahTheme(num);
  }, [pageNumber]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const controller = new AbortController();
    const loadMetadata = async () => {
      setIsLoading(true);
      try {
        const num = getSurahFromPage(pageNumber);
        const metadata = await fetchSurahMetadata(num, { signal: controller.signal });
        setSurahMetadata(metadata);
      } catch (err) {
        if (!isAbortedRequest(err)) console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void loadMetadata();
    return () => controller.abort();
  }, [isOpen, pageNumber]);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return (
    <BasePortal targetId="modal-portal">
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 'var(--z-modal)' }}
          >
            <motion.div
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={onClose}
               className="absolute inset-0 bg-[#09090b]/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl aspect-[4/3] max-h-[90vh] glass-card rounded-[3rem] overflow-hidden flex flex-col border border-white/5"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Layout className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-foreground">
                      {isArabic ? `خارطة ${surahMetadata?.name || ''}` : `${surahMetadata?.englishName || ''} Mind Map`}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Target className="h-3 w-3 text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">
                            {isArabic ? 'هيكل السورة ومقاصدها' : 'Structure & Objectives'}
                        </p>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                    <X className="h-5 w-5" />
                </button>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_#111827_0%,_#09090b_100%)] overflow-hidden">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500/60 animate-pulse">Calculating Hierarchy...</p>
                  </div>
                ) : (
                  <div className="w-full h-full overflow-auto custom-scrollbar">
                    <svg
                      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                      className="min-w-[800px] h-full mx-auto"
                    >
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <radialGradient id="centerGlow">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="nodeGlow">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {surahThemes?.sections.map((section, idx) => {
                        const angle = (idx / surahThemes.sections.length) * Math.PI * 2;
                        const radius = 240;
                        const x = centerX + Math.cos(angle) * (radius * 1.2);
                        const y = centerY + Math.sin(angle) * radius;
                        return <Connection key={idx} x1={centerX} y1={centerY} x2={x} y2={y} delay={0.3 + idx * 0.1} />;
                      })}

                      {surahThemes?.sections.map((section, idx) => {
                        const angle = (idx / surahThemes.sections.length) * Math.PI * 2;
                        const radius = 240;
                        const x = centerX + Math.cos(angle) * (radius * 1.2);
                        const y = centerY + Math.sin(angle) * radius;
                        return (
                          <Node
                            key={idx}
                            x={x}
                            y={y}
                            label={isArabic ? section.ar : section.en}
                            subLabel={`Verse ${section.range}`}
                            delay={0.6 + idx * 0.1}
                            isArabic={isArabic}
                          />
                        );
                      })}

                      <Node
                        x={centerX}
                        y={centerY}
                        label={isArabic ? surahMetadata?.name : surahMetadata?.englishName}
                        subLabel={isArabic ? 'المقصد الرئيسي' : 'MAIN OBJECTIVE'}
                        isCenter
                        delay={0.2}
                        isArabic={isArabic}
                      />
                    </svg>
                  </div>
                )}

                <AnimatePresence>
                    {!isLoading && surahThemes && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
                        >
                            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex items-start gap-4">
                                <div className="w-10 h-10 shrink-0 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                    <Info className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-1">
                                        {isArabic ? 'المقصد العام' : 'General Objective'}
                                    </p>
                                    <p className="text-sm font-bold text-foreground leading-relaxed">
                                        {isArabic ? surahThemes.objectiveAr : surahThemes.objectiveEn}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </BasePortal>
  );
};

export default MindMapModal;


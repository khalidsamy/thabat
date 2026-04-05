import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlayCircle } from 'lucide-react';

const TargetSurahCard = ({ surahName, progress, itemVariants }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const percentage = progress || 0;

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-4 group h-full"
    >
      <div className="relative h-full min-h-[460px] overflow-hidden bg-card/40 rounded-3xl p-8 sm:p-10 shadow-xl shadow-rose-900/40 border border-white/10 flex flex-col justify-between transition-all duration-500 hover:shadow-rose-900/60 backdrop-blur-md inner-glow">
        {/* Ruby Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-24 -mb-24 blur-3xl" />

        {/* Header: Title */}
        <div className="relative">
          <span className="text-[10px] font-black text-rose-100/40 uppercase tracking-[0.4em] mb-2 block">
            {t('dashboard.current_target_surah') || 'CURRENT TARGET SURAH'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-sm break-words leading-tight" dir="rtl">
            {surahName || 'Al-Baqarah'}
          </h2>
          <p className="text-xs font-bold text-rose-200/60 mt-4 uppercase tracking-[0.2em]">
            {surahName ? t('dashboard.surah_active') : t('dashboard.set_new_target')}
          </p>
        </div>

        {/* Action: Quick Start Bridge */}
        <div className="mt-8 mb-4">
            <button 
                onClick={() => navigate('/dashboard/recite')}
                className="w-full h-16 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-[0.2em] transition-all group/btn"
            >
                <PlayCircle className="h-5 w-5 text-rose-400 group-hover/btn:scale-110 transition-transform" />
                <span>Start Reciting</span>
            </button>
        </div>

        {/* Progress Logic: The Red Bar */}
        <div className="relative mt-auto pt-6 border-t border-white/5">
          <div className="flex justify-between items-end mb-3">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-rose-200/40 uppercase tracking-widest leading-none mb-2 px-1">
                    Mastery Accuracy
                </span>
                <span className="text-2xl font-black text-white">{percentage}%</span>
             </div>
             <Sparkles className="h-5 w-5 text-rose-500 mb-1 opacity-40" />
          </div>
          
          <div className="h-3 w-full bg-black/30 rounded-full border border-white/5 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TargetSurahCard;

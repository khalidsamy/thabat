import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlayCircle, Lock } from 'lucide-react';

const TargetSurahCard = ({ surahName, progress, isLocked, itemVariants }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const percentage = progress || 0;

  return (
    <motion.div 
      variants={itemVariants}
      className={`lg:col-span-4 group h-full ${isLocked ? 'filter grayscale-[0.3]' : ''}`}
    >
      <div className={`glass-card relative h-full min-h-[460px] overflow-hidden rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 inner-glow ${isLocked ? 'hover:shadow-amber-900/40' : 'hover:shadow-rose-900/60'}`}>
        {/* Ruby Accents */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-125 ${isLocked ? 'bg-amber-500/10' : 'bg-[color:var(--theme-rose-soft)]'}`} />
        <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24 blur-3xl ${isLocked ? 'bg-amber-500/5' : 'bg-[color:var(--theme-accent-soft)]'}`} />

        {/* Header: Title */}
        <div className="relative">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 block text-[color:var(--theme-text-muted)]">
              {t('dashboard.current_target_surah') || 'CURRENT TARGET SURAH'}
            </span>
          <h2 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter drop-shadow-sm break-words leading-tight" dir="rtl">
            {surahName || 'Al-Baqarah'}
          </h2>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)]">
                {surahName ? t('dashboard.surah_active') : t('dashboard.set_new_target')}
            </p>
            {isLocked && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-500 text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                    <Lock className="h-2.5 w-2.5" /> Locked
                </span>
            )}
          </div>
        </div>

        {/* Action: Quick Start Bridge */}
        <div className="mt-8 mb-4">
            <button 
                onClick={() => !isLocked && navigate('/dashboard/recite')}
                disabled={isLocked}
                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 border font-black text-sm uppercase tracking-[0.2em] transition-all group/btn ${
                    isLocked 
                    ? 'border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed' 
                    : 'border-[color:var(--theme-border)] bg-[color:var(--theme-surface-muted)] text-foreground hover:border-rose-500/20'
                }`}
            >
                {isLocked ? (
                    <>
                        <Lock className="h-5 w-5 text-amber-500/40" />
                        <span>Revision Required</span>
                    </>
                ) : (
                    <>
                        <PlayCircle className="h-5 w-5 text-rose-400 group-hover/btn:scale-110 transition-transform" />
                        <span>Start Reciting</span>
                    </>
                )}
            </button>
        </div>

        {/* Progress Logic: The Red Bar */}
        <div className="relative mt-auto pt-6 border-t border-[color:var(--theme-border)]">
          <div className="flex justify-between items-end mb-3">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-2 px-1 text-[color:var(--theme-text-muted)]">
                    Mastery Accuracy
                </span>
                <span className="text-2xl font-black text-foreground">{percentage}%</span>
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

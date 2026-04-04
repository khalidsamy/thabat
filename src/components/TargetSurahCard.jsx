import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TargetSurahCard = ({ surahName, progress, itemVariants }) => {
  const { t } = useTranslation();
  const percentage = progress || 0;

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-4 group h-full"
    >
      <div className="relative h-full min-h-[400px] max-h-[480px] overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-700 dark:to-rose-900 rounded-[3rem] p-8 sm:p-10 shadow-2xl shadow-rose-900/5 dark:shadow-rose-900/40 border border-rose-100/50 dark:border-white/10 flex flex-col justify-between transition-all duration-500 hover:shadow-rose-900/10 dark:hover:shadow-rose-900/60">
        {/* Ruby Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 dark:bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-125" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-100/10 dark:bg-black/20 rounded-full -ml-24 -mb-24 blur-3xl" />

        {/* Header: Title */}
        <div className="relative">
          <span className="text-[10px] font-black text-rose-600/40 dark:text-rose-100/40 uppercase tracking-[0.4em] mb-2 block">
            {t('dashboard.current_target_surah') || 'CURRENT TARGET SURAH'}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-rose-900 dark:text-white tracking-tighter drop-shadow-sm break-words leading-tight" dir="rtl">
            {surahName || 'Al-Baqarah'}
          </h2>
          <p className="text-xs font-bold text-rose-600/60 dark:text-rose-200/60 mt-2 uppercase tracking-widest">
            {surahName ? t('dashboard.surah_active') : t('dashboard.set_new_target')}
          </p>
        </div>

        {/* Progress Logic: The Red Bar */}
        <div className="relative mt-auto space-y-4">
          <div className="flex justify-between items-end mb-1">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-rose-200/40 uppercase tracking-widest leading-none mb-1">
                    Progress Bar
                </span>
                <span className="text-base font-black text-white">{percentage}%</span>
             </div>
          </div>
          
          <div className="h-4 w-full bg-black/30 rounded-full border border-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TargetSurahCard;

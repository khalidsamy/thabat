import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HifzStreaks from '../../components/HifzStreaks';
import SpiritualCarousel from '../../components/SpiritualCarousel';
import Leaderboard from '../../components/Leaderboard';
import RecoveryCard from '../../components/RecoveryCard';

const Home = () => {
  const { t } = useTranslation();
  const { progress, dailyVerse, itemVariants } = useOutletContext();

  return (
    <div className="space-y-8 pb-32">
      {/* Recovery Mode (Broken Streak) */}
      {progress?.streak === 0 && (
        <motion.div variants={itemVariants}>
          <RecoveryCard onStartSmall={() => {
            const el = document.getElementById('pages');
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth' });
          }} />
        </motion.div>
      )}

      {/* Daily Motivation Verse */}
      {dailyVerse && (
        <motion.section 
          variants={itemVariants}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
            <div className="relative flex flex-col items-center text-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0 shadow-xl shadow-black/20">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-white mb-3 leading-relaxed" dir="rtl">
                  {dailyVerse.arabic}
                </p>
                <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mb-2" dir="rtl">
                  — {dailyVerse.reference}
                </p>
                <p className="text-xs sm:text-sm font-medium text-white/80 italic leading-relaxed max-w-2xl mx-auto">
                  {dailyVerse.english}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      <motion.div variants={itemVariants}>
        <SpiritualCarousel />
      </motion.div>

      {/* Foundation: Progress Visualizers */}
      <motion.section variants={itemVariants} className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('dashboard.current_journey')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <HifzStreaks 
            streak={progress?.streak} 
            isCompletedToday={progress?.doneToday >= progress?.dailyTarget} 
            wasActiveYesterday={progress?.streak > 0}
            currentSurah={progress?.currentTargetSurah || 'Al-Baqarah'}
            completion={progress?.masteryPercent || 0}
            history={progress?.history || []}
          />
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <Leaderboard />
      </motion.section>
    </div>
  );
};

export default Home;

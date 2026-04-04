import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HifzStreaks from '../../components/HifzStreaks';
import SpiritualCarousel from '../../components/SpiritualCarousel';
import Leaderboard from '../../components/Leaderboard';
import RecoveryCard from '../../components/RecoveryCard';

const Home = (props) => {
  const { t } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, user, dailyVerse, itemVariants } = { 
    progress: {}, 
    user: {}, 
    ...context, 
    ...props 
  };

  return (
    <div className="space-y-8 pb-32">
      {progress?.streak === 0 && progress?.totalMemorized === 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] p-8 text-center mb-8">
            <h3 className="text-2xl font-bold text-emerald-600 mb-2">{t('streaks.newbie')}</h3>
            <p className="text-secondary-foreground opacity-70">Start your journey today and build your first streak!</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 items-stretch w-full overflow-hidden">
        {/* Spiritual Status (Recovery / Welcome) */}
        {progress?.streak === 0 && progress?.totalMemorized > 0 && (
          <div className="w-full xl:flex-1 min-w-0">
            <motion.div variants={itemVariants} className="h-full">
              <RecoveryCard onStartSmall={() => {
                const el = document.getElementById('pages');
                el?.focus();
                el?.scrollIntoView({ behavior: 'smooth' });
              }} />
            </motion.div>
          </div>
        )}

        {/* Daily Motivation Verse */}
        {dailyVerse && (
          <div className={`w-full ${progress?.streak === 0 && progress?.totalMemorized > 0 ? 'xl:flex-1' : 'xl:w-full'} min-w-0`}>
            <motion.section 
              variants={itemVariants}
              className="h-full"
            >
              <div className="relative h-full overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/20 group border border-white/10 shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="relative flex flex-col h-full items-center text-center justify-center gap-6">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0 shadow-xl shadow-black/20 group-hover:rotate-12 transition-transform">
                    <Sparkles className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 leading-relaxed line-clamp-4" dir="rtl">
                      {dailyVerse.arabic}
                    </p>
                    <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-[0.2em] mb-4" dir="rtl">
                      — {dailyVerse.reference}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-white/80 italic leading-relaxed max-w-sm mx-auto line-clamp-3">
                      {dailyVerse.english}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        )}
      </div>

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
            currentSurah={progress?.currentSurahName || user?.currentTargetSurah}
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

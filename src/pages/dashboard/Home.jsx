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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full overflow-hidden min-h-[400px]">
        {/* Daily Motivation Verse (Primary Focus) */}
        {dailyVerse && (
          <div className="lg:col-span-8 h-full">
            <motion.section 
              variants={itemVariants}
              className="h-full"
            >
              <div className="relative h-full min-h-[380px] max-h-[480px] overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-10 shadow-2xl shadow-emerald-500/10 group border border-white/10 flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                <div className="relative flex flex-col items-center text-center gap-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0 shadow-xl group-hover:rotate-6 transition-transform">
                    <Sparkles className="h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div className="space-y-6">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md px-4" dir="rtl">
                      {dailyVerse.arabic}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-[10px] sm:text-[12px] font-black text-emerald-100/60 uppercase tracking-[0.3em]" dir="rtl">
                         — {dailyVerse.reference}
                       </p>
                       <p className="text-sm sm:text-base font-medium text-white/80 italic leading-relaxed max-w-lg">
                         {dailyVerse.english}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        )}

        {/* Spiritual Status (Secondary Focus) */}
        {progress?.streak === 0 && progress?.totalMemorized > 0 && (
          <div className="lg:col-span-4 h-full">
            <motion.div variants={itemVariants} className="h-full">
              <RecoveryCard 
                onStartSmall={() => {
                  const el = document.getElementById('pages');
                  el?.focus();
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} 
              />
            </motion.div>
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
            onVisualize={context.onVisualize}
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

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Flame, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../StatCard';
import ProgressChart from '../ProgressChart';
import AchievementBadges from '../AchievementBadges';
import HifzProgress from '../HifzProgress';
import { getUserRank } from '../../utils/rankManager';

const ProgressTab = ({ progress, refreshKey, itemVariants, oldDailyTarget, newDailyTarget, reviewPace, planLabels }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 pb-24">
      {/* Rank and Overall Mastery */}
      <motion.section variants={itemVariants} className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('dashboard.overall_mastery')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <HifzProgress current={progress?.totalMemorized} total={604} label={t('dashboard.overall_mastery')} />
        </div>
      </motion.section>

      {/* Progress Chart */}
      <motion.section variants={itemVariants}>
        <ProgressChart refreshTrigger={refreshKey} />
      </motion.section>

      {/* Achievement Badges */}
      <motion.section variants={itemVariants}>
        <AchievementBadges pages={progress?.totalMemorized || 0} />
      </motion.section>

      {/* Statistics Grid */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('dashboard.hifz_stats')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard 
            title={t('dashboard.current_page')}
            value={progress?.currentPage || 1} 
            icon={<BookOpen className="h-6 w-6" />}
            subtitle={t('dashboard.out_of')}
          />
          <StatCard 
            title={t('dashboard.total_memorized')}
            value={progress?.totalMemorized || 0} 
            icon={<TrendingUp className="h-6 w-6" />}
            subtitle={t('dashboard.pages_committed')}
          />
          <StatCard 
            title={t('dashboard.active_streak')} 
            value={`${progress?.streak || 0} ${t('dashboard.days')}`} 
            icon={<Flame className="h-6 w-6" />}
            subtitle={t('dashboard.keep_momentum')}
          />
          <StatCard 
            title={t('dashboard.distant_review_card')}
            value={`${oldDailyTarget} ${t('dashboard.pages')}`} 
            icon={<CalendarCheck className="h-6 w-6 text-sky-500" />}
            subtitle={t('dashboard.days_system', { days: reviewPace })}
            className="border-sky-500/20 dark:border-sky-500/10"
          />
          <StatCard 
            title={t('dashboard.intensive_review_card')}
            value={`${newDailyTarget} ${t('dashboard.pages')}`} 
            icon={<Flame className="h-6 w-6 text-emerald-500" />}
            subtitle={t('dashboard.intensive_system')}
            className="border-emerald-500/40 dark:border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
          />
        </div>
      </motion.section>
    </div>
  );
};

export default ProgressTab;

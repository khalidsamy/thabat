import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, BookOpen, Flame, CalendarCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/StatCard';
import ProgressChart from '../../components/ProgressChart';
import AchievementBadges from '../../components/AchievementBadges';
import HifzProgress from '../../components/HifzProgress';
import { REVISION_PLANS } from '../../utils/RevisionEngine';
import { AlertCircle, History, ShieldAlert } from 'lucide-react';

const Progress = (props) => {
  const { t, i18n } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, refreshKey, itemVariants } = {
    progress: {}, 
    ...context, 
    ...props 
  };
  
  const isArabic = i18n.language === 'ar';
  
  // Dynamic Revision Target mapping - Prioritize User Intensity over Progress Goal
  const activePlanId = user?.revisionIntensity || progress?.revisionGoal;
  const currentPlan = Object.values(REVISION_PLANS).find(p => p.id === activePlanId);
  const revisionTargetLabel = currentPlan 
    ? (isArabic ? currentPlan.label.replace('Day', 'يوم') : currentPlan.label)
    : (isArabic ? 'بدون خطة' : 'No Active Plan');

  return (
    <div className="space-y-8 pb-32">
      {/* Rank and Overall Mastery */}
      <motion.section variants={itemVariants} className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('dashboard.overall_mastery')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <HifzProgress current={progress?.totalMemorized || 0} total={progress?.totalMushafPages || 604} label={t('dashboard.overall_mastery')} />
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
            {isArabic ? 'إحصائيات الحفظ' : t('dashboard.hifz_stats')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title={isArabic ? 'الصفحة الحالية' : t('dashboard.current_page')}
            value={progress?.currentPage || 1} 
            icon={<BookOpen className="h-6 w-6" />}
            subtitle={isArabic ? `من أصل ${progress?.totalMushafPages || 604}` : t('dashboard.out_of', { total: progress?.totalMushafPages || 604 })}
          />
          <StatCard 
            title={isArabic ? 'إجمالي المحفوظ' : t('dashboard.total_memorized')}
            value={progress?.totalMemorized || 0} 
            icon={<TrendingUp className="h-6 w-6" />}
            subtitle={isArabic ? 'صفحة تم إتقانها' : t('dashboard.pages_committed')}
          />
          <StatCard 
            title={isArabic ? 'الاستمرارية' : t('dashboard.active_streak')} 
            value={`${progress?.streak || 0} ${isArabic ? 'يوم' : t('dashboard.days')}`} 
            icon={<Flame className="h-6 w-6" />}
            subtitle={isArabic ? 'واصل التقدم!' : t('dashboard.keep_momentum')}
          />
          <StatCard 
            title={isArabic ? 'خطة المراجعة' : 'Revision Plan'}
            value={revisionTargetLabel} 
            icon={<CalendarCheck className="h-6 w-6 text-sky-500" />}
            subtitle={currentPlan ? (isArabic ? `${currentPlan.pages} صفحة يومياً` : `${currentPlan.pages} pages daily`) : (isArabic ? 'فعل الخطة من الإعدادات' : 'Enable in settings')}
            className="border-sky-500/10"
          />
        </div>
      </motion.section>

      {/* Weak Areas (Mawaqi' al-Khata') - Sheikh Alaa Pedagogy */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            {isArabic ? 'مواضع الضعف (تحتاج تثبيت)' : "Weak Areas (Needs Stabilization)"}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-rose-500/20 to-transparent ms-4"></div>
        </div>

        {progress?.weakSurahs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.weakSurahs.map((ws, idx) => (
              <motion.div 
                key={ws.surahNumber || idx}
                whileHover={{ y: -4 }}
                className="glass-card p-5 border-l-4 border-l-rose-500 flex items-center justify-between hover:bg-rose-500/[0.02] transition-colors"
              >
                  <div className="space-y-1">
                      <h4 className="font-black text-foreground text-lg" dir="rtl">{ws.surahName}</h4>
                      <p className="text-xs font-bold text-[color:var(--theme-text-muted)] flex items-center gap-1">
                        <History className="h-3 w-3" />
                        {isArabic ? 'آخر تعثر:' : 'Last failed:'} {new Date(ws.lastFailed).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
                      </p>
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70 mb-1">{isArabic ? 'عدد الأخطاء' : 'Errors'}</p>
                      <p className="text-3xl font-black text-rose-400">{ws.errorCount}</p>
                  </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 sm:p-10 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
              </div>
              <h4 className="font-bold text-foreground mb-2">{isArabic ? 'محفوظك متقن!' : 'Your Hifz is Solid!'}</h4>
              <p className="text-sm text-[color:var(--theme-text-muted)] max-w-sm mx-auto">
                {isArabic 
                  ? 'لا توجد سور مصنفة كضعيفة حالياً. استمر في المراجعة للحفاظ على هذا المستوى.' 
                  : 'No surahs are currently flagged as weak. Keep up your revision rotation to maintain this mastery.'}
              </p>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default Progress;

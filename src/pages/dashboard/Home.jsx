import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DailyMotivationCard from '../../components/DailyMotivationCard';
import TargetSurahCard from '../../components/TargetSurahCard';
import MemorizedGaugeCard from '../../components/MemorizedGaugeCard';
import ReviewPacerCard from '../../components/ReviewPacerCard';
import HifzStreaks from '../../components/HifzStreaks';

const MOBILE_VIEWS = [
  { id: 'focus', label: 'Focus Deck', icon: Sparkles },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
];

const Home = (props) => {
  const context = useOutletContext() || {};
  const { progress, user, dailyVerse, itemVariants, onVisualize } = { progress: {}, user: {}, ...context, ...props };
  const [mobileView, setMobileView] = useState('focus');

  return (
    <div className="space-y-4 pb-10 lg:pb-0">
      <div className="lg:hidden">
        <div className="mobile-segmented">
          {MOBILE_VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobileView(id)}
              className={`mobile-segmented__button ${mobileView === id ? 'mobile-segmented__button--active' : ''}`}
            >
              <span className="flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mobileView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {mobileView === 'focus' ? (
              <>
                <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
                <TargetSurahCard
                  surahName={progress?.currentSurahName || user?.currentTargetSurah}
                  progress={progress?.masteryPercent || 0}
                  itemVariants={itemVariants}
                />
              </>
            ) : (
              <>
                <MemorizedGaugeCard percentage={progress?.masteryPercent || 0} itemVariants={itemVariants} />
                <ReviewPacerCard itemVariants={itemVariants} />
                <HifzStreaks
                  streak={progress?.streak}
                  isCompletedToday={progress?.doneToday >= progress?.dailyTarget}
                  wasActiveYesterday={progress?.streak > 0}
                  currentSurah={progress?.currentSurahName || user?.currentTargetSurah}
                  completion={progress?.masteryPercent || 0}
                  history={progress?.history || []}
                  onVisualize={onVisualize}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden lg:block">
        <DashboardLayout>
        {/* Row 1 — 8/4: wide motivation card + compact target tracker */}
        <DashboardLayout.Item cols={8}>
          <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
        </DashboardLayout.Item>
        <DashboardLayout.Item cols={4}>
          <TargetSurahCard
            surahName={progress?.currentSurahName || user?.currentTargetSurah}
            progress={progress?.masteryPercent || 0}
            itemVariants={itemVariants}
          />
        </DashboardLayout.Item>

        {/* Row 2 — 4/4/4: three equal metric cards */}
        <DashboardLayout.Item cols={4}>
          <MemorizedGaugeCard percentage={progress?.masteryPercent || 0} itemVariants={itemVariants} />
        </DashboardLayout.Item>
        <DashboardLayout.Item cols={4}>
          <ReviewPacerCard itemVariants={itemVariants} />
        </DashboardLayout.Item>
        <DashboardLayout.Item cols={4}>
          <HifzStreaks
            streak={progress?.streak}
            isCompletedToday={progress?.doneToday >= progress?.dailyTarget}
            wasActiveYesterday={progress?.streak > 0}
            currentSurah={progress?.currentSurahName || user?.currentTargetSurah}
            completion={progress?.masteryPercent || 0}
            history={progress?.history || []}
            onVisualize={onVisualize}
          />
        </DashboardLayout.Item>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default Home;

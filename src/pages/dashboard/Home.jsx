import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DailyMotivationCard from '../../components/DailyMotivationCard';
import TargetSurahCard from '../../components/TargetSurahCard';
import MemorizedGaugeCard from '../../components/MemorizedGaugeCard';
import MasteryHeatmap from '../../components/MasteryHeatmap';
import HifzStreaks from '../../components/HifzStreaks';
import SetupWizard from '../../components/SetupWizard';
import TodayMissionCard from '../../components/TodayMissionCard';
import CatchUpModal from '../../components/CatchUpModal';
import SuccessCelebration from '../../components/SuccessCelebration';
import { generateTodayMission } from '../../utils/DailyTaskGenerator';
import api from '../../services/api';

const MOBILE_VIEWS = [
  { id: 'focus', label: 'Today\'s Mission', icon: Sparkles },
  { id: 'metrics', label: 'Growth Stats', icon: BarChart3 },
];

const Home = (props) => {
  const context = useOutletContext() || {};
  const { 
    progress, 
    user, 
    dailyVerse, 
    itemVariants, 
    onVisualize, 
    isReciteLocked, 
    refreshData 
  } = { progress: {}, user: {}, ...context, ...props };
  
  const [mobileView, setMobileView] = useState('focus');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCatchUp, setShowCatchUp] = useState(false);
  const [isStreakRepair, setIsStreakRepair] = useState(false);

  const mission = useMemo(() => generateTodayMission(user, progress), [user, progress]);

  // Handle Catch-up Modal Visibility
  useEffect(() => {
    if (mission?.pendingCatchUp && !localStorage.getItem('thabat_catchup_ignored_today')) {
      setShowCatchUp(true);
    }
  }, [mission?.pendingCatchUp]);

  // Check for completion to trigger celebration
  useEffect(() => {
    if (progress?.revisionCompletedToday && !localStorage.getItem('thabat_celebrated_today')) {
      const activeCatchUp = localStorage.getItem('thabat_catchup_active') === 'true';
      setIsStreakRepair(activeCatchUp);
      setShowCelebration(true);
      localStorage.setItem('thabat_celebrated_today', 'true');
      
      // If was catch up, clear the state
      if (activeCatchUp) {
        localStorage.removeItem('thabat_catchup_active');
      }
    }
  }, [progress?.revisionCompletedToday]);

  const handleStartCatchUp = () => {
    localStorage.setItem('thabat_catchup_active', 'true');
    localStorage.setItem('thabat_catchup_ignored_today', 'true');
    setShowCatchUp(false);
    refreshData(); // Refresh to update mission generator
  };

  const handleReschedule = async () => {
    try {
      // In a real app, we'd send an API call to reset the cycle or shift dates
      // For now, we just ignore catch-up and notify the user
      localStorage.setItem('thabat_catchup_ignored_today', 'true');
      setShowCatchUp(false);
      refreshData();
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  const handleIgnore = () => {
    localStorage.setItem('thabat_catchup_ignored_today', 'true');
    setShowCatchUp(false);
  };

  if (user && !user.setupCompleted) {
    return <SetupWizard user={user} onComplete={refreshData} />;
  }

  return (
    <div className="space-y-4 pb-10 lg:pb-0">
      <CatchUpModal 
        isOpen={showCatchUp}
        onCatchUp={handleStartCatchUp}
        onReschedule={handleReschedule}
        onIgnore={handleIgnore}
      />

      <SuccessCelebration 
        isVisible={showCelebration}
        isStreakRepair={isStreakRepair}
        onClose={() => setShowCelebration(false)}
      />

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
                <TodayMissionCard mission={mission} itemVariants={itemVariants} history={progress?.history} />
                <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
                <TargetSurahCard
                  surahName={progress?.currentSurahName || user?.currentTargetSurah || 'Al-Baqara'}
                  progress={progress?.masteryPercent || 0}
                  isLocked={isReciteLocked}
                  itemVariants={itemVariants}
                />
              </>
            ) : (
              <>
                <MemorizedGaugeCard percentage={progress?.masteryPercent || 0} itemVariants={itemVariants} />
                <HifzStreaks
                  streak={progress?.streak}
                  isCompletedToday={progress?.doneToday >= progress?.dailyTarget}
                  wasActiveYesterday={progress?.streak > 0}
                  currentSurah={progress?.currentSurahName || user?.currentTargetSurah}
                  completion={progress?.masteryPercent || 0}
                  history={progress?.history || []}
                  onVisualize={onVisualize}
                />
                <MasteryHeatmap user={user} progress={progress} itemVariants={itemVariants} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden lg:block">
        <DashboardLayout>
          {/* Main Mission Control */}
          <TodayMissionCard mission={mission} itemVariants={itemVariants} history={progress?.history} />

          {/* Row 1 — 8/4: wide motivation card + compact target tracker */}
          <DashboardLayout.Item cols={8}>
            <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
          </DashboardLayout.Item>
          <DashboardLayout.Item cols={4}>
            <TargetSurahCard
              surahName={progress?.currentSurahName || user?.currentTargetSurah}
              progress={progress?.masteryPercent || 0}
              isLocked={isReciteLocked}
              itemVariants={itemVariants}
            />
          </DashboardLayout.Item>

          {/* Row 2 — 6/6 */}
          <DashboardLayout.Item cols={6}>
            <MemorizedGaugeCard percentage={progress?.masteryPercent || 0} itemVariants={itemVariants} />
          </DashboardLayout.Item>
          <DashboardLayout.Item cols={6}>
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

          {/* Row 3 - Full Width Progress Visualization */}
          <DashboardLayout.Item cols={12}>
             <MasteryHeatmap user={user} progress={progress} itemVariants={itemVariants} />
          </DashboardLayout.Item>
        </DashboardLayout>
      </div>
    </div>
  );
};

export default Home;

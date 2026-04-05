import { useOutletContext } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DailyMotivationCard from '../../components/DailyMotivationCard';
import TargetSurahCard from '../../components/TargetSurahCard';
import MemorizedGaugeCard from '../../components/MemorizedGaugeCard';
import ReviewPacerCard from '../../components/ReviewPacerCard';
import HifzStreaks from '../../components/HifzStreaks';

const Home = (props) => {
  const context = useOutletContext() || {};
  const { progress, user, dailyVerse, itemVariants, onVisualize } = { progress: {}, user: {}, ...context, ...props };

  return (
    <div className="pb-40">
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
  );
};

export default Home;
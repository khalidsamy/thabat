import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HifzStreaks from '../../components/HifzStreaks';
import DailyMotivationCard from '../../components/DailyMotivationCard';
import TargetSurahCard from '../../components/TargetSurahCard';
import MemorizedGaugeCard from '../../components/MemorizedGaugeCard';
import ReviewPacerCard from '../../components/ReviewPacerCard';
import DashboardLayout from '../../components/layout/DashboardLayout';

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
    <div className="pb-32">
      <DashboardLayout>
        <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
        <TargetSurahCard 
          surahName={progress?.currentSurahName || user?.currentTargetSurah} 
          progress={progress?.masteryPercent || 0} 
          itemVariants={itemVariants} 
        />

        <HifzStreaks 
          streak={progress?.streak} 
          isCompletedToday={progress?.doneToday >= progress?.dailyTarget} 
          wasActiveYesterday={progress?.streak > 0}
          currentSurah={progress?.currentSurahName || user?.currentTargetSurah}
          completion={progress?.masteryPercent || 0}
          history={progress?.history || []}
          onVisualize={context.onVisualize}
        />

        <MemorizedGaugeCard 
            percentage={progress?.masteryPercent || 0} 
            itemVariants={itemVariants} 
        />

        <ReviewPacerCard 
            itemVariants={itemVariants}
            className="h-full"
        />
      </DashboardLayout>
    </div>
  );
};

export default Home;

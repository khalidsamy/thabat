import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Target, Zap } from 'lucide-react';
import DashboardSectionHeader from '../../components/layout/DashboardSectionHeader';
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
    <div className="pb-40 animate-fade-in">
      <DashboardLayout>
        {/* Section 1: Spiritual Velocity */}
        <DashboardSectionHeader 
          title="Spiritual Velocity" 
          icon={LayoutDashboard} 
          subtitle="Your daily motivation & Quranic insight"
        />
        <DailyMotivationCard dailyVerse={dailyVerse} itemVariants={itemVariants} />
        
        {/* Section 2: Hifz Mission */}
        <DashboardSectionHeader 
          title="Current Mission" 
          icon={Target} 
          subtitle="Progress towards your active surah goal"
        />
        <TargetSurahCard 
          surahName={progress?.currentSurahName || user?.currentTargetSurah} 
          progress={progress?.masteryPercent || 0} 
          itemVariants={itemVariants} 
        />
        <MemorizedGaugeCard 
            percentage={progress?.masteryPercent || 0} 
            itemVariants={itemVariants} 
        />

        {/* Section 3: Pacing & Consistency */}
        <DashboardSectionHeader 
          title="Session Trends" 
          icon={Zap} 
          subtitle="Review consistency and memorization streaks"
        />
        <ReviewPacerCard 
            itemVariants={itemVariants}
            className="lg:col-span-12"
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
      </DashboardLayout>
    </div>
  );
};

export default Home;

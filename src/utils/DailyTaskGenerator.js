/**
 * DailyTaskGenerator.js
 * 📖 MISSION: GENERATE PERSONALIZED DAILY MISSIONS (Sheikh Alaa Hamed)
 */

import { REVISION_PLANS } from './RevisionEngine';

export const detectMissedTasks = (progress) => {
  if (!progress || !progress.history) return false;
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if yesterday is logged in history
  const history = progress.history || [];
  const yesterdayEntry = history.find(h => new Date(h.date).toISOString().split('T')[0] === yesterdayStr);

  // If no entry for yesterday, it's a potential miss
  if (!yesterdayEntry) return true;

  // If entry exists but doneToday (captured in history as pages or similar) was 0
  if (yesterdayEntry.pages === 0) return true;

  return false;
};

export const generateTodayMission = (user, progress) => {
  if (!user || !progress) return null;

  const mission = {
    part1: null, // Review
    part2: null, // New Hifz
    isCatchUp: false,
    pendingCatchUp: detectMissedTasks(progress) && !localStorage.getItem('thabat_catchup_ignored_today')
  };

  // If catch-up is active, we double the intensity or add a note
  const catchUpMultiplier = localStorage.getItem('thabat_catchup_active') === 'true' ? 2 : 1;
  mission.isCatchUp = catchUpMultiplier === 2;

  // Part 1: Review Logic
  const intensity = user.revisionIntensity || progress.revisionGoal || 'NONE';
  const plan = Object.values(REVISION_PLANS).find(p => p.id === intensity) || REVISION_PLANS.HIZB;
  
  if (intensity !== 'NONE') {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Use denormalized progress data or wizard status
    const totalPagesMemorized = progress.totalMemorized || (user.hifzStatus?.juzCount * 20) || 0;

    if (totalPagesMemorized > 0) {
      const dailyPages = plan.pages * catchUpMultiplier;
      const startPage = Math.floor(((dayOfYear * plan.pages) % totalPagesMemorized) + 1);
      const endPage = Math.min(startPage + Math.ceil(dailyPages) - 1, 604);
      
      mission.part1 = {
        title: mission.isCatchUp ? 'Intensive Review (Catch-up)' : 'Daily Review (الورد القديم)',
        description: `Pages ${startPage} to ${endPage}`,
        tag: mission.isCatchUp ? 'Double Wird' : plan.label,
        completed: progress.revisionCompletedToday,
        type: 'REVIEW',
        id: 'review-task'
      };
    }
  }

  // Part 2: New Hifz Logic
  if (user.currentGoal === 'MEMORIZING_NEW') {
    const dailyPages = (user.dailyCapacity?.pages || 1) * catchUpMultiplier;
    const currentPage = progress.currentPage || 1;
    
    mission.part2 = {
      title: mission.isCatchUp ? 'Double Hifz (Catch-up)' : 'New Hifz (الورد الجديد)',
      description: `Memorize ${dailyPages} page(s) starting from Page ${currentPage}`,
      tag: mission.isCatchUp ? 'Enhanced Goal' : `${dailyPages} Page/Day`,
      completed: progress.doneToday >= dailyPages,
      type: 'NEW',
      id: 'new-hifz-task'
    };
  } else {
    mission.part2 = {
      title: 'Deep Fix (تثبيت الورد)',
      description: 'Concentrate on your flagged weak areas today.',
      tag: 'Stability Focus',
      completed: progress.doneToday >= 1,
      type: 'STABILITY',
      id: 'stability-task'
    };
  }

  return mission;
};

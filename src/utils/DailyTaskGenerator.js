/**
 * DailyTaskGenerator.js
 * 📖 MISSION: GENERATE PERSONALIZED DAILY MISSIONS (Sheikh Alaa Hamed)
 */

import { REVISION_PLANS } from './RevisionEngine';

export const generateTodayMission = (user, progress) => {
  if (!user || !progress) return null;

  const mission = {
    part1: null, // Review
    part2: null, // New Hifz
  };

  // Part 1: Review Logic
  const intensity = user.revisionIntensity || progress.revisionGoal || 'NONE';
  const plan = Object.values(REVISION_PLANS).find(p => p.id === intensity) || REVISION_PLANS.HIZB;
  
  if (intensity !== 'NONE') {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Use denormalized progress data or wizard status
    const totalPagesMemorized = progress.totalMemorized || (user.hifzStatus?.juzCount * 20) || 0;

    if (totalPagesMemorized > 0) {
      const startPage = Math.floor(((dayOfYear * plan.pages) % totalPagesMemorized) + 1);
      const endPage = Math.min(startPage + Math.ceil(plan.pages) - 1, 604);
      
      mission.part1 = {
        title: 'Daily Review (الورد القديم)',
        description: `Pages ${startPage} to ${endPage}`,
        tag: plan.label,
        completed: progress.revisionCompletedToday,
        type: 'REVIEW',
        id: 'review-task'
      };
    }
  }

  // Part 2: New Hifz Logic
  if (user.currentGoal === 'MEMORIZING_NEW') {
    const dailyPages = user.dailyCapacity?.pages || 1;
    const currentPage = progress.currentPage || 1;
    
    mission.part2 = {
      title: 'New Hifz (الورد الجديد)',
      description: `Memorize ${dailyPages} page(s) starting from Page ${currentPage}`,
      tag: `${dailyPages} Page/Day`,
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

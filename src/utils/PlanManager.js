/**
 * PlanManager: Implements Alaa Hamed's "Thabat" (Stabilization) Methodology
 * 
 * CORE PRINCIPLE:
 * 1. New Hifz (Daily): The fresh pages assigned for today.
 * 2. Close Review (Daily): Review the last 5-10 pages mastered (Intensive).
 * 3. Distant Review (Daily): Review 1/8 Juz (approx 2.5 pages) of older memorization.
 * 4. Weekly Test: Saturday is for cumulative review of the entire week's new portion.
 */

export const THABAT_PLAN = {
  DAILY_PORTION: 1, // Default 1 page
  INTENSIVE_REVIEW_SIZE: 5, // Last 5 pages
  DISTANT_REVIEW_FRACTION: 2.5, // 1/8 of a Juz
};

export const getDailyTasks = (totalMemorized = 0, currentPage = 1) => {
  const isWeekend = new Date().getDay() === 6; // Saturday in JS is 6

  if (isWeekend) {
    return {
      type: 'WEEKLY_REVIEW',
      title: 'مراجعة الأسبوع (Weekly Cumulative)',
      desc: 'Review everything you memorized this week to ensure it is rock-solid.',
      pages: THABAT_PLAN.DAILY_PORTION * 5,
    };
  }

  return [
    {
      id: 'new_hifz',
      title: 'الحفظ الجديد (New Hifz)',
      pages: THABAT_PLAN.DAILY_PORTION,
      desc: `Page ${currentPage + 1} to ${currentPage + 1 + THABAT_PLAN.DAILY_PORTION}`,
      icon: 'BookOpen',
    },
    {
      id: 'intensive_review',
      title: 'المراجعة القريبة (Intensive)',
      pages: Math.min(totalMemorized, THABAT_PLAN.INTENSIVE_REVIEW_SIZE),
      desc: 'Stabilizing the last 5 pages mastered.',
      icon: 'Flame',
    },
    {
      id: 'distant_review',
      title: 'المراجعة البعيدة (Distant)',
      pages: THABAT_PLAN.DISTANT_REVIEW_FRACTION,
      desc: '1/8 Juz of older memorization.',
      icon: 'Calendar',
    }
  ];
};

export const getProgressPercentage = (current, total = 604) => {
  return Math.min(Math.round((current / total) * 100), 100);
};

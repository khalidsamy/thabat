/**
 * StreakMoods: Duolingo-style emotive states for the Hifz streak.
 */

export const MOODS = {
  EXCITED: 'excited',
  WAITING: 'waiting',
  ANXIOUS: 'anxious',
  NEWBIE: 'newbie', // 1-3 day streak
};

const ANXIOUS_MESSAGES = [
  "لا بأس، القليل المستمر خير من الكثير المنقطع.",
  "ما زال اليوم في بدايته، آية واحدة كفيلة بإحياء يومك.",
  "اشتقنا إليك! لنعد للمسار بخطوة بسيطة.",
  "المهم أن تستمر، حتى لو كانت البداية من جديد اليوم.",
];

export const getStreakMood = (streak = 0, isCompletedToday = false, wasActiveYesterday = true) => {
  if (isCompletedToday) {
    return {
      id: MOODS.EXCITED,
      emoji: '🔥',
      label: 'على الطريق الصحيح! (On Fire!)',
      animation: 'bounce',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      desc: 'You completed today\'s goal. Keep the momentum!',
    };
  }

  if (wasActiveYesterday && !isCompletedToday) {
    return {
      id: MOODS.WAITING,
      emoji: '⏳',
      label: 'بانتظارك... (Waiting for you)',
      animation: 'pulse',
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
      desc: 'A new day is here. Recite to keep your streak alive!',
    };
  }

  if (streak === 0 && !wasActiveYesterday) {
    const randomMsg = ANXIOUS_MESSAGES[Math.floor(Math.random() * ANXIOUS_MESSAGES.length)];
    return {
      id: MOODS.ANXIOUS,
      emoji: '😟',
      label: 'نحن معك! (Let\'s Start Small)',
      animation: 'shake',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      desc: randomMsg,
    };
  }

  return {
    id: MOODS.NEWBIE,
    emoji: '🌱',
    label: 'بداية مباركة (Starting Fresh)',
    animation: 'float',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    desc: 'Grow your streak to 3 days to ignite the flame!',
  };
};

export const getMoodVariants = (moodId) => {
  switch (moodId) {
    case MOODS.EXCITED:
      return {
        animate: { y: [0, -10, 0], scale: [1, 1.1, 1] },
        transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
      };
    case MOODS.WAITING:
      return {
        animate: { opacity: [0.6, 1, 0.6] },
        transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
      };
    case MOODS.ANXIOUS:
      return {
        animate: { x: [-2, 2, -2, 2, 0] },
        transition: { duration: 0.4, repeat: Infinity, ease: "linear" }
      };
    default:
      return {
        animate: { y: [2, -2, 2] },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      };
  }
};

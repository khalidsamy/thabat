import { Flame, Star, Trophy, Target, Headphones, Link2, ShieldCheck, Zap } from 'lucide-react';

export const BADGES = [
  {
    id: 'blessed_start',
    nameKey: 'achievements.blessed_start.name',
    descKey: 'achievements.blessed_start.desc',
    icon: Star,
    color: 'amber',
    requirement: (user, progress) => (progress?.totalMemorizedPages || 0) >= 3,
    goal: 3,
    current: (user, progress) => progress?.totalMemorizedPages || 0
  },
  {
    id: 'steady_flame',
    nameKey: 'achievements.steady_flame.name',
    descKey: 'achievements.steady_flame.desc',
    icon: Flame,
    color: 'orange',
    requirement: (user, progress) => (progress?.streak || 0) >= 7,
    goal: 7,
    current: (user, progress) => progress?.streak || 0
  },
  {
    id: 'exam_veteran',
    nameKey: 'achievements.exam_veteran.name',
    descKey: 'achievements.exam_veteran.desc',
    icon: ShieldCheck,
    color: 'emerald',
    requirement: (user) => (user?.examStats?.passed || 0) >= 5,
    goal: 5,
    current: (user) => user?.examStats?.passed || 0
  },
  {
    id: 'juz_explorer',
    nameKey: 'achievements.juz_explorer.name',
    descKey: 'achievements.juz_explorer.desc',
    icon: Target,
    color: 'sky',
    requirement: (user) => (user?.hifzStatus?.juzCount || 0) >= 5,
    goal: 5,
    current: (user) => user?.hifzStatus?.juzCount || 0
  },
  {
    id: 'listening_champion',
    nameKey: 'achievements.listening_champion.name',
    descKey: 'achievements.listening_champion.desc',
    icon: Headphones,
    color: 'indigo',
    requirement: (user, progress) => {
       const totalListened = progress?.history?.reduce((acc, h) => acc + (h.listenedSurahs?.length || 0), 0) || 0;
       return totalListened >= 20;
    },
    goal: 20,
    current: (user, progress) => progress?.history?.reduce((acc, h) => acc + (h.listenedSurahs?.length || 0), 0) || 0
  },
  {
    id: 'connector',
    nameKey: 'achievements.connector.name',
    descKey: 'achievements.connector.desc',
    icon: Link2,
    color: 'rose',
    requirement: (user) => (user?.linkingStats?.success || 0) >= 5,
    goal: 5,
    current: (user) => user?.linkingStats?.success || 0
  }
];

export const getUnlockedBadges = (user, progress) => {
  return BADGES.filter(badge => badge.requirement(user, progress));
};

export const getBadgeProgress = (badgeId, user, progress) => {
  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return 0;
  
  const current = badge.current(user, progress);
  return Math.min(100, Math.round((current / badge.goal) * 140) / 1.4); // For pretty UI percentage
};

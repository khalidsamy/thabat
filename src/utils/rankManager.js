/**
 * RankManager: Defines the spiritual hierarchy of the Thabat user based on memorization progress.
 */

export const RANKS = {
  MURABIT: {
    id: 'murabit',
    title: 'المرابط (The Guardian)',
    status: 'The Guardian of Consistency',
    minPages: 0,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    icon: '🛡️',
  },
  MUJAHID: {
    id: 'mujahid',
    title: 'المجاهد (The Striver)',
    status: 'The Striver for Mastery',
    minPages: 21, // ~1 Juz
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: '⚔️',
  },
  SAFFIR: {
    id: 'saffir',
    title: 'السفير (The Ambassador)',
    status: 'The Ambassador of Light',
    minPages: 101, // ~5 Juz
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    icon: '🕯️',
  },
  HAFIZ: {
    id: 'hafiz',
    title: 'الحافظ (The Preserver)',
    status: 'The Preserver of Divine Words',
    minPages: 301, // ~15 Juz
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: '📜',
  },
  MUTQIN: {
    id: 'mutqin',
    title: 'المتقن (The Master)',
    status: 'The Master of Perfection',
    minPages: 604, // 30 Juz
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: '👑',
  },
};

export const getUserRank = (pages = 0) => {
  if (pages >= RANKS.MUTQIN.minPages) return RANKS.MUTQIN;
  if (pages >= RANKS.HAFIZ.minPages) return RANKS.HAFIZ;
  if (pages >= RANKS.SAFFIR.minPages) return RANKS.SAFFIR;
  if (pages >= RANKS.MUJAHID.minPages) return RANKS.MUJAHID;
  return RANKS.MURABIT;
};

export const MILESTONES = [
  { id: 'juz_30', title: 'البداية (Juz 30)', pages: 20, icon: '🌟', surah: 'An-Naba' },
  { id: 'al_baqarah', title: 'البقرة (The Peak)', pages: 50, icon: '🏔️', surah: 'Al-Baqarah' },
  { id: 'juz_10', title: 'الثلث (10 Juz)', pages: 200, icon: '💎', surah: 'At-Tawbah' },
  { id: 'juz_20', title: 'الثلثين (20 Juz)', pages: 400, icon: '🔥', surah: 'Al-Ankabut' },
  { id: 'full_quran', title: 'الختم (The Crown)', pages: 604, icon: '👑', surah: 'An-Nas' },
];

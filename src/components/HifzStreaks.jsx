import { Flame, Star, Trophy, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getStreakMood, getMoodVariants, MOODS } from '../utils/streakMoods';

const HifzStreaks = ({ streak = 0, isCompletedToday = false, wasActiveYesterday = true, currentSurah = "", completion = 0, history = [] }) => {
  const { t, i18n } = useTranslation();
  const mood = getStreakMood(streak, isCompletedToday, wasActiveYesterday);
  const moodVariant = getMoodVariants(mood.id);

  // Localization for mood labels
  const moodLabels = {
    excited: t('streaks.excited'),
    waiting: t('streaks.waiting'),
    anxious: t('streaks.anxious'),
    newbie: t('streaks.newbie'),
  };

  // Days localization
  const days = i18n.language === 'ar' 
    ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
  // Activity: Generate from history for the last 7 days
  const activity = Array(7).fill(false);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toDateString();
    
    // Check history for this date
    const dayEntry = history.find(entry => new Date(entry.date).toDateString() === dateStr);
    if (dayEntry && dayEntry.pages > 0) {
      activity[i] = true;
    }
  }
  
  // Ensure today's live state is reflected
  activity[6] = isCompletedToday;

  return (
    <div className="bg-card dark:bg-card/50 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
      {/* Dynamic Background Glow Based on Mood */}
      <div className={`absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 blur-3xl opacity-20 transition-colors duration-1000 ${
        mood.bgColor.replace('/10', '/30')
      }`}></div>

      <div className="relative flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            {...moodVariant}
            className={`w-14 h-14 ${mood.bgColor} rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white/10`}
          >
            {mood.emoji}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              {moodLabels[mood.id]}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{mood.desc}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-black ${mood.color} tabular-nums drop-shadow-sm`}>
            {streak}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
            {t('streaks.days_streak')}
          </span>
        </div>
      </div>

      {/* Week View Visualizer */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{day}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              activity[i] 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
            }`}>
              {activity[i] ? <CheckCircle2 className="h-5 w-5" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-100 dark:border-white/5 mb-6" />

      {/* Granular Surah Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{currentSurah || t('dashboard.start_journey')}</p>
              <p className="text-[10px] text-slate-400 capitalize">{t('dashboard.current_journey')}</p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{completion}%</span>
        </div>
        
        <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Upcoming Milestone */}
      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className="h-10 w-10 flex-shrink-0 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-foreground">{t('achievements.next_milestone')}: {streak < 7 ? t('ranks.murabit') : t('ranks.mujahid')}</p>
          <p className="text-[10px] text-slate-400">{t('achievements.keep_going')}</p>
        </div>
      </div>
    </div>
  );
};

export default HifzStreaks;

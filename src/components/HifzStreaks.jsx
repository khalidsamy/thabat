import { Flame, Star, Trophy, Calendar, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getStreakMood, getMoodVariants, MOODS } from '../utils/streakMoods';

const HifzStreaks = ({ streak = 0, isCompletedToday = false, wasActiveYesterday = true, currentSurah = "", completion = 0, history = [], onVisualize }) => {
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
    <div className="lg:col-span-4 group h-full">
      <div className="bg-card dark:bg-card/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:shadow-emerald-500/10 relative overflow-hidden group">
        {/* Dynamic Background Glow Based on Mood */}
        <div className={`absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 blur-3xl opacity-20 transition-colors duration-1000 ${
          mood.bgColor.replace('/10', '/30')
        }`}></div>

        <div className="relative flex items-start justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-[0.4em] mb-1 px-1">
              {t('dashboard.active_streak_label') || 'ACTIVE STREAK'}
            </span>
            <div className="flex items-center gap-3">
               <span className="text-5xl font-black text-foreground drop-shadow-sm">{streak}</span>
               <span className="text-xl font-bold text-slate-400 mt-2">{t('dashboard.days') || 'days'}</span>
               <div className="ms-2">
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onVisualize && (
                <button 
                    onClick={onVisualize}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-black/5 border border-white/10 active:scale-95 group/btn"
                    title="Visualize Surah"
                >
                    <Sparkles className="h-5 w-5 group-hover/btn:animate-spin" />
                </button>
            )}
          </div>
        </div>

        {/* Action Button: Visualize (as shown in image) */}
        <div className="relative mt-auto">
            <button
                onClick={onVisualize}
                className="w-full bg-slate-900 border border-white/10 text-white font-black py-4 rounded-3xl shadow-xl shadow-black/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <span>{t('dashboard.visualize') || 'Visualize'}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default HifzStreaks;

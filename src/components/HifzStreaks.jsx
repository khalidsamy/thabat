import React from 'react';
import { Flame, Star, Trophy, Calendar, CheckCircle2 } from 'lucide-react';

const HifzStreaks = ({ streak = 7, totalDays = 14, currentSurah = "Al-Kahf", completion = 65 }) => {
  // Mock data for a 7-day view
  const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const activity = [true, true, true, false, true, true, true];

  return (
    <div className="bg-card dark:bg-card/50 border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Flame className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
          معسكر التثبيت (Daily Streak)
        </h3>
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
          {streak} Days Active
        </span>
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
              <p className="text-sm font-bold text-foreground">{currentSurah}</p>
              <p className="text-[10px] text-slate-400">Current Hifz Target</p>
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
          <p className="text-xs font-bold text-foreground">Next Milestone: Golden Warrior</p>
          <p className="text-[10px] text-slate-400">Reach a 10-day streak to unlock.</p>
        </div>
      </div>
    </div>
  );
};

export default HifzStreaks;

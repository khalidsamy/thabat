import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getHeatmapData } from '../utils/RevisionEngine';

const MasteryHeatmap = ({ progress, itemVariants }) => {
  const heatmapData = useMemo(() => {
    return getHeatmapData(progress);
  }, [progress]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Helper to get color based on intensity (0-1)
  const getIntensityColor = (score) => {
    if (score === 0) return 'bg-zinc-800/40';
    if (score < 0.25) return 'bg-emerald-900/60';
    if (score < 0.5) return 'bg-emerald-700/70';
    if (score < 0.75) return 'bg-emerald-500/80';
    return 'bg-emerald-400';
  };

  return (
    <motion.div variants={itemVariants} className="lg:col-span-12">
      <div className="glass-card rounded-[2rem] p-6 lg:p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)] mb-1 block">
              MASTERY PROGRESSION
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              خارطة الثبات (Stat Heatmap)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[color:var(--theme-text-muted)]">
            <span>Less</span>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-[2px] bg-zinc-800/40" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-900/60" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-500/80" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="relative overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-1 min-w-[800px]">
            {/* Weekday Labels */}
            <div className="flex flex-col gap-1 pr-3 pt-6">
              {days.map((day, i) => (
                <span key={day} className={`text-[9px] font-black uppercase h-3 flex items-center ${i % 2 === 1 ? 'text-[color:var(--theme-text-muted)]' : 'text-transparent'}`}>
                  {day}
                </span>
              ))}
            </div>

            {/* The Grid */}
            <div className="flex-1 flex gap-1">
              {(heatmapData || []).map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {(week || []).map((day, dIndex) => (
                    <div
                      key={`${wIndex}-${dIndex}`}
                      title={`${day.date}: ${Math.round(day.score * 100)}% Mastery`}
                      className={`w-3 h-3 rounded-[2px] transition-all hover:ring-2 hover:ring-white/20 cursor-pointer ${getIntensityColor(day.score)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[color:var(--theme-text-muted)] uppercase tracking-tighter">Consistency</span>
                    <span className="text-sm font-black text-foreground">94% Over 30 Days</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[color:var(--theme-text-muted)] uppercase tracking-tighter">Weak Surahs</span>
                    <span className="text-sm font-black text-foreground">{progress?.weakSurahs?.length || 0} Surahs Flagged</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-[color:var(--theme-text-muted)] uppercase tracking-tighter">Accuracy Goal</span>
                    <span className="text-sm font-black text-foreground">98.5% Target</span>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MasteryHeatmap;

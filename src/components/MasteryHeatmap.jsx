import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getJuzMasteryData } from '../utils/RevisionEngine';
import { ShieldCheck, Info } from 'lucide-react';

const MasteryHeatmap = ({ user, progress, itemVariants }) => {
  const juzData = useMemo(() => {
    return getJuzMasteryData(user, progress);
  }, [user, progress]);

  const getLevelColor = (level) => {
    switch (level) {
      case 0: return 'bg-zinc-800/40 border-transparent';
      case 1: return 'bg-rose-500/40 border-rose-500/30 ring-1 ring-rose-500/50'; 
      case 2: return 'bg-emerald-900/40 border-emerald-500/10';
      case 3: return 'bg-emerald-600/60 border-emerald-400/20';
      case 4: return 'bg-emerald-400 border-white/20 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
      default: return 'bg-zinc-800/40 border-transparent';
    }
  };

  return (
    <motion.div variants={itemVariants} className="lg:col-span-12">
      <div className="glass-card rounded-[2rem] p-6 lg:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldCheck className="w-32 h-32 text-emerald-500" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Mastery Heatmap
              </span>
              <div className="h-px w-8 bg-emerald-500/30"></div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              خارطة الثبات (Juz Stability)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(l => (
                  <div key={l} className={`w-3 h-3 rounded-[2px] ${getLevelColor(l)}`} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--theme-text-muted)]">
              Stability Levels
            </span>
          </div>
        </div>

        {/* The 30 Juz Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3 relative z-10">
          {juzData.map((juz, idx) => (
            <motion.div
              key={juz.juzNum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ scale: 1.1, zIndex: 20 }}
              className="group relative cursor-pointer"
            >
              <div className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-300 ${getLevelColor(juz.level)}`}>
                <span className={`text-[10px] font-black ${juz.level === 4 ? 'text-zinc-950' : 'text-white/60'}`}>
                    {juz.juzNum}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 glass-assistive rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 text-center shadow-2xl border-emerald-500/20">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Juz {juz.juzNum}</p>
                <p className="text-[11px] font-bold text-white mb-2">{juz.status}</p>
                <div className="h-px w-full bg-white/5 mb-2" />
                <p className="text-[9px] font-medium text-slate-400">
                    {juz.reviewCount > 0 ? `${juz.reviewCount} Recitations Logged` : 'No recent recitations'}
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-emerald-900/40" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed">
                    Colors indicate stability based on recency, accuracy (3-Error Wall), and voice evaluation scores.
                </p>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MasteryHeatmap;

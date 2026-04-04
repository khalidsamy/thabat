import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MILESTONES } from '../utils/rankManager';

const AchievementBadges = ({ pages = 0 }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-card/40 border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
          {t('achievements.title')}
        </h3>
        <p className="text-[10px] font-black text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-white/5 uppercase tracking-widest">
          {MILESTONES.filter(m => pages >= m.pages).length} / {MILESTONES.length} {t('achievements.unlocked')}
        </p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
        {MILESTONES.map((milestone, index) => {
          const isUnlocked = pages >= milestone.pages;
          
          return (
            <motion.div
              key={milestone.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-44 snap-start p-6 rounded-3xl border transition-all duration-500 relative group ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/10 shadow-xl shadow-amber-500/5' 
                  : 'bg-slate-900/50 border-transparent opacity-50'
              }`}
            >
              {isUnlocked && (
                <motion.div 
                  initial={{ x: '-100%', skewX: -20 }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                  className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none"
                />
              )}

              <div className="flex flex-col items-center text-center gap-4 relative z-20">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                  isUnlocked 
                    ? 'bg-amber-900/30' 
                    : 'bg-slate-800 grayscale'
                }`}>
                  {milestone.icon}
                </div>
                <div>
                  <h4 className={`text-sm font-bold truncate px-2 ${
                    isUnlocked ? 'text-foreground' : 'text-slate-500'
                  }`}>
                    {milestone.title}
                  </h4>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">
                    {milestone.surah}
                  </p>
                </div>
                
                {!isUnlocked && (
                    <div className="w-full mt-2">
                        <div className="flex justify-between text-[8px] mb-1 font-bold text-slate-500">
                            <span>{t('achievements.progress')}</span>
                            <span>{Math.round((pages / milestone.pages) * 100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-slate-500 transition-all duration-1000"
                                style={{ width: `${Math.min((pages / milestone.pages) * 100, 100)}%` }}
                             />
                        </div>
                    </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;

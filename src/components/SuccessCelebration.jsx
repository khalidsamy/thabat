import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const SuccessCelebration = ({ isVisible, isStreakRepair, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      // Fire confetti immediately
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#fbbf24']
      });

      // Side bursts
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 12000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      const timer = setTimeout(onClose, 4000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[11000] flex items-center justify-center pointer-events-none p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="glass-assistive p-10 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] text-center space-y-6 pointer-events-auto shadow-[0_0_100px_rgba(16,185,129,0.3)] border-emerald-500/30 max-w-sm w-full"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50"
            >
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 bg-amber-500 p-3 rounded-full shadow-lg"
            >
              <Star className="h-4 w-4 text-white fill-white" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {achievement ? 'Honor Earned!' : 'Mission Done!'}
            </h2>
            {achievement ? (
               <div className="flex flex-col items-center gap-3">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border-2 border-${achievement.color}-500 shadow-lg shadow-${achievement.color}-500/20 mt-4 group`}>
                      <achievement.icon className={`h-10 w-10 text-${achievement.color}-400`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-black uppercase text-sm tracking-widest">{achievement.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{achievement.description}</p>
                  </div>
               </div>
            ) : isStreakRepair ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-amber-500"
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="font-black uppercase tracking-widest text-xs sm:text-sm">Streak Repaired!</span>
              </motion.div>
            ) : (
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">One step closer to Thabat</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SuccessCelebration;

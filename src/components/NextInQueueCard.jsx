import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const NextInQueueCard = ({ queue, isLocked, isCompleted, itemVariants }) => {
  if (!queue && !isCompleted) return null;

  return (
    <motion.div variants={itemVariants} className="lg:col-span-12 group">
      <div className={`glass-card rounded-[2rem] p-6 lg:p-8 transition-all duration-500 overflow-hidden relative ${isCompleted ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
        
        {/* Background Accent */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors duration-700 ${isCompleted ? 'bg-emerald-500/5' : 'bg-amber-500/5'}`} />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className={`p-4 rounded-2xl shrink-0 ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
               {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : <Calendar className="h-7 w-7" />}
            </div>
            
            <div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 block ${isCompleted ? 'text-emerald-500/60' : 'text-amber-500/60'}`}>
                {isCompleted ? 'DAILY GOAL ACHIEVED' : 'NEXT IN QUEUE'}
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-foreground tracking-tight">
                {isCompleted ? 'تقبل الله منك!' : 'مراجعة اليوم (Daily Revision)'}
              </h2>
              {queue && !isCompleted && (
                <p className="mt-2 text-sm font-bold text-[color:var(--theme-text-muted)] flex items-center gap-2">
                  <span className="text-foreground">{queue.planLabel}:</span>
                  <span>Juz {Math.ceil(queue.startPage / 20)} • Pages {queue.startPage}-{queue.endPage}</span>
                </p>
              )}
              {isCompleted && (
                <p className="mt-2 text-sm font-bold text-emerald-500/80">
                  You have completed your revision for today. The gate is open!
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
             {!isCompleted ? (
               <Link 
                 to="/dashboard/review"
                 className="flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 group/btn"
               >
                 <Play className="h-5 w-5 fill-white group-hover:scale-110 transition-transform" />
                 <span>ابدأ المراجعة الآن</span>
               </Link>
             ) : (
               <div className="flex items-center gap-2 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>تم الإنجاز</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NextInQueueCard;

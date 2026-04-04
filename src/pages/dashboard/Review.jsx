import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, BookOpen, Flame, Calendar, History, ShieldAlert, GitCompare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDailyTasks } from '../../utils/PlanManager';
import MindMapModal from '../../components/MindMapModal';

const Review = (props) => {
  const { t } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, user, itemVariants } = { 
    progress: {}, 
    user: {}, 
    ...context, 
    ...props 
  };
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);

  const reviewTools = [
    { title: t('nav.errors'), icon: ShieldAlert, path: '/dashboard/errors', color: 'bg-rose-500/10 text-rose-600' },
    { title: t('nav.mutashabihat'), icon: GitCompare, path: '/dashboard/mutashabihat', color: 'bg-emerald-500/10 text-emerald-600' },
    { title: t('nav.review_sessions'), icon: History, path: '/dashboard/review-session', color: 'bg-blue-500/10 text-blue-600' },
  ];

  return (
    <div className="space-y-12 pb-32 animate-fade-in bg-background min-h-screen">
      <motion.section variants={itemVariants} className="text-center pt-8">
            <button 
                onClick={() => setIsMindMapOpen(true)}
                className="flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white rounded-3xl font-black mx-auto hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-950/20 active:scale-95 group"
            >
                <History className="h-5 w-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span className="uppercase tracking-widest text-sm">Visualize Mind-Map (🧠)</span>
            </button>
      </motion.section>

      {/* Alaa Hamed's Thabat Schedule */}
      <motion.section variants={itemVariants} className="mb-14">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-foreground flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            {t('dashboard.stabilization_tasks')}
          </h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 ms-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(getDailyTasks(progress?.totalMemorized || 0, progress?.currentPage || 1) || []).map((task) => (
            <div key={task.id} className="bg-white dark:bg-card/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 group shadow-xl shadow-slate-200/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              
              <div className="relative flex items-center gap-5 mb-6">
                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-all">
                  {task.id === 'new_hifz' ? <BookOpen className="h-6 w-6" /> : task.id === 'intensive_review' ? <Flame className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-black text-base text-zinc-950 dark:text-foreground uppercase tracking-tight">{t(`tasks.${task.id}`)}</h4>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.3em] leading-none block mt-1.5">
                    {task.pages} {t('dashboard.pages')}
                  </span>
                </div>
              </div>
              <p className="relative text-sm text-zinc-500 leading-relaxed font-bold opacity-80">{task.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Review Quick Tools */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-foreground uppercase">
            {t('dashboard.review_tools')}
          </h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 ms-6"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {reviewTools.map((tool) => (
                <Link 
                    key={tool.title} 
                    to={tool.path}
                    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-card/40 border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl shadow-slate-200/40 hover:scale-[1.03] hover:shadow-2xl transition-all text-center group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/[0.02] transition-colors duration-500"></div>
                    <div className={`p-6 rounded-3xl mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg ${tool.color}`}>
                        <tool.icon className="h-10 w-10" />
                    </div>
                    <span className="font-black text-lg text-zinc-950 dark:text-foreground group-hover:text-emerald-600 transition-colors uppercase tracking-widest">
                        {tool.title}
                    </span>
                </Link>
            ))}
        </div>
      </motion.section>

      <MindMapModal 
          isOpen={isMindMapOpen} 
          onClose={() => setIsMindMapOpen(false)} 
          pageNumber={progress?.currentPage}
      />
    </div>
  );
};

export default Review;

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
  const { progress, itemVariants } = { ...context, ...props };
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);

  const reviewTools = [
    { title: t('nav.errors'), icon: ShieldAlert, path: '/errors', color: 'bg-rose-500/10 text-rose-600' },
    { title: t('nav.mutashabihat'), icon: GitCompare, path: '/mutashabihat', color: 'bg-emerald-500/10 text-emerald-600' },
    { title: t('nav.review_sessions'), icon: History, path: '/review', color: 'bg-blue-500/10 text-blue-600' },
  ];

  return (
    <div className="space-y-8 pb-32">
      <motion.section variants={itemVariants} className="text-center">
            <button 
                onClick={() => setIsMindMapOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold mx-auto hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
                <span>Visualize (🧠)</span>
            </button>
      </motion.section>

      {/* Alaa Hamed's Thabat Schedule */}
      <motion.section variants={itemVariants} className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {t('dashboard.stabilization_tasks')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent ms-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(getDailyTasks(progress?.totalMemorized || 0, progress?.currentPage || 1) || []).map((task) => (
            <div key={task.id} className="bg-card dark:bg-card/50 border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-colors group shadow-sm shadow-black/5">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  {task.id === 'new_hifz' ? <BookOpen className="h-5 w-5" /> : task.id === 'intensive_review' ? <Flame className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t(`tasks.${task.id}`)}</h4>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none block mt-1">
                    {task.pages} {t('dashboard.pages')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-secondary-foreground leading-relaxed font-medium opacity-70">{task.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Review Quick Tools */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t('dashboard.review_tools')}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {reviewTools.map((tool) => (
                <Link 
                    key={tool.title} 
                    to={tool.path}
                    className="flex flex-col items-center justify-center p-8 bg-card border border-gray-100 dark:border-white/5 rounded-3xl shadow-lg shadow-black/5 hover:scale-105 transition-all text-center group"
                >
                    <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
                        <tool.icon className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">
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

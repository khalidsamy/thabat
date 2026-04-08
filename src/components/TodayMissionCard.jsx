import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const TodayMissionCard = ({ mission, itemVariants }) => {
  if (!mission) return null;

  const tasks = [mission.part1, mission.part2].filter(Boolean);

  return (
    <motion.div variants={itemVariants} className="lg:col-span-12">
      <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Today's Mission</span>
              <div className="h-px w-12 bg-emerald-500/30"></div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Your Spiritual Goals</h2>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Focus</p>
              <p className="text-sm font-black text-emerald-400 capitalize">{mission.part2?.type.toLowerCase()}</p>
            </div>
            <div className="px-4 py-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Level</p>
              <p className="text-sm font-black text-white">{mission.part1?.tag || 'Balanced'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id || idx}
              whileHover={{ y: -5 }}
              className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden group/task ${
                task.completed 
                  ? 'border-emerald-500/30 bg-emerald-500/5' 
                  : 'border-white/5 bg-white/[0.03] hover:border-emerald-500/20'
              }`}
            >
              {task.completed && (
                <div className="absolute top-0 right-0 p-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
              )}

              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                }`}>
                  {task.type === 'REVIEW' ? <ShieldCheck className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                    task.completed ? 'text-emerald-500/80' : 'text-slate-500'
                  }`}>
                    {task.tag}
                  </p>
                  <h4 className="text-xl font-black text-white truncate mb-1">{task.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed truncate">{task.description}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                  task.completed ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {task.completed ? 'Completed' : 'Task Pending'}
                </span>
                <ArrowRight className={`h-4 w-4 transition-transform ${
                  task.completed ? 'text-emerald-500' : 'text-slate-700 group-hover/task:translate-x-1 group-hover/task:text-emerald-500'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>

        {!mission.part1 && !mission.part2 && (
          <div className="text-center py-12">
            <p className="text-slate-500 font-bold">No tasks generated. Complete the setup wizard.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TodayMissionCard;

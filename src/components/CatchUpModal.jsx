import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Calendar, ArrowRight } from 'lucide-react';

const CatchUpModal = ({ isOpen, onCatchUp, onReschedule, onIgnore }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card max-w-lg w-full rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl shadow-black/50"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-3xl flex items-center justify-center border border-amber-500/20 text-amber-500">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Missed a day?</h2>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Consistency is key</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed font-medium">
              We noticed you couldn't complete your hifz mission yesterday. Don't worry—life happens! How would you like to handle your progress?
            </p>

            <div className="space-y-4">
              <button
                onClick={onCatchUp}
                className="w-full group p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-left flex items-center justify-between active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-white">Start Catch-up</p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Double today's goal & repair your streak.</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onReschedule}
                className="w-full group p-6 rounded-3xl bg-white/5 border-2 border-white/5 hover:bg-white/10 transition-all text-left flex items-center justify-between active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-white">Reschedule Plan</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Shift the schedule forward (Streak resets).</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button
              onClick={onIgnore}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CatchUpModal;

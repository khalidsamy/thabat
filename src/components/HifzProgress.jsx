import React from 'react';
import { motion } from 'framer-motion';

const HifzProgress = ({ current = 0, total = 604, label = "Hifz Journey" }) => {
  const percentage = Math.round((current / total) * 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-card/50 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 flex flex-col items-center justify-center transition-all duration-300">
      <div className="relative flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          />
        </svg>
        
        {/* Percentage Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-foreground">{percentage}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Complete</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-sm font-bold text-foreground">{label}</h4>
        <p className="text-xs text-slate-400 mt-1">
          {current} of {total} Pages
        </p>
      </div>
    </div>
  );
};

export default HifzProgress;

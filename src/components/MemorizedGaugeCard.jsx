import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MemorizedGaugeCard = ({ percentage, itemVariants }) => {
  const { t } = useTranslation();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-4 group h-full"
    >
      <div className="bg-card/40 border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/5 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:shadow-emerald-500/10 backdrop-blur-md inner-glow">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em] mb-2 px-1">
            {t('dashboard.total_memorized_label') || 'Hifz Progress'}
          </span>
        </div>

        <div className="relative flex items-center justify-center flex-1 py-4">
          {/* Outer Glow Ring */}
          <div className="absolute w-56 h-56 rounded-full border border-emerald-500/5 bg-emerald-500/5 blur-3xl opacity-20" />
          
          <svg className="w-52 h-52 transform -rotate-90 relative z-10">
            {/* Background Circle (Deep Track) */}
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="currentColor"
              strokeWidth="20"
              fill="transparent"
              className="text-slate-900 shadow-inner"
            />
            {/* Progress Circle (Sleek Emerald) */}
            <motion.circle
              cx="104"
              cy="104"
              r={radius}
              stroke="currentColor"
              strokeWidth="20"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
              className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            />
          </svg>
          
          {/* Percentage Text with High-End Label */}
          <div className="absolute flex flex-col items-center z-20">
            <span className="text-5xl font-black text-white tracking-tighter">{percentage}%</span>
            <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.2em] mt-1">
               {t('dashboard.memorized') || 'Memorized'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center mt-2 group-hover:scale-110 transition-transform">
            <div className="py-2 px-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                  {percentage === 100 ? 'Khatm Complete' : 'Mission Active'}
                </span>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemorizedGaugeCard;

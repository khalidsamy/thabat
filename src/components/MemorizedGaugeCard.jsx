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
      <div className="bg-card/40 border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/5 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:shadow-emerald-500/10 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.4em] mb-2 px-1">
            {t('dashboard.total_memorized_label') || 'TOTAL MEMORIZED'}
          </span>
        </div>

        <div className="relative flex items-center justify-center flex-1 py-4">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Progress Circle with Glow */}
            <motion.circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
              className="text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            />
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-white">{percentage}%</span>
          </div>
        </div>

        <div className="flex items-center justify-center mt-2">
            <div className="py-1 px-4 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Complete</span>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemorizedGaugeCard;

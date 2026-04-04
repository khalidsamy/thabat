import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, subtitle, className = "" }) => {
  return (
    <motion.div 
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className={`bg-card/40 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between group overflow-hidden border border-white/5 shadow-xl shadow-black/40 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em] mb-2 group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
          <p className="text-3xl font-black text-white drop-shadow-sm">
            {value !== undefined ? value : '--'}
          </p>
        </div>
        
        {icon && (
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            {React.cloneElement(icon, { className: "h-6 w-6 stroke-[2.5]" })}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs font-semibold text-slate-400/70 border-t border-white/5 pt-3 mt-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;

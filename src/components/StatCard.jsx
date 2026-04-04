import React from 'react';

const StatCard = ({ title, value, icon, subtitle, className = "" }) => {
  return (
    <div className={`glass-card dark:glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:glow-border flex flex-col justify-between group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-500 dark:text-emerald-500/80 uppercase tracking-widest mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">
            {value !== undefined ? value : '--'}
          </p>
        </div>
        
        {icon && (
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
            {React.cloneElement(icon, { className: "h-6 w-6 stroke-[2.5]" })}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-400/70 border-t border-slate-200/50 dark:border-white/5 pt-3 mt-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;

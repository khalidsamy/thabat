import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, icon, subtitle, className = "", variant = "grid" }) => {
  const isList = variant === "list";

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        backgroundColor: "rgba(30, 48, 80, 0.5)",
        transition: { duration: 0.2 }
      }}
      className={`relative group overflow-hidden transition-all duration-300 inner-glow premium-shadow ${
        isList
          ? 'bg-slate-900/60 rounded-[1.5rem] p-4 flex items-center gap-4 border border-white/5'
          : 'bg-card/40 rounded-3xl p-6 flex flex-col justify-between border border-white/5'
      } ${className}`}
    >
      <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${
        isList
          ? 'w-12 h-12 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:bg-emerald-500/20'
          : 'p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 mb-4 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]'
      }`}>
        {icon && React.cloneElement(icon, { className: isList ? "h-5 w-5" : "h-6 w-6 stroke-[2.5]" })}
      </div>

      <div className={`flex-1 ${isList ? 'flex items-center justify-between' : 'flex flex-col'}`}>
        <div>
          <h3 className={`font-black uppercase tracking-[0.3em] transition-colors ${
            isList ? 'text-[9px] text-slate-500 mb-0.5' : 'text-[10px] text-emerald-500/80 mb-2'
          }`}>
            {title}
          </h3>
          <p className={`${isList ? 'text-lg' : 'text-3xl'} font-black text-white leading-tight`}>
            {value !== undefined ? value : '--'}
          </p>
        </div>

        {isList ? (
          <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-emerald-500 transition-colors" />
        ) : (
          subtitle && (
            <p className="text-xs font-semibold text-slate-400/70 border-t border-white/5 pt-3 mt-4">
              {subtitle}
            </p>
          )
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
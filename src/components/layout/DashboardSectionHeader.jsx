import React from 'react';
import { motion } from 'framer-motion';

const DashboardSectionHeader = ({ title, icon: Icon, subtitle }) => {
  return (
    <div className="col-span-full pt-8 pb-4">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 rounded-xl border border-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
               <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
              {title}
            </h2>
            {subtitle && (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Decorative Gradient Line */}
        <div className="flex-1 h-[1px] bg-gradient-to-r from-emerald-500/20 to-transparent ml-8 hidden md:block" />
      </div>
    </div>
  );
};

export default DashboardSectionHeader;

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ReviewPacerCard = ({ data = [], itemVariants }) => {
  const { t } = useTranslation();
  
  // Dummy data if empty to ensure visual consistency
  const chartData = data.length > 0 ? data : [
    { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 22 }, { value: 40 }
  ];

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-4 group h-full"
    >
      <div className="bg-card dark:bg-card/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-500/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 dark:text-indigo-500/40 uppercase tracking-[0.4em] mb-2 px-1">
            {t('dashboard.review_pacer_label') || 'REVIEW PACER'}
          </span>
        </div>

        <div className="flex-1 w-full mt-6 -mb-4 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-500">Live Pacer</span>
            </div>
            <span className="text-sm font-black text-foreground">30-min pacer</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewPacerCard;

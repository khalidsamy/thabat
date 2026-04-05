import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const FALLBACK_DATA = [
  { value: 10 }, { value: 25 }, { value: 15 },
  { value: 30 }, { value: 22 }, { value: 40 },
];

const ReviewPacerCard = ({ data = [], itemVariants }) => {
  const { t } = useTranslation();
  const chartData = data.length > 0 ? data : FALLBACK_DATA;

  return (
    <motion.div variants={itemVariants} className="lg:col-span-4 group h-full">
      <div className="bg-card/40 border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/5 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-500/10 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-black text-indigo-500/40 uppercase tracking-[0.4em] mb-2 px-1 block">
            {t('dashboard.review_pacer_label') || 'REVIEW PACER'}
          </span>
        </div>

        {/* Fixed 120px height — percentage height fails when the parent
            is a flex column without a fixed size. */}
        <div style={{ width: '100%', height: 120 }} className="mt-4 -mx-4 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="value"
                stroke="#6366f1" strokeWidth={3}
                fillOpacity={1} fill="url(#colorValue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-500">Live Pacer</span>
          </div>
          <span className="text-sm font-black text-white">30-min pacer</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewPacerCard;
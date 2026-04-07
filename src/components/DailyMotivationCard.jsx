import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Star, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DailyMotivationCard = ({ dailyVerse, itemVariants }) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      variants={itemVariants}
      className="lg:col-span-8 group h-full"
    >
      <div className="glass-card relative h-full min-h-[400px] overflow-hidden rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-emerald-500/10 group">
        {/* Glassmorphism Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 blur-3xl transition-transform duration-1000 group-hover:scale-110 bg-[color:var(--theme-accent-soft)]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full -ml-32 -mb-32 blur-3xl bg-[color:var(--theme-amber-soft)]"></div>

        {/* Header: Title */}
        <div className="relative flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 text-[color:var(--theme-text-muted)]">
              {t('dashboard.daily_motivation') || 'DAILY MOTIVATION'}
            </span>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {t('dashboard.daily_verse') || 'Daily Verse'}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-muted)] shadow-xl group-hover:rotate-6 transition-transform">
            <Sparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Content: Verse */}
        <div className="relative py-6">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-[1.4] drop-shadow-sm mb-4 text-center sm:text-right" dir="rtl">
            {dailyVerse?.arabic}
          </p>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500/80" dir="rtl">
              — {dailyVerse?.reference}
            </p>
            <p className="text-sm sm:text-base font-medium italic leading-relaxed max-w-xl text-center sm:text-right text-[color:var(--theme-text-soft)]">
              {dailyVerse?.english}
            </p>
          </div>
        </div>

        {/* Footer: Spiritual Status Icons */}
        <div className="relative pt-6 border-t border-[color:var(--theme-border)]">
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
            <div className="flex flex-col max-sm:items-center">
              <span className="text-[9px] font-black uppercase tracking-widest mb-3 px-1 text-[color:var(--theme-text-muted)]">
                {t('dashboard.spiritual_status') || 'Spiritual Status'}
              </span>
              <div className="flex items-center gap-3">
                {[
                  { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                  { icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, scale: 1.1 }}
                    className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center border border-white/5 cursor-pointer transition-all shadow-lg shadow-black/5 hover:border-emerald-500/30`}
                  >
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyMotivationCard;

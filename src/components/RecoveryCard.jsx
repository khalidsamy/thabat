import { HeartPulse, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MOTIVATIONAL_HADITHS = [
  {
    text: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ",
    translation: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: "صحيح البخاري"
  },
  {
    text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation: "The best among you are those who learn the Quran and teach it.",
    source: "صحيح البخاري"
  },
  {
    text: "لا شَيْءَ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ مِنْ حُسْنِ الْخُلُقِ",
    translation: "Nothing is heavier on the believer's scale than excellence in character and consistency.",
    source: "سنن الترمدي"
  }
];

const RecoveryCard = ({ onStartSmall }) => {
  const { t } = useTranslation();
  const hadith = MOTIVATIONAL_HADITHS[Math.floor(Math.random() * MOTIVATIONAL_HADITHS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-card dark:bg-[#1a1617] border-2 border-rose-100 dark:border-rose-900/30 rounded-[3rem] p-6 lg:p-8 shadow-2xl shadow-rose-500/10 h-full max-h-[480px] overflow-hidden relative group"
    >
      {/* Decorative doctor-themed blur */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
      
      <div className="relative flex flex-col h-full items-center justify-between gap-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-200 dark:shadow-black/20 group-hover:scale-110 transition-transform">
            <HeartPulse className="h-8 w-8 text-rose-500 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-950 px-3 py-1 rounded-full">
              {t('recovery.doctor_mode')}
            </span>
            <h3 className="text-xl font-black text-foreground">
              {t('recovery.doctor_title')}
            </h3>
            <p className="text-[11px] font-medium text-slate-400 max-w-[200px] mx-auto leading-tight">
              {t('recovery.doctor_subtitle')}
            </p>
          </div>
        </div>

        <div className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-[2rem] p-5 border border-white dark:border-white/5 space-y-3">
          <p className="text-base font-bold text-foreground leading-snug line-clamp-3" dir="rtl">
             "{hadith.text}"
          </p>
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3">
            <p className="text-[9px] font-black text-rose-600/70 dark:text-rose-400/60 uppercase tracking-widest" dir="rtl">
              — {hadith.source}
            </p>
            <p className="text-[9px] font-medium text-slate-400 line-clamp-1 max-w-[150px]">
              {hadith.translation}
            </p>
          </div>
        </div>

        {/* Surah Progress Indicator */}
        <div className="w-full space-y-1.5">
           <div className="flex justify-between items-end">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Surah Goal</span>
              <span className="text-[8px] font-black text-rose-500 uppercase">Recovery</span>
           </div>
           <div className="h-1.5 w-full bg-rose-100 dark:bg-rose-900/20 rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '35%' }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-rose-500 rounded-full" 
              />
           </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartSmall}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 group transition-all"
        >
          <span>{t('recovery.cta')}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RecoveryCard;

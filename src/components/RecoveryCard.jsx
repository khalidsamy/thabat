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
      className="bg-card dark:bg-[#1a1617] border-2 border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] p-8 shadow-2xl shadow-rose-500/10 mb-10 overflow-hidden relative"
    >
      {/* Decorative doctor-themed blur */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full -mr-24 -mt-24 blur-3xl" />
      
      <div className="relative flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/40 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg shadow-rose-200 dark:shadow-black/20">
          <HeartPulse className="h-10 w-10 text-rose-500 animate-pulse" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="mb-4">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-950 px-4 py-1.5 rounded-full">
              {t('recovery.doctor_mode')}
            </span>
            <h3 className="text-2xl font-black text-foreground mt-3 mb-1">
              {t('recovery.doctor_title')}
            </h3>
            <p className="text-sm font-medium text-slate-400">
              {t('recovery.doctor_subtitle')}
            </p>
          </div>

          <div className="bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-white dark:border-white/5">
            <p className="text-xl font-bold text-foreground mb-2 leading-relaxed" dir="rtl">
               "{hadith.text}"
            </p>
            <p className="text-xs font-medium text-rose-600/70 dark:text-rose-400/60 uppercase tracking-widest mb-2" dir="rtl">
              — {hadith.source}
            </p>
            <p className="text-xs font-medium text-slate-400 italic">
              {hadith.translation}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartSmall}
          className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-5 rounded-[1.5rem] font-bold shadow-xl shadow-rose-500/30 flex items-center gap-3 group transition-all duration-300"
        >
          <span>{t('recovery.cta')}</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RecoveryCard;

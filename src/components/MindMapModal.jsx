import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Layers, Type, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const MindMapModal = ({ isOpen, onClose, pageNumber = 1 }) => {
  const { t, i18n } = useTranslation();
  const [surahData, setSurahData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Approximate Surah by Page (Simplified mapping)
  const getSurahFromPage = (page) => {
    if (page <= 1) return 1; // Al-Fatihah
    if (page <= 50) return 2; // Al-Baqarah
    if (page <= 76) return 3; // Al-Imran
    return 114; // Fallback to shorten test logic
  };

  useEffect(() => {
    if (isOpen) {
      const fetchSurahMetadata = async () => {
        setIsLoading(true);
        try {
          const surahNum = getSurahFromPage(pageNumber);
          const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNum}`);
          if (response.data.code === 200) {
            setSurahData(response.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch mind map data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSurahMetadata();
    }
  }, [isOpen, pageNumber]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-1">
                  {i18n.language === 'ar' ? 'خارطة التثبيت (Mind Map)' : 'Stabilization Map'}
                </h2>
                <p className="text-emerald-100/80 font-medium text-sm">
                  {i18n.language === 'ar' ? 'تصور هيكلي للسورة الحالية' : 'Structural visualization of the current Surah'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
                <p className="animate-pulse">{i18n.language === 'ar' ? 'جاري بناء الخارطة...' : 'Building Map...'}</p>
              </div>
            ) : surahData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-bold text-foreground">{i18n.language === 'ar' ? 'اسم السورة' : 'Surah Name'}</h4>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400" dir="rtl">
                      {surahData.name} ({surahData.englishName})
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <Layers className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-bold text-foreground">{i18n.language === 'ar' ? 'عدد الآيات' : 'Total Verses'}</h4>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {surahData.numberOfAyahs} {i18n.language === 'ar' ? 'آية' : 'Ayahs'}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border-2 border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Globe className="h-20 w-20 text-emerald-500" />
                   </div>
                   <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <Type className="h-5 w-5 text-emerald-500" />
                        <h4 className="font-bold text-foreground">{i18n.language === 'ar' ? 'النزول والنمط' : 'Revelation & Type'}</h4>
                      </div>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {i18n.language === 'ar' 
                          ? `${surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - نزلت بترتيب ${surahData.number}` 
                          : `${surahData.revelationType} - Revelation order: ${surahData.number}`}
                      </p>
                      <p className="mt-4 text-sm text-secondary-foreground leading-relaxed">
                        {i18n.language === 'ar'
                          ? 'هذه الخارطة تساعدك على تثبيت المحفوظ من خلال فهم السياق التاريخي والهيكلي للسورة.'
                          : 'This map helps stabilize your memorization by understanding the historical and structural context.'}
                      </p>
                   </div>
                </div>
              </div>
            ) : (
                <p className="text-center py-20 opacity-50">Data unavailable.</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MindMapModal;

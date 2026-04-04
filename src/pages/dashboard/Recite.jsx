import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Mic, MicOff, Sparkles, CheckCircle2, ChevronRight, Volume2, Search, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useVoiceCorrection } from '../../hooks/useVoiceCorrection';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const Recite = (props) => {
  const { t } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, user, handleVoiceComplete, itemVariants } = { 
    progress: {}, 
    user: {}, 
    ...context, 
    ...props 
  };
  const { showSuccess, showError } = useToast();

  // State Management
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(1); // Default Al-Fatihah
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(7);
  const [targetVerses, setTargetVerses] = useState([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Voice Correction Hook
  const { 
    isListening, 
    transcript, 
    matches, 
    masteryScore, 
    error, 
    startListening, 
    stopListening, 
    resetCorrection 
  } = useVoiceCorrection(targetVerses);

  // Fetch Surahs on Mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await axios.get('https://api.alquran.cloud/v1/surah');
        setSurahs(res.data.data);
      } catch (err) {
        showError('Failed to fetch Surah list');
      }
    };
    fetchSurahs();
  }, [showError]);

  // Fetch Target Verses when selection changes
  const loadTargetVerses = async () => {
    setIsLoadingVerses(true);
    try {
      const verses = [];
      for (let i = ayahFrom; i <= ayahTo; i++) {
        const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${i}/quran-uthmani`);
        verses.push({
          numberInSurah: i,
          text: res.data.data.text,
          surah: res.data.data.surah.name
        });
      }
      setTargetVerses(verses);
      resetCorrection();
    } catch (err) {
      showError('Failed to fetch specific verses');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleLog = async () => {
    stopListening();
    try {
      const surahName = surahs.find(s => s.number === selectedSurah)?.englishName || '';
      
      // 1. Log the mastery score to user history
      await api.post('/progress/mastery', { 
        score: masteryScore,
        surah: surahName
      });

      // 2. Update the actual progress pages in the tracker
      const pagesToLog = Math.ceil(targetVerses.length / 2) || 1;
      await api.post('/progress/update', { 
        pages: pagesToLog
      });

      showSuccess(t('dashboard.progress_logged') || 'Recitation mastery logged successfully!');
      setShowSummary(true);
      
      // Update global context/state
      if (handleVoiceComplete) {
        handleVoiceComplete(masteryScore, surahName);
      }
    } catch (err) {
      showError(err.message || 'Failed to log progress');
    }
  };

  return (
    <div className="pb-40 animate-fade-in">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12">
        
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div 
              key="tutor-main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            >
              {/* LEFT SIDEBAR: CONFIGURATION (4 COLS) */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-card dark:bg-card/40 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 animate-slide-in">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      Selection Range
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-[0.3em] px-1">Choose Surah</label>
                       <select 
                          value={selectedSurah}
                          onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                          className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                       >
                          {surahs.map(s => (
                            <option key={s.number} value={s.number}>{s.number}. {s.englishName} ({s.name})</option>
                          ))}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-[0.3em] px-1">From Ayah</label>
                          <input 
                            type="number"
                            min="1"
                            value={ayahFrom}
                            onChange={(e) => setAyahFrom(parseInt(e.target.value))}
                            className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500/40 uppercase tracking-[0.3em] px-1">To Ayah</label>
                          <input 
                            type="number"
                            min="1"
                            value={ayahTo}
                            onChange={(e) => setAyahTo(parseInt(e.target.value))}
                            className="w-full h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={loadTargetVerses}
                      disabled={isLoadingVerses}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-16 rounded-2xl font-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isLoadingVerses ? (
                         <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Load Verses</span>
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Score Dashboard (Optional Stats) */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-900/40 border border-white/10 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative">
                        <span className="text-[10px] font-black text-indigo-100/40 uppercase tracking-[0.4em] mb-1 block">Live Mastery</span>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-5xl font-black tracking-tighter">{masteryScore}%</span>
                            <span className="text-xs font-bold text-indigo-100/60 mb-2">accuracy</span>
                        </div>
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${masteryScore}%` }}
                                className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* RIGHT CONTENT: TUTOR ENGINE (8 COLS) */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-card dark:bg-card/40 border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-xl shadow-black/5 flex flex-col items-center justify-between min-h-[700px] relative overflow-hidden">
                    
                    {/* Header Action */}
                    <div className="relative w-full flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                <Volume2 className="h-5 w-5" />
                            </div>
                            <h4 className="text-lg font-black text-foreground">AI Recitation Tutor</h4>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`px-4 py-2 rounded-full border border-gray-100 dark:border-white/10 flex items-center gap-2 transition-colors duration-500 ${isListening ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{isListening ? 'Listening' : 'Ready'}</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN MICROPHONE AREA */}
                    <div className="relative group/btn my-10">
                        {/* THE PURE CENTERED PULSE */}
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: [1, 2, 1], opacity: [0.1, 0, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-rose-500 rounded-full blur-[60px]"
                                />
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isListening ? stopListening : startListening}
                            className={`w-40 h-40 lg:w-56 lg:h-56 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 relative z-10 ${
                                isListening 
                                    ? 'bg-rose-500 shadow-rose-500/40 ring-[12px] ring-rose-500/10' 
                                    : 'bg-emerald-500 shadow-emerald-500/30 ring-[12px] ring-emerald-500/10 hover:shadow-emerald-500/50'
                            }`}
                        >
                            {isListening ? (
                                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                    <MicOff className="h-16 w-16 lg:h-24 lg:w-24" />
                                </motion.div>
                            ) : (
                                <Mic className="h-16 w-16 lg:h-24 lg:w-24" />
                            )}
                        </motion.button>
                    </div>

                    {/* LIVE CORRECTION BOX (THE STAR FEATURE) */}
                    <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 lg:p-10 min-h-[220px] flex flex-wrap items-center justify-center gap-x-4 gap-y-3 shadow-inner text-center" dir="rtl">
                        {targetVerses.length > 0 ? (
                           matches.map((word, i) => (
                             <motion.span 
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.01 }}
                                className={`text-2xl lg:text-3xl font-extrabold transition-all duration-500 ${
                                  word.status === 'correct' ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] scale-110' :
                                  word.status === 'wrong' ? 'text-rose-500' :
                                  'text-slate-300 dark:text-slate-700'
                                }`}
                             >
                               {word.text}
                             </motion.span>
                           ))
                        ) : (
                          <p className="text-slate-400 font-bold italic opacity-40 text-xl" dir="ltr">Load a range to begin correction</p>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="w-full flex justify-center pt-10">
                        {targetVerses.length > 0 && (
                            <button
                                onClick={handleLog}
                                disabled={masteryScore < 20}
                                className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30 disabled:grayscale"
                            >
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                <span>Confirm & Log Mastery</span>
                            </button>
                        )}
                    </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="tutor-summary"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-xl mx-auto bg-card rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100 dark:border-white/5"
            >
              <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trophy className="h-12 w-12 text-amber-500" />
              </div>
              <h2 className="text-4xl font-black text-foreground mb-4">Masha'Allah!</h2>
              <p className="text-lg text-slate-500 font-medium mb-12">You have successfully mastered this recitation section with amazing accuracy.</p>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 mb-10">
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Final Score</span>
                        <span className="text-4xl font-black text-emerald-500">{masteryScore}%</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verses</span>
                        <span className="text-4xl font-black text-foreground">{targetVerses.length}</span>
                     </div>
                  </div>
              </div>

              <button 
                onClick={() => setShowSummary(false)}
                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              >
                Back to Tutor
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Recite;

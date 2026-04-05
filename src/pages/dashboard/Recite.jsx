import React, { useState, useEffect, useCallback } from 'react';
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

  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(7);
  const [targetVerses, setTargetVerses] = useState([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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

  const playErrorChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.error('Audio chime failed', e);
    }
  }, []);

  const handleRecitationError = useCallback((word) => {
    // 1. Physical Haptic Feedback (Compatibility Check)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // 2. Audible subtle cue
    playErrorChime();

    // 3. Professional Visual Alert (Arabic)
    showError("خطأ في التلاوة، يرجى إعادة الآية");
  }, [showError, playErrorChime]);

  const handleLog = async () => {
    stopListening();
    try {
      const surahName = surahs.find(s => s.number === selectedSurah)?.englishName || '';
      
      await api.post('/progress/mastery', { 
        score: masteryScore,
        surah: surahName
      });

      const pagesToLog = Math.ceil(targetVerses.length / 2) || 1;
      await api.post('/progress/update', { 
        pages: pagesToLog
      });

      const wrongWords = matches.filter(m => m.status === 'wrong');
      if (wrongWords.length > 0) {
        const uniqueWrongTexts = [...new Set(wrongWords.map(m => m.text))];
        
        for (const wordText of uniqueWrongTexts) {
            await api.post('/errors', {
                surah: surahName,
                verse: ayahFrom,
                wrongText: wordText,
                correctText: wordText,
                type: 'pronunciation',
                note: `Automatically logged during AI Recitation session (${masteryScore}% accuracy)`
            }).catch(err => console.error("Failed to log error:", err));
        }
      }

      showSuccess(t('dashboard.progress_logged') || 'Recitation mastery logged successfully!');
      setShowSummary(true);
      
      if (handleVoiceComplete) {
        handleVoiceComplete(masteryScore, surahName);
      }
    } catch (err) {
      showError(err.message || 'Failed to log progress');
    }
  };

  return (
    <div className="pb-40 animate-fade-in bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-12 pt-8">
        
        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div 
              key="tutor-main"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10"
            >
              {/* STEP 1: TARGET RANGE SELECTION */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-card/40 border border-white/5 rounded-3xl p-8 shadow-xl shadow-black/5 animate-slide-in">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-foreground">
                      Target Range
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] px-1">Surah Selection</label>
                       <select 
                          value={selectedSurah}
                          onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                          className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                       >
                          {surahs.map(s => (
                            <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>
                          ))}
                       </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] px-1">From Ayah</label>
                          <input 
                            type="number"
                            min="1"
                            value={ayahFrom}
                            onChange={(e) => setAyahFrom(parseInt(e.target.value))}
                            className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] px-1">To Ayah</label>
                          <input 
                            type="number"
                            min="1"
                            value={ayahTo}
                            onChange={(e) => setAyahTo(parseInt(e.target.value))}
                            className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                       </div>
                    </div>

                    <button 
                      onClick={loadTargetVerses}
                      disabled={isLoadingVerses}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-16 rounded-3xl font-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isLoadingVerses ? (
                         <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Pre-load Range</span>
                          <ChevronRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Accuracy Metric */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-3xl p-8 shadow-2xl shadow-emerald-900/10 border border-white/10 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative">
                        <span className="text-[10px] font-black text-emerald-100/40 uppercase tracking-[0.4em] mb-1 block">Recitation Mastery</span>
                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-5xl font-black tracking-tighter">{masteryScore}%</span>
                        </div>
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${masteryScore}%` }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* STEP 2 & 3: CONTINUOUS AI RECITER */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-card/40 border border-white/5 rounded-[2.5rem] p-10 lg:p-14 shadow-xl shadow-zinc-900/5 flex flex-col items-center justify-between min-h-[750px] relative overflow-hidden group/tutor">
                    
                    <div className="relative w-full flex flex-col items-center mb-8">
                        <h4 className="text-2xl font-black text-foreground mb-4">Al Quran Tutor</h4>
                        <div className="flex items-center gap-4">
                            <div className="px-6 py-2.5 bg-slate-900 border border-white/10 rounded-2xl flex items-center gap-3">
                                <Volume2 className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">
                                  {surahs.find(s => s.number === selectedSurah)?.englishName || "Surah Selection"}
                                </span>
                            </div>
                            <div className="px-6 py-2.5 bg-emerald-500/20 border border-emerald-500/20 rounded-2xl">
                                <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">Verses {ayahFrom}-{ayahTo}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-slate-900/50 border-2 border-white/5 shadow-inner rounded-3xl p-8 lg:p-12 min-h-[320px] flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-center relative z-20" dir="rtl">
                        {targetVerses.length > 0 ? (
                           matches.map((word, i) => (
                             <motion.span 
                                key={i}
                                initial={{ opacity: 0.3, scale: 0.95 }}
                                animate={{ 
                                    opacity: word.status === 'pending' ? 0.3 : 1, 
                                    scale: word.status === 'pending' ? 0.95 : 1,
                                    y: word.status === 'pending' ? 0 : -2
                                }}
                                className={`text-4xl lg:text-5xl font-quran font-black transition-all duration-500 tracking-tight leading-relaxed ${
                                  word.status === 'correct' ? 'text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                                  word.status === 'wrong' ? 'text-rose-600 drop-shadow-[0_0_12px_rgba(225,29,72,0.3)]' :
                                  'text-zinc-800'
                                }`}
                             >
                               {word.text}
                             </motion.span>
                           ))
                        ) : (
                          <div className="flex flex-col items-center gap-4 py-10 opacity-40">
                              <Sparkles className="h-10 w-10 text-emerald-500" />
                              <p className="text-foreground font-black italic text-2xl uppercase tracking-widest" dir="ltr">Range Not Loaded</p>
                          </div>
                        )}
                    </div>

                    <div className="relative flex flex-col items-center gap-6 mt-12 mb-8">
                        <AnimatePresence>
                            {isListening && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ 
                                        scale: [1, 2.5, 3.5], 
                                        opacity: [0.1, 0.05, 0] 
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    className="absolute inset-0 bg-emerald-500 rounded-full blur-[80px]"
                                />
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={isListening ? stopListening : () => startListening(handleRecitationError)}
                            className={`w-44 h-44 lg:w-52 lg:h-52 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-700 relative z-30 ring-[15px] ${
                                isListening 
                                    ? 'bg-rose-600 shadow-rose-600/40 ring-rose-500/5' 
                                    : 'bg-emerald-500 shadow-emerald-500/30 ring-emerald-500/5 hover:shadow-emerald-500/50'
                            }`}
                        >
                            {isListening ? (
                                <div className="flex flex-col items-center">
                                    <MicOff className="h-16 w-16 lg:h-20 lg:w-20 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Stop Session</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Mic className="h-16 w-16 lg:h-20 lg:w-20 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Start Reciting</span>
                                </div>
                            )}
                        </motion.button>
                        
                        <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.2em]">{isListening ? 'Stream Active' : 'Tap to Start AI'}</p>
                    </div>

                    <div className="w-full flex justify-center py-6">
                        {targetVerses.length > 0 && masteryScore > 0 && !isListening && (
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                onClick={handleLog}
                                className="px-12 py-6 bg-white text-zinc-950 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                            >
                                <Sparkles className="h-6 w-6 text-emerald-400" />
                                <span>Analyze & End Session</span>
                            </motion.button>
                        )}
                    </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="tutor-summary"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-2xl mx-auto bg-card/40 rounded-[3rem] p-12 lg:p-16 text-center shadow-2xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
              
              <div className="w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <Trophy className="h-14 w-14 text-emerald-500" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
                />
              </div>

              <h2 className="text-5xl font-black text-foreground tracking-tighter mb-4">Allahuma Barik!</h2>
              <p className="text-xl text-zinc-500 font-medium mb-12">Recitation complete. Your effort has been logged to your progress history.</p>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-inner">
                      <span className="text-[10px] font-black text-emerald-600/40 uppercase tracking-widest block mb-1 px-1">Mastery Score</span>
                      <span className="text-5xl font-black text-emerald-600">{masteryScore}%</span>
                  </div>
                  <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-inner">
                      <span className="text-[10px] font-black text-rose-600/40 uppercase tracking-widest block mb-1 px-1">Mistakes Found</span>
                      <span className="text-5xl font-black text-rose-600">{matches.filter(m => m.status === 'wrong').length}</span>
                  </div>
              </div>

              <div className="space-y-4">
                  <button 
                    onClick={() => setShowSummary(false)}
                    className="w-full h-20 bg-white text-zinc-950 rounded-3xl font-black text-lg shadow-2xl shadow-emerald-500/30 hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>Log to Streak</span>
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/errors'}
                    className="w-full text-zinc-400 font-bold py-4 hover:text-rose-500 transition-all text-sm uppercase tracking-widest"
                  >
                    View in Error Book
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Recite;

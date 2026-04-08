import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, CheckCircle, XCircle, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { pickTestAyah } from '../utils/ExamEngine';
import api from '../services/api';
import confetti from 'canvas-confetti';

const ExamModal = ({ isOpen, onClose, user, onResult }) => {
  const [phase, setPhase] = useState('loading'); // loading, question, verify, result
  const [testData, setTestData] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (isOpen) {
      startNewTest();
    }
    return () => audioRef.current.pause();
  }, [isOpen]);

  const startNewTest = async () => {
    setPhase('loading');
    try {
      const data = await pickTestAyah(user);
      if (!data) {
        onClose();
        return;
      }
      setTestData(data);
      setPhase('question');
      audioRef.current.src = data.prompt.audio;
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  const handlePlayAudio = () => {
    audioRef.current.play().catch(e => console.warn('Audio playback failed:', e));
  };

  const handleSubmitResult = async (status) => {
    try {
      // Record result globally
      await api.post('/user/exam-result', {
        juz: testData.juz,
        surah: testData.surah.name,
        status: status
      });
      
      if (status === 'PASSED') {
         confetti({
           particleCount: 100,
           spread: 70,
           origin: { y: 0.6 },
           colors: ['#10b981', '#34d399', '#fbbf24']
         });
      } else {
         // Logic to help the user: report error to progress
         // This ensures that struggling on an exam adds the surah to "Weak Areas"
         await api.post('/progress/report-error', { 
           surahNumber: testData.surah.number, 
           surahName: testData.surah.name 
         }).catch(() => {});
      }
      
      if (onResult) onResult(status);
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 backdrop-blur-xl bg-black/60"
        />

        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="glass-card w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] border-white/5 relative z-[10001]"
        >
          {phase === 'loading' ? (
              <div className="p-20 flex flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Sampling Revelation...</p>
              </div>
          ) : (
             <div className="p-8 sm:p-12 text-center space-y-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                     <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{testData.rangeLabel}</span>
                  </div>
                  <div className="h-px w-8 bg-white/10" />
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Complete the recitation:</h3>
                  <div className="p-8 bg-white/[0.03] rounded-3xl border border-white/5 shadow-inner">
                    <p className="text-2xl sm:text-3xl font-black text-white leading-loose font-quran text-right" dir="rtl">
                       {testData.prompt.text}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={handlePlayAudio} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
                    <Play className="h-6 w-6 text-white" />
                  </button>
                  <button onClick={startNewTest} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
                    <RotateCcw className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                {phase === 'question' ? (
                   <button 
                     onClick={() => setPhase('verify')}
                     className="w-full py-5 bg-emerald-500 text-zinc-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-lg"
                   >
                     REVEAL & VERIFY
                   </button>
                ) : (
                   <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-500 uppercase">{testData.surah.name}</span>
                            <BookOpen className="h-4 w-4 text-emerald-500/50" />
                        </div>
                        <div className="space-y-3">
                           {testData.verification.map((v, i) => (
                             <p key={i} className="text-lg text-white/80 font-quran leading-relaxed text-right" dir="rtl">
                               {v.text}
                               <span className="ms-2 text-[10px] opacity-30">({v.numberInSurah})</span>
                             </p>
                           ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleSubmitResult('FAILED')}
                          className="flex flex-col items-center gap-3 p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl group hover:bg-rose-500/10 transition-all active:scale-95"
                        >
                           <XCircle className="h-8 w-8 text-rose-500" />
                           <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase">I STRUGGLED</span>
                        </button>
                        <button 
                          onClick={() => handleSubmitResult('PASSED')}
                          className="flex flex-col items-center gap-3 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl group hover:bg-emerald-500/10 transition-all active:scale-95"
                        >
                           <CheckCircle className="h-8 w-8 text-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">I REMEMBERED</span>
                        </button>
                      </div>
                   </div>
                )}
             </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExamModal;

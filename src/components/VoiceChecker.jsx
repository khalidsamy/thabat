import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';

const VoiceChecker = ({ 
  isActive, 
  isProcessing, 
  phase, 
  words = [], 
  onStart, 
  onStop, 
  onReset,
  surahName = '',
  ayahNumber = 1
}) => {
  // Revealed words are those that are no longer 'pending'
  const revealedWords = useMemo(() => 
    words.filter(w => w.status !== 'pending'), 
    [words]
  );

  const isIdle = phase === 'idle';

  return (
    <div className="relative w-full min-h-[500px] bg-black rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-between p-8 sm:p-12 border border-white/5 shadow-2xl">
      {/* Screen 1: Idle / Start State */}
      <AnimatePresence mode="wait">
        {isIdle ? (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="space-y-2">
              <h3 className="text-emerald-500/80 font-black tracking-[0.3em] uppercase text-xs">Ready for Recitation</h3>
              <h2 className="text-3xl font-quran text-white">{surahName}</h2>
              <p className="text-slate-500 text-sm font-medium">Ayah {ayahNumber}</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 rounded-3xl border-2 border-white/10 flex items-center justify-center bg-white/5">
                <BookOpen className="h-10 w-10 text-emerald-500/50" />
              </div>
            </div>

            <p className="max-w-xs text-slate-400 text-sm leading-relaxed">
              Recite from memory. The text will reveal itself as you speak correctly.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full flex flex-col items-center justify-center gap-12"
          >
            {/* Word Display Area */}
            <div 
              className="flex flex-wrap justify-center items-center gap-x-4 gap-y-6 max-w-2xl min-h-[120px]"
              dir="rtl"
            >
              {revealedWords.length > 0 ? (
                revealedWords.map((word, idx) => (
                  <motion.span
                    key={`${word.text}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`font-quran text-3xl sm:text-4xl leading-relaxed transition-colors duration-300 ${
                      word.status === 'correct' 
                        ? 'text-white' 
                        : 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    }`}
                  >
                    {word.text}
                  </motion.span>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <p className="text-slate-600 text-[10px] items-center font-black uppercase tracking-[0.3em]">Listening for your voice...</p>
                </motion.div>
              )}
            </div>

            {/* Error Indicators */}
            {words.some(w => w.status === 'wrong') && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20"
              >
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Mistake Detected</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Layout */}
      <div className="w-full flex flex-col items-center gap-6 mt-8">
        <div className="flex items-center gap-6">
          {isActive && (
             <button
              onClick={onReset}
              className="p-4 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all active:scale-90"
              title="Reset"
             >
               <RefreshCw className="h-5 w-5" />
             </button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isActive ? onStop : onStart}
            disabled={isProcessing}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
              isActive 
                ? 'bg-rose-500 shadow-rose-500/40' 
                : 'bg-emerald-600 shadow-emerald-600/30'
            } ${isProcessing ? 'opacity-50 grayscale cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <RefreshCw className="h-8 w-8 animate-spin text-white" />
            ) : isActive ? (
              <>
                <MicOff className="h-8 w-8 text-white" />
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/80">Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-8 w-8 text-white" />
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white/80">Start</span>
              </>
            )}
          </motion.button>

          {isActive && (
            <div className="w-12" /> // Spacer to balance reset button
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
            {isActive ? 'Live Recognition Active' : 'Pure Memorization Mode'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceChecker;

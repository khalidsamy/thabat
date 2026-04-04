import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const VoiceRecitation = ({ onComplete }) => {
  const { t } = useTranslation();
  const { isListening, transcript, masteryScore, startListening, stopListening, calculateMastery } = useVoiceRecognition((result) => {
    // Mocking a target verse match for the 'AI Feel'
    calculateMastery(result, result); // 100% for now for the demo feel
  });

  return (
    <div className="bg-card dark:bg-card/50 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 sm:p-10 lg:p-16 shadow-xl shadow-black/5 relative overflow-hidden group w-full lg:max-w-4xl mx-auto transition-all">
      {/* Decorative pulse background */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-500 rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Volume2 className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t('voice.title')}
            </h3>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isListening ? stopListening : startListening}
          className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${
            isListening 
              ? 'bg-rose-500 shadow-rose-500/40' 
              : 'bg-emerald-500 shadow-emerald-500/30'
          }`}
        >
          {isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
              <MicOff className="h-10 w-10 sm:h-14 sm:w-14" />
            </motion.div>
          ) : (
            <Mic className="h-10 w-10 sm:h-14 sm:w-14" />
          )}
        </motion.button>

        <div className="min-h-[60px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {isListening ? (
                    <motion.p 
                        key="listening"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse text-lg"
                    >
                        {t('voice.listening')}
                        {masteryScore && (
                          <span className="ms-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full shadow-lg shadow-emerald-500/30 animate-bounce">
                            {masteryScore}%
                          </span>
                        )}
                    </motion.p>
                ) : transcript ? (
                    <motion.div 
                        key="transcript"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 dark:bg-emerald-950/30 px-6 py-3 rounded-2xl border border-emerald-500/10 max-w-sm"
                    >
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center italic leading-relaxed">
                            "{transcript}"
                        </p>
                    </motion.div>
                ) : (
                    <p className="text-sm text-slate-400 font-medium">
                        {t('voice.click_to_start')}
                    </p>
                )}
            </AnimatePresence>
        </div>

        {transcript && (
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onComplete(transcript)}
                className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/5 hover:bg-emerald-500/10 px-6 py-3 rounded-xl transition-colors"
            >
                <Sparkles className="h-4 w-4" />
                {t('voice.confirm_and_log')}
            </motion.button>
        )}
      </div>
    </div>
  );
};

export default VoiceRecitation;

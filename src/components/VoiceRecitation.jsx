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
    <div className="bg-card/50 border border-white/5 rounded-[2rem] p-6 sm:p-10 lg:p-16 shadow-xl shadow-black/5 relative overflow-hidden group w-full lg:max-w-4xl mx-auto transition-all backdrop-blur-md">
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
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Volume2 className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {t('voice.title')}
            </h3>
        </div>

        <div className="relative group/btn">
          {/* Constant 'Main Star Action' Pulse Animation */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -inset-10 rounded-full blur-3xl transition-colors duration-500 ${
              isListening ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            className={`w-36 h-36 sm:w-48 sm:h-48 rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 relative z-10 ${
              isListening 
                ? 'bg-rose-500 shadow-rose-500/40 ring-8 ring-rose-500/10' 
                : 'bg-emerald-500 shadow-emerald-500/30 ring-8 ring-emerald-500/10 hover:shadow-emerald-500/50'
            }`}
          >
            {isListening ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                <MicOff className="h-14 w-14 sm:h-20 sm:w-20" />
              </motion.div>
            ) : (
              <Mic className="h-14 w-14 sm:h-20 sm:w-20" />
            )}
          </motion.button>
        </div>

        <div className="min-h-[60px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {isListening ? (
                    <motion.p 
                        key="listening"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-emerald-400 font-bold animate-pulse text-lg"
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
                        className="bg-emerald-950/30 px-6 py-3 rounded-2xl border border-emerald-500/10 max-w-sm"
                    >
                        <p className="text-sm font-medium text-slate-400 text-center italic leading-relaxed">
                            "{transcript}"
                        </p>
                    </motion.div>
                ) : (
                    <p className="text-sm text-slate-500 font-medium">
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
                className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-3 rounded-xl transition-colors"
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

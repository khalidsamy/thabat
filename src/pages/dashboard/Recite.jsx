import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Mic, MicOff, Search, RotateCcw, Trophy, AlertCircle, Link2, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useSmartRecitation } from '../hooks/useSmartRecitation';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// Subtle audio cue on error — keeps the experience non-jarring
const playErrorChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (_) {}
};

const Waveform = () => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [6, 28, 10, 22, 6] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        className="w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
      />
    ))}
  </div>
);

// Word block rendered inside the verse display area
const WordChip = ({ word, isNext }) => {
  const colorMap = {
    correct: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]',
    error:   'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.4)]',
    pending: isNext ? 'text-zinc-300' : 'text-zinc-600',
  };

  return (
    <motion.span
      layout
      animate={isNext ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={isNext ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
      className={`font-quran text-3xl leading-loose tracking-wide transition-colors duration-300 ${colorMap[word.status]}`}
    >
      {word.text}
    </motion.span>
  );
};

const Recite = (props) => {
  const context = useOutletContext() || {};
  const { handleVoiceComplete } = { ...context, ...props };
  const { showSuccess, showError } = useToast();

  const [surahs, setSurahs] = useState([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(5);
  const [targetVerses, setTargetVerses] = useState([]);
  const [previousVerse, setPreviousVerse] = useState(null);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  const handleError = useCallback((word) => {
    playErrorChime();
    showError(`خطأ: "${word}" — اضغط استئناف للمتابعة`);
  }, [showError]);

  const {
    phase, words, masteryScore, errorWord, linkWord,
    recognitionError, isActive,
    startSession, stopSession, resumeFromError, resetSession,
  } = useSmartRecitation({ targetVerses, previousVerseText: previousVerse?.text, onError: handleError });

  useEffect(() => {
    axios.get('https://api.alquran.cloud/v1/surah')
      .then((r) => setSurahs(r.data.data))
      .catch(() => showError('Failed to load surah list'));
  }, [showError]);

  const filteredSurahs = useMemo(
    () => surahs.filter((s) =>
      s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.number.toString().includes(surahSearch)
    ),
    [surahs, surahSearch]
  );

  const loadVerses = async () => {
    setIsLoadingVerses(true);
    try {
      const fetched = [];
      for (let i = ayahFrom; i <= ayahTo; i++) {
        const r = await axios.get(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${i}/quran-uthmani`);
        fetched.push({ numberInSurah: i, text: r.data.data.text, surah: r.data.data.surah });
      }

      // Fetch the verse before the range for الربط (verse linking)
      if (ayahFrom > 1) {
        const prevR = await axios.get(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${ayahFrom - 1}/quran-uthmani`);
        setPreviousVerse({ text: prevR.data.data.text, numberInSurah: ayahFrom - 1 });
      } else {
        setPreviousVerse(null);
      }

      setTargetVerses(fetched);
      resetSession();
      setSessionDone(false);
    } catch {
      showError('Failed to fetch verses from API');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleEndSession = async () => {
    stopSession();
    const surahData = surahs.find((s) => s.number === selectedSurah);
    const surahName = surahData?.name || surahData?.englishName || '';

    try {
      await api.post('/progress/mastery', { score: masteryScore, surah: surahName });
      await api.post('/progress/update', { pages: Math.max(1, Math.ceil(targetVerses.length / 2)) });

      // Log each error word to the Error Book with the correct schema format
      const errorWords = words.filter((w) => w.status === 'error');
      const uniqueErrors = [...new Set(errorWords.map((w) => w.text))];

      for (const word of uniqueErrors) {
        await api.post('/errors', {
          location: {
            surahNumber: selectedSurah,
            surahName,
            ayahNumber: ayahFrom,
          },
          errorType: 'wrong_word',
          note: `كلمة "${word}" — مسجلة تلقائياً (دقة: ${masteryScore}%)`,
          ayahText: targetVerses[0]?.text,
        }).catch(() => {});
      }

      showSuccess('تم تسجيل جلسة التلاوة بنجاح');
      setSessionDone(true);
      handleVoiceComplete?.(masteryScore, surahName);
    } catch {
      showError('Failed to save session');
    }
  };

  const nextWordIndex = words.findIndex((w) => w.status === 'pending');

  if (sessionDone) {
    const errorCount = words.filter((w) => w.status === 'error').length;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-card/50 border border-white/5 rounded-3xl p-12 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-4xl font-black text-foreground mb-2">اللهم بارك!</h2>
          <p className="text-zinc-500 mb-8">تم تسجيل الجلسة في سجل التقدم</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5">
              <p className="text-xs font-black text-emerald-500/40 uppercase tracking-widest mb-1">الإتقان</p>
              <p className="text-4xl font-black text-emerald-400">{masteryScore}%</p>
            </div>
            <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5">
              <p className="text-xs font-black text-rose-500/40 uppercase tracking-widest mb-1">أخطاء</p>
              <p className="text-4xl font-black text-rose-400">{errorCount}</p>
            </div>
          </div>

          <button
            onClick={() => { setSessionDone(false); resetSession(); }}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="h-5 w-5" /> جلسة جديدة
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* ── Selector Panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" /> النطاق المستهدف
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="ابحث عن السورة..."
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="w-full h-11 bg-slate-900/60 border border-white/5 rounded-xl pl-10 pr-3 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none"
                  dir="rtl"
                />
              </div>

              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(parseInt(e.target.value))}
                className="w-full h-12 bg-slate-900/60 border border-white/5 rounded-xl px-3 font-bold text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none"
              >
                {filteredSurahs.map((s) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                {[['من آية', ayahFrom, setAyahFrom], ['إلى آية', ayahTo, setAyahTo]].map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest px-1 block mb-1">{label}</label>
                    <input
                      type="number" min="1" value={val}
                      onChange={(e) => setter(parseInt(e.target.value) || 1)}
                      className="w-full h-11 bg-slate-900/60 border border-white/5 rounded-xl px-3 font-bold text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none text-center"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={loadVerses}
                disabled={isLoadingVerses}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isLoadingVerses
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>تحميل الآيات</span><ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>

          {/* Mastery score */}
          <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-1">دقة التلاوة</p>
            <p className="text-5xl font-black text-emerald-400 mb-3">{masteryScore}%</p>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${masteryScore}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* ── Recitation Engine ──────────────────────────────────────────── */}
        <div className="lg:col-span-8">
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 lg:p-10 min-h-[600px] flex flex-col gap-6">

            {/* Verse linking banner — الربط */}
            <AnimatePresence>
              {phase === 'linking' && linkWord && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl px-5 py-4"
                >
                  <Link2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-400/60 uppercase tracking-widest">الربط — ابدأ بقول</p>
                    <p className="text-2xl font-quran text-amber-200 mt-0.5">{linkWord}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error pause banner */}
            <AnimatePresence>
              {phase === 'paused_error' && errorWord && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between gap-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-rose-400/60 uppercase tracking-widest">توقف عند</p>
                      <p className="text-xl font-quran text-rose-200 mt-0.5">{errorWord.text}</p>
                    </div>
                  </div>
                  <button
                    onClick={resumeFromError}
                    className="shrink-0 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black rounded-xl transition-all active:scale-95"
                  >
                    استئناف
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verse word display */}
            <div
              className="flex-1 min-h-[280px] bg-slate-900/40 border border-white/5 rounded-2xl p-6 lg:p-8 flex flex-wrap content-center justify-center gap-x-4 gap-y-2"
              dir="rtl"
            >
              {targetVerses.length > 0 ? (
                words.map((word, i) => (
                  <WordChip key={i} word={word} isNext={i === nextWordIndex && isActive} />
                ))
              ) : (
                <p className="text-zinc-600 font-bold text-sm" dir="ltr">
                  Load a verse range to begin
                </p>
              )}
            </div>

            {/* Waveform */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <Waveform />
                </motion.div>
              )}
            </AnimatePresence>

            {recognitionError && (
              <p className="text-xs text-rose-400 text-center font-bold">{recognitionError}</p>
            )}

            {/* Mic button */}
            <div className="flex flex-col items-center gap-4">
              {phase === 'paused_error' ? null : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={isActive ? stopSession : startSession}
                  disabled={targetVerses.length === 0}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 relative ring-[12px] disabled:opacity-40 ${
                    isActive
                      ? 'bg-rose-500 shadow-rose-500/30 ring-rose-500/10'
                      : 'bg-emerald-500 shadow-emerald-500/30 ring-emerald-500/10'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div key="stop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <MicOff className="h-10 w-10 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">إيقاف</span>
                      </motion.div>
                    ) : (
                      <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <Mic className="h-10 w-10 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">ابدأ</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}

              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                {phase === 'idle'     && 'اضغط للبدء'}
                {phase === 'linking'  && 'الربط — قل الكلمة الأخيرة'}
                {phase === 'reciting' && 'استمر بالتلاوة'}
                {phase === 'paused_error' && 'صحّح ثم اضغط استئناف'}
                {phase === 'complete' && 'اكتملت التلاوة!'}
              </p>
            </div>

            {/* End session — shown only when there's a meaningful score */}
            <AnimatePresence>
              {masteryScore > 0 && !isActive && phase !== 'paused_error' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-center">
                  <button
                    onClick={handleEndSession}
                    className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-3"
                  >
                    <Trophy className="h-5 w-5 text-emerald-500" />
                    إنهاء وتسجيل الجلسة
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recite;
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Mic, MicOff, Search, RotateCcw, Trophy, AlertCircle, Link2, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useSmartRecitation } from '../../hooks/usesmartrecitation';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

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
  <div className="flex items-center justify-center gap-1 h-7">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ height: [6, 26, 8, 20, 6] }}
        transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.11, ease: 'easeInOut' }}
        className="w-1 rounded-full bg-emerald-400"
      />
    ))}
  </div>
);

// ── Word chip with auto-scroll target ref ────────────────────────────────
const WordChip = ({ word, isNext, activeRef }) => {
  const colorMap = {
    correct: 'text-emerald-400',
    error:   'text-rose-400',
    pending: isNext ? 'text-zinc-200' : 'text-zinc-600',
  };
  return (
    <motion.span
      ref={isNext ? activeRef : null}
      layout
      animate={isNext ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={isNext ? { duration: 1.8, repeat: Infinity } : {}}
      className={`font-quran text-3xl leading-loose transition-colors duration-300 ${colorMap[word.status]}`}
    >
      {word.text}
    </motion.span>
  );
};

const Recite = (props) => {
  const context = useOutletContext() || {};
  const { handleVoiceComplete } = { ...context, ...props };
  const { showSuccess, showError } = useToast();

  const [surahs, setSurahs]             = useState([]);
  const [surahSearch, setSurahSearch]   = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom]         = useState(1);
  const [ayahTo, setAyahTo]             = useState(5);
  const [targetVerses, setTargetVerses] = useState([]);
  const [previousVerse, setPreviousVerse] = useState(null);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [sessionDone, setSessionDone]   = useState(false);

  // Auto-scroll ref: points to the currently active word DOM node
  const activeWordRef = useRef(null);
  const verseContainerRef = useRef(null);

  const handleError = useCallback((word) => {
    playErrorChime();
    showError(`خطأ عند: "${word}" — كرر الكلمة ${3} مرات للمتابعة`);
  }, [showError]);

  const {
    phase, words, masteryScore, errorWord,
    correctionReps, correctionRepsRequired,
    linkWord, recognitionError, isActive,
    startSession, stopSession, resetSession,
  } = useSmartRecitation({ targetVerses, previousVerseText: previousVerse?.text, onError: handleError });

  // Auto-scroll the active word into the center of the verse container
  useEffect(() => {
    if (!activeWordRef.current || !verseContainerRef.current) return;
    activeWordRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [words]); // runs whenever word statuses change

  useEffect(() => {
    axios.get('https://api.alquran.cloud/v1/surah')
      .then(r => setSurahs(r.data.data))
      .catch(() => showError('Failed to load surah list'));
  }, [showError]);

  const filteredSurahs = useMemo(() =>
    surahs.filter(s =>
      s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      s.number.toString().includes(surahSearch)
    ), [surahs, surahSearch]);

  const loadVerses = async () => {
    setIsLoadingVerses(true);
    try {
      const fetched = [];
      for (let i = ayahFrom; i <= ayahTo; i++) {
        const r = await axios.get(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${i}/quran-uthmani`);
        fetched.push({ numberInSurah: i, text: r.data.data.text, surah: r.data.data.surah });
      }
      if (ayahFrom > 1) {
        const prev = await axios.get(`https://api.alquran.cloud/v1/ayah/${selectedSurah}:${ayahFrom - 1}/quran-uthmani`);
        setPreviousVerse({ text: prev.data.data.text, numberInSurah: ayahFrom - 1 });
      } else {
        setPreviousVerse(null);
      }
      setTargetVerses(fetched);
      resetSession();
      setSessionDone(false);
    } catch {
      showError('Failed to fetch verses');
    } finally {
      setIsLoadingVerses(false);
    }
  };

  const handleEndSession = async () => {
    stopSession();
    const surahData = surahs.find(s => s.number === selectedSurah);
    const surahName = surahData?.name || surahData?.englishName || '';
    try {
      await api.post('/progress/mastery', { score: masteryScore, surah: surahName });
      await api.post('/progress/update', { pages: Math.max(1, Math.ceil(targetVerses.length / 2)) });

      const errorWords = [...new Set(words.filter(w => w.status === 'error').map(w => w.text))];
      for (const word of errorWords) {
        await api.post('/errors', {
          location: { surahNumber: selectedSurah, surahName, ayahNumber: ayahFrom },
          errorType: 'wrong_word',
          note: `"${word}" — ${masteryScore}% دقة`,
          ayahText: targetVerses[0]?.text,
        }).catch(() => {});
      }

      showSuccess('تم تسجيل الجلسة بنجاح');
      setSessionDone(true);
      handleVoiceComplete?.(masteryScore, surahName);
    } catch {
      showError('Failed to save session');
    }
  };

  const nextWordIndex = words.findIndex(w => w.status === 'pending');

  // ── Session summary ─────────────────────────────────────────────────────
  if (sessionDone) {
    const errCount = words.filter(w => w.status === 'error').length;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card/50 border border-white/5 rounded-3xl p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-4xl font-black text-foreground mb-2">اللهم بارك!</h2>
          <p className="text-zinc-500 mb-8 text-sm">تم تسجيل الجلسة في سجل التقدم</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5">
              <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest mb-1">الإتقان</p>
              <p className="text-4xl font-black text-emerald-400">{masteryScore}%</p>
            </div>
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/5">
              <p className="text-[10px] font-black text-rose-500/40 uppercase tracking-widest mb-1">أخطاء</p>
              <p className="text-4xl font-black text-rose-400">{errCount}</p>
            </div>
          </div>
          <button
            onClick={() => { setSessionDone(false); resetSession(); }}
            className="w-full h-13 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 py-4"
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

        {/* ── Selector panel ─────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" /> النطاق المستهدف
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text" placeholder="ابحث عن السورة..." value={surahSearch}
                  onChange={e => setSurahSearch(e.target.value)}
                  className="w-full h-11 bg-slate-900/60 border border-white/5 rounded-xl pl-10 pr-3 text-sm text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none"
                  dir="rtl"
                />
              </div>
              <select
                value={selectedSurah} onChange={e => setSelectedSurah(parseInt(e.target.value))}
                className="w-full h-12 bg-slate-900/60 border border-white/5 rounded-xl px-3 font-bold text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none"
              >
                {filteredSurahs.map(s => (
                  <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                {[['من آية', ayahFrom, setAyahFrom], ['إلى آية', ayahTo, setAyahTo]].map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest px-1 block mb-1">{label}</label>
                    <input
                      type="number" min="1" value={val}
                      onChange={e => setter(parseInt(e.target.value) || 1)}
                      className="w-full h-11 bg-slate-900/60 border border-white/5 rounded-xl px-3 font-bold text-foreground focus:ring-2 focus:ring-emerald-500/40 outline-none text-center"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={loadVerses} disabled={isLoadingVerses}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isLoadingVerses
                  ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>تحميل الآيات</span><ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>

          {/* Mastery score card */}
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

        {/* ── Recitation engine ──────────────────────────────────────── */}
        <div className="lg:col-span-8">
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 lg:p-10 min-h-[600px] flex flex-col gap-5">

            {/* الربط banner */}
            <AnimatePresence>
              {phase === 'linking' && linkWord && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl px-5 py-4"
                >
                  <Link2 className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest">الربط — ابدأ بقول</p>
                    <p className="text-2xl font-quran text-amber-200 mt-0.5">{linkWord}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correction drill banner */}
            <AnimatePresence>
              {phase === 'correction' && errorWord && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="bg-rose-950/40 border border-rose-500/30 rounded-2xl px-5 py-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-rose-400/60 uppercase tracking-widest">التصحيح — كرر هذه الكلمة</p>
                      <p className="text-2xl font-quran text-rose-200 mt-0.5">{errorWord.text}</p>
                    </div>
                  </div>
                  {/* 3-rep progress dots */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-rose-400/50 uppercase tracking-widest">
                      التكرار {correctionReps}/{correctionRepsRequired}
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: correctionRepsRequired }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={i < correctionReps ? { scale: [1, 1.3, 1] } : {}}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            i < correctionReps ? 'bg-emerald-500' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <Waveform />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Verse word display — scrollable container */}
            <div
              ref={verseContainerRef}
              className="flex-1 min-h-[280px] max-h-[380px] bg-slate-900/40 border border-white/5 rounded-2xl p-6 lg:p-8 overflow-y-auto flex flex-wrap content-center justify-center gap-x-4 gap-y-2 scroll-smooth"
              dir="rtl"
            >
              {targetVerses.length > 0 ? (
                words.map((word, i) => (
                  <WordChip
                    key={i}
                    word={word}
                    isNext={i === nextWordIndex && (phase === 'reciting' || phase === 'idle')}
                    activeRef={activeWordRef}
                  />
                ))
              ) : (
                <p className="text-zinc-600 font-bold text-sm" dir="ltr">Load a verse range to begin</p>
              )}
            </div>

            {/* Waveform (reciting phase) */}
            <AnimatePresence>
              {phase === 'reciting' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                  <Waveform />
                </motion.div>
              )}
            </AnimatePresence>

            {recognitionError && (
              <p className="text-xs text-rose-400 text-center font-bold">{recognitionError}</p>
            )}

            {/* Main mic button — hidden during correction drill */}
            {phase !== 'correction' && (
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={isActive ? stopSession : startSession}
                  disabled={targetVerses.length === 0}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500 relative ring-[10px] disabled:opacity-40 ${
                    isActive
                      ? 'bg-rose-500 shadow-rose-500/30 ring-rose-500/10'
                      : 'bg-emerald-500 shadow-emerald-500/30 ring-emerald-500/10'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isActive
                      ? <motion.div key="stop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center"><MicOff className="h-9 w-9 mb-1" /><span className="text-[9px] font-black uppercase tracking-widest">إيقاف</span></motion.div>
                      : <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center"><Mic className="h-9 w-9 mb-1" /><span className="text-[9px] font-black uppercase tracking-widest">ابدأ</span></motion.div>
                    }
                  </AnimatePresence>
                </motion.button>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                  {phase === 'idle'    && 'اضغط للبدء'}
                  {phase === 'linking' && 'الربط — قل الكلمة الأخيرة من الآية السابقة'}
                  {phase === 'reciting'&& 'استمر بالتلاوة'}
                  {phase === 'complete'&& '✓ اكتملت التلاوة'}
                </p>
              </div>
            )}

            {/* End session CTA */}
            <AnimatePresence>
              {masteryScore > 0 && !isActive && phase !== 'correction' && (
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

            {/* Reset */}
            {phase !== 'idle' && (
              <div className="flex justify-center">
                <button onClick={resetSession} className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-bold uppercase tracking-widest">
                  <RefreshCw className="h-3 w-3" /> إعادة التحميل
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recite;
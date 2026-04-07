import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Link2,
  Mic,
  MicOff,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { useSmartRecitation } from '../../hooks/useSmartRecitationEngine';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { fetchAyah, fetchSurahList, isAbortedRequest } from '../../services/quranApi';

const playErrorChime = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(330, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.onended = () => {
      void audioContext.close().catch(() => undefined);
    };

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);
  } catch {
    // Audio feedback is optional.
  }
};

const Waveform = () => (
  <div className="flex h-7 items-center justify-center gap-1">
    {[...Array(5)].map((_, index) => (
      <motion.div
        key={index}
        animate={{ height: [6, 24, 8, 18, 6] }}
        transition={{ duration: 0.85, repeat: Infinity, delay: index * 0.11, ease: 'easeInOut' }}
        className="w-1 rounded-full bg-emerald-400"
      />
    ))}
  </div>
);

const WordChip = ({ word, isNext, activeRef }) => {
  const displayState = word.status === 'pending' ? (isNext ? 'active' : 'pending') : word.status;

  return (
    <motion.span
      ref={isNext ? activeRef : null}
      layout
      data-state={displayState}
      animate={displayState === 'active' ? { opacity: [0.65, 1, 0.65] } : { opacity: 1 }}
      transition={displayState === 'active' ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 }}
      className="recitation-word whitespace-nowrap"
    >
      {word.text}
    </motion.span>
  );
};

const RecitePremium = (props) => {
  const context = useOutletContext() || {};
  const { refreshData, isReciteLocked, revisionQueue } = { ...context, ...props };
  const { t, i18n } = useTranslation();
  const { showError, showSuccess } = useToast();
  const isArabic = i18n.language === 'ar';

  const [surahs, setSurahs] = useState([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(5);
  const [targetVerses, setTargetVerses] = useState([]);
  const [previousVerses, setPreviousVerses] = useState([]); // Sheikh Alaa's 5-verse Rabt
  const [isLinkingReviewOpen, setIsLinkingReviewOpen] = useState(false);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [showSelectorOnMobile, setShowSelectorOnMobile] = useState(true);

  const activeWordRef = useRef(null);
  const verseContainerRef = useRef(null);
  const surahRequestRef = useRef(null);
  const versesRequestRef = useRef(null);

  const handleError = useCallback((word) => {
    playErrorChime();
    showError(isArabic ? `خطأ في كلمة "${word}". كررها 3 مرات للمتابعة.` : `Mistake on "${word}". Repeat it 3 times to continue.`);
    
    // 3-Error Wall: Report to backend in real-time
    const surahData = surahs.find(s => s.number === selectedSurah);
    api.post('/progress/report-error', { 
        surahNumber: selectedSurah, 
        surahName: surahData?.name || surahData?.englishName || '' 
    }).catch(() => {});
  }, [showError, isArabic, surahs, selectedSurah]);

  const {
    correctionReps,
    correctionRepsRequired,
    errorWord,
    isActive,
    linkWord,
    liveTranscript,
    masteryScore,
    phase,
    recognitionError,
    resetSession,
    startSession,
    stopSession,
    words,
  } = useSmartRecitation({
    targetVerses,
    previousVerseText: previousVerses[previousVerses.length - 1]?.text,
    onError: handleError,
  });

  useEffect(() => {
    if (!activeWordRef.current || !verseContainerRef.current) return;

    activeWordRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [words]);

  useEffect(() => {
    if (targetVerses.length > 0) {
      setShowSelectorOnMobile(false);
    }
  }, [targetVerses.length]);

  useEffect(() => {
    const controller = new AbortController();
    surahRequestRef.current = controller;

    const loadSurahs = async () => {
      try {
        const data = await fetchSurahList({ signal: controller.signal });
        setSurahs(data);
      } catch (error) {
        if (!isAbortedRequest(error)) {
          showError('Failed to load surah list.');
        }
      }
    };

    void loadSurahs();

    return () => {
      controller.abort();
      if (surahRequestRef.current === controller) {
        surahRequestRef.current = null;
      }
    };
  }, [showError]);

  useEffect(() => () => {
    surahRequestRef.current?.abort();
    versesRequestRef.current?.abort();
  }, []);

  const filteredSurahs = useMemo(
    () => surahs.filter((surah) =>
      surah.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      surah.number.toString().includes(surahSearch)
    ),
    [surahs, surahSearch],
  );

  const loadVerses = useCallback(async () => {
    if (ayahTo < ayahFrom) {
      showError('Ending ayah must be after the starting ayah.');
      return;
    }

    versesRequestRef.current?.abort();
    const controller = new AbortController();
    versesRequestRef.current = controller;
    setIsLoadingVerses(true);

    try {
      const fetchedAyahs = await Promise.all(
        Array.from({ length: ayahTo - ayahFrom + 1 }, (_, index) =>
          fetchAyah(selectedSurah, ayahFrom + index, 'quran-uthmani', { signal: controller.signal }),
        ),
      );

      const nextVerses = fetchedAyahs.map((ayah) => ({
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        surah: ayah.surah,
      }));

      if (ayahFrom > 1) {
        const startPrev = Math.max(1, ayahFrom - 5);
        const prevAyahs = await Promise.all(
          Array.from({ length: ayahFrom - startPrev }, (_, i) => 
            fetchAyah(selectedSurah, startPrev + i, 'quran-uthmani', { signal: controller.signal })
          )
        );
        setPreviousVerses(prevAyahs.map(a => ({ text: a.text, numberInSurah: a.numberInSurah })));
        setIsLinkingReviewOpen(true); // Sheikh Alaa's Rabt Gate
      } else {
        setPreviousVerses([]);
      }

      setTargetVerses(nextVerses);
      resetSession();
      setSessionDone(false);
    } catch (error) {
      if (!isAbortedRequest(error)) {
        showError('Failed to fetch verses.');
      }
    } finally {
      if (versesRequestRef.current === controller) {
        versesRequestRef.current = null;
      }
      setIsLoadingVerses(false);
    }
  }, [ayahFrom, ayahTo, resetSession, selectedSurah, showError]);

  const handleEndSession = useCallback(async () => {
    stopSession();

    const surahData = surahs.find((surah) => surah.number === selectedSurah);
    const surahName = surahData?.name || surahData?.englishName || '';

    try {
      await Promise.all([
        api.post('/progress/mastery', { score: masteryScore, surah: surahName }),
        api.post('/progress/update', { pages: Math.max(1, Math.ceil(targetVerses.length / 2)) }),
      ]);

      const errorWords = [...new Set(words.filter((word) => word.status === 'error').map((word) => word.text))];

      await Promise.allSettled(
        errorWords.map((word) =>
          api.post('/errors', {
            location: { surahNumber: selectedSurah, surahName, ayahNumber: ayahFrom },
            errorType: 'wrong_word',
            note: `"${word}" - ${masteryScore}% accuracy`,
            ayahText: targetVerses[0]?.text,
          }),
        ),
      );

      showSuccess(isArabic ? 'تم حفظ الجلسة في سجل التقدم' : 'Session logged successfully.');
      setSessionDone(true);
      void refreshData?.();
    } catch {
      showError('Failed to save session.');
    }
  }, [ayahFrom, masteryScore, refreshData, selectedSurah, showError, showSuccess, stopSession, surahs, targetVerses, words, isArabic]);

  const nextWordIndex = words.findIndex((word) => word.status === 'pending');
  const shouldShowSelector = showSelectorOnMobile || targetVerses.length === 0;

  if (isReciteLocked) {
    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-lg rounded-[2.5rem] p-10 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-3xl font-black text-foreground">
                    {isArabic ? 'المراجعة أولاً' : 'Review first!'}
                </h2>
                <p className="mt-4 text-sm text-[color:var(--theme-text-muted)] leading-relaxed">
                    {isArabic 
                        ? 'تطبيقاً لمنهجية الشيخ "المراجعة قبل الحفظ"، يرجى إتمام ورد المراجعة اليومي أولاً لفتح ميزة التلاوة والحفظ الجديد.' 
                        : 'Following the Sheikh Hamed methodology, you must complete your daily revision queue before starting new memorization.'}
                </p>
                
                <div className="mt-8 space-y-3">
                    <button 
                        onClick={() => window.location.href = '/dashboard/review'}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isArabic ? 'الذهاب للمراجعة الآن' : 'Go to Revision'}
                        <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                    </button>
                    <button 
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-foreground rounded-2xl font-black transition-all"
                    >
                        {isArabic ? 'العودة للرئيسية' : 'Back to Home'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
  }

  if (sessionDone) {
    const errorCount = words.filter((word) => word.status === 'error').length;

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md rounded-[2rem] p-8 text-center sm:p-10"
        >
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-emerald-500/12">
            <Trophy className="h-9 w-9 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-foreground sm:text-4xl">
            {isArabic ? 'تم بحمد الله' : 'Session Complete'}
          </h2>
          <p className="mt-2 text-sm text-[color:var(--theme-text-muted)]">
            {isArabic ? 'تم تسجيل تلاوتك بنجاح في سجل التقدم.' : 'Your recitation session has been recorded.'}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="surface-inset rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500/70">{isArabic ? 'الإتقان' : 'Accuracy'}</p>
              <p className="mt-2 text-4xl font-black text-emerald-400">{masteryScore}%</p>
            </div>
            <div className="surface-inset rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-500/70">{isArabic ? 'أخطاء' : 'Errors'}</p>
              <p className="mt-2 text-4xl font-black text-rose-400">{errorCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSessionDone(false);
              resetSession();
              setShowSelectorOnMobile(true);
            }}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-black text-white transition-all hover:bg-emerald-600 active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5" />
            {isArabic ? 'جلسة جديدة' : 'Start Another Session'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setShowSelectorOnMobile((current) => !current)}
          className="glass-card flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black text-foreground">{isArabic ? 'إعداد الجلسة' : 'Session Setup'}</span>
              <span className="block text-xs text-[color:var(--theme-text-muted)]">
                {targetVerses.length > 0 ? (isArabic ? `تم تحميل ${targetVerses.length} آية` : `Loaded ${targetVerses.length} ayah(s)`) : (isArabic ? 'اختر سورة ونطاق الآيات' : 'Choose a Surah and ayah range')}
              </span>
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 text-[color:var(--theme-text-muted)] transition-transform ${shouldShowSelector ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <AnimatePresence initial={false}>
          {shouldShowSelector && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 lg:col-span-4"
            >
              <div className="glass-card rounded-[2rem] p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">{isArabic ? 'نطاق الحفظ' : 'Target Range'}</p>
                    <h3 className="text-lg font-black text-foreground">{isArabic ? 'إعداد الجلسة' : 'Build the session'}</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--theme-text-muted)]" />
                    <input
                      type="text"
                      value={surahSearch}
                      onChange={(event) => setSurahSearch(event.target.value)}
                      placeholder={isArabic ? 'ابحث عن سورة...' : 'Search for a Surah'}
                      className="surface-input h-11 w-full rounded-xl pl-10 pr-3 text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                      dir="rtl"
                    />
                  </div>

                  <select
                    value={selectedSurah}
                    onChange={(event) => setSelectedSurah(Number.parseInt(event.target.value, 10))}
                    className="surface-input h-12 w-full rounded-xl px-3 font-bold text-foreground outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {filteredSurahs.map((surah) => (
                      <option key={surah.number} value={surah.number}>
                        {surah.number}. {surah.englishName}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'From ayah', value: ayahFrom, setter: setAyahFrom },
                      { label: 'To ayah', value: ayahTo, setter: setAyahTo },
                    ].map(({ label, value, setter }) => (
                      <div key={label}>
                        <label className="mb-1 block px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)]">
                          {label}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={value}
                          onChange={(event) => setter(Number.parseInt(event.target.value, 10) || 1)}
                          className="surface-input h-11 w-full rounded-xl px-3 text-center font-bold text-foreground outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={loadVerses}
                    disabled={isLoadingVerses}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 font-black text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                  >
                    {isLoadingVerses ? (
                      <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>{isArabic ? 'تحميل الآيات' : 'Load Ayahs'}</span>
                        <ChevronRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-[2rem] p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500/70">{isArabic ? 'دقة التلاوة الحالية' : 'Recitation Accuracy'}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-4xl font-black text-emerald-400 sm:text-5xl">{masteryScore}%</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)]">
                    {isActive ? (isArabic ? 'بث مباشر' : 'Live session') : (isArabic ? 'جاهز للبدء' : 'Ready state')}
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
                  <motion.div
                    animate={{ width: `${masteryScore}%` }}
                    transition={{ duration: 0.35 }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-8">
          <div className="glass-card flex min-h-[560px] flex-col gap-4 rounded-[2rem] p-4 sm:min-h-[620px] sm:p-6 lg:p-8">
            <AnimatePresence>
              {phase === 'linking' && linkWord && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-4 sm:px-5"
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="h-5 w-5 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-400/70">{isArabic ? 'ربط الآيات' : 'Linking cue'}</p>
                      <p className="mt-1 font-quran text-2xl text-amber-200">{linkWord}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'correction' && errorWord && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/8 px-4 py-4 sm:px-5"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-400/70">{isArabic ? 'تمرين التصحيح' : 'Correction drill'}</p>
                      <p className="mt-1 font-quran text-2xl text-rose-200">{errorWord.text}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-300/70">
                          {isArabic ? `التكرار ${correctionReps}/${correctionRepsRequired}` : `Repetition ${correctionReps}/${correctionRepsRequired}`}
                        </span>
                        <div className="flex gap-2">
                          {Array.from({ length: correctionRepsRequired }).map((_, index) => (
                            <motion.div
                              key={index}
                              animate={index < correctionReps ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                              className={`h-3 w-3 rounded-full ${index < correctionReps ? 'bg-emerald-500' : 'bg-white/10'}`}
                            />
                          ))}
                        </div>
                        <Waveform />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              ref={verseContainerRef}
              className="surface-inset flex max-h-[46svh] min-h-[250px] flex-1 flex-wrap content-center justify-center gap-x-3 gap-y-1.5 overflow-y-auto rounded-[1.75rem] px-4 py-5 scroll-smooth sm:min-h-[300px] sm:gap-x-4 sm:gap-y-2 sm:px-6 sm:py-6"
              style={{ scrollPaddingBlock: '7rem' }}
              dir="rtl"
            >
              {targetVerses.length > 0 ? (
                words.map((word, index) => (
                  <WordChip
                    key={`${word.text}-${index}`}
                    word={word}
                    isNext={index === nextWordIndex && (phase === 'reciting' || phase === 'idle')}
                    activeRef={activeWordRef}
                  />
                ))
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">{isArabic ? 'جاهز عند استعدادك' : 'Ready when you are'}</p>
                  <p className="mt-3 max-w-sm text-sm text-[color:var(--theme-text-soft)]">
                    {isArabic ? 'اختر السورة ونطاق الآيات لبدء جلسة التلاوة الموجهة.' : 'Load a Surah and ayah range to begin the guided recitation session.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex min-h-[3rem] flex-col items-center justify-center gap-2">
              <AnimatePresence>
                {phase === 'reciting' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Waveform />
                  </motion.div>
                )}
              </AnimatePresence>

              {liveTranscript && (
                <p className="max-w-xl rounded-full border border-emerald-500/12 bg-emerald-500/8 px-4 py-2 text-center text-xs font-medium text-[color:var(--theme-text-soft)]">
                  {liveTranscript}
                </p>
              )}

              {recognitionError && (
                <p className="text-center text-xs font-bold text-rose-400">{recognitionError}</p>
              )}
            </div>

            {phase !== 'correction' && (
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={isActive ? stopSession : startSession}
                  disabled={targetVerses.length === 0}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-45 sm:h-28 sm:w-28 ${
                    isActive
                      ? 'bg-rose-500 shadow-rose-500/25 ring-[12px] ring-rose-500/12'
                      : 'bg-emerald-500 shadow-emerald-500/25 ring-[12px] ring-emerald-500/12'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div
                        key="stop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <MicOff className="h-8 w-8 sm:h-9 sm:w-9" />
                        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.24em]">{isArabic ? 'إيقاف' : 'Stop'}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <Mic className="h-8 w-8 sm:h-9 sm:w-9" />
                        <span className="mt-1 text-[10px] font-black uppercase tracking-[0.24em]">{isArabic ? 'ابدأ' : 'Start'}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <p className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--theme-text-muted)]">
                  {phase === 'idle' && (isArabic ? 'اضغط على الميكروفون للبدء' : 'Tap the mic to begin')}
                  {phase === 'linking' && (isArabic ? 'قل كلمة الربط من الآية السابقة' : 'Speak the bridge word from the previous ayah')}
                  {phase === 'reciting' && (isArabic ? 'الاستماع المستمر نشط' : 'Continuous listening is active')}
                  {phase === 'complete' && (isArabic ? 'اكتملت التلاوة' : 'Recitation completed')}
                </p>
              </div>
            )}

            <AnimatePresence>
              {masteryScore > 0 && !isActive && phase !== 'correction' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-center"
                >
                  <button
                    type="button"
                    onClick={handleEndSession}
                    className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-950 shadow-xl transition-all hover:bg-slate-100 active:scale-[0.98]"
                  >
                    <Trophy className="h-5 w-5 text-emerald-500" />
                    {isArabic ? 'حفظ الجلسة' : 'Save Session'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {phase !== 'idle' && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={resetSession}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[color:var(--theme-text-muted)] transition-colors hover:text-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {isArabic ? 'إعادة ضبط الجلسة' : 'Reset session'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Al-Rabt Review Modal — Sheikh Alaa Pedagogy */}
      <AnimatePresence>
          {isLinkingReviewOpen && previousVerses.length > 0 && (
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
              >
                  <motion.div 
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                      className="max-w-2xl w-full bg-[#09090b] border border-amber-500/20 rounded-[2.5rem] p-8 lg:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
                  >
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full -ml-24 -mb-24" />

                      <div className="relative text-center mb-8">
                          <div className="w-20 h-20 bg-amber-500/12 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-xl">
                              <Link2 className="h-10 w-10 text-amber-500" />
                          </div>
                          <h3 className="text-3xl font-black text-foreground">
                            {isArabic ? 'بروتوكول الربط' : 'Linking Protocol'}
                          </h3>
                          <p className="text-xs font-bold text-amber-500/60 uppercase tracking-[0.2em] mt-3">
                              {isArabic ? 'ربط القديم بالجديد — راجع آخر 5 آيات' : 'Review previous 5 verses before new memorization'}
                          </p>
                      </div>

                      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar py-4" dir="rtl">
                          {previousVerses.map(v => (
                              <div key={v.numberInSurah} className="flex gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all duration-300 group">
                                  <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-black border border-amber-500/10 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                      {v.numberInSurah}
                                  </span>
                                  <p className="font-quran text-2xl text-foreground leading-[1.8] text-right">
                                      {v.text}
                                  </p>
                              </div>
                          ))}
                      </div>

                      <div className="mt-10">
                          <button 
                              onClick={() => setIsLinkingReviewOpen(false)}
                              className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                          >
                              <span>{isArabic ? 'أتممت المراجعة، ابدأ الحفظ' : 'Review Done, Start Memorization'}</span>
                              <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default RecitePremium;

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
import { useVoiceCorrection } from '../../hooks/useVoiceCorrection';
import VoiceChecker from '../../components/VoiceChecker';
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

const RecitePremium = (props) => {
  const context = useOutletContext() || {};
  const { refreshData, isReciteLocked } = { ...context, ...props };
  const { i18n } = useTranslation();
  const { showError, showSuccess } = useToast();
  const isArabic = i18n.language === 'ar';

  const [surahs, setSurahs] = useState([]);
  const [surahSearch, setSurahSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(5);
  const [targetVerses, setTargetVerses] = useState([]);
  const [previousVerses, setPreviousVerses] = useState([]); 
  const [isLinkingReviewOpen, setIsLinkingReviewOpen] = useState(false);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [showSelectorOnMobile, setShowSelectorOnMobile] = useState(true);

  const surahRequestRef = useRef(null);
  const versesRequestRef = useRef(null);

  const {
    isListening,
    transcript,
    matches: words,
    masteryScore,
    startListening,
    stopListening,
    resetCorrection
  } = useVoiceCorrection(targetVerses);

  const handleError = useCallback((wordText) => {
    playErrorChime();
    const surahData = surahs.find(s => s.number === selectedSurah);
    api.post('/progress/report-error', { 
        surahNumber: selectedSurah, 
        surahName: surahData?.name || surahData?.englishName || '' 
    }).catch(() => {});
  }, [surahs, selectedSurah]);

  useEffect(() => {
    const controller = new AbortController();
    surahRequestRef.current = controller;
    const loadSurahs = async () => {
      try {
        const data = await fetchSurahList({ signal: controller.signal });
        setSurahs(data);
      } catch (error) {
        if (!isAbortedRequest(error)) showError('Failed to load surah list.');
      }
    };
    loadSurahs();
    return () => controller.abort();
  }, [showError]);

  const filteredSurahs = useMemo(
    () => surahs.filter((surah) =>
      surah.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      surah.number.toString().includes(surahSearch)
    ),
    [surahs, surahSearch]
  );

  const loadVerses = useCallback(async () => {
    if (ayahTo < ayahFrom) {
      showError(isArabic ? 'نهاية الآيات لا يمكن أن تكون قبل بدايتها' : 'Ending ayah must be after the starting ayah.');
      return;
    }
    const controller = new AbortController();
    versesRequestRef.current = controller;
    setIsLoadingVerses(true);
    try {
      const fetchedAyahs = await Promise.all(
        Array.from({ length: ayahTo - ayahFrom + 1 }, (_, index) =>
          fetchAyah(selectedSurah, ayahFrom + index, 'quran-uthmani', { signal: controller.signal })
        )
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
        setIsLinkingReviewOpen(true);
      } else {
        setPreviousVerses([]);
      }
      setTargetVerses(nextVerses);
      resetCorrection();
      setSessionDone(false);
      setShowSelectorOnMobile(false);
    } catch (error) {
      if (!isAbortedRequest(error)) showError('Failed to fetch verses.');
    } finally {
      setIsLoadingVerses(false);
    }
  }, [ayahFrom, ayahTo, selectedSurah, showError, isArabic, resetCorrection]);

  const handleEndSession = useCallback(async () => {
    stopListening();
    const surahData = surahs.find((surah) => surah.number === selectedSurah);
    const surahName = surahData?.name || surahData?.englishName || '';
    try {
      await Promise.all([
        api.post('/progress/mastery', { score: masteryScore, surah: surahName }),
        api.post('/progress/update', { pages: Math.max(1, Math.ceil(targetVerses.length / 2)) }),
      ]);
      const errorWords = [...new Set(words.filter((word) => word.status === 'wrong').map((word) => word.text))];
      await Promise.allSettled(
        errorWords.map((word) =>
          api.post('/errors', {
            location: { surahNumber: selectedSurah, surahName, ayahNumber: ayahFrom },
            errorType: 'wrong_word',
            note: `"${word}" - ${masteryScore}% accuracy`,
            ayahText: targetVerses[0]?.text,
          }),
        )
      );
      showSuccess(isArabic ? 'تم حفظ الجلسة في سجل التقدم' : 'Session logged successfully.');
      setSessionDone(true);
      if (refreshData) refreshData();
    } catch {
      showError('Failed to save session.');
    }
  }, [masteryScore, selectedSurah, surahs, words, targetVerses, ayahFrom, isArabic, showSuccess, showError, stopListening, refreshData]);

  if (isReciteLocked) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-lg rounded-[2.5rem] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20"><AlertCircle className="h-10 w-10 text-amber-500" /></div>
          <h2 className="text-3xl font-black text-foreground">{isArabic ? 'المراجعة أولاً' : 'Review first!'}</h2>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">{isArabic ? 'يرجى إتمام ورد المراجعة اليومي أولاً لفتح ميزة التلاوة.' : 'Please complete your daily revision queue before starting new memorization.'}</p>
          <div className="mt-8 space-y-3">
            <button onClick={() => window.location.href = '/dashboard/review'} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
              {isArabic ? 'الذهاب للمراجعة الآن' : 'Go to Revision'} <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 pb-20">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md rounded-[2rem] p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-emerald-500/12"><Trophy className="h-9 w-9 text-emerald-400" /></div>
          <h2 className="text-3xl font-black text-foreground">{isArabic ? 'تم بحمد الله' : 'Session Complete'}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="surface-inset rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-emerald-500/70">{isArabic ? 'الإتقان' : 'Accuracy'}</p>
              <p className="mt-2 text-4xl font-black text-emerald-400">{masteryScore}%</p>
            </div>
            <div className="surface-inset rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-rose-500/70">{isArabic ? 'أخطاء' : 'Errors'}</p>
              <p className="mt-2 text-4xl font-black text-rose-400">{words.filter(w => w.status === 'wrong').length}</p>
            </div>
          </div>
          <button onClick={() => { setSessionDone(false); resetCorrection(); setShowSelectorOnMobile(true); }} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-black text-white hover:bg-emerald-600 transition-all">
            <RotateCcw className="h-5 w-5" /> {isArabic ? 'جلسة جديدة' : 'New Session'}
          </button>
        </motion.div>
      </div>
    );
  }

  const shouldShowSelector = showSelectorOnMobile || targetVerses.length === 0;

  return (
    <div className="space-y-4 pb-10">
      <div className="lg:hidden">
        <button onClick={() => setShowSelectorOnMobile(c => !c)} className="glass-card flex w-full items-center justify-between rounded-2xl px-4 py-3">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><SlidersHorizontal className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-black">{isArabic ? 'إعداد الجلسة' : 'Session Setup'}</span>
              <span className="block text-xs text-slate-500">{targetVerses.length > 0 ? (isArabic ? `تم تحميل ${targetVerses.length} آية` : `Loaded ${targetVerses.length} ayahs`) : (isArabic ? 'اختر السورة والآيات' : 'Select Surah')}</span>
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 transition-transform ${shouldShowSelector ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <AnimatePresence>
          {shouldShowSelector && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4 lg:col-span-4">
              <div className="glass-card rounded-[2rem] p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Search className="h-5 w-5" /></span>
                  <h3 className="text-lg font-black">{isArabic ? 'إعداد الجلسة' : 'Session Setup'}</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input type="text" value={surahSearch} onChange={e => setSurahSearch(e.target.value)} placeholder={isArabic ? 'ابحث عن سورة...' : 'Search Surah'} className="surface-input h-11 w-full rounded-xl pl-10 pr-3 text-sm outline-none focus:border-emerald-500" dir="auto" />
                  </div>
                  <select value={selectedSurah} onChange={e => setSelectedSurah(Number(e.target.value))} className="surface-input h-12 w-full rounded-xl px-3 font-bold outline-none focus:border-emerald-500">
                    {filteredSurahs.map(s => <option key={s.number} value={s.number}>{s.number}. {s.englishName}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black uppercase text-slate-500 px-1">From</label><input type="number" value={ayahFrom} onChange={e => setAyahFrom(Number(e.target.value))} className="surface-input h-11 w-full rounded-xl text-center font-bold" /></div>
                    <div><label className="text-[10px] font-black uppercase text-slate-500 px-1">To</label><input type="number" value={ayahTo} onChange={e => setAyahTo(Number(e.target.value))} className="surface-input h-11 w-full rounded-xl text-center font-bold" /></div>
                  </div>
                  <button onClick={loadVerses} disabled={isLoadingVerses} className="w-full h-12 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50">
                    {isLoadingVerses ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-4 w-4" /> {isArabic ? 'تحميل الآيات' : 'Load Ayahs'}</>}
                  </button>
                </div>
              </div>
              <div className="glass-card rounded-[2rem] p-6">
                 <p className="text-[10px] font-black uppercase text-emerald-500/70">{isArabic ? 'دقة التلاوة' : 'Accuracy'}</p>
                 <div className="mt-3 flex items-end justify-between"><p className="text-4xl font-black text-emerald-400">{masteryScore}%</p><p className="text-[10px] text-slate-500 uppercase">{isListening ? 'Live' : 'Ready'}</p></div>
                 <div className="mt-4 h-1.5 bg-black/20 rounded-full overflow-hidden"><motion.div animate={{ width: `${masteryScore}%` }} className="h-full bg-emerald-500" /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-8">
          {targetVerses.length > 0 ? (
            <VoiceChecker 
               isActive={isListening}
               isProcessing={false}
               phase={isListening ? 'reciting' : transcript ? 'complete' : 'idle'}
               words={words}
               surahName={surahs.find(s => s.number === selectedSurah)?.name || ''}
               ayahNumber={ayahFrom}
               onStart={() => startListening(handleError)}
               onStop={stopListening}
               onReset={resetCorrection}
            />
          ) : (
            <div className="glass-card flex min-h-[500px] flex-col items-center justify-center p-8 bg-black/40 border-white/5 rounded-[2.5rem] text-center">
              <Mic className="h-16 w-16 text-emerald-500/20 mb-6" />
              <h3 className="text-xl font-black text-white">{isArabic ? 'اختر السورة للبدء' : 'Select a Surah to Start'}</h3>
              <p className="text-slate-500 text-sm mt-2">{isArabic ? 'لا يمكن عرض الآيات قبل الاختيار لضمان التثبيت.' : 'Select the range to begin the stealth recitation.'}</p>
            </div>
          )}

          <AnimatePresence>
            {masteryScore > 0 && !isListening && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-8">
                <button onClick={handleEndSession} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-slate-100 transition-all">
                  <Trophy className="h-5 w-5 text-emerald-500" /> {isArabic ? 'حفظ الجلسة' : 'Save Session'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isLinkingReviewOpen && previousVerses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-2xl w-full bg-[#09090b] border border-amber-500/20 rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20"><Link2 className="h-8 w-8 text-amber-500" /></div>
                <h3 className="text-2xl font-black text-white">{isArabic ? 'بروتوكول الربط' : 'Linking Protocol'}</h3>
                <p className="text-xs text-amber-500/60 uppercase mt-2 tracking-widest">{isArabic ? 'راجع آخر 5 آيات قبل البدء' : 'Review last 5 verses before memorizing'}</p>
              </div>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2" dir="rtl">
                {previousVerses.map(v => (
                  <div key={v.numberInSurah} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex gap-4">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-black">{v.numberInSurah}</span>
                    <p className="font-quran text-xl text-white">{v.text}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsLinkingReviewOpen(false)} className="w-full mt-8 py-5 bg-amber-500 text-white rounded-2xl font-black text-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                {isArabic ? 'تمت المراجعة، ابدأ' : 'Review Done, Start'} <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecitePremium;

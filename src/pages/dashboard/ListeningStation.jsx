import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Disc3,
  Headphones,
  Loader2,
  Pause,
  Play,
  Repeat,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  Waves,
  Crosshair, // New icon for "Back to Ayah"
  ArrowUp,
  Layout,
  Book,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { fetchSurahList } from '../../services/quranApi';

const RECITERS = [
  {
    id: 'minshawi',
    identifier: 'ar.minshawi',
    name: 'Al-Minshawi',
    arabicName: 'المنشاوي',
    avatar: 'من',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'husary',
    identifier: 'ar.husary',
    name: 'Al-Hosary',
    arabicName: 'الحصري',
    avatar: 'حص',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'alafasy',
    identifier: 'ar.alafasy',
    name: 'Al-Afasy',
    arabicName: 'العفاسي',
    avatar: 'عف',
    gradient: 'from-sky-500 to-indigo-500',
  },
];

const REPEAT_SEQUENCE = ['off', 'ayah', 'surah'];
const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1';

const normalizeLabel = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const isSameCalendarDay = (left, right = new Date()) =>
  new Date(left).toDateString() === new Date(right).toDateString();

const getRepeatModeLabel = (mode, isArabic) => {
  if (mode === 'ayah') return isArabic ? 'تكرار الآية' : 'Repeat Ayah';
  if (mode === 'surah') return isArabic ? 'تكرار السورة' : 'Repeat Surah';
  return isArabic ? 'بدون تكرار' : 'No Repeat';
};

const fetchSurahAudio = async (surahNumber, reciterIdentifier, signal) => {
  const response = await fetch(`${ALQURAN_API_BASE}/surah/${surahNumber}/${reciterIdentifier}`, { signal });
  const payload = await response.json();

  if (!response.ok || payload?.code !== 200) {
    throw new Error('Unable to stream this Surah right now.');
  }

  return payload.data;
};

const ReciterPicker = ({ isArabic, isOpen, onSelect, selectedReciter, setIsOpen }) => (
  <div className="relative">
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      className="glass-card flex w-full items-center justify-between rounded-[1.75rem] px-4 py-4 text-left"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedReciter.gradient} text-sm font-black text-white shadow-lg`}>
          {selectedReciter.avatar}
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">
            {isArabic ? 'القارئ' : 'Reciter'}
          </span>
          <span className="block truncate text-base font-black text-foreground">
            {isArabic ? selectedReciter.arabicName : selectedReciter.name}
          </span>
        </span>
      </span>
      <ChevronDown className={`h-5 w-5 text-[color:var(--theme-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[90] block bg-transparent"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="glass-card-strong absolute inset-x-0 top-[calc(100%+0.75rem)] z-[100] overflow-hidden rounded-[1.75rem] p-2"
          >
            {RECITERS.map((reciter) => {
              const active = reciter.id === selectedReciter.id;

              return (
                <button
                  key={reciter.id}
                  type="button"
                  onClick={() => {
                    onSelect(reciter);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-all ${
                    active
                      ? 'bg-emerald-500/12 text-foreground'
                      : 'text-[color:var(--theme-text-muted)] hover:bg-[color:var(--theme-surface-muted)] hover:text-foreground'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${reciter.gradient} text-sm font-black text-white`}>
                    {reciter.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{isArabic ? reciter.arabicName : reciter.name}</span>
                    <span className="block truncate text-xs text-[color:var(--theme-text-muted)]">{reciter.identifier}</span>
                  </span>
                  {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
);

const DesktopPlayer = ({
  currentAyah,
  currentAyahIndex,
  isArabic,
  isLoadingAudio,
  isMarkedListened,
  isMarkingListened,
  isPlaying,
  isRtl,
  onNext,
  onPrevious,
  onTogglePlay,
  onToggleRepeat,
  repeatMode,
  selectedReciter,
  selectedSurahMeta,
}) => (
  <div className={`pointer-events-none fixed bottom-5 z-[9999] hidden md:block ${isRtl ? 'left-6 right-24 lg:right-72' : 'left-24 right-6 lg:left-72'}`}>
    <div className="glass-card-strong border-emerald-500/10 pointer-events-auto flex items-center gap-5 rounded-[1.9rem] px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="eyebrow">{isArabic ? 'محطة الاستماع' : 'Listening Station'}</span>
          {isMarkedListened && (
            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
              {isArabic ? 'تم التعليم كمسموعة' : 'Marked as listened'}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedReciter.gradient} text-sm font-black text-white`}>
            {selectedReciter.avatar}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-foreground">
              {selectedSurahMeta ? (isArabic ? selectedSurahMeta.name : selectedSurahMeta.englishName) : (isArabic ? 'اختر سورة' : 'Choose a Surah')}
            </p>
            <p className="truncate text-sm text-[color:var(--theme-text-muted)]">
              {selectedSurahMeta
                ? `${isArabic ? 'الآية' : 'Ayah'} ${currentAyah?.numberInSurah === 0 ? (isArabic ? 'البسملة' : 'Basmala') : (currentAyah?.numberInSurah || currentAyahIndex + 1)}${currentAyah ? ` • ${isArabic ? selectedReciter.arabicName : selectedReciter.name}` : ''}`
                : (isArabic ? 'اختر سورة وقارئًا لبدء البث' : 'Pick a reciter and Surah to begin streaming')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!selectedSurahMeta}
          className="surface-input flex h-12 w-12 items-center justify-center rounded-2xl text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!selectedSurahMeta || isLoadingAudio}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedSurahMeta}
          className="surface-input flex h-12 w-12 items-center justify-center rounded-2xl text-foreground transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleRepeat}
        className={`surface-input flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-[0.18em] ${
          repeatMode !== 'off' ? 'border-emerald-500/30 text-emerald-500' : 'text-[color:var(--theme-text-muted)]'
        }`}
      >
        <Repeat className="h-4 w-4" />
        {getRepeatModeLabel(repeatMode, isArabic)}
      </button>

      {isMarkingListened && <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />}
    </div>
  </div>
);

const MobilePlayerSheet = ({
  currentAyah,
  currentAyahIndex,
  isArabic,
  isExpanded,
  isLoadingAudio,
  isMarkedListened,
  isMarkingListened,
  isPlaying,
  onNext,
  onPrevious,
  onToggleExpanded,
  onTogglePlay,
  onToggleRepeat,
  repeatMode,
  selectedReciter,
  selectedSurahMeta,
}) => (
  <div className="fixed inset-x-0 bottom-0 z-[9999] md:hidden">
    <motion.div
      animate={{ y: isExpanded ? 0 : 96 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="glass-card-strong rounded-t-[2rem] border-zinc-700 bg-zinc-900/95 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] border-b-0 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"
    >
      <button type="button" onClick={onToggleExpanded} className="mx-auto mb-3 block h-1.5 w-14 rounded-full bg-white/20" />

      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedReciter.gradient} text-sm font-black text-white`}>
          {selectedReciter.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">
            {selectedSurahMeta ? (isArabic ? selectedSurahMeta.name : selectedSurahMeta.englishName) : (isArabic ? 'اختر سورة' : 'Choose a Surah')}
          </p>
          <p className="truncate text-xs text-[color:var(--theme-text-muted)]">
            {selectedSurahMeta ? `${isArabic ? 'الآية' : 'Ayah'} ${currentAyahIndex + 1}` : (isArabic ? 'ابدأ الاستماع' : 'Start listening')}
          </p>
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!selectedSurahMeta || isLoadingAudio}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 space-y-4"
          >
            <div className="surface-inset rounded-[1.6rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--theme-text-muted)]">
                    {isArabic ? 'التشغيل الحالي' : 'Now Playing'}
                  </p>
                  <p className="mt-2 truncate text-sm font-black text-foreground">
                    {currentAyah?.text || (isArabic ? 'اختر سورة للبدء' : 'Select a Surah to start')}
                  </p>
                </div>
                <Volume2 className="h-5 w-5 shrink-0 text-emerald-500" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={onPrevious} disabled={!selectedSurahMeta} className="surface-input flex h-12 flex-1 items-center justify-center rounded-2xl disabled:opacity-50">
                <SkipBack className="h-5 w-5" />
              </button>
              <button type="button" onClick={onNext} disabled={!selectedSurahMeta} className="surface-input flex h-12 flex-1 items-center justify-center rounded-2xl disabled:opacity-50">
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={onToggleRepeat}
                className={`surface-input flex h-12 flex-[1.3] items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-[0.16em] ${
                  repeatMode !== 'off' ? 'border-emerald-500/30 text-emerald-500' : 'text-[color:var(--theme-text-muted)]'
                }`}
              >
                <Repeat className="h-4 w-4" />
                {repeatMode === 'ayah' ? '1' : repeatMode === 'surah' ? 'S' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs font-bold">
              <span className="text-[color:var(--theme-text-muted)]">{getRepeatModeLabel(repeatMode, isArabic)}</span>
              <span className="flex items-center gap-2 text-emerald-500">
                {isMarkingListened && <Loader2 className="h-4 w-4 animate-spin" />}
                {isMarkedListened && (isArabic ? 'تم التعليم كمسموعة' : 'Marked as listened')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
);

const ListeningStation = (props) => {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const context = useOutletContext() || {};
  const { progress, user, refreshData } = { progress: {}, user: {}, ...context, ...props };
  const isArabic = i18n.language === 'ar';
  const isRtl = isArabic;

  const [surahs, setSurahs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [selectedReciterId, setSelectedReciterId] = useState(RECITERS[0].id);
  const [reciterMenuOpen, setReciterMenuOpen] = useState(false);
  const [surahPayload, setSurahPayload] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false);
  const [isMarkingListened, setIsMarkingListened] = useState(false);
  const [optimisticListenedKey, setOptimisticListenedKey] = useState('');

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);

  const audioRef = useRef(null);
  const ayahRefs = useRef({});
  const markAttemptRef = useRef(new Set());
  const scrollingRef = useRef(false);

  // Detect manual scroll to disable auto-scroll
  useEffect(() => {
    const handleScrollIntent = () => {
      if (!scrollingRef.current) {
        setIsAutoScrollEnabled(false);
      }
    };

    window.addEventListener('wheel', handleScrollIntent, { passive: true });
    window.addEventListener('touchmove', handleScrollIntent, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleScrollIntent);
      window.removeEventListener('touchmove', handleScrollIntent);
    };
  }, []);


  const selectedReciter = useMemo(
    () => RECITERS.find((reciter) => reciter.id === selectedReciterId) || RECITERS[0],
    [selectedReciterId],
  );

  const selectedSurahMeta = useMemo(
    () => surahs.find((surah) => surah.number === selectedSurahNumber) || null,
    [selectedSurahNumber, surahs],
  );

  const filteredSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return surahs;

    return surahs.filter((surah) =>
      surah.englishName.toLowerCase().includes(query) ||
      surah.name.toLowerCase().includes(query) ||
      surah.number.toString().includes(query),
    );
  }, [search, surahs]);

  const todayHistoryEntry = useMemo(
    () => (progress?.history || []).find((entry) => isSameCalendarDay(entry.date)),
    [progress?.history],
  );

  const listenedToday = todayHistoryEntry?.listenedSurahs || [];
  const selectedListenKey = `${selectedSurahNumber}:${selectedReciter.identifier}`;
  const isMarkedListened =
    listenedToday.some((entry) => entry.surahNumber === selectedSurahNumber) ||
    optimisticListenedKey === selectedListenKey;

  const targetSurahLabel = normalizeLabel(progress?.currentSurahName || user?.currentTargetSurah);
  const isTargetSurah = useMemo(() => {
    if (!selectedSurahMeta || !targetSurahLabel) return false;

    return [selectedSurahMeta.englishName, selectedSurahMeta.name]
      .map((label) => normalizeLabel(label))
      .includes(targetSurahLabel);
  }, [selectedSurahMeta, targetSurahLabel]);

  const ayahs = useMemo(() => {
    if (!surahPayload) return [];
    const baseAyahs = surahPayload.ayahs || [];
    
    // Some editions don't include Basmala in the ayahs array (except Fatiha)
    // but provide it in surahPayload.bismillah
    if (selectedSurahNumber !== 1 && selectedSurahNumber !== 9 && surahPayload.bismillah) {
      return [
        {
          ...surahPayload.bismillah,
          numberInSurah: 0,
          text: isArabic ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' : 'Bismillahir-Rahmanir-Rahim',
          number: 'bismillah-' + selectedSurahNumber
        },
        ...baseAyahs
      ];
    }
    return baseAyahs;
  }, [surahPayload, selectedSurahNumber, isArabic]);

  const currentAyah = ayahs[currentAyahIndex] || null;

  const headerCopy = {
    title: isArabic ? 'محطة الاستماع' : 'The Listening Station',
    subtitle: isArabic
      ? 'بث عالي الجودة للقرآن الكريم مع انتقال تلقائي بين الآيات ومتابعة القارئ المفضل.'
      : 'Premium Quran streaming with auto-advancing ayahs and a focused player for your favorite reciters.',
    searchPlaceholder: isArabic ? 'ابحث عن سورة أو رقم...' : 'Search for a Surah or number...',
    selectReciter: isArabic ? 'اختر قارئًا' : 'Choose a Reciter',
    chooseSurah: isArabic ? 'اختر سورة' : 'Choose a Surah',
    loadingSurah: isArabic ? 'جارٍ تحميل البث...' : 'Loading stream...',
    nowListening: isArabic ? 'الاستماع الآن' : 'Now Listening',
    targetTag: isArabic ? 'سورة الحفظ الحالية' : 'Current Memorization Target',
    listenedTag: isArabic ? 'تم التعليم كمسموعة اليوم' : 'Marked as listened today',
    willMarkTag: isArabic ? 'سيتم تعليمها تلقائيًا عند بدء الاستماع' : 'Will auto-mark once playback starts',
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadSurahs = async () => {
      setIsLoadingList(true);
      try {
        const data = await fetchSurahList({ signal: controller.signal });
        setSurahs(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error.message || 'Unable to load Surahs.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingList(false);
        }
      }
    };

    void loadSurahs();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoadingSurah(true);
    setLoadError('');
    // No longer resetting index or payload here to avoid flickering 
    // if a user selects something fast, but handled in selectivity logic.

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    const loadSurahStream = async () => {
      try {
        const payload = await fetchSurahAudio(selectedSurahNumber, selectedReciter.identifier, controller.signal);
        setSurahPayload(payload);
        setIsPlaying(true); // DEFINITIVE FIX: Trigger playback immediately on success
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error.message || 'Unable to stream this Surah right now.');
          setSurahPayload(null);
          setIsPlaying(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSurah(false);
        }
      }
    };

    void loadSurahStream();

    return () => controller.abort();
  }, [selectedReciter.identifier, selectedSurahNumber]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyah?.audio) return;

    const sourceKey = `${selectedReciter.identifier}:${selectedSurahNumber}:${currentAyahIndex}`;
    if (audio.dataset.sourceKey !== sourceKey) {
      audio.pause();
      audio.src = currentAyah.audio;
      audio.load();
      audio.dataset.sourceKey = sourceKey;
    }

    if (!isPlaying || !currentAyah?.audio) {
      if (audio.dataset.sourceKey === sourceKey && !audio.paused) {
        audio.pause();
      }
      return;
    }

    // Playback with safety guard
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch((e) => {
        // AbortError is normal during rapid navigation - ignore it
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
          console.error("Playback error:", e);
          setIsPlaying(false);
        }
      });
    }
  }, [currentAyah?.audio, currentAyahIndex, isPlaying, selectedReciter.identifier, selectedSurahNumber]);

  useEffect(() => {
    if (!currentAyah || !isAutoScrollEnabled) return;

    scrollingRef.current = true;
    ayahRefs.current[currentAyah.numberInSurah]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    const timeout = setTimeout(() => { scrollingRef.current = false; }, 1000);
    return () => clearTimeout(timeout);
  }, [currentAyah, isAutoScrollEnabled]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleEnded = () => {
      if (!ayahs.length) return;

      if (repeatMode === 'ayah') {
        audio.currentTime = 0;
        void audio.play().catch(() => setIsPlaying(false));
        return;
      }

      if (currentAyahIndex < ayahs.length - 1) {
        setCurrentAyahIndex((index) => index + 1);
        return;
      }

      if (repeatMode === 'surah') {
        setCurrentAyahIndex(0);
        return;
      }

      setIsPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setLoadError(isArabic ? 'تعذر تشغيل هذه الآية حاليًا.' : 'Unable to play this ayah right now.');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [ayahs.length, currentAyahIndex, isArabic, repeatMode]);

  useEffect(() => {
    if (!isPlaying || !isTargetSurah || !selectedSurahMeta || isMarkedListened) return;
    if (markAttemptRef.current.has(selectedListenKey)) return;

    markAttemptRef.current.add(selectedListenKey);
    let cancelled = false;

    const markAsListened = async () => {
      setIsMarkingListened(true);

      try {
        await api.post('/progress/listened', {
          surahNumber: selectedSurahMeta.number,
          surahName: selectedSurahMeta.englishName,
          reciter: selectedReciter.identifier,
          reciterName: selectedReciter.name,
        });

        if (!cancelled) {
          setOptimisticListenedKey(selectedListenKey);
          void refreshData?.();
        }
      } catch {
        if (!cancelled) {
          markAttemptRef.current.delete(selectedListenKey);
        }
      } finally {
        if (!cancelled) {
          setIsMarkingListened(false);
        }
      }
    };

    void markAsListened();

    return () => {
      cancelled = true;
    };
  }, [isMarkedListened, isPlaying, isTargetSurah, refreshData, selectedListenKey, selectedReciter.identifier, selectedReciter.name, selectedSurahMeta]);

  const handleSelectSurah = useCallback((surahNumber) => {
    if (surahNumber === selectedSurahNumber && surahPayload) {
        // If already loaded, just toggle play
        setIsPlaying(true);
        return;
    }

    // AGGRESSIVE RESET: Prepare engine for new stream
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Clear existing src to prevent cross-contamination
    }

    setSelectedSurahNumber(surahNumber);
    setSurahPayload(null);
    setCurrentAyahIndex(0);
    setIsLoadingSurah(true); // Immediate loading state
    setIsPlaying(false); // Will be set to true by the fetch effect upon success
    setLoadError('');
  }, [selectedSurahNumber, surahPayload]);

  const togglePlay = useCallback(() => {
    if (!selectedSurahMeta || isLoadingSurah) return;
    setIsPlaying((current) => !current);
  }, [isLoadingSurah, selectedSurahMeta]);

  const playSpecificAyah = useCallback((index) => {
    setCurrentAyahIndex(index);
    setIsPlaying(true);
  }, []);

  const playNextAyah = useCallback(() => {
    setCurrentAyahIndex((index) => {
      if (!ayahs.length) return index;
      if (index >= ayahs.length - 1) return repeatMode === 'surah' ? 0 : index;
      return index + 1;
    });
    setIsPlaying(true);
  }, [ayahs.length, repeatMode]);

  const playPreviousAyah = useCallback(() => {
    setCurrentAyahIndex((index) => {
      if (!ayahs.length) return index;
      if (index <= 0) return 0;
      return index - 1;
    });
    setIsPlaying(true);
  }, [ayahs.length]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((current) => REPEAT_SEQUENCE[(REPEAT_SEQUENCE.indexOf(current) + 1) % REPEAT_SEQUENCE.length]);
  }, []);

  return (
    <div className="space-y-6 pb-52 md:pb-44">
      <audio ref={audioRef} preload="metadata" />

      <section className="glass-card overflow-hidden rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-500">
              <Headphones className="h-4 w-4" />
              {headerCopy.title}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {headerCopy.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--theme-text-soft)] sm:text-base">
              {headerCopy.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isTargetSurah && (
              <span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-500">
                {headerCopy.targetTag}
              </span>
            )}
            {isMarkedListened && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/12 px-4 py-2 text-xs font-black text-emerald-500">
                {headerCopy.listenedTag}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
        <div className="space-y-6 relative z-20">
          <div className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Disc3 className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">{headerCopy.selectReciter}</p>
                <h2 className="text-xl font-black text-foreground">{isArabic ? 'اختيار القارئ' : 'Reciter Selection'}</h2>
              </div>
            </div>

            <ReciterPicker
              isArabic={isArabic}
              isOpen={reciterMenuOpen}
              onSelect={(reciter) => setSelectedReciterId(reciter.id)}
              selectedReciter={selectedReciter}
              setIsOpen={setReciterMenuOpen}
            />

            <div className="mt-5 grid grid-cols-3 gap-2">
              {RECITERS.map((reciter) => {
                const active = reciter.id === selectedReciter.id;

                return (
                  <button
                    key={reciter.id}
                    type="button"
                    onClick={() => setSelectedReciterId(reciter.id)}
                    className={`rounded-2xl px-2 py-3 text-center transition-all ${active ? 'bg-emerald-500/12 text-foreground' : 'surface-input text-[color:var(--theme-text-muted)]'}`}
                  >
                    <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${reciter.gradient} text-sm font-black text-white`}>
                      {reciter.avatar}
                    </span>
                    <span className="mt-2 block text-[11px] font-black">{isArabic ? reciter.arabicName : reciter.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
                <Volume2 className="h-5 w-5" />
              </span>
              <div>
                <p className="eyebrow">{headerCopy.nowListening}</p>
                <h3 className="text-lg font-black text-foreground">
                  {selectedSurahMeta ? (isArabic ? selectedSurahMeta.name : selectedSurahMeta.englishName) : headerCopy.chooseSurah}
                </h3>
              </div>
            </div>

            <div className="surface-inset rounded-[1.6rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">
                    {currentAyah?.text || (isArabic ? 'اختر سورة لبدء الاستماع' : 'Select a Surah to start listening')}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--theme-text-muted)]">
                    {selectedSurahMeta
                      ? `${isArabic ? 'عدد الآيات' : 'Ayahs'}: ${selectedSurahMeta.numberOfAyahs}`
                      : (isArabic ? 'سيظهر النص الجاري تشغيله هنا' : 'The playing ayah will appear here')}
                  </p>
                </div>
                <Waves className="h-5 w-5 shrink-0 text-emerald-500" />
              </div>
            </div>

            {isTargetSurah && !isMarkedListened && (
              <p className="mt-4 text-xs font-bold text-emerald-500">{headerCopy.willMarkTag}</p>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">{headerCopy.chooseSurah}</p>
                <h2 className="text-xl font-black text-foreground">{isArabic ? 'مكتبة السور' : 'Surah Library'}</h2>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--theme-text-muted)] ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={headerCopy.searchPlaceholder}
                  className={`surface-input h-11 w-full rounded-xl text-sm text-foreground outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${isRtl ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'}`}
                />
              </div>
            </div>

            {isLoadingList ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSurahs.map((surah) => {
                  const active = surah.number === selectedSurahNumber;
                  const isCurrentTarget = [surah.englishName, surah.name]
                    .map((label) => normalizeLabel(label))
                    .includes(targetSurahLabel);
                  const listened = listenedToday.some((entry) => entry.surahNumber === surah.number);

                  return (
                    <button
                      key={surah.number}
                      type="button"
                      onClick={() => handleSelectSurah(surah.number)}
                      className={`rounded-[1.6rem] border p-4 text-left transition-all ${
                        active
                          ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_12px_30px_rgba(16,185,129,0.08)]'
                          : 'surface-input hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-black text-foreground">{isArabic ? surah.name : surah.englishName}</p>
                          <p className="mt-1 text-xs text-[color:var(--theme-text-muted)]">
                            {surah.number}. {isArabic ? surah.englishName : surah.englishNameTranslation}
                          </p>
                        </div>
                        <span className="rounded-full bg-[color:var(--theme-surface-muted)] px-3 py-1 text-xs font-black text-foreground">
                          {surah.numberOfAyahs}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {active && (
                          <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                            {isArabic ? 'يتم التحميل' : 'Selected'}
                          </span>
                        )}
                        {isCurrentTarget && (
                          <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">
                            {headerCopy.targetTag}
                          </span>
                        )}
                        {listened && (
                          <span className="rounded-full bg-sky-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-500">
                            {isArabic ? 'مسموعة اليوم' : 'Listened today'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{headerCopy.nowListening}</p>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-foreground">
                    {selectedSurahMeta ? (isArabic ? selectedSurahMeta.name : selectedSurahMeta.englishName) : headerCopy.chooseSurah}
                    </h2>
                    <button 
                        onClick={() => setIsReadingMode(!isReadingMode)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isReadingMode ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                        {isReadingMode ? <Book className="h-3 w-3" /> : <Layout className="h-3 w-3" />}
                        {isReadingMode ? (isArabic ? 'وضع القراءة' : 'Mushaf View') : (isArabic ? 'وضع القوائم' : 'List View')}
                    </button>
                </div>
              </div>
              {isLoadingSurah && <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />}
            </div>

            {/* Sticky Quick Access (Reading Mode) */}
            {isReadingMode && !isLoadingSurah && (
               <div className="sticky-selector flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                     <select 
                        value={selectedSurahNumber} 
                        onChange={(e) => handleSelectSurah(Number(e.target.value))}
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-emerald-500 outline-none cursor-pointer truncate"
                     >
                        {surahs.map(s => (
                            <option key={s.number} value={s.number} className="bg-zinc-900 text-white">{s.number}. {isArabic ? s.name : s.englishName}</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button onClick={playPreviousAyah} className="text-zinc-500 hover:text-white transition-colors"><SkipBack size={16}/></button>
                    <span className="text-xs font-black text-foreground">
                        {isArabic ? 'الآية' : 'Ayah'} {currentAyahIndex + 1}
                    </span>
                    <button onClick={playNextAyah} className="text-zinc-500 hover:text-white transition-colors"><SkipForward size={16}/></button>
                  </div>
               </div>
            )}

            {loadError ? (
              <div className="rounded-[1.6rem] border border-rose-500/20 bg-rose-500/8 p-4 text-sm font-bold text-rose-400">
                {loadError}
              </div>
            ) : isLoadingSurah ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-bold text-[color:var(--theme-text-muted)]">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  {headerCopy.loadingSurah}
                </div>
              </div>
            ) : (
              <div className={isReadingMode ? "mushaf-reading-mode" : "space-y-3"}>
                {ayahs.map((ayah, index) => {
                  const active = index === currentAyahIndex;

                  if (isReadingMode) {
                    return (
                        <span 
                            key={ayah.number}
                            ref={(node) => { ayahRefs.current[ayah.numberInSurah] = node; }}
                            onClick={() => playSpecificAyah(index)}
                            className={`ayah-inline font-quran ${active ? 'ayah-inline--active' : ''}`}
                        >
                            {ayah.text}
                            {ayah.numberInSurah !== 0 && (
                                <span className={`ayah-marker ${active ? 'ayah-marker--active' : ''}`}>
                                    {ayah.numberInSurah}
                                </span>
                            )}
                        </span>
                    );
                  }

                  return (
                    <button
                      key={ayah.number}
                      type="button"
                      ref={(node) => {
                        ayahRefs.current[ayah.numberInSurah] = node;
                      }}
                      onClick={() => playSpecificAyah(index)}
                      className={`w-full rounded-[1.6rem] border p-4 text-right transition-all ${
                        active
                          ? isDark
                            ? 'border-emerald-500/35 bg-emerald-500/10 shadow-[0_0_28px_rgba(16,185,129,0.14)]'
                            : 'border-emerald-500/30 bg-emerald-500/8 shadow-[0_0_24px_rgba(16,185,129,0.12)]'
                          : 'surface-input hover:border-emerald-500/20'
                      }`}
                      dir="rtl"
                    >
                      <div className="flex items-start gap-4">
                        <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          active ? 'bg-emerald-500 text-white' : 'bg-[color:var(--theme-surface-muted)] text-foreground'
                        }`}>
                          {ayah.numberInSurah === 0 ? 'ث' : ayah.numberInSurah}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`font-quran text-right transition-all ${active ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : 'text-foreground'}`}>
                            {ayah.text}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--theme-text-muted)]">
                              {isArabic ? 'اضغط لتشغيل الآية' : 'Tap to play ayah'}
                            </span>
                            {active && (
                              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">
                                <Waves className="h-3.5 w-3.5" />
                                {isArabic ? 'الآية النشطة' : 'Active ayah'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {!isAutoScrollEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                bottom: selectedSurahMeta ? "7.5rem" : "2rem" // Slide up when player is active
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed right-6 z-[9998] flex flex-col items-center gap-2"
          >
            <button
              onClick={() => setIsAutoScrollEnabled(true)}
              className="sync-fab flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 transition-transform active:scale-95"
            >
              <Crosshair className="h-6 w-6" />
            </button>
            <div className="rounded-full bg-emerald-500/12 px-3 py-1 backdrop-blur-md">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                    {isArabic ? 'مزامنة' : 'Sync View'}
                </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DesktopPlayer
        currentAyah={currentAyah}
        currentAyahIndex={currentAyahIndex}
        isArabic={isArabic}
        isLoadingAudio={isLoadingSurah}
        isMarkedListened={isMarkedListened}
        isMarkingListened={isMarkingListened}
        isPlaying={isPlaying}
        isRtl={isRtl}
        onNext={playNextAyah}
        onPrevious={playPreviousAyah}
        onTogglePlay={togglePlay}
        onToggleRepeat={cycleRepeatMode}
        repeatMode={repeatMode}
        selectedReciter={selectedReciter}
        selectedSurahMeta={selectedSurahMeta}
      />

      <MobilePlayerSheet
        currentAyah={currentAyah}
        currentAyahIndex={currentAyahIndex}
        isArabic={isArabic}
        isExpanded={isMobilePlayerExpanded}
        isLoadingAudio={isLoadingSurah}
        isMarkedListened={isMarkedListened}
        isMarkingListened={isMarkingListened}
        isPlaying={isPlaying}
        onNext={playNextAyah}
        onPrevious={playPreviousAyah}
        onToggleExpanded={() => setIsMobilePlayerExpanded((current) => !current)}
        onTogglePlay={togglePlay}
        onToggleRepeat={cycleRepeatMode}
        repeatMode={repeatMode}
        selectedReciter={selectedReciter}
        selectedSurahMeta={selectedSurahMeta}
      />
    </div>
  );
};

export default ListeningStation;

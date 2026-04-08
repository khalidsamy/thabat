import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useFloatingActionStack } from '../context/FloatingActionContext';
import { useTranslation } from 'react-i18next';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QURAN_VERSES } from '../utils/verses';
import { getUserRank } from '../utils/rankManager';
import confetti from 'canvas-confetti';
import HeartMessage from '../components/HeartMessage';
import MindMapModal from '../components/MindMapModal';
import ChatAssistant from '../components/ChatAssistant';

import Home from './dashboard/Home';
import { getDailyQueue, isReciteLocked } from '../utils/RevisionEngine';
import notificationService from '../services/notificationService';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user: authUser } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const location = useLocation();

  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(authUser || {});
  const [isLoading, setIsLoading] = useState(true);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [isHeartOpen, setIsHeartOpen] = useState(false);
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [pagesInput, setPagesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingSunnah, setIsTogglingSunnah] = useState(false);
  const [reciteLocked, setReciteLocked] = useState(false);
  const [revisionQueue, setRevisionQueue] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);

  const fetchProgress = useCallback(async () => {
    const res = await api.get('/progress');
    if (res.data.success) setProgress(res.data.progress);
  }, []);

  const loadInitialData = useCallback(async () => {
  setIsLoading(true);
  try {
    // Using individual catch blocks for higher compatibility and specific error tracking
    const [progressResult, userResult] = await Promise.all([
      api.get('/progress')
        .then(res => ({ status: 'fulfilled', value: res }))
        .catch(err => {
          console.error('API Error (Progress):', err);
          return { status: 'rejected', reason: err };
        }),
      api.get('/user/profile')
        .then(res => ({ status: 'fulfilled', value: res }))
        .catch(err => {
          console.error('API Error (User):', err);
          return { status: 'rejected', reason: err };
        })
    ]);
 
    // Progress — fall back to an empty defaults object so the UI never crashes
    if (progressResult.status === 'fulfilled' && progressResult.value.data.success) {
      setProgress(progressResult.value.data.progress);
    } else {
      setProgress({
        currentPage: 1,
        totalMemorized: 0,
        dailyTarget: 1,
        streak: 0,
        longestStreak: 0,
        doneToday: 0,
        sunnahCompletedToday: false,
        masteryPercent: 0,
        history: [],
      });
      if (progressResult.status === 'rejected') {
        console.error('Progress fetch failed:', progressResult.reason?.message);
      }
    }
 
    // User profile — fall back to the cached AuthContext value
    if (userResult.status === 'fulfilled' && userResult.value.data.success) {
      const userData = userResult.value.data.data || userResult.value.data.user;
      if (userData) setUser(userData);
    } else {
      if (authUser) setUser(authUser);
      if (userResult.status === 'rejected') {
        console.error('Profile fetch failed:', userResult.reason?.message);
      }
    }

    // Revision Gatekeeper Logic
    if (progressResult.status === 'fulfilled' && progressResult.value?.data?.success) {
      const prog = progressResult.value.data.progress;
      
      // Safety check for RevisionEngine functions
      try {
        const locked = typeof isReciteLocked === 'function' ? isReciteLocked(prog) : false;
        setReciteLocked(locked);
        
        if (typeof getDailyQueue === 'function') {
          const queue = await getDailyQueue(prog);
          setRevisionQueue(queue);
        }
      } catch (revErr) {
        console.warn('RevisionEngine calculation failure:', revErr);
      }

      // Sheikh Alaa's Proactive Reminders logic
      const isAr = authUser?.language === 'ar' || i18n?.language === 'ar';
      if (notificationService && typeof notificationService.checkAndRemind === 'function') {
        try {
          notificationService.checkAndRemind(prog, isAr);
        } catch (notifErr) {
          console.warn('NotificationService error:', notifErr);
        }
      }
    }
 
    if (QURAN_VERSES && Array.isArray(QURAN_VERSES) && QURAN_VERSES.length > 0) {
      const randomVerse = QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)];
      setDailyVerse(randomVerse);
    }
 
    if (notificationService && typeof notificationService.requestPermission === 'function') {
      try {
        notificationService.requestPermission();
      } catch (permErr) {
        console.warn('Permission request error:', permErr);
      }
    }
  } catch (err) {
    console.error('loadInitialData unexpected error detail:', {
      message: err?.message,
      stack: err?.stack,
      error: err
    });
    if (authUser) setUser(authUser);
  } finally {
    setIsLoading(false);
  }
}, [authUser, i18n?.language]); // Use .language for stable dependency

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 1500;
    const colors = ['#10B981', '#F59E0B', '#FFFFFF'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, []);

  const handleUpdateSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const pages = Number(pagesInput);
    if (!pagesInput || isNaN(pages) || pages <= 0) {
      showError(t('dashboard.invalid_input'));
      return;
    }
    setIsUpdating(true);
    try {
      const res = await api.post('/progress/update', { pages });
      if (res.data.success) {
        setPagesInput('');
        showSuccess(t('dashboard.success_update', { count: pages }));
        fireConfetti();
        await fetchProgress();
        setRefreshKey((p) => p + 1);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsUpdating(false);
    }
  }, [pagesInput, showError, showSuccess, t, fireConfetti, fetchProgress]);

  const handleSunnahToggle = useCallback(async () => {
    setIsTogglingSunnah(true);
    try {
      const res = await api.put('/progress/toggle-sunnah');
      if (res.data.success) {
        if (res.data.sunnahCompletedToday) showSuccess('ما شاء الله! تقبل الله منك.');
        await fetchProgress();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsTogglingSunnah(false);
    }
  }, [showSuccess, showError, fetchProgress]);

  const handleVoiceComplete = useCallback(async (score, surah) => {
    await api.post('/progress/mastery', { score, surah }).catch(() => {});
    if (score > 90) showSuccess(t('voice.perfect_match') || 'Perfect recitation! Recorded.');
  }, [showSuccess, t]);

  const shareProgress = useCallback(async () => {
    const rank = getUserRank(progress?.totalMemorized || 0);
    const text = i18n.language === 'ar'
      ? `الحمد لله! حققت لقب "${t(`ranks.${rank.id}`)}" في تطبيق ثبات. استمراريتي: ${progress?.streak || 0} أيام. 📖✨`
      : `Alhamdulillah! I achieved "${t(`ranks.${rank.id}`)}" in Thabat. Streak: ${progress?.streak || 0} days. 📖✨`;

    if (navigator.share) {
      await navigator.share({ title: 'Thabat', text, url: window.location.origin }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).then(
        () => showSuccess(t('dashboard.copy_success')),
        () => showError('Could not copy')
      );
    }
  }, [progress, i18n.language, t, showSuccess, showError]);

  // Memoized to prevent unnecessary re-renders in child pages during voice recognition.
  // Without this, every Dashboard state change (e.g. isUpdating) would re-render
  // ReciteTab and interrupt the SpeechRecognition stream.
  const sharedProps = useMemo(() => ({
    progress,
    user,
    dailyVerse,
    refreshKey,
    pagesInput,
    setPagesInput,
    handleUpdateSubmit,
    isUpdating,
    handleSunnahToggle,
    isTogglingSunnah,
    handleVoiceComplete,
    refreshData: loadInitialData,
    onVisualize: () => setIsMindMapOpen(true),
    shareProgress,
    reciteLocked,
    revisionQueue,
    itemVariants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
  }), [
    progress, user, dailyVerse, refreshKey, pagesInput,
    handleUpdateSubmit, isUpdating, handleSunnahToggle, isTogglingSunnah,
    handleVoiceComplete, loadInitialData, shareProgress, reciteLocked, revisionQueue
  ]);

  const { registerElement, unregisterElement } = useFloatingActionStack();

  const heartButton = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsHeartOpen(true)}
      className={`pointer-events-auto flex items-center justify-center rounded-3xl border-2 border-white/20 bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_20px_50px_rgba(245,158,11,0.3)] h-12 w-12 sm:h-14 sm:w-14 ${hasBottomPlayerRoute ? 'hidden sm:flex' : 'flex'}`}
    >
      <Heart className="h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
    </motion.button>
  );

  useEffect(() => {
    registerElement('bottomRight', 'dashboard-heart', heartButton);
    return () => unregisterElement('bottomRight', 'dashboard-heart');
  }, [registerElement, unregisterElement, heartButton]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-foreground font-black text-lg animate-pulse">
          {(typeof t === 'function' ? t('dashboard.syncing') : null) || 'جاري المزامنة...'}
        </p>
      </div>
    );
  }

  const isDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const hasBottomPlayerRoute =
    location.pathname.startsWith('/dashboard/recite') ||
    location.pathname.startsWith('/dashboard/listen');

  return (
    <div className="relative w-full h-full" style={{ isolation: 'isolate' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={sharedProps.itemVariants}
          transition={{ duration: 0.25 }}
          className="w-full h-full"
        >
          {isDashboardRoot ? <Home {...sharedProps} /> : <Outlet context={sharedProps} />}
        </motion.div>
      </AnimatePresence>

      <HeartMessage isOpen={isHeartOpen} onClose={() => setIsHeartOpen(false)} />
      <MindMapModal isOpen={isMindMapOpen} onClose={() => setIsMindMapOpen(false)} pageNumber={progress?.currentPage} />
    </div>
  );
};

export default Dashboard;

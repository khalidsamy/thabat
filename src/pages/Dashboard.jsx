import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useLocation, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart, Flame, CalendarCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QURAN_VERSES } from '../utils/verses';
import { getUserRank } from '../utils/rankManager';
import confetti from 'canvas-confetti';
import HeartMessage from '../components/HeartMessage';
import BottomNav from '../components/BottomNav';
import MindMapModal from '../components/MindMapModal';

// Sub-pages (Adaptive)
import Home from './dashboard/Home';
import Progress from './dashboard/Progress';
import Recite from './dashboard/Recite';
import Community from './dashboard/Community';
import Review from './dashboard/Review';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user: authUser } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  
  // Shared State (Reactive & Live)
  const [progress, setProgress] = useState(null);
  const [user, setUser] = useState(authUser || {});
  const [isLoading, setIsLoading] = useState(true);
  
  // Sync the local user state with AuthContext (Live Updates)
  useEffect(() => {
    if (authUser) setUser(authUser);
  }, [authUser]);
  const [error, setError] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [hasNotifiedToday, setHasNotifiedToday] = useState(false);
  const [isHeartOpen, setIsHeartOpen] = useState(false);
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [pagesInput, setPagesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingSunnah, setIsTogglingSunnah] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await api.get('/progress');
      if (response.data.success) {
        setProgress(response.data.progress);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      setError(t('dashboard.fetch_error'));
    }
  }, [t]);

  // Combined Initial Data Fetch (Performance Optimization)
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 🚀 Parallel execution to minimize TTI (Time to Interactive)
      const [progressRes, userRes] = await Promise.all([
        api.get('/progress'),
        api.get('/user/profile')
      ]);
      
      if (progressRes.data.success) setProgress(progressRes.data.progress);
      
      // Definitively set the user state from the fresh profile data
      const userData = userRes.data.data || userRes.data.user;
      if (userRes.data.success && userData) {
        setUser(userData);
      }
      
      // Random Daily Verse
      const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      setDailyVerse(QURAN_VERSES[randomIndex]);
      
      // Browser background notifications check
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch (err) {
      console.error('Initial load failed:', err);
      // Fallback: If auth exists, don't crash, just show an error toast
      if (authUser) {
          setUser(authUser);
          showError(t('dashboard.fetch_error') || 'Sync failed. Using cached profile.');
      } else {
          setError(t('dashboard.fetch_error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [t, authUser, showError]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const fireConfetti = () => {
    const end = Date.now() + (1.5 * 1000);
    const colors = ['#10B981', '#F59E0B', '#FFFFFF'];
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();
    const pages = Number(pagesInput);
    if (!pagesInput || isNaN(pages) || pages <= 0) {
      showError(t('dashboard.invalid_input'));
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.post('/progress/update', { pages });
      if (response.data.success) {
        setPagesInput('');
        showSuccess(t('dashboard.success_update', { count: pages }));
        fireConfetti();
        await fetchProgress();
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSunnahToggle = async () => {
    setIsTogglingSunnah(true);
    try {
      const response = await api.put('/progress/toggle-sunnah');
      if (response.data.success) {
        if (response.data.sunnahCompletedToday) showSuccess('ما شاء الله! تقبل الله منك.');
        await fetchProgress();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsTogglingSunnah(false);
    }
  };

  const shareProgress = async () => {
    // Definitive rank check
    const rank = getUserRank(progress?.totalMemorized || 0);
    const text = i18n.language === 'ar' 
      ? `الحمد لله! حققت لقب "${t(`ranks.${rank.id}`)}" في تطبيق ثبات (Thabat). استمراريتي: ${progress?.streak || 0} أيام. 📖✨`
      : `Alhamdullilah! I achieved the rank "${t(`ranks.${rank.id}`)}" in Thabat. My streak: ${progress?.streak || 0} days. 📖✨`;
    
    if (navigator.share) {
      try { await navigator.share({ title: t('dashboard.share'), text, url: window.location.origin }); }
      catch (err) { console.error('Share failed:', err); }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showSuccess(t('dashboard.copy_success') || 'Link copied to clipboard!');
      } catch (err) {
        showError('Could not copy link.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="relative mb-8">
            <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} 
               transition={{ duration: 4, repeat: Infinity }}
               className="w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl absolute -inset-4" 
            />
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin relative" />
        </div>
        <p className="text-foreground font-black text-xl tracking-tight animate-pulse uppercase">
            {t('dashboard.syncing') || 'Stabilizing Thabat...'}
        </p>
        <p className="text-secondary-foreground text-sm font-medium mt-2 opacity-50">
            {t('dashboard.loading_subtitle') || 'Synchronizing your spiritual journey'}
        </p>
      </div>
    );
  }


  const reviewPace = user?.reviewPace || 10;
  const totalMemorized = progress?.totalMemorized || 0;
  const oldPortion = Math.max(totalMemorized - 20, 0);
  const oldDailyTarget = Math.ceil(oldPortion / reviewPace);
  const newDailyTarget = Math.ceil(Math.min(totalMemorized, 20) / 3);

  const sharedProps = {
    progress, 
    user,
    dailyVerse, 
    refreshKey, 
    oldDailyTarget, 
    newDailyTarget, 
    reviewPace,
    pagesInput, 
    setPagesInput, 
    handleUpdateSubmit, 
    isUpdating,
    handleSunnahToggle, 
    isTogglingSunnah, 
    handleVoiceComplete: (score, surah) => {
        // Record 1 page of progress for a successful recitation session
        setPagesInput('1');
        handleUpdateSubmit();
        
        // Background sync for mastery analytics
        api.post('/progress/mastery', { score, surah }).catch(console.error);
        if (score > 90) showSuccess(t('voice.perfect_match') || 'Perfect recitation! Recorded.');
    },
    refreshData: loadInitialData,
    onVisualize: () => setIsMindMapOpen(true),
    itemVariants: { 
        hidden: { opacity: 0, y: 20 }, 
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },
    planLabels: { 7: 'المثالي (7 أيام)', 10: 'المتوسط (10 أيام)', 14: 'الحد الأدنى (14 يوماً)' }
  };

  const isDashboardRoot = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="dashboard-main relative w-full h-full">
        {/* Unified Responsive Content Area */}
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={sharedProps.itemVariants}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
            >
                {isDashboardRoot ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* Main Stream: Left Column (Home / Primary Tools) */}
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            <Home {...sharedProps} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <Recite {...sharedProps} />
                                <Progress {...sharedProps} />
                            </div>
                        </div>

                        {/* Sidebar Stream: Right Column (Support Tools) */}
                        <div className="lg:col-span-4 flex flex-col gap-10">
                            <div className="order-2 lg:order-1">
                                <Review {...sharedProps} />
                            </div>
                            <div className="order-1 lg:order-2">
                                <Community {...sharedProps} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        <Outlet context={sharedProps} />
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

        {/* Floating Heart FAB - Professionally Integrated */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsHeartOpen(true)}
          className="fixed bottom-8 sm:bottom-10 right-8 sm:right-10 z-[100] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center justify-center group border-2 border-white/20 active:scale-95 transition-all"
        >
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-amber-300 rounded-3xl" />
          <Heart className="relative h-6 w-6 sm:h-7 sm:w-7 text-white fill-white group-hover:scale-110 transition-transform" />
        </motion.button>

        <HeartMessage isOpen={isHeartOpen} onClose={() => setIsHeartOpen(false)} />
        
        <MindMapModal 
          isOpen={isMindMapOpen} 
          onClose={() => setIsMindMapOpen(false)} 
          pageNumber={progress?.currentPage}
        />
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart, Flame, CalendarCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QURAN_VERSES } from '../utils/verses';
import { getUserRank } from '../utils/rankManager';
import confetti from 'canvas-confetti';
import HeartMessage from '../components/HeartMessage';

// Tabs
import HomeTab from '../components/tabs/HomeTab';
import ProgressTab from '../components/tabs/ProgressTab';
import ReciteTab from '../components/tabs/ReciteTab';
import ReviewTab from '../components/tabs/ReviewTab';
import CommunityTab from '../components/tabs/CommunityTab';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  
  // Shared State
  const [progress, setProgress] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [hasNotifiedToday, setHasNotifiedToday] = useState(false);
  const [isHeartOpen, setIsHeartOpen] = useState(false);
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

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [progressRes, userRes] = await Promise.all([
          api.get('/progress'),
          api.get('/user/profile')
        ]);
        
        if (progressRes.data.success) setProgress(progressRes.data.progress);
        if (userRes.data.success) setCurrentUser(userRes.data.user);
        
        const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
        setDailyVerse(QURAN_VERSES[randomIndex]);
        
        if ("Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission();
        }
      } catch (err) {
        console.error('Initial load failed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [fetchProgress]);

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
    const rank = getUserRank(progress?.totalMemorized || 0);
    const text = i18n.language === 'ar' 
      ? `الحمد لله! حققت لقب "${t(`ranks.${rank.id}`)}" في تطبيق ثبات (Thabat). استمراريتي: ${progress?.streak} أيام. 📖✨`
      : `Alhamdullilah! I achieved the rank "${t(`ranks.${rank.id}`)}" in Thabat. My streak: ${progress?.streak} days. 📖✨`;
    
    if (navigator.share) {
      try { await navigator.share({ title: t('dashboard.share'), text, url: window.location.origin }); }
      catch (err) { console.error('Share failed:', err); }
    } else {
      navigator.clipboard.writeText(text);
      showSuccess(t('dashboard.success_update', { count: 0 }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
        <p className="text-secondary-foreground font-medium animate-pulse">{t('dashboard.loading')}</p>
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
    user: currentUser,
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
    handleVoiceComplete: () => handleUpdateSubmit(),
    itemVariants: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
    planLabels: { 7: 'المثالي (7 أيام)', 10: 'المتوسط (10 أيام)', 14: 'الحد الأدنى (14 يوماً)' }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Universal Header (Simplified on Mobile) */}
      <header className="bg-card dark:bg-card/50 border-b border-gray-100 dark:border-white/5 shadow-sm sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {t('auth.welcome_back', { name: user?.name || '' })}
              </h1>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-white/10 flex items-center gap-2 ${getUserRank(progress?.totalMemorized || 0).bgColor} ${getUserRank(progress?.totalMemorized || 0).color}`}>
                <span className="text-sm">{getUserRank(progress?.totalMemorized || 0).icon}</span>
                {t(`ranks.${getUserRank(progress?.totalMemorized || 0).id}`)}
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/10">
                <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{progress?.streak || 0} {t('dashboard.days')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/10">
                <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{sharedProps.planLabels[reviewPace]}</span>
              </div>
            </div>
            <button onClick={shareProgress} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all outline-none border border-white/10">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Responsive Grid for Desktop */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
                <HomeTab {...sharedProps} />
                <div className="grid grid-cols-2 gap-8">
                    <ReciteTab {...sharedProps} />
                    <ProgressTab {...sharedProps} />
                </div>
            </div>
            <div className="col-span-1 space-y-8">
                <ReviewTab {...sharedProps} />
            </div>
        </div>

        {/* Tabbed View for Mobile */}
        <div className="lg:hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Routes location={location}>
                        <Route path="/" element={<HomeTab {...sharedProps} />} />
                        <Route path="/progress" element={<ProgressTab {...sharedProps} />} />
                        <Route path="/recite" element={<ReciteTab {...sharedProps} />} />
                        <Route path="/review" element={<ReviewTab {...sharedProps} />} />
                        <Route path="/community" element={<CommunityTab {...sharedProps} />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Floating Heart FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsHeartOpen(true)}
          className="fixed bottom-24 lg:bottom-12 right-8 z-40 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-2xl flex items-center justify-center group border-2 border-white/20"
        >
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-amber-400 rounded-full" />
          <Heart className="relative h-7 w-7 text-white fill-white group-hover:scale-110" />
        </motion.button>

        <HeartMessage isOpen={isHeartOpen} onClose={() => setIsHeartOpen(false)} />
      </main>
    </div>
  );
};

export default Dashboard;

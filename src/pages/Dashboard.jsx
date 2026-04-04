import React, { useState, useEffect, useContext, useCallback } from 'react';
import { BookOpen, TrendingUp, Flame, CalendarCheck, Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';
import Achievements from '../components/Achievements';
import Leaderboard from '../components/Leaderboard';
import Input from '../components/Input';
import Button from '../components/Button';
import SpiritualCarousel from '../components/SpiritualCarousel';
import HifzStreaks from '../components/HifzStreaks';
import HifzProgress from '../components/HifzProgress';
import AchievementBadges from '../components/AchievementBadges';
import { QURAN_VERSES } from '../utils/verses';
import { motion } from 'framer-motion';
import { getDailyTasks } from '../utils/PlanManager';
import { getUserRank } from '../utils/rankManager';
import RecoveryCard from '../components/RecoveryCard';
import VoiceRecitation from '../components/VoiceRecitation';
import HeartMessage from '../components/HeartMessage';
import confetti from 'canvas-confetti';
import { queueOfflineAction } from '../services/offlineSync';
import { Share2, Heart } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  
  // View State
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [hasNotifiedToday, setHasNotifiedToday] = useState(false);
  const [isHeartOpen, setIsHeartOpen] = useState(false);

  // Update State
  const [pagesInput, setPagesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTogglingSunnah, setIsTogglingSunnah] = useState(false);
  
  // Chart Update Trigger State
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
  }, []);

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchProgress();
      // Pick a random verse
      const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      setDailyVerse(QURAN_VERSES[randomIndex]);
      
      // Request Notification Permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchProgress]);

  // Proactive Notifications Check (5:00 PM)
  useEffect(() => {
    const checkNotification = () => {
      const now = new Date();
      const hours = now.getHours();
      
      if (hours >= 17 && !progress?.completedToday && !hasNotifiedToday && Notification.permission === "granted") {
        new Notification(t('dashboard.streak_saved'), {
          body: t('dashboard.streak_saved_msg'),
          icon: "/ThabatLogo.png"
        });
        setHasNotifiedToday(true);
      }
    };

    const timer = setInterval(checkNotification, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [progress?.completedToday, hasNotifiedToday]);

  const fireConfetti = () => {
    const end = Date.now() + (1.5 * 1000);
    const colors = ['#10B981', '#F59E0B', '#FFFFFF'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const pages = Number(pagesInput);

    // Front-end Validation guard
    if (!pagesInput || isNaN(pages) || pages <= 0) {
      showError(t('dashboard.invalid_input'));
      return;
    }

    setIsUpdating(true);

    try {
      const response = await api.post('/progress/update', { pages });
      if (response.data.success) {
        setPagesInput('');
        
        const successMessage = t('dashboard.success_update', { count: pages });
          
        showSuccess(successMessage);
        fireConfetti();

        // Streak Saved Logic
        if (hasNotifiedToday) {
           new Notification(t('dashboard.streak_saved'), {
             body: t('dashboard.streak_saved_msg'),
             icon: "/ThabatLogo.png"
           });
        }
        
        // Silently re-fetch progress data in background to refresh all stat cards
        await fetchProgress();
        
        // Trigger the child Chart component to re-fetch its graph axis dynamically!
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
        if (response.data.sunnahCompletedToday) {
          showSuccess('ما شاء الله! تقبل الله منك.');
        }
        await fetchProgress();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsTogglingSunnah(false);
    }
  };

  const shareProgress = async () => {
    const rank = getUserRank(progress?.totalMemorized);
    const text = i18n.language === 'ar' 
      ? `الحمد لله! حققت لقب "${t(`ranks.${rank.id}`)}" في تطبيق ثبات (Thabat) لحفظ القرآن الكريم. استمراريتي: ${progress?.streak} أيام. انضم إلينا! 📖✨`
      : `Alhamdullilah! I achieved the rank "${t(`ranks.${rank.id}`)}" in Thabat App. My streak: ${progress?.streak} days. Join us! 📖✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('dashboard.share'),
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      showSuccess(t('dashboard.success_update', { count: 0 })); // Reuse for copy feedback
    }
  };

  const handleVoiceComplete = async (transcript) => {
      // Simplified: Just log progress for now. In reality, we'd verify the verse.
      handleUpdateSubmit({ preventDefault: () => {} });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-secondary-foreground font-medium animate-pulse">{t('dashboard.loading')}</p>
      </div>
    );
  }

  // Calculate review targets based on portioning
  const reviewPace = user?.reviewPace || 10;
  const totalMemorized = progress?.totalMemorized || 0;
  
  // Last 20 pages are treated as 'new progress' with intensive review
  const newPortion = Math.min(totalMemorized, 20);
  const oldPortion = Math.max(totalMemorized - 20, 0);
  
  const oldDailyTarget = Math.ceil(oldPortion / reviewPace);
  const newDailyTarget = Math.ceil(newPortion / 3);

  const planLabels = {
    7: 'المثالي (7 أيام)',
    10: 'المتوسط (10 أيام)',
    14: 'الحد الأدنى (14 يوماً)'
  };

  return (
    <div className="min-h-screen bg-background pb-12 transition-colors duration-300">
      {/* Structural Header */}
      <header className="bg-card dark:bg-card/50 border-b border-gray-100 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                {t('auth.welcome_back', { name: user?.name || '' })}
                </h1>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-white/10 flex items-center gap-2 ${
                    getUserRank(progress?.totalMemorized || 0).bgColor
                } ${getUserRank(progress?.totalMemorized || 0).color}`}>
                    <span className="text-sm">{getUserRank(progress?.totalMemorized || 0).icon}</span>
                    {t(`ranks.${getUserRank(progress?.totalMemorized || 0).id}`)}
                </div>
            </div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1 opacity-90">
              {t('dashboard.quote')}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full border border-emerald-500/10 scale-110 md:scale-100 origin-left">
              <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {progress?.streak || 0} {t('dashboard.days')} {t('dashboard.active_streak')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 dark:bg-blue-500/10 rounded-full border border-blue-500/10 shadow-sm shadow-blue-500/5">
              <CalendarCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {planLabels[reviewPace]}
              </span>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareProgress}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all border border-white/10"
          >
            <Share2 className="h-4 w-4" />
            <span>{t('dashboard.share')}</span>
          </motion.button>
        </div>
      </header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Recovery Mode (Broken Streak) */}
        {progress?.streak === 0 && (
          <motion.div variants={itemVariants}>
            <RecoveryCard onStartSmall={() => {
              const el = document.getElementById('pages');
              el?.focus();
              el?.scrollIntoView({ behavior: 'smooth' });
            }} />
          </motion.div>
        )}

        {/* Daily Motivation Verse */}
        {dailyVerse && (
          <motion.section 
            variants={itemVariants}
            className="mb-8"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shrink-0 shadow-xl shadow-black/20">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <p className="text-2xl md:text-3xl font-bold text-white mb-3" dir="rtl">
                    {dailyVerse.arabic}
                  </p>
                  <p className="text-xs font-black text-emerald-100/60 uppercase tracking-widest mb-2" dir="rtl">
                    — {dailyVerse.reference}
                  </p>
                  <p className="text-sm md:text-base font-medium text-white/80 italic leading-relaxed max-w-2xl md:ml-auto">
                    {dailyVerse.english}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <motion.div variants={itemVariants}>
          <SpiritualCarousel />
        </motion.div>
        
        {/* Foundation: Progress Visualizers */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              الخطة والهدف (Consistency & Journey)
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HifzStreaks 
                streak={progress?.streak} 
                isCompletedToday={progress?.completedToday} 
                wasActiveYesterday={progress?.streak > 0 || (progress?.lastEntryDate && new Date(progress.lastEntryDate).toDateString() === new Date(Date.now() - 86400000).toDateString())}
              />
            </div>
            <div className="lg:col-span-1">
              <HifzProgress current={progress?.totalMemorized} total={604} label={t('dashboard.overall_mastery')} />
            </div>
          </div>
        </motion.section>

        {/* Alaa Hamed's Thabat Schedule */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {t('dashboard.stabilization_tasks')}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent ms-4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(getDailyTasks(progress?.totalMemorized || 0, progress?.currentPage || 1) || []).map((task) => (
              <div key={task.id} className="bg-card dark:bg-card/50 border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-colors group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    {task.id === 'new_hifz' ? <BookOpen className="h-5 w-5" /> : task.id === 'intensive_review' ? <Flame className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{t(`tasks.${task.id}`)}</h4>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">{task.pages} {t('dashboard.pages')}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{task.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Achievement Badges Milestone Section */}
        <motion.section variants={itemVariants} className="mb-10">
          <AchievementBadges pages={progress?.totalMemorized || 0} />
        </motion.section>

        {/* Statistics Grid */}
        <motion.section variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t('dashboard.hifz_stats')}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent ms-4"></div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard 
              title={t('dashboard.current_page')}
              value={progress?.currentPage || 1} 
              icon={<BookOpen className="h-6 w-6" />}
              subtitle={t('dashboard.out_of')}
            />
            <StatCard 
              title={t('dashboard.total_memorized')}
              value={progress?.totalMemorized || 0} 
              icon={<TrendingUp className="h-6 w-6" />}
              subtitle={t('dashboard.pages_committed')}
            />
            <StatCard 
              title={t('dashboard.active_streak')} 
              value={`${progress?.streak || 0} ${t('dashboard.days')}`} 
              icon={<Flame className="h-6 w-6" />}
              subtitle={t('dashboard.keep_momentum')}
            />
            <StatCard 
              title={t('dashboard.distant_review_card')}
              value={`${oldDailyTarget} ${t('dashboard.pages')}`} 
              icon={<CalendarCheck className="h-6 w-6 text-sky-500" />}
              subtitle={t('dashboard.days_system', { days: reviewPace })}
              className="border-sky-500/20 dark:border-sky-500/10"
            />
            <StatCard 
              title={t('dashboard.intensive_review_card')}
              value={`${newDailyTarget} ${t('dashboard.pages')}`} 
              icon={<Flame className="h-6 w-6 text-emerald-500" />}
              subtitle={t('dashboard.intensive_system')}
              className="border-emerald-500/40 dark:border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
            />
          </div>
        </motion.section>

        {/* Daily Habit Tracker */}
        <motion.section variants={itemVariants} className="mb-10">
          <div 
            className={`relative overflow-hidden group p-6 rounded-2xl border-2 transition-all duration-500 backdrop-blur-md ${
              progress?.sunnahCompletedToday 
                ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.1)]' 
                : 'bg-white/80 dark:bg-slate-800/80 border-gray-100 dark:border-slate-700 shadow-lg shadow-black/5'
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full transition-all duration-500 ${
              progress?.sunnahCompletedToday ? 'bg-emerald-500/10' : 'bg-blue-500/5'
            }`}></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${
                  progress?.sunnahCompletedToday 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                }`}>
                  <Sparkles className={`h-7 w-7 ${progress?.sunnahCompletedToday ? 'animate-pulse' : ''}`} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-bold text-foreground">
                    {t('dashboard.sunnah_question')}
                  </h3>
                  <p className="text-sm text-secondary-foreground mt-1 opacity-80">
                    {t('dashboard.sunnah_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSunnahToggle}
                disabled={isTogglingSunnah}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                  progress?.sunnahCompletedToday
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 ring-4 ring-amber-500/10'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                } ${isTogglingSunnah ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {progress?.sunnahCompletedToday ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    {t('dashboard.sunnah_done')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t('dashboard.sunnah_log')}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Scalable Layout Scaffolding */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Area: Update Progress */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-card rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex-1">
              <h3 className="text-lg font-medium text-foreground mb-1">{t('dashboard.update_progress')}</h3>
              <p className="text-sm text-secondary-foreground mb-6">{t('dashboard.update_subtitle')}</p>

              <form onSubmit={handleUpdateSubmit} className="max-w-md space-y-4">
                {/* 24-hour stabilization rule tip */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                    <span className="font-bold underline decoration-amber-500/50">{t('dashboard.golden_rule')}</span> {t('dashboard.golden_rule_msg')}
                  </p>
                </div>

                <Input
                  label={t('dashboard.number_of_pages')}
                  id="pages"
                  name="pages"
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder={t('dashboard.placeholder_pages')}
                  value={pagesInput}
                  onChange={(e) => {
                    setPagesInput(e.target.value);
                  }}
                  disabled={isUpdating}
                />
                <Button type="submit" isLoading={isUpdating}>
                  {isUpdating ? t('dashboard.saving') : t('dashboard.save_progress')}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col min-h-[300px] gap-8">
            <VoiceRecitation onComplete={handleVoiceComplete} />
            <ProgressChart refreshTrigger={refreshKey} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 flex flex-col min-h-[300px]">
            <Achievements refreshTrigger={refreshKey} />
          </div>
          <div className="lg:col-span-1 flex flex-col min-h-[300px]">
            <Leaderboard />
          </div>
        </motion.div>

        {/* Floating Action Button (Message to Your Heart) */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsHeartOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center group border-2 border-white/20"
        >
          {/* Breathing Pulse Animation */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-amber-400 rounded-full"
          />
          <Heart className="relative h-7 w-7 text-white fill-white group-hover:scale-110 transition-transform" />
        </motion.button>

        {/* Soulful Heart Modal */}
        <HeartMessage isOpen={isHeartOpen} onClose={() => setIsHeartOpen(false)} />

      </motion.main>
    </div>
  );
};

export default Dashboard;

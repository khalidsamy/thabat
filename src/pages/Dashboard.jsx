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

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  
  // View State
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchProgress]);

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
        
        const successMessage = "تم الحفظ مبدئياً. موعد التسميع غداً إن شاء الله!";
          
        showSuccess(successMessage);
        
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
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
              {t('auth.welcome_back', { name: user?.name || '' })}
            </h1>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1 opacity-90">
              {t('dashboard.quote')}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full border border-emerald-500/10">
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SpiritualCarousel />
        
        {/* Statistics Grid */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t('dashboard.current_journey')}
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
              title="ورد المراجعة (القديم)"
              value={`${oldDailyTarget} صفحة`} 
              icon={<CalendarCheck className="h-6 w-6 text-sky-500" />}
              subtitle={`نظام الـ ${reviewPace} أيام`}
              className="border-sky-500/20 dark:border-sky-500/10"
            />
            <StatCard 
              title="ورد التثبيت (الجديد)"
              value={`${newDailyTarget} صفحة`} 
              icon={<Flame className="h-6 w-6 text-emerald-500" />}
              subtitle="نظام الـ 3 أيام (مكثف)"
              className="border-emerald-500/40 dark:border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
            />
          </div>
        </section>

        {/* Daily Habit Tracker */}
        <section className="mb-10">
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
                    هل قرأت ورد التثبيت الجديد في صلوات النوافل اليوم؟
                  </h3>
                  <p className="text-sm text-secondary-foreground mt-1 opacity-80">
                    Reciting your new review in Sunnah/Nawafil prayers is the ultimate stabilization technique.
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
                    تم التثبيت في النوافل
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    سجّل الإتمام الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Scalable Layout Scaffolding */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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
                    <span className="font-bold underline decoration-amber-500/50">قاعدة ذهبية:</span> لا تُسمّع ما حفظته اليوم لشيخك! اختبر نفسك كل 8 ساعات، وسمّعه غداً لضمان ثباته في الذاكرة طويلة المدى.
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

          <div className="lg:col-span-2 flex flex-col min-h-[300px]">
            <ProgressChart refreshTrigger={refreshKey} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 flex flex-col min-h-[300px]">
            <Achievements refreshTrigger={refreshKey} />
          </div>
          <div className="lg:col-span-1 flex flex-col min-h-[300px]">
            <Leaderboard />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Mic, Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VoiceRecitation from '../../components/VoiceRecitation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MindMapModal from '../../components/MindMapModal';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const Recite = (props) => {
  const { t } = useTranslation();
  const context = useOutletContext() || {};
  const { progress, user, pagesInput, setPagesInput, handleUpdateSubmit, isUpdating, handleSunnahToggle, isTogglingSunnah, handleVoiceComplete, itemVariants } = { 
    progress: {}, 
    user: {}, 
    ...context, 
    ...props 
  };
  const { showSuccess, showError } = useToast();
  const [targetInput, setTargetInput] = useState(user?.currentTargetSurah || '');
  const [isChangingTarget, setIsChangingTarget] = useState(false);
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);

  // Sync target input if user profile loads late
  React.useEffect(() => {
    if (user?.currentTargetSurah && !isChangingTarget) {
      setTargetInput(user.currentTargetSurah);
    }
  }, [user?.currentTargetSurah, isChangingTarget]);

  const onTargetSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch('/user/profile', { currentTargetSurah: targetInput });
      if (res.data.success) {
        setIsChangingTarget(false);
        showSuccess(t('dashboard.target_updated') || 'Target Surah updated!');
        if (props.refreshData) props.refreshData();
      }
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <motion.section variants={itemVariants} className="space-y-12">
        {/* TOP COMPACT NAV: Target & Visualization */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-card/40 backdrop-blur-md p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 p-1 rounded-2xl shadow-sm">
                {!isChangingTarget ? (
                    <div className="flex items-center gap-3 px-4 py-2">
                        <span className="text-sm font-bold text-foreground">Target: {user?.currentTargetSurah} 🎯</span>
                        <button 
                            onClick={() => setIsChangingTarget(true)}
                            className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 underline"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <form onSubmit={onTargetSubmit} className="flex items-center gap-2">
                        <input 
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold focus:ring-0 w-32 px-4"
                            autoFocus
                        />
                        <button type="submit" className="p-2 bg-emerald-500 text-white rounded-xl">
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                    </form>
                )}
            </div>

            <button 
                onClick={() => setIsMindMapOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 border border-white/10 w-full sm:w-auto justify-center"
            >
                <span>Visualize Surah 🧠</span>
            </button>
        </div>
        
        {/* HERO: Voice Recitation - The Star Action */}
        <div className="py-8 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
           <VoiceRecitation onComplete={handleVoiceComplete} />
        </div>

        {/* SECONDARY: Manual Logging & Habit Check */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Manual Progress Box */}
           <div className="bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-xl shadow-black/5 flex flex-col group">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform">
                   <Mic className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-0.5">{t('dashboard.update_progress')}</h3>
                    <p className="text-xs text-secondary-foreground opacity-60 tracking-wider uppercase font-bold">{t('dashboard.update_subtitle')}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 p-6 rounded-3xl flex items-start gap-4">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-amber-800/80 dark:text-amber-200/80 leading-relaxed italic">
                    {t('dashboard.golden_rule_msg')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('dashboard.number_of_pages')}
                    id="pages"
                    name="pages"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="0"
                    value={pagesInput}
                    onChange={(e) => setPagesInput(e.target.value)}
                    disabled={isUpdating}
                    className="bg-slate-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-white/5 h-16 text-xl font-black rounded-2xl text-center"
                  />
                  <div className="mt-7">
                    <Button type="submit" isLoading={isUpdating} className="h-16 text-lg shadow-emerald-500/20 rounded-2xl font-black">
                      {isUpdating ? t('dashboard.saving') : t('dashboard.save_progress')}
                    </Button>
                  </div>
                </div>
              </form>
           </div>

           {/* Habit Check (Sunnah) */}
           <div className={`relative overflow-hidden group p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col justify-center ${
              progress?.sunnahCompletedToday 
                ? 'bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.05)]' 
                : 'bg-white/50 dark:bg-slate-800/30 border-gray-100 dark:border-white/5 shadow-lg shadow-black/5'
            }`}>
              <div className="relative flex flex-col items-center text-center gap-6">
                  <div className={`p-6 rounded-[2rem] transition-all duration-500 ${
                    progress?.sunnahCompletedToday 
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 rotate-6' 
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                  }`}>
                    <Sparkles className={`h-10 w-10 ${progress?.sunnahCompletedToday ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      {t('dashboard.sunnah_question')}
                    </h3>
                    <p className="text-sm text-secondary-foreground opacity-60 font-medium max-w-sm mx-auto leading-relaxed">
                      {t('dashboard.sunnah_desc')}
                    </p>
                  </div>

                <button
                  onClick={handleSunnahToggle}
                  disabled={isTogglingSunnah}
                  className={`flex items-center justify-center gap-3 px-12 py-5 rounded-2xl font-black transition-all duration-300 shadow-xl w-full sm:w-auto ${
                    progress?.sunnahCompletedToday
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-8 ring-amber-500/5'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  } ${isTogglingSunnah ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                >
                  {progress?.sunnahCompletedToday ? (
                    <>
                      <CheckCircle2 className="h-6 w-6" />
                      {t('dashboard.sunnah_done')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      {t('dashboard.sunnah_log')}
                    </>
                  )}
                </button>
              </div>
           </div>
        </div>
      </motion.section>
      
      <MindMapModal 
          isOpen={isMindMapOpen} 
          onClose={() => setIsMindMapOpen(false)} 
          pageNumber={progress?.currentPage}
      />
    </div>
  );
};

export default Recite;

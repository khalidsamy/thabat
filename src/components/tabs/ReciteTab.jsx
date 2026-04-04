import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Mic, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Input from '../Input';
import Button from '../Button';
import VoiceRecitation from '../VoiceRecitation';
import { AuthContext } from '../../context/AuthContext';
import MindMapModal from '../MindMapModal';

const ReciteTab = ({ progress, user, pagesInput, setPagesInput, handleUpdateSubmit, isUpdating, handleSunnahToggle, isTogglingSunnah, handleVoiceComplete, itemVariants }) => {
  const { t } = useTranslation();
  const { updateUser } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [isChangingTarget, setIsChangingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(user?.currentTargetSurah || '');

  return (
    <div className="space-y-8 pb-32">
      <motion.section variants={itemVariants} className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button 
                onClick={() => setIsMindMapOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-black/20 border border-white/5"
            >
                <span>Visualize Current Surah 🧠</span>
            </button>
            
            <div className="flex items-center gap-2 bg-card/40 border border-white/5 p-1 rounded-2xl shadow-sm backdrop-blur-md">
                {!isChangingTarget ? (
                    <div className="flex items-center gap-3 px-4 py-2">
                        <span className="text-sm font-bold text-foreground">Target: {user?.currentTargetSurah} 🎯</span>
                        <button 
                            onClick={() => setIsChangingTarget(true)}
                            className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 underline"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await api.patch('/user/profile', { currentTargetSurah: targetInput });
                                if (res.data.success) {
                                    updateUser({ currentTargetSurah: targetInput });
                                    setIsChangingTarget(false);
                                    showSuccess('Target Surah updated!');
                                }
                            } catch (err) {
                                showError(err.message);
                            }
                        }}
                        className="flex items-center gap-2 bg-slate-900 rounded-xl px-2"
                    >
                        <input 
                            value={targetInput}
                            onChange={(e) => setTargetInput(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold focus:ring-0 w-32 px-2 text-foreground"
                            autoFocus
                        />
                        <button type="submit" className="p-2 bg-emerald-500 text-white rounded-xl">
                            <CheckCircle2 className="h-4 w-4" />
                        </button>
                    </form>
                )}
            </div>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <VoiceRecitation onComplete={handleVoiceComplete} />
        </div>

        <div className="bg-card/40 rounded-[2rem] border border-white/5 p-8 shadow-2xl shadow-black/5 flex-1 max-w-2xl mx-auto w-full backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
               <Mic className="h-6 w-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-foreground mb-0.5">{t('dashboard.update_progress')}</h3>
                <p className="text-sm text-slate-500 opacity-70">{t('dashboard.update_subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="bg-amber-900/20 border border-amber-700/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm transition-all hover:shadow-md">
              <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-200 leading-relaxed">
                <span className="font-bold underline decoration-amber-500/50 block mb-1">{t('dashboard.golden_rule')}</span> 
                {t('dashboard.golden_rule_msg')}
              </p>
            </div>

            <div className="space-y-4">
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
                onChange={(e) => setPagesInput(e.target.value)}
                disabled={isUpdating}
                className="bg-slate-900 border-none h-14 text-lg font-bold text-foreground"
              />
              <Button type="submit" isLoading={isUpdating} className="h-14 text-lg shadow-emerald-950/20 bg-emerald-500 hover:bg-emerald-600 text-white">
                {isUpdating ? t('dashboard.saving') : t('dashboard.save_progress')}
              </Button>
            </div>
          </form>
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <div 
            className={`relative overflow-hidden group p-8 rounded-[2rem] border-2 transition-all duration-500 backdrop-blur-md ${
              progress?.sunnahCompletedToday 
                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.1)]' 
                : 'bg-slate-800/80 border-slate-700 shadow-lg shadow-black/5'
            }`}
          >
            <div className="relative flex flex-col items-center text-center gap-6">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${
                  progress?.sunnahCompletedToday 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-blue-900/40 text-blue-400'
                }`}>
                  <Sparkles className={`h-8 w-8 ${progress?.sunnahCompletedToday ? 'animate-pulse' : ''}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {t('dashboard.sunnah_question')}
                  </h3>
                  <p className="text-sm text-slate-500 opacity-80 max-w-sm mx-auto">
                    {t('dashboard.sunnah_desc')}
                  </p>
                </div>

              <button
                onClick={handleSunnahToggle}
                disabled={isTogglingSunnah}
                className={`flex items-center gap-3 px-10 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg w-full sm:w-auto ${
                  progress?.sunnahCompletedToday
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 ring-4 ring-amber-500/10'
                    : 'bg-white text-zinc-950 hover:bg-slate-100'
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

export default ReciteTab;

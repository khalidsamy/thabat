import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Target, BookOpen, Flame, Compass, Sparkles, Trophy } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from './Button';

const SetupWizard = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    hifzStatus: { juzCount: null, surahs: [] },
    currentGoal: null,
    dailyCapacity: { pages: 1, lines: 0 },
    revisionIntensity: 'HIZB'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps && isStepValid()) setStep(s => s + 1);
    else if (step === totalSteps && isStepValid()) handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const setJuzCount = (val) => {
    setFormData(d => ({ 
      ...d, 
      hifzStatus: { 
        ...(d.hifzStatus || { surahs: [] }), 
        juzCount: val 
      } 
    }));
  };

  const setCurrentGoal = (id) => {
    setFormData(d => ({ ...d, currentGoal: id }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.patch('/user/profile', {
        ...formData,
        setupCompleted: true
      });
      if (res.data.success) {
        showSuccess('Your hifz journey is ready! Bismillah.');
        if (typeof onComplete === 'function') onComplete(res.data.user);
      }
    } catch (err) {
      showError(err.message || 'Failed to complete setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.hifzStatus?.juzCount !== null;
    if (step === 2) return formData.currentGoal !== null;
    if (step === 3) return formData.dailyCapacity?.pages > 0 && formData.revisionIntensity;
    return true; // Step 4 is a summary
  };

  const renderProgress = () => (
    <div className="flex gap-2 mb-10">
      {[...Array(totalSteps)].map((_, i) => (
        <div 
          key={i} 
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i + 1 <= step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/10'
          }`} 
        />
      ))}
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        layout
        className="glass-card w-full max-w-xl rounded-[2.5rem] p-6 sm:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        {renderProgress()}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Compass className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Where are you on your journey?</h2>
                <p className="text-sm text-slate-400">Tell us how much of the Holy Quran you have currently memorized.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Beginner', desc: '0-2 Juz memorized', val: 0 },
                  { label: 'Intermediate', desc: '5+ Juz memorized', val: 5 },
                  { label: 'Advanced', desc: '15+ Juz memorized', val: 15 },
                  { label: 'Hafiz', desc: 'Full Quran (30 Juz)', val: 30 }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setJuzCount(opt.val)}
                    className={`text-left p-6 rounded-3xl border-2 transition-all active:scale-[0.98] ${
                      formData.hifzStatus?.juzCount === opt.val 
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-black text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Target className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">What is your current focus?</h2>
                <p className="text-sm text-slate-400">Choose your primary goal for this season.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'MEMORIZING_NEW', label: 'Memorizing New', desc: 'Continue moving forward with new Surahs.', Icon: Flame },
                  { id: 'REVIEWING_OLD', label: 'Perfecting Revision', desc: 'Focus specifically on stabilizing past hifz.', Icon: BookOpen }
                ].map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentGoal(id)}
                    className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left ${
                      formData.currentGoal === id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${formData.currentGoal === id ? 'text-emerald-500' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-black text-white">{label}</p>
                      <p className="text-sm text-slate-500">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants} 
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">Define your capacity.</h2>
                <p className="text-sm text-slate-400">Be honest with yourself to ensure consistency.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Daily New Memorization</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setFormData(d => ({ ...d, dailyCapacity: { ...d.dailyCapacity, pages: n } }))}
                        className={`flex-1 p-5 rounded-2xl border-2 transition-all ${
                          formData.dailyCapacity.pages === n 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                            : 'border-white/5 bg-white/5 text-slate-400'
                        }`}
                      >
                        <span className="font-black text-xl">{n}</span>
                        <span className="block text-[9px] uppercase tracking-tighter mt-1">Pages</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Revision Intensity (الورد)</p>
                  <select 
                    value={formData.revisionIntensity}
                    onChange={(e) => setFormData(d => ({ ...d, revisionIntensity: e.target.value }))}
                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-white font-bold outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="HIZB">1 Hizb / Day (Balanced)</option>
                    <option value="1_JUZ">1 Juz / Day (Strong)</option>
                    <option value="2_JUZ">2 Juz / Day (Intensive)</option>
                    <option value="RUB_EL_HIZB">1 Rub' / Day (Light)</option>
                    <option value="NONE">No Revision Plan (Not Recommended)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" 
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants} 
              className="space-y-8 text-center"
            >
              <div className="space-y-3">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Trophy className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Commitment is key.</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  "The most beloved actions to Allah are those performed consistently, even if they are few."
                </p>
              </div>

              <div className="surface-inset p-8 rounded-[2rem] text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-6">Your Initial Plan</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-medium">Starting with {formData.hifzStatus.juzCount} Juz memorized.</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-medium">{formData.currentGoal === 'MEMORIZING_NEW' ? 'New Memorization focus.' : 'Stabilization focus.'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-medium">{formData.dailyCapacity.pages} Pages per day + {formData.revisionIntensity} revision.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isSubmitting || !isStepValid()}
            className={`flex-[2] py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${isSubmitting || !isStepValid() ? 'opacity-40 grayscale-[0.5] pointer-events-none' : 'hover:bg-emerald-600'}`}
          >
            {isSubmitting ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {step === totalSteps ? 'Finalize' : 'Confirm'}
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupWizard;

import React, { useState } from 'react';
import { motion, AnimatePresence } from ' AnimatePresence'; 
import { Check, ChevronRight, Target, BookOpen, Flame, Compass, Sparkles, Trophy, ListRestart, ArrowDown01, ArrowUp10 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from './Button';

/**
 * Multi-step onboarding wizard for new Quran students.
 * Captures hifz status, preferred direction (Mashriq vs Maghrib logic), and intensity.
 * Persists profile completion to trigger the main dashboard experience.
 */
const SetupWizard = ({ user, onComplete }) => {
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    hifzStatus: { juzCount: null, surahs: [] },
    hifzDirection: 'START_FROM_BEGINNING', // Standard forward path
    currentGoal: null,
    dailyCapacity: { pages: 1, lines: 0 },
    revisionIntensity: 'HIZB'
  });

  const totalSteps = 5;

  // --- NAVIGATION ---
  const handleNext = () => {
    if (step < totalSteps && isStepValid()) setStep(s => s + 1);
    else if (step === totalSteps && isStepValid()) handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  // --- LOGIC ---
  const setJuzCount = (val) => {
    setFormData(d => ({ 
      ...d, 
      hifzStatus: { 
        ...(d.hifzStatus || { surahs: [] }), 
        juzCount: val 
      } 
    }));
  };

  const setHifzDirection = (dir) => {
    setFormData(d => ({ ...d, hifzDirection: dir }));
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
        showSuccess('رحلتك في حفظ القرآن جاهزة! بسم الله.');
        if (typeof onComplete === 'function') onComplete(res.data.user);
      }
    } catch (err) {
      showError(err.message || 'فشل في إكمال الإعداد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return formData.hifzStatus?.juzCount !== null;
      case 2: return formData.hifzDirection !== null;
      case 3: return formData.currentGoal !== null;
      case 4: return formData.dailyCapacity?.pages > 0 && formData.revisionIntensity;
      default: return true;
    }
  };

  // --- RENDER HELPERS ---
  const renderProgress = () => (
    <div className="flex gap-2 mb-10" dir="rtl">
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4" dir="rtl">
      <motion.div 
        layout
        className="glass-card w-full max-w-xl rounded-[2.5rem] p-6 sm:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -ml-32 -mt-32" />
        
        {renderProgress()}

        <AnimatePresence mode="wait">
          {/* Step 1: Hifz Assessment */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Compass className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">ما هو مقدار حفظك الحالي؟</h2>
                <p className="text-sm text-slate-400 font-medium">أخبرنا بمدى إنجازك في حفظ القرآن الكريم حتى نتمكن من بناء خطتك.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'مبتدئ', desc: '0-2 جزء', val: 0 },
                  { label: 'متوسط', desc: '5+ أجزاء', val: 5 },
                  { label: 'متقدم', desc: '15+ جزءاً', val: 15 },
                  { label: 'خاتم (حافظ)', desc: 'القرآن كاملاً (30 جزء)', val: 30 }
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setJuzCount(opt.val)}
                    className={`text-right p-6 rounded-3xl border-2 transition-all active:scale-[0.98] ${
                      formData?.hifzStatus?.juzCount === opt.val 
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-black text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Hifz Path Selection */}
          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <ListRestart className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">ما هو مسار حفظك المفضل؟</h2>
                <p className="text-sm text-slate-400 font-medium">حدد الاتجاه الذي تتبعه في حفظك الجديد.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'START_FROM_BEGINNING', label: 'من البداية (الفاتحة/البقرة)', desc: 'الحفظ بالترتيب التقليدي للمصحف.', Icon: ArrowDown01 },
                  { id: 'START_FROM_END', label: 'من النهاية (جزء عم)', desc: 'الحفظ من قصار السور صعوداً.', Icon: ArrowUp10 }
                ].map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setHifzDirection(id)}
                    className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-right ${
                      formData?.hifzDirection === id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${formData?.hifzDirection === id ? 'text-emerald-500' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-black text-white">{label}</p>
                      <p className="text-sm text-slate-500 font-medium">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Performance Focus */}
          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Target className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">ما هو هدفك الأساسي؟</h2>
                <p className="text-sm text-slate-400 font-medium">اختر التركيز الرئيسي لجدولك في هذه المرحلة.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'MEMORIZING_NEW', label: 'حفظ جديد', desc: 'التركيز على إضافة سور وآيات جديدة لذاكرتك.', Icon: Flame },
                  { id: 'REVIEWING_OLD', label: 'تثبيت المراجعة', desc: 'التركيز المكثف على تقوية المحفوظ السابق.', Icon: BookOpen }
                ].map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentGoal(id)}
                    className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-right ${
                      formData?.currentGoal === id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${formData?.currentGoal === id ? 'text-emerald-500' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-black text-white">{label}</p>
                      <p className="text-sm text-slate-500 font-medium">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Revision Intensity */}
          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Flame className="h-8 w-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">حدد وتيرة إنجازك</h2>
                <p className="text-sm text-slate-400 font-medium">ما هو مقدار الورد الذي يمكنك الالتزام به يومياً في (المراجعة)؟</p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-1">شدة المراجعة (الورد اليومي)</p>
                  <select 
                    value={formData?.revisionIntensity || 'HIZB'}
                    onChange={(e) => setFormData(d => ({ ...d, revisionIntensity: e.target.value }))}
                    className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-white font-bold outline-none focus:border-emerald-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="HIZB" className="bg-slate-900">1 حزب / يوم (متوازن)</option>
                    <option value="1_JUZ" className="bg-slate-900">1 جزء / يوم (قوي)</option>
                    <option value="2_JUZ" className="bg-slate-900">2 جزء / يوم (مكثف)</option>
                    <option value="RUB_EL_HIZB" className="bg-slate-900">1 ربع / يوم (خفيف)</option>
                    <option value="NONE" className="bg-slate-900">لا يوجد خطة مراجعة (غير مستحسن)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Final Confirmation */}
          {step === 5 && (
            <motion.div 
              key="step5" 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-3">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Trophy className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">الاستمرارية سر النجاح</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  "أحب الأعمال إلى الله أدومها وإن قل."
                </p>
              </div>

              <div className="surface-inset p-8 rounded-[2rem] text-right border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 mb-6">ملخص خطتك الأولية</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-bold">المحفوظ الحالي: {formData?.hifzStatus?.juzCount || 0} جزء.</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-bold">المسار: {formData?.hifzDirection === 'START_FROM_BEGINNING' ? 'من البداية' : 'من جزء عم'}.</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-white font-bold">التركيز: {formData?.currentGoal === 'MEMORIZING_NEW' ? 'حفظ جديد' : 'تثبيت المراجعة'}.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={handleNext}
            disabled={isSubmitting || !isStepValid()}
            className={`flex-[2] py-5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${isSubmitting || !isStepValid() ? 'opacity-40 grayscale-[0.5] pointer-events-none' : 'hover:bg-emerald-600'}`}
          >
            {isSubmitting ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {step === totalSteps ? 'إبداء الرحلة' : 'تأكيد'}
                <ChevronRight className={`h-5 w-5 ${step === totalSteps ? 'hidden' : ''} -scale-x-100`} />
              </>
            )}
          </button>
          
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              رجوع
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SetupWizard;

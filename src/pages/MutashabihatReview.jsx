import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Sparkles, Eye, EyeOff, GitMerge, RotateCcw, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// ── Mastery interval table (matches backend exactly) ──────────────────────
const MASTERY_LABELS    = ['Confusing', 'Uncertain', 'Shaky', 'Usually Good', 'Confident', 'Mastered'];

// ── All-done screen ───────────────────────────────────────────────────────
const AllDoneScreen = ({ reviewed }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-teal-900/50 border-2 border-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-950/50">
        <Sparkles className="h-12 w-12 text-teal-400" />
      </div>
      <h2 className="text-3xl font-extrabold text-white mb-2">أحسنت! 🌟</h2>
      <p className="text-teal-400 text-lg font-bold mb-2">
        All Mutashabihat reviewed for today!
      </p>
      <p className="text-slate-400 mb-2">
        You reviewed <strong className="text-white">{reviewed}</strong> group{reviewed !== 1 ? 's' : ''} — each session brings you closer to certainty.
      </p>
      <p className="text-sm text-teal-400/80 italic mb-8" dir="rtl">
        «وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ»
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard/mutashabihat"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 border border-white/5 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Back to المتشابهات
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all shadow-lg shadow-teal-900/20"
        >
          <BookOpen className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// ── Nothing-due screen ────────────────────────────────────────────────────
const NothingDueScreen = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-teal-900/40 border-2 border-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <GitMerge className="h-10 w-10 text-teal-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-white mb-2">All caught up!</h2>
      <p className="text-slate-400 mb-6">No Mutashabihat are due for review today. Come back tomorrow or log new groups.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard/mutashabihat"
          className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all shadow-teal-900/20"
        >
          Go to المتشابهات Log
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-slate-800 border border-white/5 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// ── Main Review Session ───────────────────────────────────────────────────
const MutashabihatReview = () => {
  const { showError } = useToast();

  const [queue, setQueue]               = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewed, setReviewed]         = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [slideOut, setSlideOut]         = useState(false);
  const slideTimerRef = useRef(null);

  const fetchDue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/mutashabihat/due');
      if (res.data.success) setQueue(res.data.mutashabihat);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchDue(); }, [fetchDue]);
  useEffect(() => () => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
    }
  }, []);

  const handleReview = async (rating) => {
    const current = queue[currentIndex];
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/mutashabihat/${current._id}/review`, { rating });
      setReviewed((prev) => prev + 1);

      setSlideOut(true);
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
      slideTimerRef.current = setTimeout(() => {
        setSlideOut(false);
        setHintRevealed(false);
        if (currentIndex + 1 >= queue.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setIsSubmitting(false);
        slideTimerRef.current = null;
      }, 350);
    } catch (err) {
      showError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (sessionComplete) return <AllDoneScreen reviewed={reviewed} />;
  if (queue.length === 0) return <NothingDueScreen />;

  const current = queue[currentIndex];
  const level   = current.srs.masteryLevel;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/50">
            Reviewing {currentIndex + 1} of {queue.length}
          </span>
          <span className="text-sm font-bold text-teal-400">
            Mastery: {MASTERY_LABELS[level]}
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div
        className={`w-full max-w-2xl relative z-10 transition-all duration-350 ${
          slideOut ? 'opacity-0 scale-95 -translate-y-3' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-black/80 overflow-hidden border border-white/5 backdrop-blur-md">

          {/* Card header */}
          <div className="bg-teal-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitMerge className="h-5 w-5 text-teal-200" />
              <div>
                <p className="text-teal-100/70 text-sm font-black uppercase tracking-tighter">Mutashabih Group</p>
                <p className="text-white font-extrabold text-lg">
                  {current.verses.length} Similar Verses
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-teal-200/50 text-[10px] font-black uppercase">Reviews: {current.srs.totalReviews}</p>
              <p className="text-teal-200/50 text-[10px] font-black uppercase">Level {level}/5</p>
            </div>
          </div>

          {/* Verses display */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
              Can you distinguish these?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {current.verses.map((v, i) => (
                <div
                  key={i}
                  className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 transition-all hover:border-teal-500/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal-400">
                      {v.surahName}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-white/5">
                      Ayah {v.ayahNumber}
                    </span>
                  </div>
                  {v.ayahText ? (
                    <p
                      className="text-lg font-quran font-bold text-white leading-loose text-right"
                      dir="rtl"
                    >
                      {v.ayahText}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 italic text-center py-2">
                      Refer to your mushaf.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hint section — hidden until revealed */}
          <div className="px-6 py-4 border-b border-white/5">
            <button
              type="button"
              onClick={() => setHintRevealed((prev) => !prev)}
              className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest hover:text-amber-300 transition-colors"
            >
              {hintRevealed ? (
                <><EyeOff className="h-4 w-4" /> Hide Hint</>
              ) : (
                <><Eye className="h-4 w-4" /> إظهار العلامة الذهنية — Reveal Hint</>
              )}
            </button>

            {hintRevealed && (
              <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Global mnemonic */}
                {current.customMnemonic && (
                  <div className="flex items-start gap-3 bg-amber-950/20 rounded-xl px-4 py-3 border border-amber-800/30">
                    <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase mb-1">العلامة الذهنية</p>
                      <p className="text-sm text-amber-100/80">{current.customMnemonic}</p>
                    </div>
                  </div>
                )}

                {/* Per-verse distinction notes */}
                {current.verses.some((v) => v.distinctionNote) && (
                  <div className="space-y-2">
                    {current.verses.map((v, i) =>
                      v.distinctionNote ? (
                        <div
                          key={i}
                          className="bg-slate-800/50 rounded-lg px-3 py-2 border border-white/5 text-sm"
                        >
                          <span className="font-bold text-teal-400 me-2 text-xs uppercase tracking-tighter">
                            {v.surahName}:{v.ayahNumber} →
                          </span>
                          <span className="text-slate-300 italic">{v.distinctionNote}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3-way action buttons */}
          <div className="px-6 py-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleReview(-1)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-5 px-2 bg-rose-950/20 hover:bg-rose-950/30 border-2 border-rose-900 text-rose-400 font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <span className="text-2xl">🔴</span>
              <span className="text-[10px] uppercase font-black text-rose-400 text-center leading-tight">
                Confused
              </span>
              <span className="text-[9px] text-rose-500/50 font-bold uppercase" dir="rtl">أخطأت</span>
            </button>

            <button
              onClick={() => handleReview(0)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-5 px-2 bg-amber-950/20 hover:bg-amber-950/30 border-2 border-amber-900 text-amber-400 font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <span className="text-2xl">🟡</span>
              <span className="text-[10px] uppercase font-black text-amber-400 text-center leading-tight">
                Unsure
              </span>
              <span className="text-[9px] text-amber-500/50 font-bold uppercase" dir="rtl">متردد</span>
            </button>

            <button
              onClick={() => handleReview(1)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-5 px-2 bg-emerald-950/20 hover:bg-emerald-950/30 border-2 border-emerald-900 text-emerald-400 font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <span className="text-2xl">🟢</span>
              <span className="text-[10px] uppercase font-black text-emerald-400 text-center leading-tight">
                Mastered
              </span>
              <span className="text-[9px] text-emerald-500/50 font-bold uppercase" dir="rtl">أتقنت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutashabihatReview;

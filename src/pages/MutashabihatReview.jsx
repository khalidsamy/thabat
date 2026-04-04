import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, Eye, EyeOff, GitMerge, RotateCcw, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// ── Mastery interval table (matches backend exactly) ──────────────────────
const MASTERY_INTERVALS = { 0: 1, 1: 2, 2: 4, 3: 7, 4: 14, 5: 30 };
const MASTERY_LABELS    = ['Confusing', 'Uncertain', 'Shaky', 'Usually Good', 'Confident', 'Mastered'];

// ── All-done screen ───────────────────────────────────────────────────────
const AllDoneScreen = ({ reviewed }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-teal-900/50 border-2 border-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-900/50">
        <Sparkles className="h-12 w-12 text-teal-400" />
      </div>
      <h2 className="text-3xl font-extrabold text-white mb-2">أحسنت! 🌟</h2>
      <p className="text-teal-300 text-lg font-bold mb-2">
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
          to="/mutashabihat"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Back to المتشابهات
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold hover:from-teal-500 hover:to-teal-400 transition-all shadow-lg"
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
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-teal-900/40 border-2 border-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <GitMerge className="h-10 w-10 text-teal-400" />
      </div>
      <h2 className="text-2xl font-extrabold text-white mb-2">All caught up!</h2>
      <p className="text-slate-400 mb-6">No Mutashabihat are due for review today. Come back tomorrow or log new groups.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/mutashabihat"
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Go to المتشابهات Log
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-slate-700 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors"
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
  }, []);

  useEffect(() => { fetchDue(); }, [fetchDue]);

  const handleReview = async (rating) => {
    const current = queue[currentIndex];
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/mutashabihat/${current._id}/review`, { rating });
      setReviewed((prev) => prev + 1);

      // Animate out, then advance
      setSlideOut(true);
      setTimeout(() => {
        setSlideOut(false);
        setHintRevealed(false); // Reset hint reveal for next card
        if (currentIndex + 1 >= queue.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setIsSubmitting(false);
      }, 350);
    } catch (err) {
      showError(err.message);
      setIsSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (sessionComplete) return <AllDoneScreen reviewed={reviewed} />;
  if (queue.length === 0) return <NothingDueScreen />;

  const current = queue[currentIndex];
  const level   = current.srs.masteryLevel;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col items-center justify-center px-4 py-10">

      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/70">
            Reviewing {currentIndex + 1} of {queue.length}
          </span>
          <span className="text-sm font-bold text-teal-400">
            Mastery: {MASTERY_LABELS[level]}
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div
        className={`w-full max-w-2xl transition-all duration-350 ${
          slideOut ? 'opacity-0 scale-95 -translate-y-3' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">

          {/* Card header */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitMerge className="h-5 w-5 text-teal-200" />
              <div>
                <p className="text-teal-100 text-sm">Mutashabih Group</p>
                <p className="text-white font-extrabold">
                  {current.verses.length} Similar Verses
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-teal-200 text-xs">Reviews: {current.srs.totalReviews}</p>
              <p className="text-teal-200 text-xs">Level {level}/5</p>
            </div>
          </div>

          {/* Verses display */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs font-bold text-secondary-foreground uppercase tracking-widest mb-3">
              Can you distinguish these?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.verses.map((v, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-700 rounded-2xl p-4 border border-teal-100 dark:border-teal-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {v.surahName}
                    </span>
                    <span className="text-xs text-secondary-foreground bg-white dark:bg-slate-600 px-2 py-0.5 rounded-full">
                      Ayah {v.ayahNumber}
                    </span>
                  </div>
                  {v.ayahText ? (
                    <p
                      className="text-lg font-bold text-foreground leading-loose text-right"
                      dir="rtl"
                      style={{ fontFamily: "'Scheherazade New', serif" }}
                    >
                      {v.ayahText}
                    </p>
                  ) : (
                    <p className="text-sm text-secondary-foreground italic text-center py-2">
                      Refer to your mushaf.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hint section — hidden until revealed */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setHintRevealed((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
            >
              {hintRevealed ? (
                <><EyeOff className="h-4 w-4" /> Hide Hint</>
              ) : (
                <><Eye className="h-4 w-4" /> إظهار العلامة الذهنية — Reveal Hint</>
              )}
            </button>

            {hintRevealed && (
              <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Global mnemonic */}
                {current.customMnemonic && (
                  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-800">
                    <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">العلامة الذهنية</p>
                      <p className="text-sm text-amber-900 dark:text-amber-300">{current.customMnemonic}</p>
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
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 text-sm"
                        >
                          <span className="font-bold text-teal-600 dark:text-teal-400 me-1">
                            {v.surahName}:{v.ayahNumber} →
                          </span>
                          <span className="text-secondary-foreground italic">{v.distinctionNote}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                {!current.customMnemonic && !current.verses.some((v) => v.distinctionNote) && (
                  <p className="text-sm text-secondary-foreground italic text-center py-2">
                    No hints added for this group yet.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3-way action buttons */}
          <div className="px-6 py-5 grid grid-cols-3 gap-3">
            {/* -1: Still confused */}
            <button
              onClick={() => handleReview(-1)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border-2 border-red-200 dark:border-red-800 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 group"
            >
              <span className="text-2xl">🔴</span>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 text-center leading-tight">
                Still Confused
              </span>
              <span className="text-[10px] text-red-500/70 font-bold" dir="rtl">لا أزال أخطئ</span>
            </button>

            {/* 0: Unsure */}
            <button
              onClick={() => handleReview(0)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 group"
            >
              <span className="text-2xl">🟡</span>
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 text-center leading-tight">
                Unsure
              </span>
              <span className="text-[10px] text-yellow-600/70 font-bold" dir="rtl">متردد</span>
            </button>

            {/* +1: Distinguished */}
            <button
              onClick={() => handleReview(1)}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 group"
            >
              <span className="text-2xl">🟢</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center leading-tight">
                Distinguished!
              </span>
              <span className="text-[10px] text-emerald-600/70 font-bold" dir="rtl">عرفت الفرق</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutashabihatReview;

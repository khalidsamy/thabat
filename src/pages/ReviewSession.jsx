import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ErrorTypeBadge } from './ErrorLog';

// ── Celebration screen shown when queue is empty ──────────────────────────
const AllDoneScreen = ({ reviewed, onReturnHome }) => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40">
          <Sparkles className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
      <h2 className="text-3xl font-extrabold text-foreground mb-3">
        مبارك! 🎉
      </h2>
      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-2">
        All reviews complete for today!
      </p>
      <p className="text-secondary-foreground mb-2">
        You reviewed <strong className="text-foreground">{reviewed}</strong> error{reviewed !== 1 ? 's' : ''}. 
        Allah make it easy for you.
      </p>
      <p className="text-sm text-secondary-foreground italic mb-8">
        «مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ»
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/errors"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-foreground rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Back to Error Log
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-primary text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-md"
        >
          <BookOpen className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// ── Empty queue screen ─────────────────────────────────────────────────────
const NothingDueScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground mb-2">All caught up!</h2>
      <p className="text-secondary-foreground mb-6">
        You have no errors due for review today. Come back tomorrow, or log new errors now.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/errors"
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-primary text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Go to Error Log
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-foreground rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

// ── Main Review Session ───────────────────────────────────────────────────
const ReviewSession = () => {
  const { showError } = useToast();

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [slideOut, setSlideOut] = useState(false); // animation trigger

  const fetchDueErrors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/errors/due');
      if (res.data.success) {
        setQueue(res.data.errors);
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDueErrors(); }, [fetchDueErrors]);

  const handleReview = async (result) => {
    const current = queue[currentIndex];
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/errors/${current._id}/review`, { result });

      setReviewed((prev) => prev + 1);

      // Animate card out, then advance
      setSlideOut(true);
      setTimeout(() => {
        setSlideOut(false);
        if (currentIndex + 1 >= queue.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setIsSubmitting(false);
      }, 300);
    } catch (err) {
      showError(err.message);
      setIsSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  // ── Session complete ─────────────────────────────────────────
  if (sessionComplete) return <AllDoneScreen reviewed={reviewed} />;

  // ── Nothing due ──────────────────────────────────────────────
  if (queue.length === 0) return <NothingDueScreen />;

  const current = queue[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-center px-4 py-10">
      
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/70">
            Reviewing {currentIndex + 1} of {queue.length}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {Math.round(((currentIndex) / queue.length) * 100)}% done
          </span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div
        className={`w-full max-w-xl transition-all duration-300 ${
          slideOut ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Location Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-semibold">
                  {current.location.surahName}
                </p>
                <p className="text-white text-xl font-extrabold">
                  Ayah {current.location.ayahNumber}
                  {current.location.pageNumber && (
                    <span className="text-emerald-200 text-sm font-normal ms-2">
                      · Page {current.location.pageNumber}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-200 text-xs">Su. {current.location.surahNumber}</p>
                {current.location.juzNumber && (
                  <p className="text-emerald-200 text-xs">Juz {current.location.juzNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ayah Text */}
          <div className="px-6 py-6 border-b border-gray-100 dark:border-slate-700 bg-amber-50/30 dark:bg-amber-900/5">
            {current.ayahText ? (
              <p
                className="text-2xl font-quran font-bold text-foreground leading-loose text-center"
                dir="rtl"
              >
                {current.ayahText}
              </p>
            ) : (
              <p className="text-center text-secondary-foreground italic text-sm py-4">
                Ayah text not stored — refer to your mushaf.
              </p>
            )}
          </div>

          {/* Mistake Details */}
          <div className="px-6 py-4">
            <p className="text-xs font-bold text-secondary-foreground uppercase tracking-widest mb-3">
              Your Previous Mistake
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <ErrorTypeBadge value={current.errorType} lang="en" />
              <ErrorTypeBadge value={current.errorType} lang="ar" />
            </div>
            {current.note && (
              <p className="text-sm text-foreground mt-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2 border border-gray-100 dark:border-slate-600 italic">
                "{current.note}"
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs text-secondary-foreground opacity-70">
              <span>{current.srs.consecutiveCorrect}/{5} correct reviews</span>
              <span>·</span>
              <span>Total reviews: {current.srs.totalReviews}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleReview('wrong')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border-2 border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <XCircle className="h-8 w-8" />
              <span className="text-sm">Made a Mistake</span>
              <span className="text-xs font-normal opacity-70">نسيت / أخطأت</span>
            </button>

            <button
              onClick={() => handleReview('correct')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-sm">Remembered It!</span>
              <span className="text-xs font-normal opacity-70">حفظت وأجدت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;

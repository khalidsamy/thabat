import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ErrorTypeBadge } from './ErrorLog';

// ── Celebration screen shown when queue is empty ──────────────────────────
const AllDoneScreen = ({ reviewed }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
          <Sparkles className="h-12 w-12 text-emerald-500" />
        </div>
      </div>
      <h2 className="text-3xl font-extrabold text-foreground mb-3">
        مبارك! 🎉
      </h2>
      <p className="text-lg font-bold text-emerald-400 mb-2">
        All reviews complete for today!
      </p>
      <p className="text-slate-400 mb-2">
        You reviewed <strong className="text-foreground">{reviewed}</strong> error{reviewed !== 1 ? 's' : ''}. 
        Allah make it easy for you.
      </p>
      <p className="text-sm text-slate-500 italic mb-8">
        «مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ»
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/dashboard/errors"
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-white/5 text-foreground rounded-xl font-semibold hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Back to Error Log
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-md"
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
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground mb-2">All caught up!</h2>
      <p className="text-slate-400 mb-6">
        You have no errors due for review today. Come back tomorrow, or log new errors now.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard/errors"
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Go to Error Log
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 bg-slate-800 border border-white/5 text-foreground rounded-xl font-semibold hover:bg-slate-700 transition-colors"
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
  }, [showError]);

  useEffect(() => { fetchDueErrors(); }, [fetchDueErrors]);

  const handleReview = async (result) => {
    const current = queue[currentIndex];
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/errors/${current._id}/review`, { result });

      setReviewed((prev) => prev + 1);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (sessionComplete) return <AllDoneScreen reviewed={reviewed} />;
  if (queue.length === 0) return <NothingDueScreen />;

  const current = queue[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 py-10">
      
      {/* Progress Bar */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white/50">
            Reviewing {currentIndex + 1} of {queue.length}
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {Math.round(((currentIndex) / queue.length) * 100)}% done
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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
        <div className="bg-slate-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden border border-white/5">

          {/* Location Header */}
          <div className="bg-emerald-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100/70 text-sm font-semibold">
                  {current.location.surahName}
                </p>
                <p className="text-white text-xl font-extrabold">
                  Ayah {current.location.ayahNumber}
                  {current.location.pageNumber && (
                    <span className="text-emerald-200/60 text-sm font-normal ms-2">
                      · Page {current.location.pageNumber}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-emerald-200/50 text-[10px] font-black uppercase">Su. {current.location.surahNumber}</p>
                {current.location.juzNumber && (
                  <p className="text-emerald-200/50 text-[10px] font-black uppercase">Juz {current.location.juzNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ayah Text */}
          <div className="px-6 py-6 border-b border-white/5 bg-amber-950/10">
            {current.ayahText ? (
              <p
                className="text-2xl font-quran font-bold text-white leading-loose text-center"
                dir="rtl"
              >
                {current.ayahText}
              </p>
            ) : (
              <p className="text-center text-slate-500 italic text-sm py-4">
                Ayah text not stored — refer to your mushaf.
              </p>
            )}
          </div>

          {/* Mistake Details */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              Your Previous Mistake
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <ErrorTypeBadge value={current.errorType} lang="en" />
              <ErrorTypeBadge value={current.errorType} lang="ar" />
            </div>
            {current.note && (
              <p className="text-sm text-slate-300 mt-2 bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 italic">
                "{current.note}"
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
              <span>{current.srs.consecutiveCorrect}/{5} correct reviews</span>
              <span className="opacity-30">•</span>
              <span>Total reviews: {current.srs.totalReviews}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleReview('wrong')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-rose-900/20 hover:bg-rose-900/30 border-2 border-rose-900 text-rose-400 font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <XCircle className="h-8 w-8" />
              <span className="text-sm">Made a Mistake</span>
              <span className="text-[10px] font-normal opacity-70">نسيت / أخطأت</span>
            </button>

            <button
              onClick={() => handleReview('correct')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-1.5 py-4 px-4 bg-emerald-900/20 hover:bg-emerald-900/30 border-2 border-emerald-900 text-emerald-400 font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
            >
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-sm">Remembered It!</span>
              <span className="text-[10px] font-normal opacity-70">حفظت وأجدت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;

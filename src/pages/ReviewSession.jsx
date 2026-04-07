import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, Sparkles, BookOpen, RotateCcw, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ErrorTypeBadge from '../components/ErrorTypeBadge';

// ── Celebration screen ────────────────────────────────────────────────────
const AllDoneScreen = ({ reviewed }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-950/40">
        <Sparkles className="h-12 w-12 text-emerald-400" />
      </div>
      <h2 className="text-3xl font-black text-foreground mb-2">مبارك! 🎉</h2>
      <p className="text-lg font-bold text-emerald-400 mb-2">
        تمت مراجعة جميع الأخطاء لهذا اليوم
      </p>
      <p className="text-zinc-400 text-sm mb-2">
        راجعت <strong className="text-foreground">{reviewed}</strong> {reviewed === 1 ? 'خطأ' : 'أخطاء'}.
        بارك الله فيك.
      </p>
      <p className="text-sm text-zinc-600 italic mb-8">
        «مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ»
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/dashboard/errors"
          className="flex items-center gap-2 px-6 py-3 bg-card border border-white/5 text-foreground rounded-2xl font-bold hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          كراسة الأخطاء
        </Link>
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
        >
          <BookOpen className="h-4 w-4" />
          لوحة التحكم
        </Link>
      </div>
    </div>
  </div>
);

// ── Empty queue screen ────────────────────────────────────────────────────
const NothingDueScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
      </div>
      <h2 className="text-2xl font-black text-foreground mb-2">لا أخطاء مستحقة اليوم</h2>
      <p className="text-zinc-400 mb-6 text-sm">
        عودوا غداً، أو سجّلوا أخطاءً جديدة من جلسة التلاوة.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard/errors" className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-md hover:bg-emerald-600 transition-all">
          كراسة الأخطاء
        </Link>
        <Link to="/dashboard" className="px-6 py-3 bg-card border border-white/5 text-foreground rounded-2xl font-bold hover:bg-white/5 transition-colors">
          لوحة التحكم
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
  const [isSliding, setIsSliding] = useState(false);
  const slideTimerRef = useRef(null);

  const fetchDueErrors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/errors/due');
      // Backend already orders by nextReviewDate ASC — most overdue errors first,
      // which implements Sheikh Alaa Hamed's 7-day cumulative review priority.
      if (res.data.success) setQueue(res.data.errors);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchDueErrors(); }, [fetchDueErrors]);
  useEffect(() => () => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
    }
  }, []);

  const handleReview = async (result) => {
    const current = queue[currentIndex];
    if (!current || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.put(`/errors/${current._id}/review`, { result });
      setReviewed((n) => n + 1);
      setIsSliding(true);
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
      }
      slideTimerRef.current = setTimeout(() => {
        setIsSliding(false);
        if (currentIndex + 1 >= queue.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex((n) => n + 1);
        }
        setIsSubmitting(false);
        slideTimerRef.current = null;
      }, 280);
    } catch (err) {
      showError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (sessionComplete) return <AllDoneScreen reviewed={reviewed} />;
  if (queue.length === 0) return <NothingDueScreen />;

  const current = queue[currentIndex];
  const progress = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">

      {/* Sheikh Alaa Hamed methodology banner */}
      <div className="w-full max-w-xl mb-5 flex items-center gap-3 bg-amber-950/30 border border-amber-500/20 rounded-2xl px-4 py-3">
        <Flame className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-xs font-bold text-amber-300/70">
          المراجعة التراكمية — الأخطاء الأقدم موعداً تظهر أولاً (منهج الشيخ علاء حامد)
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xl mb-5">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-bold text-zinc-500">{currentIndex + 1} / {queue.length}</span>
          <span className="text-xs font-bold text-emerald-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-xl transition-all duration-280 ${
          isSliding ? 'opacity-0 scale-95 -translate-y-1' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        <div className="bg-card border border-white/5 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Location header */}
          <div className="bg-emerald-900/60 px-6 py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300/60 text-xs font-black uppercase tracking-widest">
                  {current.location.surahName}
                </p>
                <p className="text-white text-xl font-black mt-0.5">
                  آية {current.location.ayahNumber}
                  {current.location.pageNumber && (
                    <span className="text-emerald-200/40 text-sm font-normal ms-2">
                      · ص {current.location.pageNumber}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                {current.location.juzNumber && (
                  <p className="text-emerald-200/40 text-[10px] font-black uppercase">
                    جزء {current.location.juzNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ayah text */}
          <div className="px-6 py-6 border-b border-white/5 bg-amber-950/10 min-h-[96px] flex items-center justify-center">
            {current.ayahText ? (
              <p className="font-quran text-3xl text-white text-center leading-loose" dir="rtl">
                {current.ayahText}
              </p>
            ) : (
              <p className="text-center text-zinc-600 text-sm italic">
                النص غير مخزون — راجع مصحفك
              </p>
            )}
          </div>

          {/* Mistake details */}
          <div className="px-6 py-5">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">
              الخطأ السابق
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <ErrorTypeBadge value={current.errorType} lang="ar" />
              <ErrorTypeBadge value={current.errorType} lang="en" />
            </div>
            {current.note && (
              <p className="text-sm text-zinc-400 mt-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 italic">
                "{current.note}"
              </p>
            )}
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-3">
              {current.srs.consecutiveCorrect}/5 مستوى الإتقان · {current.srs.totalReviews} مراجعة إجمالية
            </p>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleReview('wrong')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-2 py-5 bg-rose-950/30 hover:bg-rose-950/50 border-2 border-rose-900/60 text-rose-400 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-40"
            >
              <XCircle className="h-7 w-7" />
              <span className="text-sm">أخطأت</span>
              <span className="text-[10px] font-normal opacity-60">نسيت / أخطأت</span>
            </button>

            <button
              onClick={() => handleReview('correct')}
              disabled={isSubmitting}
              className="flex flex-col items-center justify-center gap-2 py-5 bg-emerald-950/30 hover:bg-emerald-950/50 border-2 border-emerald-900/60 text-emerald-400 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-40"
            >
              <CheckCircle2 className="h-7 w-7" />
              <span className="text-sm">أجدت!</span>
              <span className="text-[10px] font-normal opacity-60">حفظت وأتقنت</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSession;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, BookMarked, Clock, Loader2, Trash2, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { fetchAyahText as fetchAyahPreview, isAbortedRequest } from '../services/quranApi';

// ── Error type config ─────────────────────────────────────────────────────
const ERROR_TYPES = [
  { value: 'wrong_word',       label: 'Wrong Word',        labelAr: 'كلمة خاطئة',      color: 'bg-red-900/40 text-red-300' },
  { value: 'tashkeel',         label: 'Tashkeel (Vowels)', labelAr: 'تشكيل خاطئ',      color: 'bg-orange-900/40 text-orange-300' },
  { value: 'tajweed',          label: 'Tajweed Rule',      labelAr: 'حكم تجويد',        color: 'bg-purple-900/40 text-purple-300' },
  { value: 'added_word',       label: 'Added Word',        labelAr: 'زيادة كلمة',       color: 'bg-yellow-900/40 text-yellow-300' },
  { value: 'skipped_word',     label: 'Skipped Word',      labelAr: 'حذف كلمة',         color: 'bg-pink-900/40 text-pink-300' },
  { value: 'nasya',            label: 'Forgot (Nasya)',    labelAr: 'نسيان',             color: 'bg-gray-700/60 text-gray-300' },
  { value: 'wrong_transition', label: 'Wrong Transition',  labelAr: 'انتقال خاطئ',     color: 'bg-blue-900/40 text-blue-300' },
  { value: 'mutashabih',       label: 'Mutashabih',        labelAr: 'متشابه',            color: 'bg-teal-900/40 text-teal-300' },
  { value: 'other',            label: 'Other',             labelAr: 'أخرى',              color: 'bg-slate-700/60 text-slate-300' },
];

export const getErrorTypeMeta = (value) =>
  ERROR_TYPES.find((t) => t.value === value) || ERROR_TYPES[ERROR_TYPES.length - 1];

// ── Helpers ───────────────────────────────────────────────────────────────
const formatDueDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return { label: 'Due now', urgent: true };
  if (diffDays === 1) return { label: 'Due tomorrow', urgent: false };
  return { label: `Due in ${diffDays} days`, urgent: false };
};

// ── Quran API fetch ───────────────────────────────────────────────────────
const _fetchAyahText = async (surahNumber, ayahNumber) => {
  try {
    const res = await fetch(
      `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`
    );
    const data = await res.json();
    if (data.code === 200) {
      return {
        text: data.data.text,
        surahName: data.data.surah.name,
        surahEnglishName: data.data.surah.englishName,
      };
    }
  } catch (_) {/* silently fail — user can still log without ayahText */}
  return null;
};

// ── Error Badge ───────────────────────────────────────────────────────────
const ErrorTypeBadge = ({ value, lang }) => {
  const meta = getErrorTypeMeta(value);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
      {lang === 'ar' ? meta.labelAr : meta.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const ErrorLog = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { showSuccess, showError } = useToast();

  const [errors, setErrors] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingAyah, setIsFetchingAyah] = useState(false);

  // Form state
  const [form, setForm] = useState({
    surahNumber: '',
    ayahNumber: '',
    juzNumber: '',
    pageNumber: '',
    errorType: 'other',
    note: '',
  });
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const previewAbortRef = useRef(null);
  const previewTimerRef = useRef(null);

  // ── Fetch active errors ───────────────────────────────────────
  const fetchErrors = useCallback(async () => {
    try {
      const res = await api.get('/errors');
      if (res.data.success) setErrors(res.data.errors);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoadingList(false);
    }
  }, [showError]);

  useEffect(() => { fetchErrors(); }, [fetchErrors]);

  // ── Auto-fetch ayah text when surah + ayah are filled ────────
  useEffect(() => {
    const surah = Number.parseInt(form.surahNumber, 10);
    const ayah = Number.parseInt(form.ayahNumber, 10);

    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }

    previewAbortRef.current?.abort();

    if (!(surah >= 1 && surah <= 114 && ayah >= 1)) {
      setResolvedLocation(null);
      setIsFetchingAyah(false);
      return undefined;
    }

    const controller = new AbortController();
    previewAbortRef.current = controller;
    previewTimerRef.current = setTimeout(async () => {
      setIsFetchingAyah(true);

      try {
        const result = await fetchAyahPreview(surah, ayah, { signal: controller.signal });
        if (previewAbortRef.current === controller) {
          setResolvedLocation(result);
        }
      } catch (error) {
        if (!isAbortedRequest(error) && previewAbortRef.current === controller) {
          setResolvedLocation(null);
        }
      } finally {
        if (previewAbortRef.current === controller) {
          previewAbortRef.current = null;
        }
        setIsFetchingAyah(false);
      }
    }, 400);

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      controller.abort();
      if (previewAbortRef.current === controller) {
        previewAbortRef.current = null;
      }
    };
  }, [form.surahNumber, form.ayahNumber]);

  useEffect(() => () => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
    previewAbortRef.current?.abort();
  }, []);

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const surahNumber = parseInt(form.surahNumber);
    const ayahNumber = parseInt(form.ayahNumber);

    if (!surahNumber || !ayahNumber) {
      showError('Please enter a valid Surah and Ayah number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        location: {
          surahNumber,
          surahName: resolvedLocation?.surahName || `Surah ${surahNumber}`,
          ayahNumber,
          ...(form.pageNumber && { pageNumber: parseInt(form.pageNumber) }),
          ...(form.juzNumber && { juzNumber: parseInt(form.juzNumber) }),
        },
        errorType: form.errorType,
        note: form.note.trim(),
        ayahText: resolvedLocation?.text || '',
      };

      const res = await api.post('/errors', payload);
      if (res.data.success) {
        showSuccess('Error logged successfully!');
        setForm({ surahNumber: '', ayahNumber: '', juzNumber: '', pageNumber: '', errorType: 'other', note: '' });
        setResolvedLocation(null);
        await fetchErrors();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this error record permanently?')) return;
    try {
      await api.delete(`/errors/${id}`);
      showSuccess('Error deleted.');
      setErrors((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3.5 bg-rose-900/30 rounded-2xl shadow-sm">
              <BookMarked className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight leading-none mb-1">
                كراسة الأخطاء
              </h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hifz Error Log — cure your mistakes</p>
            </div>
          </div>
        </div>

        {/* ── LOG NEW ERROR FORM ──────────────────────────────── */}
        <div className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/20 mb-10 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-5 border-b border-white/5 bg-rose-900/10">
            <PlusCircle className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-black text-foreground uppercase tracking-wider">Log a New Error</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
              {[
                { name: 'surahNumber', label: 'Surah #', placeholder: '1–114', required: true },
                { name: 'ayahNumber', label: 'Ayah #', placeholder: 'e.g., 5', required: true },
                { name: 'pageNumber', label: 'Page #', placeholder: '1–604' },
                { name: 'juzNumber', label: 'Juz #', placeholder: '1–30' },
              ].map(({ name, label, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest px-1">
                    {label}{required && <span className="text-rose-500 ms-1">*</span>}
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                    placeholder={placeholder}
                    className="w-full h-14 px-4 bg-slate-900/50 border border-white/5 rounded-2xl font-bold text-foreground focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
                  />
                </div>
              ))}
            </div>

            {(isFetchingAyah || resolvedLocation) && (
              <div className="mb-6 p-6 bg-emerald-900/20 rounded-2xl border border-white/5 min-h-[80px] flex items-center shadow-inner">
                {isFetchingAyah ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                ) : (
                  <div className="w-full">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2">
                      {resolvedLocation.surahName} — Ayah {form.ayahNumber}
                    </p>
                    <p className="text-2xl font-quran font-black text-emerald-200 leading-relaxed text-right" dir="rtl">
                      {resolvedLocation.text}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest px-1">
                  Error Type <span className="text-rose-500 ms-1">*</span>
                </label>
                <select
                  name="errorType"
                  value={form.errorType}
                  onChange={handleFormChange}
                  className="w-full h-14 px-4 bg-slate-900/50 border border-white/5 rounded-2xl font-bold text-foreground focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none appearance-none"
                >
                  {ERROR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {isAr ? t.labelAr : t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest px-1">
                  Your Note
                </label>
                <input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleFormChange}
                  placeholder="e.g., said فَـ instead of وَ"
                  className="w-full h-14 px-4 bg-slate-900/50 border border-white/5 rounded-2xl font-bold text-foreground focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none"
                />
              </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="h-16 px-10 bg-white text-zinc-950 rounded-3xl font-black shadow-xl shadow-black/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{isSubmitting ? 'Logging...' : 'Log This Error'}</span>
            </button>
          </form>
        </div>

        {/* ── ACTIVE ERRORS LIST ──────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Active Errors</h2>
            {errors.length > 0 && (
                <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg shadow-rose-500/20">
                    {errors.length} Sessions
                </span>
            )}
          </div>

          {isLoadingList ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-24 bg-card/40 rounded-3xl border border-dashed border-white/10 shadow-sm">
              <BookOpen className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <p className="text-foreground font-black text-lg">No active errors logged yet.</p>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">Use the system above to log your first mistake — it's the first step to curing it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {errors.map((err) => {
                const due = formatDueDate(err.srs.nextReviewDate);
                return (
                  <div
                    key={err._id}
                    className="bg-slate-800/80 rounded-3xl border border-white/5 shadow-xl shadow-black/20 p-6 flex flex-col sm:flex-row sm:items-start gap-6 hover:shadow-2xl transition-all group"
                  >
                    {/* Left: Location Badge */}
                    <div className="flex-shrink-0 bg-slate-900 border border-white/5 rounded-2xl p-4 text-center min-w-[80px] shadow-sm">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                        {err.location.surahName}
                      </p>
                      <p className="text-3xl font-black text-white">
                        {err.location.ayahNumber}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Ayah</p>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0">
                      {err.ayahText && (
                        <p className="text-2xl font-quran font-black text-foreground leading-relaxed mb-4 text-right" dir="rtl">
                          {err.ayahText}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <ErrorTypeBadge value={err.errorType} lang={i18n.language} />
                        {err.note && (
                          <span className="text-sm font-bold text-slate-500 italic px-2 border-s-2 border-white/5">"{err.note}"</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-6">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${due.urgent ? 'text-rose-500' : 'text-slate-500'}`}>
                          <Clock className="h-4 w-4" />
                          {due.label}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {err.srs.consecutiveCorrect}/{5} Mastery Level
                        </span>
                      </div>
                    </div>

                    {/* Right: Delete */}
                    <button
                      onClick={() => handleDelete(err._id)}
                      className="flex-shrink-0 p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-900/20 rounded-2xl transition-all"
                      title="Delete error"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorLog;
export { ERROR_TYPES, ErrorTypeBadge };

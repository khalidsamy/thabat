import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusCircle, BookMarked, Clock, AlertCircle, Loader2, Trash2, BookOpen } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';

// ── Error type config ─────────────────────────────────────────────────────
const ERROR_TYPES = [
  { value: 'wrong_word',       label: 'Wrong Word',        labelAr: 'كلمة خاطئة',      color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'tashkeel',         label: 'Tashkeel (Vowels)', labelAr: 'تشكيل خاطئ',      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { value: 'tajweed',          label: 'Tajweed Rule',      labelAr: 'حكم تجويد',        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'added_word',       label: 'Added Word',        labelAr: 'زيادة كلمة',       color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { value: 'skipped_word',     label: 'Skipped Word',      labelAr: 'حذف كلمة',         color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { value: 'nasya',            label: 'Forgot (Nasya)',    labelAr: 'نسيان',             color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300' },
  { value: 'wrong_transition', label: 'Wrong Transition',  labelAr: 'انتقال خاطئ',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'mutashabih',       label: 'Mutashabih',        labelAr: 'متشابه',            color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  { value: 'other',            label: 'Other',             labelAr: 'أخرى',              color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300' },
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
const fetchAyahText = async (surahNumber, ayahNumber) => {
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
  const [resolvedLocation, setResolvedLocation] = useState(null); // { text, surahName }

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
  }, []);

  useEffect(() => { fetchErrors(); }, [fetchErrors]);

  // ── Auto-fetch ayah text when surah + ayah are filled ────────
  useEffect(() => {
    const surah = parseInt(form.surahNumber);
    const ayah = parseInt(form.ayahNumber);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      const timer = setTimeout(async () => {
        setIsFetchingAyah(true);
        const result = await fetchAyahText(surah, ayah);
        setResolvedLocation(result);
        setIsFetchingAyah(false);
      }, 700); // debounce 700ms
      return () => clearTimeout(timer);
    } else {
      setResolvedLocation(null);
    }
  }, [form.surahNumber, form.ayahNumber]);

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
        fetchErrors();
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <BookMarked className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                كراسة الأخطاء
              </h1>
              <p className="text-sm text-secondary-foreground">Hifz Error Log — track and cure your memorization mistakes</p>
            </div>
          </div>
        </div>

        {/* ── LOG NEW ERROR FORM ──────────────────────────────── */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg mb-8 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-red-50/50 dark:bg-red-900/10">
            <PlusCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-base font-bold text-foreground">Log a New Error</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Location Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { name: 'surahNumber', label: 'Surah #', placeholder: '1–114', required: true },
                { name: 'ayahNumber', label: 'Ayah #', placeholder: 'e.g., 5', required: true },
                { name: 'pageNumber', label: 'Page #', placeholder: '1–604' },
                { name: 'juzNumber', label: 'Juz #', placeholder: '1–30' },
              ].map(({ name, label, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-secondary-foreground mb-1.5 uppercase tracking-wider">
                    {label}{required && <span className="text-red-500 ms-0.5">*</span>}
                  </label>
                  <input
                    type="number"
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                    placeholder={placeholder}
                    className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Ayah Preview */}
            {(isFetchingAyah || resolvedLocation) && (
              <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 min-h-[60px] flex items-center">
                {isFetchingAyah ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />
                ) : (
                  <div className="w-full">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                      {resolvedLocation.surahName} — Ayah {form.ayahNumber}
                    </p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200 leading-loose text-right" dir="rtl">
                      {resolvedLocation.text}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Type + Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-secondary-foreground mb-1.5 uppercase tracking-wider">
                  Error Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="errorType"
                  value={form.errorType}
                  onChange={handleFormChange}
                  className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                >
                  {ERROR_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-foreground mb-1.5 uppercase tracking-wider">
                  Your Note
                </label>
                <input
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleFormChange}
                  placeholder="e.g., said فَـ instead of وَ"
                  maxLength={500}
                  className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="sm:w-auto px-8">
              <PlusCircle className="h-4 w-4 me-2" />
              {isSubmitting ? 'Logging...' : 'Log This Error'}
            </Button>
          </form>
        </div>

        {/* ── ACTIVE ERRORS LIST ──────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              Active Errors
              {errors.length > 0 && (
                <span className="ms-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-sm font-bold px-2 py-0.5 rounded-full">
                  {errors.length}
                </span>
              )}
            </h2>
          </div>

          {isLoadingList ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : errors.length === 0 ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-secondary-foreground font-medium">No active errors logged yet.</p>
              <p className="text-sm text-secondary-foreground opacity-70 mt-1">Use the form above to log your first mistake — it's the first step to curing it!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((err) => {
                const due = formatDueDate(err.srs.nextReviewDate);
                return (
                  <div
                    key={err._id}
                    className="bg-white/90 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Left: Location Badge */}
                    <div className="flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center min-w-[65px]">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        {err.location.surahName}
                      </p>
                      <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                        {err.location.ayahNumber}
                      </p>
                      <p className="text-[10px] text-secondary-foreground">Ayah</p>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0">
                      {err.ayahText && (
                        <p className="text-base font-bold text-foreground leading-loose mb-2 text-right line-clamp-2" dir="rtl">
                          {err.ayahText}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <ErrorTypeBadge value={err.errorType} lang={i18n.language} />
                        {err.note && (
                          <span className="text-sm text-secondary-foreground italic">"{err.note}"</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${due.urgent ? 'text-red-500' : 'text-secondary-foreground'}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {due.label}
                        </div>
                        <span className="text-xs text-secondary-foreground opacity-50">·</span>
                        <span className="text-xs text-secondary-foreground opacity-60">
                          {err.srs.consecutiveCorrect}/{5} correct reviews
                        </span>
                      </div>
                    </div>

                    {/* Right: Delete */}
                    <button
                      onClick={() => handleDelete(err._id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete error"
                    >
                      <Trash2 className="h-4 w-4" />
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

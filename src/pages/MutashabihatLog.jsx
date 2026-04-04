import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, GitMerge, Loader2, BookOpen, Clock, Sparkles, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';

// ── Constants ─────────────────────────────────────────────────────────────
const MAX_VERSES = 5;
const MIN_VERSES = 2;

const CATEGORIES = [
  { value: 'other',        label: 'Other / General',      labelAr: 'عام' },
  { value: 'opening',      label: 'Opening Words',        labelAr: 'فواتح المتشابهة' },
  { value: 'ending',       label: 'Ending Words',         labelAr: 'خواتيم المتشابهة' },
  { value: 'middle',       label: 'Middle Wording',       labelAr: 'وسط الآية' },
  { value: 'tashkeel',     label: 'Tashkeel (Vowels)',    labelAr: 'اختلاف التشكيل' },
  { value: 'addition',     label: 'Added Word',           labelAr: 'زيادة كلمة' },
  { value: 'substitution', label: 'Word Substitution',    labelAr: 'اختلاف الكلمة' },
];

const MASTERY_LABELS = ['Confusing', 'Uncertain', 'Shaky', 'Usually Good', 'Confident', 'Mastered'];
const MASTERY_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
];

// ── Quran API fetch ───────────────────────────────────────────────────────
const fetchAyahData = async (surahNumber, ayahNumber) => {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`);
    const data = await res.json();
    if (data.code === 200) {
      return {
        text: data.data.text,
        surahName: data.data.surah.name,
        surahEnglishName: data.data.surah.englishName,
      };
    }
  } catch (_) {}
  return null;
};

const emptyVerse = () => ({
  surahNumber: '',
  ayahNumber: '',
  distinctionNote: '',
  _resolved: null,   // { text, surahName } — fetched from API
  _fetching: false,
});

// ── Verse Input Block ─────────────────────────────────────────────────────
const VerseBlock = ({ index, verse, onChange, onRemove, canRemove }) => {
  // Debounced Quran API fetch
  useEffect(() => {
    const surah = parseInt(verse.surahNumber);
    const ayah = parseInt(verse.ayahNumber);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      onChange(index, '_fetching', true);
      const timer = setTimeout(async () => {
        const result = await fetchAyahData(surah, ayah);
        onChange(index, '_resolved', result);
        onChange(index, '_fetching', false);
        if (result) onChange(index, '_surahName', result.surahName);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      onChange(index, '_resolved', null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse.surahNumber, verse.ayahNumber]);

  return (
    <div className="relative bg-emerald-50/50 dark:bg-slate-700/30 rounded-xl border border-emerald-100 dark:border-slate-600 p-4 mb-4">
      {/* Verse number badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          Verse {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-gray-400 hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Surah + Ayah inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-secondary-foreground mb-1 uppercase tracking-wider">
            Surah # <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={verse.surahNumber}
            onChange={(e) => onChange(index, 'surahNumber', e.target.value)}
            placeholder="1–114"
            min={1} max={114}
            className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-secondary-foreground mb-1 uppercase tracking-wider">
            Ayah # <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={verse.ayahNumber}
            onChange={(e) => onChange(index, 'ayahNumber', e.target.value)}
            placeholder="e.g., 5"
            min={1}
            className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Live Ayah Preview */}
      {(verse._fetching || verse._resolved) && (
        <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-emerald-800 min-h-[44px] flex items-center">
          {verse._fetching ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin mx-auto" />
          ) : (
            <div className="w-full">
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                {verse._resolved.surahName}
              </p>
              <p className="text-base font-bold text-foreground leading-loose text-right" dir="rtl">
                {verse._resolved.text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Per-verse distinction note */}
      <div>
        <label className="block text-xs font-semibold text-secondary-foreground mb-1 uppercase tracking-wider">
          Distinction Note <span className="text-secondary-foreground opacity-50">(optional)</span>
        </label>
        <input
          type="text"
          value={verse.distinctionNote}
          onChange={(e) => onChange(index, 'distinctionNote', e.target.value)}
          placeholder={`e.g., "This verse in Al-Baqarah starts with وَ"`}
          maxLength={300}
          className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
        />
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const MutashabihatLog = () => {
  const { showSuccess, showError } = useToast();

  const [records, setRecords] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic verse form state
  const [verses, setVerses] = useState([emptyVerse(), emptyVerse()]);
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [category, setCategory] = useState('other');

  // ── Fetch active records ────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get('/mutashabihat');
      if (res.data.success) setRecords(res.data.mutashabihat);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // ── Verse management ────────────────────────────────────────────
  const handleVerseChange = (index, field, value) => {
    setVerses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addVerse = () => {
    if (verses.length < MAX_VERSES) setVerses((prev) => [...prev, emptyVerse()]);
  };

  const removeVerse = (index) => {
    if (verses.length > MIN_VERSES) {
      setVerses((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validVerses = verses.filter(
      (v) => parseInt(v.surahNumber) > 0 && parseInt(v.ayahNumber) > 0
    );

    if (validVerses.length < 2) {
      showError('Please fill in at least 2 valid verses (Surah # and Ayah #).');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        verses: validVerses.map((v) => ({
          surahNumber: parseInt(v.surahNumber),
          surahName: v._resolved?.surahName || `Surah ${v.surahNumber}`,
          ayahNumber: parseInt(v.ayahNumber),
          ayahText: v._resolved?.text || '',
          ...(v.distinctionNote?.trim() && { distinctionNote: v.distinctionNote.trim() }),
        })),
        customMnemonic: customMnemonic.trim(),
        category,
      };

      const res = await api.post('/mutashabihat', payload);
      if (res.data.success) {
        showSuccess('Mutashabih group logged!');
        setVerses([emptyVerse(), emptyVerse()]);
        setCustomMnemonic('');
        setCategory('other');
        fetchRecords();
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Mutashabih group permanently?')) return;
    try {
      await api.delete(`/mutashabihat/${id}`);
      showSuccess('Deleted.');
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      showError(err.message);
    }
  };

  const formatDue = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff <= 0) return { label: 'Due now', urgent: true };
    if (diff === 1) return { label: 'Due tomorrow', urgent: false };
    return { label: `Due in ${diff} days`, urgent: false };
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <GitMerge className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">المتشابهات</h1>
            <p className="text-sm text-secondary-foreground">Mutashabihat Tracker — master similar verses side by side</p>
          </div>
        </div>

        {/* ── LOG FORM ─────────────────────────────────────────── */}
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-slate-700 shadow-lg mb-8 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-teal-50/50 dark:bg-teal-900/10">
            <PlusCircle className="h-5 w-5 text-teal-500" />
            <h2 className="text-base font-bold text-foreground">Log a New Mutashabih Group</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {/* Dynamic verse blocks */}
            {verses.map((verse, i) => (
              <VerseBlock
                key={i}
                index={i}
                verse={verse}
                onChange={handleVerseChange}
                onRemove={removeVerse}
                canRemove={verses.length > MIN_VERSES}
              />
            ))}

            {/* Add verse button */}
            {verses.length < MAX_VERSES && (
              <button
                type="button"
                onClick={addVerse}
                className="w-full py-2.5 mb-5 border-2 border-dashed border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400 rounded-xl text-sm font-semibold hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add another Ayah ({verses.length}/{MAX_VERSES})
              </button>
            )}

            {/* Mnemonic textarea */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-secondary-foreground mb-1.5 uppercase tracking-wider">
                العلامة الذهنية — Custom Mnemonic{' '}
                <span className="text-secondary-foreground opacity-50">(optional but powerful!)</span>
              </label>
              <textarea
                value={customMnemonic}
                onChange={(e) => setCustomMnemonic(e.target.value)}
                placeholder="Write your personal trick to remember the difference... e.g., 'Al-Baqarah = Cow = open mouth = Fatha (a)'"
                rows={3}
                maxLength={1000}
                className="w-full py-3 px-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Category (optional) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-secondary-foreground mb-1.5 uppercase tracking-wider">
                Category <span className="text-secondary-foreground opacity-50">(optional)</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 px-3 border border-gray-200 dark:border-slate-600 rounded-xl bg-card text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} — {c.labelAr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-foreground pointer-events-none" />
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="sm:w-auto px-8">
              <PlusCircle className="h-4 w-4 me-2" />
              {isSubmitting ? 'Logging...' : 'Log This Group'}
            </Button>
          </form>
        </div>

        {/* ── ACTIVE LIST ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              Active Groups
              {records.length > 0 && (
                <span className="ms-2 bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 text-sm font-bold px-2 py-0.5 rounded-full">
                  {records.length}
                </span>
              )}
            </h2>
          </div>

          {isLoadingList ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
              <GitMerge className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-secondary-foreground font-medium">No Mutashabihat logged yet.</p>
              <p className="text-sm text-secondary-foreground opacity-70 mt-1">
                Log your first confusing verse pair above to start mastering them!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((rec) => {
                const due = formatDue(rec.srs.nextReviewDate);
                const level = rec.srs.masteryLevel;
                return (
                  <div
                    key={rec._id}
                    className="bg-white/90 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Header: mastery + due */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${MASTERY_COLORS[level]}`}>
                        Mastery {level}/5 — {MASTERY_LABELS[level]}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold flex items-center gap-1 ${due.urgent ? 'text-red-500' : 'text-secondary-foreground'}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {due.label}
                        </span>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="p-1.5 text-gray-400 hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Verse pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.verses.map((v, i) => (
                        <div
                          key={i}
                          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-3 py-2 flex-1 min-w-[140px]"
                        >
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">
                            {v.surahName} : {v.ayahNumber}
                          </p>
                          {v.ayahText && (
                            <p className="text-sm font-bold text-foreground leading-loose line-clamp-2 text-right" dir="rtl">
                              {v.ayahText}
                            </p>
                          )}
                          {v.distinctionNote && (
                            <p className="text-xs text-secondary-foreground italic mt-1 border-t border-emerald-100 dark:border-emerald-800 pt-1">
                              {v.distinctionNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mnemonic */}
                    {rec.customMnemonic && (
                      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-800">
                        <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-900 dark:text-amber-300 italic">
                          {rec.customMnemonic}
                        </p>
                      </div>
                    )}
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

export default MutashabihatLog;

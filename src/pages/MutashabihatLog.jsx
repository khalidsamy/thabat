import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, GitMerge, Loader2, Clock, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { fetchAyahText as fetchAyahPreview, isAbortedRequest } from '../services/quranApi';

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
  'bg-red-900/40 text-red-400 border border-red-500/20',
  'bg-orange-900/40 text-orange-400 border border-orange-500/20',
  'bg-yellow-900/40 text-yellow-400 border border-yellow-500/20',
  'bg-blue-900/40 text-blue-400 border border-blue-500/20',
  'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20',
  'bg-purple-900/40 text-purple-400 border border-purple-500/20',
];

// ── Quran API fetch ───────────────────────────────────────────────────────
const _fetchAyahData = async (surahNumber, ayahNumber) => {
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
  } catch (_error) {
    // Optional preview failures should not block logging the group.
  }
  return null;
};

const emptyVerse = () => ({
  surahNumber: '',
  ayahNumber: '',
  distinctionNote: '',
  _resolved: null,
  _fetching: false,
});

// ── Verse Input Block ─────────────────────────────────────────────────────
const VerseBlock = ({ index, verse, onChange, onRemove, canRemove }) => {
  useEffect(() => {
    const surah = Number.parseInt(verse.surahNumber, 10);
    const ayah = Number.parseInt(verse.ayahNumber, 10);

    if (!(surah >= 1 && surah <= 114 && ayah >= 1)) {
      onChange(index, '_resolved', null);
      onChange(index, '_fetching', false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      onChange(index, '_fetching', true);

      try {
        const result = await fetchAyahPreview(surah, ayah, { signal: controller.signal });
        onChange(index, '_resolved', result);
        if (result) {
          onChange(index, '_surahName', result.surahName);
        }
      } catch (error) {
        if (!isAbortedRequest(error)) {
          onChange(index, '_resolved', null);
        }
      } finally {
        onChange(index, '_fetching', false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [index, onChange, verse.ayahNumber, verse.surahNumber]);

  return (
    <div className="relative bg-teal-950/20 rounded-2xl border border-white/5 p-5 mb-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">
          Verse {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
            Surah # <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={verse.surahNumber}
            onChange={(e) => onChange(index, 'surahNumber', e.target.value)}
            placeholder="1–114"
            min={1} max={114}
            className="w-full py-3 px-4 border border-white/5 rounded-xl bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-foreground"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
            Ayah # <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            value={verse.ayahNumber}
            onChange={(e) => onChange(index, 'ayahNumber', e.target.value)}
            placeholder="e.g., 5"
            min={1}
            className="w-full py-3 px-4 border border-white/5 rounded-xl bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-foreground"
          />
        </div>
      </div>

      {(verse._fetching || verse._resolved) && (
        <div className="mb-4 p-4 bg-slate-950 rounded-xl border border-emerald-500/20 min-h-[50px] flex items-center">
          {verse._fetching ? (
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin mx-auto" />
          ) : (
            <div className="w-full">
              <p className="text-[10px] text-emerald-400 font-bold mb-1 uppercase">
                {verse._resolved.surahName}
              </p>
              <p className="text-lg font-bold text-foreground leading-loose text-right font-quran" dir="rtl">
                {verse._resolved.text}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">
          Distinction Note <span className="text-slate-600 opacity-50">(optional)</span>
        </label>
        <input
          type="text"
          value={verse.distinctionNote}
          onChange={(e) => onChange(index, 'distinctionNote', e.target.value)}
          placeholder={`e.g., "This verse in Al-Baqarah starts with وَ"`}
          maxLength={300}
          className="w-full py-3 px-4 border border-white/5 rounded-xl bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-foreground italic"
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

  const [verses, setVerses] = useState([emptyVerse(), emptyVerse()]);
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [category, setCategory] = useState('other');

  const fetchRecords = useCallback(async () => {
    try {
      const res = await api.get('/mutashabihat');
      if (res.data.success) setRecords(res.data.mutashabihat);
    } catch (err) {
      showError(err.message);
    } finally {
      setIsLoadingList(false);
    }
  }, [showError]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleVerseChange = useCallback((index, field, value) => {
    setVerses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const addVerse = () => {
    if (verses.length < MAX_VERSES) setVerses((prev) => [...prev, emptyVerse()]);
  };

  const removeVerse = (index) => {
    if (verses.length > MIN_VERSES) {
      setVerses((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validVerses = verses.filter(
      (v) => parseInt(v.surahNumber) > 0 && parseInt(v.ayahNumber) > 0
    );
    if (validVerses.length < 2) {
      showError('Please fill in at least 2 valid verses.');
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

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shadow-lg shadow-teal-500/5">
              <GitMerge className="h-7 w-7 text-teal-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">المتشابهات</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Mutashabihat Tracker</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-white/5">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery System Active</span>
          </div>
        </div>

        {/* ── LOG FORM ─────────────────────────────────────────── */}
        <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl mb-12 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-6 border-b border-white/5 bg-teal-500/5">
            <PlusCircle className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-black text-foreground uppercase tracking-tight">Log a New Mutashabih Group</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8">
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

            {verses.length < MAX_VERSES && (
              <button
                type="button"
                onClick={addVerse}
                className="w-full py-4 mb-6 border-2 border-dashed border-white/10 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-teal-500/40 hover:text-teal-400 hover:bg-teal-500/5 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add another Ayah ({verses.length}/{MAX_VERSES})
              </button>
            )}

            <div className="mb-6">
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">
                العلامة الذهنية — Custom Mnemonic <span className="opacity-50">(optional)</span>
              </label>
              <textarea
                value={customMnemonic}
                onChange={(e) => setCustomMnemonic(e.target.value)}
                placeholder="Personal trick to remember the difference..."
                rows={3}
                maxLength={1000}
                className="w-full py-4 px-5 border border-white/5 rounded-2xl bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none text-foreground font-medium"
              />
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3.5 px-5 border border-white/5 rounded-2xl bg-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none text-foreground font-bold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-slate-900 text-foreground">
                      {c.label} — {c.labelAr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute end-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto px-10 h-14 bg-white text-zinc-950 font-black hover:bg-slate-100 rounded-2xl shadow-xl shadow-black/20">
              <CheckCircle2 className="h-5 w-5 me-2" />
              {isSubmitting ? 'Logging...' : 'Log This Group'}
            </Button>
          </form>
        </div>

        {/* ── ACTIVE LIST ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight"> Active Groups </h2>
            {records.length > 0 && (
              <span className="bg-teal-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-teal-500/20">
                {records.length} TOTAL
              </span>
            )}
          </div>

          {isLoadingList ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-20 bg-card/20 rounded-[2.5rem] border border-dashed border-white/10 backdrop-blur-sm">
              <GitMerge className="h-16 w-16 text-slate-700 mx-auto mb-4 opacity-30" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Mutashabihat logged yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {records.map((rec) => {
                const due = formatDue(rec.srs.nextReviewDate);
                const level = rec.srs.masteryLevel;
                return (
                  <div key={rec._id} className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-white/5 shadow-xl p-6 transition-all hover:shadow-2xl hover:border-white/10 group">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg ${MASTERY_COLORS[level]}`}>
                        {MASTERY_LABELS[level]}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 ${due.urgent ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {due.label}
                        </span>
                        <button
                          onClick={() => handleDelete(rec._id)}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                      {rec.verses.map((v, i) => (
                        <div key={i} className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 hover:border-teal-500/20 transition-colors">
                          <p className="text-[10px] text-teal-400 font-black uppercase mb-2 tracking-tighter">
                            {v.surahName} : {v.ayahNumber}
                          </p>
                          {v.ayahText && (
                            <p className="text-base font-bold text-foreground leading-loose line-clamp-2 text-right font-quran" dir="rtl">
                              {v.ayahText}
                            </p>
                          )}
                          {v.distinctionNote && (
                            <p className="text-[11px] text-slate-500 italic mt-3 border-t border-white/5 pt-2">
                              {v.distinctionNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {rec.customMnemonic && (
                      <div className="flex items-start gap-3 bg-amber-950/20 rounded-2xl px-5 py-3 border border-amber-900/30">
                        <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-100/70 italic font-medium">
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

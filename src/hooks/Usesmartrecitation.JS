import { useState, useCallback, useRef, useEffect } from 'react';

// How similar a spoken word must be to the target (0–1).
// 0.72 tolerates minor STT inaccuracies without over-correcting.
const SIM_THRESHOLD = 0.72;

// How many consecutive correct recitations of an error word are required
// before the session resumes — Sheikh Alaa Hamed's correction principle.
const CORRECTION_REPS_REQUIRED = 3;

const normalize = (s) => {
  if (!s) return '';
  return s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
};

const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j]);
  return dp[m][n];
};

const similarity = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
};

const lastWord = (text) => {
  const w = (text || '').trim().split(/\s+/).filter(Boolean);
  return w[w.length - 1] || null;
};

/*
  Phase machine:
  idle
  ├─ linking       (الربط — say last word of previous verse; skipped if ayahFrom === 1)
  ├─ reciting      (normal forward recitation)
  ├─ correction    (3-rep drill on the failed word before resuming)
  └─ complete
*/

export const useSmartRecitation = ({ targetVerses = [], previousVerseText = null, onError }) => {
  const [phase, setPhase]         = useState('idle');
  const [words, setWords]         = useState([]);
  const [masteryScore, setMastery]= useState(0);
  const [errorWord, setErrorWord] = useState(null);
  const [correctionReps, setCorrectionReps] = useState(0);
  const [recognitionError, setRecognitionError] = useState(null);

  // All mutable real-time counters live in refs to avoid stale closures in SR callbacks
  const wordIndexRef      = useRef(0);
  const phaseRef          = useRef('idle');
  const correctionRepsRef = useRef(0);
  const errorIndexRef     = useRef(-1);
  const recognitionRef    = useRef(null);

  const linkWord = previousVerseText ? lastWord(previousVerseText) : null;

  useEffect(() => {
    if (!targetVerses.length) return;
    const all = targetVerses
      .flatMap(v => v.text.trim().split(/\s+/).filter(Boolean))
      .map(w => ({ text: w, normalized: normalize(w), status: 'pending' }));
    setWords(all);
    setMastery(0);
    setErrorWord(null);
    setCorrectionReps(0);
    setPhase('idle');
    phaseRef.current = 'idle';
    wordIndexRef.current = 0;
    correctionRepsRef.current = 0;
    errorIndexRef.current = -1;
    return () => stopRecognition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetVerses]);

  const calcScore = (wordList) => {
    if (!wordList.length) return 0;
    return Math.round(wordList.filter(w => w.status === 'correct').length / wordList.length * 100);
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate([120, 60, 120]);
  };

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // SpeechRecognition can throw when the instance has already been stopped.
    }
    recognitionRef.current = null;
  }, []);

  const startRecognition = useCallback((onFinal) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setRecognitionError('Speech recognition not supported in this browser'); return; }
    stopRecognition();

    const r = new SR();
    r.lang = 'ar-SA';
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onerror = (e) => { if (e.error !== 'aborted') setRecognitionError(e.error); };
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onFinal(e.results[i][0].transcript);
      }
    };
    r.start();
    recognitionRef.current = r;
  }, [stopRecognition]);

  // ── CORRECTION DRILL ────────────────────────────────────────────────────
  // The user must correctly recite the failed word CORRECTION_REPS_REQUIRED
  // times before the session resumes from that exact position.
  const startCorrectionDrill = useCallback((failedWord, failedIndex) => {
    stopRecognition();
    correctionRepsRef.current = 0;
    errorIndexRef.current = failedIndex;
    setErrorWord(failedWord);
    setCorrectionReps(0);
    setPhase('correction');
    phaseRef.current = 'correction';

    startRecognition((speech) => {
      if (phaseRef.current !== 'correction') return;
      const spoken = normalize(speech.trim().split(/\s+/).pop() || speech);
      const isCorrect = similarity(failedWord.normalized, spoken) >= SIM_THRESHOLD;

      if (isCorrect) {
        correctionRepsRef.current += 1;
        setCorrectionReps(correctionRepsRef.current);

        if (correctionRepsRef.current >= CORRECTION_REPS_REQUIRED) {
          // Drill complete — mark the word correct and resume from next word
          stopRecognition();
          setWords(prev => {
            const updated = [...prev];
            updated[errorIndexRef.current] = { ...updated[errorIndexRef.current], status: 'correct' };
            setMastery(calcScore(updated));
            return updated;
          });
          wordIndexRef.current = errorIndexRef.current + 1;
          setErrorWord(null);
          setCorrectionReps(0);
          setPhase('reciting');
          phaseRef.current = 'reciting';
          startRecognition(processChunk);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startRecognition, stopRecognition]);

  // ── MAIN RECITATION CHUNK PROCESSOR ─────────────────────────────────────
  const processChunk = useCallback((speech) => {
    if (phaseRef.current !== 'reciting') return;

    const spoken = normalize(speech).split(/\s+/).filter(Boolean);
    let errorFound = false;
    let errorData = null;

    setWords(prev => {
      const updated = [...prev];
      let idx = wordIndexRef.current;

      for (const s of spoken) {
        if (idx >= updated.length || errorFound) break;

        const sim = similarity(updated[idx].normalized, s);
        if (sim >= SIM_THRESHOLD) {
          updated[idx] = { ...updated[idx], status: 'correct' };
          idx++;
        } else {
          // Try one word ahead to absorb a single dropped word
          if (idx + 1 < updated.length && similarity(updated[idx + 1].normalized, s) >= SIM_THRESHOLD) {
            updated[idx] = { ...updated[idx], status: 'error' };
            errorData = { text: updated[idx].text, normalized: updated[idx].normalized, index: idx };
            updated[idx + 1] = { ...updated[idx + 1], status: 'correct' };
            errorFound = true;
            idx += 2;
          } else {
            updated[idx] = { ...updated[idx], status: 'error' };
            errorData = { text: updated[idx].text, normalized: updated[idx].normalized, index: idx };
            errorFound = true;
          }
        }
      }

      wordIndexRef.current = idx;
      setMastery(calcScore(updated));

      if (idx >= updated.length) {
        setPhase('complete');
        phaseRef.current = 'complete';
        stopRecognition();
      }

      return updated;
    });

    if (errorFound && errorData) {
      stopRecognition();
      triggerHaptic();
      onError?.(errorData.text);
      startCorrectionDrill(errorData, errorData.index);
    }
  }, [stopRecognition, onError, startCorrectionDrill]);

  // ── LINKING PHASE ────────────────────────────────────────────────────────
  const startLinkingPhase = useCallback(() => {
    setPhase('linking');
    phaseRef.current = 'linking';

    startRecognition((speech) => {
      if (phaseRef.current !== 'linking') return;
      const spokenLast = normalize(speech.trim().split(/\s+/).pop() || speech);
      if (similarity(normalize(linkWord), spokenLast) >= SIM_THRESHOLD) {
        stopRecognition();
        setPhase('reciting');
        phaseRef.current = 'reciting';
        startRecognition(processChunk);
      }
    });
  }, [linkWord, startRecognition, stopRecognition, processChunk]);

  // ── PUBLIC API ────────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    if (!words.length) return;
    setRecognitionError(null);
    if (linkWord) {
      startLinkingPhase();
    } else {
      setPhase('reciting');
      phaseRef.current = 'reciting';
      startRecognition(processChunk);
    }
  }, [words.length, linkWord, startLinkingPhase, startRecognition, processChunk]);

  const stopSession = useCallback(() => {
    stopRecognition();
    if (phaseRef.current !== 'complete') {
      setPhase('idle');
      phaseRef.current = 'idle';
    }
  }, [stopRecognition]);

  const resetSession = useCallback(() => {
    stopRecognition();
    setPhase('idle');
    phaseRef.current = 'idle';
    wordIndexRef.current = 0;
    correctionRepsRef.current = 0;
    errorIndexRef.current = -1;
    setErrorWord(null);
    setCorrectionReps(0);
    setMastery(0);
    setRecognitionError(null);
    setWords(prev => prev.map(w => ({ ...w, status: 'pending' })));
  }, [stopRecognition]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  return {
    phase,
    words,
    masteryScore,
    errorWord,
    correctionReps,
    correctionRepsRequired: CORRECTION_REPS_REQUIRED,
    linkWord,
    recognitionError,
    isActive: phase === 'reciting' || phase === 'linking' || phase === 'correction',
    startSession,
    stopSession,
    resetSession,
  };
};

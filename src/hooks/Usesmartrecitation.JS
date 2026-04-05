import { useState, useCallback, useRef, useEffect } from 'react';

// Similarity threshold for accepting a spoken word as matching the target.
// 0.72 is intentionally lenient — STT for Arabic is imperfect and we prefer
// false positives over stopping a student mid-flow for minor mispronunciations.
const SIMILARITY_THRESHOLD = 0.72;

const normalize = (str) => {
  if (!str) return '';
  return str
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
};

const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
    }
  }
  return dp[a.length][b.length];
};

const wordSimilarity = (a, b) => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
};

const getLastWord = (text) => {
  if (!text) return null;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words[words.length - 1] || null;
};

/*
  Phase state machine:
  idle → linking  (when a previous verse exists — الربط)
       → reciting (when no previous verse)
  linking → reciting  (link word confirmed)
  reciting → paused_error  (wrong word detected)
  paused_error → reciting  (user taps Resume)
  reciting → complete (all words matched)
*/
export const useSmartRecitation = ({ targetVerses = [], previousVerseText = null, onError }) => {
  const [phase, setPhase] = useState('idle');
  const [words, setWords] = useState([]);
  const [masteryScore, setMasteryScore] = useState(0);
  const [errorWord, setErrorWord] = useState(null);
  const [recognitionError, setRecognitionError] = useState(null);

  // Refs prevent stale closures inside recognition callbacks — the #1 bug
  // in the original hook was reading `currentIndex` from a stale closure.
  const recognitionRef = useRef(null);
  const wordIndexRef = useRef(0);
  const phaseRef = useRef('idle');

  const linkWord = previousVerseText ? getLastWord(previousVerseText) : null;

  useEffect(() => {
    if (targetVerses.length === 0) return;
    const allWords = targetVerses.flatMap((v) =>
      v.text.trim().split(/\s+/).filter(Boolean).map((w) => ({
        text: w,
        normalized: normalize(w),
        status: 'pending',
      }))
    );
    setWords(allWords);
    setMasteryScore(0);
    setErrorWord(null);
    setPhase('idle');
    phaseRef.current = 'idle';
    wordIndexRef.current = 0;
  }, [targetVerses]);

  const computeScore = useCallback((wordList) => {
    if (!wordList.length) return 0;
    const correct = wordList.filter((w) => w.status === 'correct').length;
    return Math.round((correct / wordList.length) * 100);
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
      recognitionRef.current = null;
    }
  }, []);

  // Called with each finalized speech chunk during the main reciting phase.
  // Returns true if an error was found (used to stop the loop early).
  const processSpeechChunk = useCallback((speech) => {
    const spokenWords = normalize(speech).split(/\s+/).filter(Boolean);
    let errorFound = false;
    let errorData = null;

    setWords((prev) => {
      const updated = [...prev];
      let idx = wordIndexRef.current;

      for (const spoken of spokenWords) {
        if (idx >= updated.length || errorFound) break;

        const targetNorm = updated[idx].normalized;
        const sim = wordSimilarity(targetNorm, spoken);

        if (sim >= SIMILARITY_THRESHOLD) {
          updated[idx] = { ...updated[idx], status: 'correct' };
          idx++;
        } else {
          // Try the next word — handles a single omitted word gracefully
          const nextIdx = idx + 1;
          if (
            nextIdx < updated.length &&
            wordSimilarity(updated[nextIdx].normalized, spoken) >= SIMILARITY_THRESHOLD
          ) {
            updated[idx] = { ...updated[idx], status: 'error' };
            updated[nextIdx] = { ...updated[nextIdx], status: 'correct' };
            errorData = { text: updated[idx].text, index: idx };
            errorFound = true;
            idx = nextIdx + 1;
          } else {
            updated[idx] = { ...updated[idx], status: 'error' };
            errorData = { text: updated[idx].text, index: idx };
            errorFound = true;
          }
        }
      }

      wordIndexRef.current = idx;
      const score = computeScore(updated);
      setMasteryScore(score);

      if (idx >= updated.length) {
        setPhase('complete');
        phaseRef.current = 'complete';
      }

      return updated;
    });

    if (errorFound && errorData) {
      stopRecognition();
      triggerHaptic();
      setErrorWord(errorData);
      setPhase('paused_error');
      phaseRef.current = 'paused_error';
      onError?.(errorData.text);
    }

    return errorFound;
  }, [computeScore, stopRecognition, triggerHaptic, onError]);

  // Checks if the spoken text contains the link word with sufficient similarity.
  const processLinkCheck = useCallback((speech) => {
    if (!linkWord) return true;
    const lastSpoken = normalize(speech.trim().split(/\s+/).pop() || speech);
    return wordSimilarity(normalize(linkWord), lastSpoken) >= SIMILARITY_THRESHOLD;
  }, [linkWord]);

  const startRecognition = useCallback((onFinalResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setRecognitionError('Speech recognition is not supported in this browser.');
      return;
    }
    stopRecognition();

    const recognition = new SR();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setRecognitionError(e.error);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        onFinalResult(event.results[i][0].transcript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [stopRecognition]);

  const startSession = useCallback(() => {
    if (!words.length) return;
    setRecognitionError(null);

    if (linkWord) {
      // الربط: require the last word of the previous verse before proceeding
      setPhase('linking');
      phaseRef.current = 'linking';

      startRecognition((speech) => {
        const linked = processLinkCheck(speech);
        if (linked) {
          stopRecognition();
          setPhase('reciting');
          phaseRef.current = 'reciting';
          startRecognition(processSpeechChunk);
        }
      });
    } else {
      setPhase('reciting');
      phaseRef.current = 'reciting';
      startRecognition(processSpeechChunk);
    }
  }, [words.length, linkWord, startRecognition, processLinkCheck, stopRecognition, processSpeechChunk]);

  // Resume from the exact word that caused the error — not from the beginning.
  const resumeFromError = useCallback(() => {
    if (!errorWord) return;
    setWords((prev) =>
      prev.map((w, i) => i >= errorWord.index ? { ...w, status: 'pending' } : w)
    );
    wordIndexRef.current = errorWord.index;
    setErrorWord(null);
    setPhase('reciting');
    phaseRef.current = 'reciting';
    startRecognition(processSpeechChunk);
  }, [errorWord, startRecognition, processSpeechChunk]);

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
    setErrorWord(null);
    setMasteryScore(0);
    setRecognitionError(null);
    setWords((prev) => prev.map((w) => ({ ...w, status: 'pending' })));
  }, [stopRecognition]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  return {
    phase,
    words,
    masteryScore,
    errorWord,
    linkWord,
    recognitionError,
    isActive: phase === 'reciting' || phase === 'linking',
    startSession,
    stopSession,
    resumeFromError,
    resetSession,
  };
};
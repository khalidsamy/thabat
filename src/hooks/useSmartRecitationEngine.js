import { useCallback, useEffect, useRef, useState } from 'react';

const SIM_THRESHOLD = 0.72;
const CORRECTION_REPS_REQUIRED = 3;
const RESTART_DELAY_MS = 360;
const MIN_NOISE_CHAR_COUNT = 2;
const DUPLICATE_FINAL_WINDOW_MS = 650;

const normalize = (value) => {
  if (!value) return '';

  return value
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    .replace(/[\u0623\u0625\u0622]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\s+/g, ' ')
    .trim();
};

const levenshtein = (left, right) => {
  const rows = left.length;
  const cols = right.length;
  const matrix = Array.from({ length: rows + 1 }, (_, rowIndex) => [rowIndex]);

  for (let colIndex = 0; colIndex <= cols; colIndex += 1) {
    matrix[0][colIndex] = colIndex;
  }

  for (let rowIndex = 1; rowIndex <= rows; rowIndex += 1) {
    for (let colIndex = 1; colIndex <= cols; colIndex += 1) {
      matrix[rowIndex][colIndex] =
        left[rowIndex - 1] === right[colIndex - 1]
          ? matrix[rowIndex - 1][colIndex - 1]
          : 1 + Math.min(
              matrix[rowIndex - 1][colIndex - 1],
              matrix[rowIndex][colIndex - 1],
              matrix[rowIndex - 1][colIndex],
            );
    }
  }

  return matrix[rows][cols];
};

const similarity = (left, right) => {
  if (!left || !right) return 0;
  if (left === right) return 1;
  return 1 - levenshtein(left, right) / Math.max(left.length, right.length);
};

const lastWord = (text) => {
  const tokens = (text || '').trim().split(/\s+/).filter(Boolean);
  return tokens[tokens.length - 1] || null;
};

const hasArabicCharacters = (value) => /[\u0600-\u06FF]/.test(value);

const getSpeechConstructor = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSmartRecitation = ({ targetVerses = [], previousVerseText = null, onError }) => {
  const [phase, setPhase] = useState('idle');
  const [words, setWords] = useState([]);
  const [masteryScore, setMasteryScore] = useState(0);
  const [errorWord, setErrorWord] = useState(null);
  const [correctionReps, setCorrectionReps] = useState(0);
  const [recognitionError, setRecognitionError] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  const wordIndexRef = useRef(0);
  const phaseRef = useRef('idle');
  const correctionRepsRef = useRef(0);
  const errorIndexRef = useRef(-1);
  const errorWordRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const manualStopRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const wordsRef = useRef([]);
  const lastFinalChunkRef = useRef('');
  const lastFinalChunkAtRef = useRef(0);

  const linkWord = previousVerseText ? lastWord(previousVerseText) : null;

  const clearRestartTimer = useCallback(() => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const calcScore = useCallback((wordList) => {
    if (!wordList.length) return 0;
    return Math.round((wordList.filter((word) => word.status === 'correct').length / wordList.length) * 100);
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
  }, []);

  const stopRecognition = useCallback(({ manual = false, clearIntent = false } = {}) => {
    manualStopRef.current = manual;
    if (clearIntent) {
      shouldListenRef.current = false;
    }

    clearRestartTimer();

    try {
      recognitionRef.current?.stop();
    } catch {
      // Some browsers throw when the recognizer has already ended.
    }
  }, [clearRestartTimer]);

  const shouldIgnoreSpeech = useCallback((spokenWords, expectedWord) => {
    if (!spokenWords.length) return true;

    const joinedSpeech = spokenWords.join('');
    if (!hasArabicCharacters(joinedSpeech)) return true;

    if (joinedSpeech.length >= MIN_NOISE_CHAR_COUNT) return false;

    const expectedLength = expectedWord?.normalized?.length ?? 0;
    return expectedLength > joinedSpeech.length + 1;
  }, []);

  const handleCorrectionSpeech = useCallback((speech) => {
    if (phaseRef.current !== 'correction' || !errorWordRef.current) return;

    const spokenWord = normalize(speech.trim().split(/\s+/).pop() || speech);
    if (shouldIgnoreSpeech([spokenWord], errorWordRef.current)) return;

    const matches = similarity(errorWordRef.current.normalized, spokenWord) >= SIM_THRESHOLD;
    if (!matches) return;

    correctionRepsRef.current += 1;
    setCorrectionReps(correctionRepsRef.current);

    if (correctionRepsRef.current < CORRECTION_REPS_REQUIRED) return;

    stopRecognition({ manual: false });

    setWords((previousWords) => {
      const nextWords = [...previousWords];
      const targetIndex = errorIndexRef.current;
      nextWords[targetIndex] = { ...nextWords[targetIndex], status: 'correct' };
      wordsRef.current = nextWords;
      setMasteryScore(calcScore(nextWords));
      return nextWords;
    });

    wordIndexRef.current = errorIndexRef.current + 1;
    correctionRepsRef.current = 0;
    errorIndexRef.current = -1;
    errorWordRef.current = null;
    setErrorWord(null);
    setCorrectionReps(0);
    setPhase('reciting');
    phaseRef.current = 'reciting';
    setLiveTranscript('');
  }, [calcScore, shouldIgnoreSpeech, stopRecognition]);

  const startCorrectionDrill = useCallback((failedWord, failedIndex) => {
    correctionRepsRef.current = 0;
    errorIndexRef.current = failedIndex;
    errorWordRef.current = failedWord;
    setErrorWord(failedWord);
    setCorrectionReps(0);
    setPhase('correction');
    phaseRef.current = 'correction';
    setLiveTranscript('');
  }, []);

  const processChunk = useCallback((speech) => {
    if (phaseRef.current !== 'reciting') return;

    const spokenWords = normalize(speech).split(/\s+/).filter(Boolean);
    const currentExpectedWord = wordsRef.current[wordIndexRef.current];
    if (shouldIgnoreSpeech(spokenWords, currentExpectedWord)) return;

    let errorFound = false;
    let nextError = null;

    setWords((previousWords) => {
      const nextWords = [...previousWords];
      let wordIndex = wordIndexRef.current;

      for (const spokenWord of spokenWords) {
        if (wordIndex >= nextWords.length || errorFound) break;

        const currentWord = nextWords[wordIndex];
        const currentSimilarity = similarity(currentWord.normalized, spokenWord);

        if (currentSimilarity >= SIM_THRESHOLD) {
          nextWords[wordIndex] = { ...currentWord, status: 'correct' };
          wordIndex += 1;
          continue;
        }

        const lookaheadWord = nextWords[wordIndex + 1];
        if (lookaheadWord && similarity(lookaheadWord.normalized, spokenWord) >= SIM_THRESHOLD) {
          nextWords[wordIndex] = { ...currentWord, status: 'error' };
          nextWords[wordIndex + 1] = { ...lookaheadWord, status: 'correct' };
          nextError = {
            text: currentWord.text,
            normalized: currentWord.normalized,
            index: wordIndex,
          };
          errorFound = true;
          wordIndex += 2;
          break;
        }

        nextWords[wordIndex] = { ...currentWord, status: 'error' };
        nextError = {
          text: currentWord.text,
          normalized: currentWord.normalized,
          index: wordIndex,
        };
        errorFound = true;
      }

      wordIndexRef.current = wordIndex;
      wordsRef.current = nextWords;
      setMasteryScore(calcScore(nextWords));

      if (wordIndex >= nextWords.length) {
        shouldListenRef.current = false;
        setPhase('complete');
        phaseRef.current = 'complete';
        setLiveTranscript('');
        stopRecognition({ manual: false, clearIntent: true });
      }

      return nextWords;
    });

    if (!errorFound || !nextError) return;

    stopRecognition({ manual: false });
    triggerHaptic();
    setLiveTranscript('');
    onError?.(nextError.text);
    startCorrectionDrill(nextError, nextError.index);
  }, [calcScore, onError, shouldIgnoreSpeech, startCorrectionDrill, stopRecognition, triggerHaptic]);

  const handleLinkingSpeech = useCallback((speech) => {
    if (phaseRef.current !== 'linking' || !linkWord) return;

    const spokenWord = normalize(speech.trim().split(/\s+/).pop() || speech);
    const expectedWord = { normalized: normalize(linkWord) };
    if (shouldIgnoreSpeech([spokenWord], expectedWord)) return;

    if (similarity(expectedWord.normalized, spokenWord) < SIM_THRESHOLD) return;

    stopRecognition({ manual: false });
    setLiveTranscript('');
    setPhase('reciting');
    phaseRef.current = 'reciting';
  }, [linkWord, shouldIgnoreSpeech, stopRecognition]);

  const handleRecognitionResult = useCallback((mode, event) => {
    let interimTranscript = '';
    const finalChunks = [];

    for (let resultIndex = event.resultIndex; resultIndex < event.results.length; resultIndex += 1) {
      const transcript = event.results[resultIndex][0]?.transcript?.trim();
      if (!transcript) continue;

      if (event.results[resultIndex].isFinal) {
        finalChunks.push(transcript);
      } else {
        interimTranscript += `${transcript} `;
      }
    }

    setLiveTranscript(interimTranscript.trim());

    for (const finalChunk of finalChunks) {
      const normalizedChunk = normalize(finalChunk);
      const now = Date.now();

      if (!normalizedChunk) continue;

      if (
        lastFinalChunkRef.current === normalizedChunk &&
        now - lastFinalChunkAtRef.current < DUPLICATE_FINAL_WINDOW_MS
      ) {
        continue;
      }

      lastFinalChunkRef.current = normalizedChunk;
      lastFinalChunkAtRef.current = now;

      if (mode === 'linking') {
        handleLinkingSpeech(finalChunk);
        continue;
      }

      if (mode === 'correction') {
        handleCorrectionSpeech(finalChunk);
        continue;
      }

      processChunk(finalChunk);
    }

    if (finalChunks.length) {
      setLiveTranscript('');
    }
  }, [handleCorrectionSpeech, handleLinkingSpeech, processChunk]);

  const startRecognition = useCallback((mode) => {
    const SpeechRecognition = getSpeechConstructor();

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser.');
      shouldListenRef.current = false;
      return;
    }

    clearRestartTimer();
    setRecognitionError(null);
    manualStopRef.current = false;
    shouldListenRef.current = true;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop races while we replace the recognizer instance.
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => handleRecognitionResult(mode, event);

    recognition.onerror = (event) => {
      if (event.error === 'aborted' && manualStopRef.current) {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        manualStopRef.current = true;
      }

      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setRecognitionError(event.error);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current && recognitionRef.current !== recognition) {
        return;
      }

      recognitionRef.current = null;

      if (!shouldListenRef.current || manualStopRef.current) {
        return;
      }

      if (phaseRef.current === 'idle' || phaseRef.current === 'complete') {
        return;
      }

      clearRestartTimer();
      restartTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current || phaseRef.current === 'idle' || phaseRef.current === 'complete') {
          return;
        }

        if (phaseRef.current === 'linking') {
          startRecognition('linking');
          return;
        }

        if (phaseRef.current === 'correction') {
          startRecognition('correction');
          return;
        }

        startRecognition('reciting');
      }, RESTART_DELAY_MS);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [clearRestartTimer, handleRecognitionResult]);

  const syncRecognizerToPhase = useCallback(() => {
    if (phaseRef.current === 'linking') {
      startRecognition('linking');
      return;
    }

    if (phaseRef.current === 'correction') {
      startRecognition('correction');
      return;
    }

    if (phaseRef.current === 'reciting') {
      startRecognition('reciting');
    }
  }, [startRecognition]);

  const startSession = useCallback(() => {
    if (!wordsRef.current.length) return;

    setRecognitionError(null);
    setLiveTranscript('');
    shouldListenRef.current = true;
    manualStopRef.current = false;

    if (linkWord) {
      setPhase('linking');
      phaseRef.current = 'linking';
    } else {
      setPhase('reciting');
      phaseRef.current = 'reciting';
    }
  }, [linkWord]);

  const stopSession = useCallback(() => {
    shouldListenRef.current = false;
    setLiveTranscript('');
    stopRecognition({ manual: true, clearIntent: true });

    if (phaseRef.current !== 'complete') {
      setPhase('idle');
      phaseRef.current = 'idle';
    }
  }, [stopRecognition]);

  const resetSession = useCallback(() => {
    shouldListenRef.current = false;
    manualStopRef.current = true;
    correctionRepsRef.current = 0;
    errorIndexRef.current = -1;
    errorWordRef.current = null;
    wordIndexRef.current = 0;
    lastFinalChunkRef.current = '';
    lastFinalChunkAtRef.current = 0;
    setLiveTranscript('');
    stopRecognition({ manual: true, clearIntent: true });
    setPhase('idle');
    phaseRef.current = 'idle';
    setErrorWord(null);
    setCorrectionReps(0);
    setMasteryScore(0);
    setRecognitionError(null);
    setWords((previousWords) => {
      const nextWords = previousWords.map((word) => ({ ...word, status: 'pending' }));
      wordsRef.current = nextWords;
      return nextWords;
    });
  }, [stopRecognition]);

  useEffect(() => {
    if (!targetVerses.length) {
      setWords([]);
      wordsRef.current = [];
      return undefined;
    }

    const nextWords = targetVerses
      .flatMap((verse) => verse.text.trim().split(/\s+/).filter(Boolean))
      .map((word) => ({ text: word, normalized: normalize(word), status: 'pending' }));

    shouldListenRef.current = false;
    manualStopRef.current = true;
    clearRestartTimer();
    stopRecognition({ manual: true, clearIntent: true });

    setWords(nextWords);
    wordsRef.current = nextWords;
    setMasteryScore(0);
    setErrorWord(null);
    setCorrectionReps(0);
    setRecognitionError(null);
    setLiveTranscript('');
    setPhase('idle');
    phaseRef.current = 'idle';
    wordIndexRef.current = 0;
    correctionRepsRef.current = 0;
    errorIndexRef.current = -1;
    errorWordRef.current = null;
    lastFinalChunkRef.current = '';
    lastFinalChunkAtRef.current = 0;

    return () => {
      shouldListenRef.current = false;
      clearRestartTimer();
      stopRecognition({ manual: true, clearIntent: true });
    };
  }, [clearRestartTimer, stopRecognition, targetVerses]);

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    if (!shouldListenRef.current) return;
    if (phase === 'idle' || phase === 'complete') return;

    syncRecognizerToPhase();
  }, [phase, syncRecognizerToPhase]);

  useEffect(() => () => {
    shouldListenRef.current = false;
    clearRestartTimer();
    stopRecognition({ manual: true, clearIntent: true });
  }, [clearRestartTimer, stopRecognition]);

  return {
    phase,
    words,
    masteryScore,
    errorWord,
    correctionReps,
    correctionRepsRequired: CORRECTION_REPS_REQUIRED,
    linkWord,
    recognitionError,
    liveTranscript,
    isActive: phase === 'reciting' || phase === 'linking' || phase === 'correction',
    startSession,
    stopSession,
    resetSession,
  };
};

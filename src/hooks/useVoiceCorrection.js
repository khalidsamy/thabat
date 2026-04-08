import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Real-time Quranic recitation engine.
 * Handles normalization and word-level diffing between speech and target text.
 * Optimized for Arabic STT nuances (simplified text vs. Quranic diacritics).
 */
export const useVoiceCorrection = (targetVerses = [], _onComplete) => {
  // --- STATE ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [matches, setMatches] = useState([]); 
  const [masteryScore, setMasteryScore] = useState(0);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const recognitionRef = useRef(null);

  // --- UTILS ---

  /**
   * Compares two strings using Levenshtein distance.
   * Essential for STT which might return slightly different spellings for the same tajweed.
   */
  const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
  };

  const getSimilarity = (a, b) => {
      if (!a || !b) return 0;
      if (a === b) return 1;
      const distance = getLevenshteinDistance(a, b);
      return 1 - distance / Math.max(a.length, b.length);
  };

  /**
   * Normalizes Arabic text for comparison.
   * Strips diacritics (Harakaat) and Quranic symbols as WebSpeech API 
   * returns basic Uthmani or simplified text without these markers.
   */
  const normalize = useCallback((str) => {
    if (!str) return "";
    return str
      // Remove Harakaat, diacritics, and Quranic punctuation marks
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
      // Normalize Letter variations to simplify matching
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  // --- ENGINE ---

  useEffect(() => {
    if (targetVerses.length > 0) {
      const allWords = targetVerses.flatMap(v => v.text.split(/\s+/)).filter(w => w.length > 0);
      setMatches(allWords.map(w => ({ text: w, status: 'pending', normalized: normalize(w) })));
      setTranscript('');
      setInterimTranscript('');
      setMasteryScore(0);
      setCurrentIndex(0);
    }
    return () => stopListening();
  }, [targetVerses, normalize]);

  /**
   * Core diffing logic. 
   * Checks the transcript against the target 'matches'.
   * Allows for 1-word skip detection to handle common recitation hiccups.
   */
  const updateMatches = useCallback((finalSpeech, onError) => {
    const speechWords = normalize(finalSpeech).split(/\s+/).filter(w => w.length > 0);
    let errorDetected = false;
    
    setMatches(prev => {
      const updated = [...prev];
      const threshold = 0.72; // Optimized for Arabic speech ambiguity
      let localIndex = currentIndex;
      
      speechWords.forEach(sWord => {
        if (localIndex >= updated.length || errorDetected) return;

        const targetWordNormalized = updated[localIndex].normalized;
        const currentSim = getSimilarity(targetWordNormalized, sWord);
        
        if (currentSim >= threshold) {
            updated[localIndex].status = 'correct';
            localIndex++;
        } else {
            // Check next word for single skip error detection
            const nextIdx = localIndex + 1;
            if (nextIdx < updated.length) {
                const nextSim = getSimilarity(updated[nextIdx].normalized, sWord);
                if (nextSim >= threshold) {
                    updated[localIndex].status = 'wrong';
                    updated[nextIdx].status = 'correct';
                    errorDetected = true;
                    if ('vibrate' in navigator) navigator.vibrate(300); 
                    if (onError) onError(updated[localIndex].text);
                    localIndex = nextIdx + 1;
                } else {
                    updated[localIndex].status = 'wrong';
                    errorDetected = true;
                    if ('vibrate' in navigator) navigator.vibrate(300);
                    if (onError) onError(updated[localIndex].text);
                }
            } else {
                updated[localIndex].status = 'wrong';
                errorDetected = true;
                if ('vibrate' in navigator) navigator.vibrate(300);
                if (onError) onError(updated[localIndex].text);
            }
        }
      });
      
      setCurrentIndex(localIndex);
      const score = Math.round((updated.filter(m => m.status === 'correct').length / updated.length) * 100);
      setMasteryScore(score);
      return updated;
    });

    return errorDetected;
  }, [normalize, currentIndex]);

  // --- CONTROLS ---

  const startListening = useCallback((onWordError) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => setError(event.error);
    
    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = transcript;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const speech = event.results[i][0].transcript;
          finalText += speech + ' ';
          const hasError = updateMatches(speech, onWordError);
          if (hasError) {
              recognition.stop();
              return; // Terminate recognition on error to prevent cascading fails
          }
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalText);
      setInterimTranscript(interimText);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [transcript, updateMatches]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetCorrection = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setMasteryScore(0);
    const allWords = targetVerses.flatMap(v => v.text.split(/\s+/)).filter(w => w.length > 0);
    setMatches(allWords.map(w => ({ text: w, status: 'pending', normalized: normalize(w) })));
  }, [targetVerses, normalize]);

  return { 
    isListening, 
    transcript: transcript + interimTranscript, 
    matches, 
    masteryScore, 
    error, 
    startListening, 
    stopListening, 
    resetCorrection 
  };
};

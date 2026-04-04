import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Real-time Quranic recitation feedback hook.
 * Handles normalization and word-level diffing between speech and target text.
 */
export const useVoiceCorrection = (targetVerses = [], onComplete) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [matches, setMatches] = useState([]); // Array of { text: string, status: 'correct' | 'wrong' | 'pending' }
  const [masteryScore, setMasteryScore] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

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

  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize Arabic text to ensure consistent STT vs Script comparisons
  const normalize = useCallback((str) => {
    if (!str) return "";
    return str
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
      // Standardize Alef, Yaa, Hamza, and Teh Marbuta variations
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .trim();
  }, []);

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

  const updateMatches = useCallback((finalSpeech, onError) => {
    const speechWords = normalize(finalSpeech).split(/\s+/).filter(w => w.length > 0);
    
    let errorDetected = false;
    
    setMatches(prev => {
      const updated = [...prev];
      const threshold = 0.8; // 80% Similarity Threshold
      let localIndex = currentIndex;
      
      speechWords.forEach(sWord => {
        if (localIndex >= updated.length || errorDetected) return;

        // 1. Try to match the CURRENT word
        const currentSim = getSimilarity(updated[localIndex].normalized, sWord);
        
        if (currentSim >= threshold) {
            updated[localIndex].status = 'correct';
            localIndex++;
        } else {
            // 2. Try to match the NEXT word (handle single-word skip)
            const nextIdx = localIndex + 1;
            if (nextIdx < updated.length) {
                const nextSim = getSimilarity(updated[nextIdx].normalized, sWord);
                if (nextSim >= threshold) {
                    // Mark current as 'wrong' (skipped/mistake) and next as 'correct'
                    updated[localIndex].status = 'wrong';
                    updated[nextIdx].status = 'correct';
                    errorDetected = true; // Error found
                    if (onError) onError(updated[localIndex].text); // Alert trigger
                    localIndex = nextIdx + 1;
                } else {
                    // 3. This is a clear mistake on the current word
                    updated[localIndex].status = 'wrong';
                    errorDetected = true; // Error found
                    if (onError) onError(updated[localIndex].text); // Alert trigger
                    // Stop index here - forcing repetition
                }
            } else {
                updated[localIndex].status = 'wrong';
                errorDetected = true; // Error found
                if (onError) onError(updated[localIndex].text);
            }
        }
      });
      
      setCurrentIndex(localIndex);

      const totalWords = updated.length;
      const correctCount = updated.filter(m => m.status === 'correct').length;
      const score = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
      setMasteryScore(score);

      return updated;
    });

    return errorDetected;
  }, [normalize, currentIndex]);

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
              return; // Exit stream immediately
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

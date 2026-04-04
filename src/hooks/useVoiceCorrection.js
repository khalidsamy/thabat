import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useVoiceCorrection: Advanced hook for real-time Quranic recitation feedback.
 * Normalizes Arabic text (Tashkeel stripping) and provides live word-level diffing.
 */
export const useVoiceCorrection = (targetVerses = [], onComplete) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [matches, setMatches] = useState([]); // Array of { text: string, status: 'correct' | 'wrong' | 'pending' }
  const [masteryScore, setMasteryScore] = useState(0);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  // Normalize: Strip Tashkeel, small signs, and standardize letters
  const normalize = useCallback((str) => {
    if (!str) return "";
    return str
      .replace(/[\u064B-\u0652\u06D6-\u06ED]/g, "") // Strip Tashkeel & small tajweed signs
      .replace(/[إأآٱ]/g, "ا")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[ىي]/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  // Initialize matches when target verses change
  useEffect(() => {
    if (targetVerses.length > 0) {
      const allWords = targetVerses.flatMap(v => v.text.split(/\s+/)).filter(w => w.length > 0);
      setMatches(allWords.map(w => ({ text: w, status: 'pending', normalized: normalize(w) })));
      setTranscript('');
      setInterimTranscript('');
      setMasteryScore(0);
    }
  }, [targetVerses, normalize]);

  const updateMatches = useCallback((finalSpeech) => {
    const speechWords = normalize(finalSpeech).split(/\s+/).filter(w => w.length > 0);
    
    setMatches(prev => {
      const updated = [...prev];
      let matchCount = 0;
      
      // Simple greedy matching for demonstration
      speechWords.forEach(sWord => {
        const index = updated.findIndex(m => m.status === 'pending' && m.normalized === sWord);
        if (index !== -1) {
          updated[index].status = 'correct';
        }
      });

      // Calculate score based on correct matches
      const correct = updated.filter(m => m.status === 'correct').length;
      matchCount = Math.round((correct / updated.length) * 100);
      setMasteryScore(matchCount);

      return updated;
    });
  }, [normalize]);

  const startListening = useCallback(() => {
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
          finalText += event.results[i][0].transcript + ' ';
          updateMatches(event.results[i][0].transcript);
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

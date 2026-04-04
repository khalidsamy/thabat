import { useState, useCallback, useRef } from 'react';

/**
 * useVoiceRecognition: A custom hook to handle Arabic Speech-to-Text and Fuzzy Matching.
 */
export const useVoiceRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => setError(event.error);
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
      if (onResult) onResult(result);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
  }, []);

  /**
   * compareArabic: Fuzzy Match logic that ignores Tashkeel (diacritics).
   */
  const compareArabic = (str1, str2) => {
    const normalize = (str) => {
      if (!str) return "";
      return str
        .replace(/[\u064B-\u0652]/g, "") // Remove all Tashkeel (Fatha, Damma, Kasra, etc.)
        .replace(/[إأآٱ]/g, "ا") // Normalize all Alef variations to plain Alef
        .replace(/ؤ/g, "و") // Normalize Waw with Hamza
        .replace(/ئ/g, "ي") // Normalize Ya with Hamza
        .replace(/ة/g, "ه") // Normalize Teh Marbuta to Heh
        .replace(/[ىي]/g, "ي") // Normalize Alef Maksura to Ya
        .replace(/\s+/g, " ") // Normalize multiple spaces
        .trim();
    };

    const n1 = normalize(str1);
    const n2 = normalize(str2);

    return n1 === n2;
  };

  return { isListening, transcript, error, startListening, stopListening, compareArabic };
};

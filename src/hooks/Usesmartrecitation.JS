import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../services/api';
import { generateDiffMap, calculateAccuracy } from '../utils/SpeechComparison';

/**
 * useSmartRecitation: Enhanced with Hugging Face Whisper v3
 * Replaces the flaky Web Speech API with professional-grade batch transcription.
 */
export const useSmartRecitation = ({ targetVerses = [], previousVerseText = null, onError }) => {
  const [phase, setPhase]         = useState('idle');
  const [words, setWords]         = useState([]);
  const [masteryScore, setMastery]= useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fullTargetTextRef = useRef('');

  useEffect(() => {
    if (!targetVerses.length) return;
    const text = targetVerses.map(v => v.text).join(' ');
    fullTargetTextRef.current = text;
    
    const all = text.trim().split(/\s+/).filter(Boolean).map(w => ({ 
      text: w, 
      status: 'pending' 
    }));
    
    setWords(all);
    setMastery(0);
    setPhase('idle');
    setRecognitionError(null);
  }, [targetVerses]);

  const startSession = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recitation.webm');

        try {
          const res = await api.post('/ai/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res.data.success) {
            const transcription = res.data.text;
            const diffMap = generateDiffMap(transcription, fullTargetTextRef.current);
            const score = calculateAccuracy(diffMap);

            setWords(diffMap);
            setMastery(score);
            setPhase('complete');

            if (score < 80) {
              const firstFail = diffMap.find(d => d.status === 'incorrect');
              if (firstFail && onError) onError(firstFail.word);
            }
          }
        } catch (err) {
          console.error("Transcription Failed:", err);
          setRecognitionError("Speech engine failed. Please try again.");
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setPhase('reciting');
      setRecognitionError(null);
    } catch (err) {
      console.error("Mic Access Denied:", err);
      setRecognitionError("Microphone access denied or not available.");
    }
  }, [onError]);

  const stopSession = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetSession = useCallback(() => {
    setPhase('idle');
    setMastery(0);
    setRecognitionError(null);
    setWords(prev => prev.map(w => ({ ...w, status: 'pending' })));
  }, []);

  return {
    phase,
    words,
    masteryScore,
    isProcessing,
    recognitionError,
    isActive: phase === 'reciting',
    startSession,
    stopSession,
    resetSession,
  };
};

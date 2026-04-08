/**
 * Normalizes Arabic text for baseline comparison.
 */
const normalize = (text) => {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u0652]/g, "") // Remove Tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ـ]/g, "") // Remove Tatweel
    .replace(/\s+/g, " ")
    .replace(/[^\u0621-\u064A\s]/g, "") // Keep only Arabic letters and spaces
    .trim();
};

/**
 * Compares a transcription to a target Ayah and returns a visual "Difference Map".
 * @param {string} transcribed The text returned by Whisper AI
 * @param {string} target The original Ayah text from the Quran
 * @returns {Array} Array of word objects { word: string, status: 'correct' | 'incorrect' | 'missed' }
 */
export const generateDiffMap = (transcribed, target) => {
  const normTranscribed = normalize(transcribed).split(" ");
  const normTarget = normalize(target).split(" ");
  const originalWords = target.split(" ");

  const diffMap = originalWords.map((originalWord, index) => {
    const targetWordNorm = normTarget[index];
    
    // Check if the word exists in the transcribed text around the expected position
    // (We look at neighbor indices (+/- 1) to account for slight speed variations/skips)
    const window = [index - 1, index, index + 1];
    const matchFound = window.some(pos => pos >= 0 && pos < normTranscribed.length && normTranscribed[pos] === targetWordNorm);

    if (matchFound) {
      return { text: originalWord, status: 'correct' };
    } else {
      // If the word isn't there, it's either an incorrect pronunciation or missed entirely
      return { text: originalWord, status: 'error' };
    }
  });

  return diffMap;
};

/**
 * Calculates a percentage score based on the Diff Map.
 */
export const calculateAccuracy = (diffMap) => {
  if (!diffMap || diffMap.length === 0) return 0;
  const correctCount = diffMap.filter(d => d.status === 'correct').length;
  return Math.round((correctCount / diffMap.length) * 100);
};

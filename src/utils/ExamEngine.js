import axios from 'axios';

/**
 * ExamEngine.js
 * 🎓 MISSION: SIMULATE THE INTENSITY OF A REAL HIFZ EXAM
 * 
 * Picks random verses, focusing on mid-surah ranges to test 
 * Stability (Thabat) and Linking (Al-Rabt).
 */

export const pickTestAyah = async (user) => {
  const hifz = user?.hifzStatus || { juzCount: 0, surahs: [] };
  const juzCount = hifz.juzCount || 0;
  
  if (juzCount === 0 && (!hifz.surahs || hifz.surahs.length === 0)) return null;

  try {
    // 1. Build the Juz Pool based on Memorized range
    const initialJuzs = Array.from({ length: juzCount }, (_, i) => i + 1);
    
    // 2. Challenge Mode (Pedagogical Injection)
    // If the user is currently memorizing new parts, we include the "Next Juz" 
    // to test their fresh hifz under pressure.
    if (user?.currentGoal === 'MEMORIZING_NEW' && juzCount < 30) {
      initialJuzs.push(juzCount + 1);
    }

    // Safety: ensure no duplicates and within range
    const allowedJuzs = [...new Set(initialJuzs)].filter(j => j >= 1 && j <= 30);
    const randomJuz = allowedJuzs[Math.floor(Math.random() * allowedJuzs.length)];
    
    // 3. Fetch Juz data
    const res = await axios.get(`https://api.alquran.cloud/v1/juz/${randomJuz}/quran-uthmani`);
    const ayahs = res.data.data.ayahs;
    
    if (!ayahs || ayahs.length === 0) return null;

    // Filter ayahs to test linking (avoiding surah starts)
    const eligibleAyahs = ayahs.filter(a => a.numberInSurah > 2);
    const selected = eligibleAyahs[Math.floor(Math.random() * eligibleAyahs.length)] || ayahs[Math.floor(ayahs.length / 2)];
    
    // Verification Logic (Next 3 Ayahs)
    const startIndex = ayahs.findIndex(a => a.number === selected.number);
    const verification = ayahs.slice(startIndex + 1, startIndex + 4);

    const isChallenge = randomJuz > juzCount;

    return {
      juz: randomJuz,
      rangeLabel: isChallenge 
        ? `Challenge Mode (Juz ${randomJuz})` 
        : `Memorized Range (Juz 1-${juzCount})`,
      isChallenge,
      prompt: {
        text: selected.text,
        number: selected.number,
        numberInSurah: selected.numberInSurah,
        audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${selected.number}.mp3`
      },
      surah: {
        number: selected.surah.number,
        name: selected.surah.name,
        englishName: selected.surah.englishName
      },
      verification: verification.map(a => ({
        text: a.text,
        numberInSurah: a.numberInSurah
      }))
    };
  } catch (err) {
    console.error('ExamEngine selection error:', err);
    return null;
  }
};

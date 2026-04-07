/**
 * RevisionEngine.js
 * 📖 MISSION: IMPLEMENT SHEIKH ALAA HAMED'S REVISION METHODOLOGY
 * 
 * This engine handles the dynamic calculation of revision tasks, 
 * the linking protocol (Al-Rabt), and the "3-Error Wall" logic.
 */

import api from '../services/api';
import { fetchAyah } from '../services/quranApi';

export const REVISION_PLANS = {
  JUZ_1: { id: '1_JUZ', label: '1 Juz / Day', pages: 20 },
  JUZ_2: { id: '2_JUZ', label: '2 Juz / Day', pages: 40 },
  HIZB:  { id: 'HIZB', label: '1 Hizb / Day', pages: 10 },
  RUB_EL_HIZB: { id: 'RUB_EL_HIZB', label: '1 Rub\' / Day', pages: 2.5 },
};

class RevisionEngine {
  /**
   * Calculates the current revision queue based on user progress and plan.
   * Logic: Sheikh Alaa recommends a rolling cycle through what has been memorized.
   */
  static async getDailyQueue(progress) {
    if (!progress || progress.revisionGoal === 'NONE') return null;

    const plan = Object.values(REVISION_PLANS).find(p => p.id === progress.revisionGoal) || REVISION_PLANS.HIZB;
    
    // Simple rotation logic based on the date to ensure consistency across users
    // In a real app, this might be stored in the DB as 'currentRevisionPointer'
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    const totalPagesMemorized = progress.totalMemorized || 0;
    if (totalPagesMemorized === 0) return null;

    const startPage = ((dayOfYear * plan.pages) % totalPagesMemorized) + 1;
    const endPage = Math.min(startPage + plan.pages - 1, 604);

    return {
      startPage,
      endPage,
      totalPages: Math.ceil(plan.pages),
      planLabel: plan.label
    };
  }

  /**
   * Linking Protocol (الربط):
   * Pedagogy: Before memorizing new verses, review the last 5 verses.
   */
  static async getLinkingVerses(surahNumber, currentAyahNumber) {
    const startAyah = Math.max(1, currentAyahNumber - 5);
    const verses = [];

    // Only fetch if we aren't at the very start of a surah
    if (currentAyahNumber > 1) {
      for (let i = startAyah; i < currentAyahNumber; i++) {
        try {
          const v = await fetchAyah(surahNumber, i);
          verses.push(v);
        } catch (err) {
          console.error("Linking fetch error:", err);
        }
      }
    }
    return verses;
  }

  /**
   * 3-Error Wall Logic:
   * Flags a surah as "Weak" if errors persist.
   */
  static async trackError(surahNumber, surahName) {
    try {
      const res = await api.post('/progress/report-error', { surahNumber, surahName });
      return res.data; // { success, errorCount, isWeak }
    } catch (err) {
      console.error("Error reporting failure:", err);
      return null;
    }
  }

  /**
   * Mastery Heatmap Logic:
   * Converts user history into a grid of mastery levels.
   */
  static generateHeatmapData(history = [], weakSurahs = []) {
    // 604 pages in Quran. We'll group them into 30 Juz or 60 Hizbs for the heatmap.
    const heatmap = Array.from({ length: 60 }, (_, i) => ({
      hizb: i + 1,
      status: 'none', // none, weak, solid, mastery
      intensity: 0
    }));

    // Mark weak surahs (This is a simplification, mapping surahs to hizbs)
    weakSurahs.forEach(ws => {
      // Approximation: every 10 pages is a Hizb
      const index = Math.floor((ws.surahNumber * 5) % 60); // Mock mapping
      heatmap[index].status = 'weak';
      heatmap[index].intensity = ws.errorCount;
    });

    // Mark history
    history.forEach(entry => {
        const index = Math.floor(entry.pages % 60);
        if (heatmap[index].status !== 'weak') {
            heatmap[index].status = 'solid';
            heatmap[index].intensity += 1;
        }
    });

    return heatmap;
  }

  /**
   * Gatekeeper Logic:
   * Checks if the user should be allowed to access 'Recite' (New Memorization).
   */
  static isReciteLocked(progress) {
    if (!progress) return false;
    // Lock if they have a plan but haven't finished today's revision
    return progress.revisionGoal !== 'NONE' && !progress.revisionCompletedToday;
  }
}

export default RevisionEngine;

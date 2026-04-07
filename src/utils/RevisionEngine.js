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
   * Converts user history into a nested grid (52 weeks x 7 days) of mastery levels.
   */
  static getHeatmapData(progress) {
    const history = progress?.history || [];
    const weakSurahs = progress?.weakSurahs || [];
    
    // Create a 52-week grid (GitHub style)
    // We'll calculate dates for the last 52 weeks
    const weeks = [];
    const now = new Date();
    
    // Start from the Sunday of the week 51 weeks ago
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (51 * 7 + now.getDay()));
    startDate.setHours(0, 0, 0, 0);

    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7 + d));
        
        // Find if any history entry matches this date
        const dateStr = currentDate.toISOString().split('T')[0];
        const entry = history.find(h => {
          const hDate = new Date(h.date).toISOString().split('T')[0];
          return hDate === dateStr;
        });

        // Calculate score (0 to 1)
        // In a real app, this would be based on pages/mastery
        let score = entry ? Math.min(entry.pages / 20, 1) : 0;
        
        // Boost score if they have many pages or weak surahs were cleared (simplified)
        if (score > 0 && score < 1) score += 0.2;

        week.push({
          date: dateStr,
          score: Math.min(score, 1)
        });
      }
      weeks.push(week);
    }

    return weeks;
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

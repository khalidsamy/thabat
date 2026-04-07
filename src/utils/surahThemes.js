/**
 * surahThemes.js
 * 📖 THEMATIC MAP DATA (Maqasid al-Suwar)
 * Based on: Al-Mukhtasar in Tafsir & trusted Maqasid sources.
 */

export const SURAH_THEMES = {
    1: { // Al-Fatiha
        objectiveAr: "تحقيق العبودية لله وحده",
        objectiveEn: "Realization of true worship for Allah alone",
        sections: [
            { id: 1, ar: "الثناء والتمجيد", en: "Praise & Glorification", range: "1-4" },
            { id: 2, ar: "إفراد الله بالاستعانة", en: "Exclusive Reliance", range: "5" },
            { id: 3, ar: "طلب الهداية", en: "Seeking Guidance", range: "6-7" }
        ]
    },
    2: { // Al-Baqara
        objectiveAr: "إعداد الأمة لعمارة الأرض وفق منهج الله",
        objectiveEn: "Preparing the Ummah for vicegerency according to Allah's law",
        sections: [
            { id: 1, ar: "أصناف الناس وموقفهم من الكتاب", en: "Types of People & the Quran", range: "1-20" },
            { id: 2, ar: "دعوة الناس كافة لعبادة الله وذكر نعمته", en: "Universal Call to Worship", range: "21-39" },
            { id: 3, ar: "قصة بني إسرائيل: التحذير من مخالفة المنهج", en: "Story of Children of Israel", range: "40-123" },
            { id: 4, ar: "بناء البيت ونشأة الأمة الإسلامية", en: "Building the House (Ibrahim)", range: "124-141" },
            { id: 5, ar: "تحويل القبلة والوسطية", en: "Changing the Qibla", range: "142-167" },
            { id: 6, ar: "تفصيل التشريعات وحسن الامتثال", en: "Legislation & Obedience", range: "168-214" },
            { id: 7, ar: "الجهاد، الإنفاق، والربا", en: "Jihad, Spending, & Interest", range: "215-283" },
            { id: 8, ar: "الخاتمة: الاستجابة والدعاء", en: "Conclusion: Prayer & Covenant", range: "284-286" }
        ]
    },
    3: { // Al-Imran
        objectiveAr: "الثبات على المنهج بعد وضوحه",
        objectiveEn: "Steadfastness on the Path after clarity",
        sections: [
            { id: 1, ar: "عقيدة التوحيد ومواجهة الشبهات", en: "Tawhid & Responding to Doubts", range: "1-32" },
            { id: 2, ar: "قصة مريم وزكريا وعيسى عليه السلام", en: "Stories of Maryam & Isa", range: "33-63" },
            { id: 3, ar: "مجادلة أهل الكتاب ودعوتهم للحق", en: "Debate with People of the Book", range: "64-101" },
            { id: 4, ar: "الأمر بالتقوى والوحدة واجتناب الفرقة", en: "Unity & Taqwa", range: "102-120" },
            { id: 5, ar: "غزوة أحد: الدروس والعبر", en: "Lessons from Uhud", range: "121-175" },
            { id: 6, ar: "خاتمة السورة: التفكر والابتلاء", en: "Reflection & Trial", range: "176-200" }
        ]
    }
};

/**
 * Helper to get theme by Surah number
 */
export const getSurahTheme = (number) => SURAH_THEMES[number] || null;

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
            { id: 4, ar: "الأمر بالتقوى والوحدة واجتها الفرقة", en: "Unity & Taqwa", range: "102-120" },
            { id: 5, ar: "غزوة أحد: الدروس والعبر", en: "Lessons from Uhud", range: "121-175" },
            { id: 6, ar: "خاتمة السورة: التفكر والابتلاء", en: "Reflection & Trial", range: "176-200" }
        ]
    },
    4: { // An-Nisa
        objectiveAr: "إرساء قيم العدل والرحمة بالمستضعفين",
        objectiveEn: "Establishing Justice & Compassion for the Vulnerable",
        sections: [
            { id: 1, ar: "حقوق الضعفاء خاصة اليتامى والنساء", en: "Rights of Orphans & Women", range: "1-35" },
            { id: 2, ar: "طاعة الله والرسول والتحكيم للشرع", en: "Obedience & Legal Arbitration", range: "36-104" },
            { id: 3, ar: "مواجهة مكر أهل الكتاب والمنافقين", en: "Facing the plots of Hypocrites", range: "105-147" },
            { id: 4, ar: "بيان ضلال أهل الكتاب وشهادة الشهود", en: "Errors of People of the Book", range: "148-176" }
        ]
    },
    5: { // Al-Ma'ida
        objectiveAr: "الوفاء بالعهود والعقود",
        objectiveEn: "Fulfillment of Covenants & Contracts",
        sections: [
            { id: 1, ar: "أحكام الأطعمة والذبائح والطهور", en: "Rulings on Food & Purity", range: "1-6" },
            { id: 2, ar: "وجوب العدل والوفاء بالميثاق", en: "Obligation of Justice", range: "7-11" },
            { id: 3, ar: "قصة ابني آدم وسفك الدماء", en: "Story of Adam's two sons", range: "12-40" },
            { id: 4, ar: "بيان أحكام أهل الكتاب والمحاكمات", en: "Rulings for People of the Book", range: "41-86" },
            { id: 5, ar: "أحكام الصيد وكفارة الأيمان والخمر", en: "Hunting, Oaths, & Alcohol", range: "87-108" },
            { id: 6, ar: "قصة المائدة وشهادة عيسى عليه السلام", en: "The Table (Ma'ida) & Isa's Witness", range: "109-120" }
        ]
    },
    6: { // Al-An'am
        objectiveAr: "تقرير عقيدة التوحيد بالحجة والبرهان",
        objectiveEn: "Establishing Monotheism via Logical Proofs",
        sections: [
            { id: 1, ar: "بديع صنع الله واستحقاقه للعبودية", en: "Proofs from Creation", range: "1-90" },
            { id: 2, ar: "مجلة المشركين حول الأرزاق والأنعام", en: "Debates with Polytheists", range: "91-150" },
            { id: 3, ar: "الوصايا العشر والخاتمة", en: "The Ten Commandments & Conclusion", range: "151-165" }
        ]
    },
    78: { // An-Naba'
        objectiveAr: "إثبات عقيدة البعث والجزاء",
        objectiveEn: "Proving Resurrection and Reckoning",
        sections: [
            { id: 1, ar: "التساؤل عن الخبر العظيم", en: "Inquiry about the Great News", range: "1-5" },
            { id: 2, ar: "دلائل قدرة الله في الكون", en: "Proofs in the Universe", range: "6-16" },
            { id: 3, ar: "يوم الفصل وأهواله", en: "Day of Decision & its Terrors", range: "17-30" },
            { id: 4, ar: "جزاء المتقين ومآل الكافرين", en: "Reckoning of Righteous & Wicked", range: "31-40" }
        ]
    },
    79: { // An-Nazi'at
        objectiveAr: "التذكير بالساعة وعلاماتها",
        objectiveEn: "Reminder of the Final Hour & its Signs",
        sections: [
            { id: 1, ar: "قسم بالملائكة على وقوع البعث", en: "Oath by Angels of Resurrection", range: "1-14" },
            { id: 2, ar: "قصة موسى وفضل عاقبة الطغيان", en: "Story of Musa & Pharaoh", range: "15-26" },
            { id: 3, ar: "تذليل الأرض وبناء السماء", en: "Creation of Heaven & Earth", range: "27-33" },
            { id: 4, ar: "الطامة الكبرى وفوز الخائفين", en: "The Greatest Calamity", range: "34-46" }
        ]
    },
    80: { // Abasa
        objectiveAr: "بيان حقارة الدنيا وقيمة الهداية",
        objectiveEn: "Worthlessness of Dunya vs. Value of Guidance",
        sections: [
            { id: 1, ar: "قصة ابن أم مكتوم والعتاب اللطيف", en: "Story of Ibn Umm Maktum", range: "1-16" },
            { id: 2, ar: "جحود الإنسان ونعم الله عليه", en: "Ingratitude for Divine Favors", range: "17-32" },
            { id: 3, ar: "أهوال الصاخة وفرار الإنسان", en: "The Deafening Blast", range: "33-42" }
        ]
    },
    112: { // Al-Ikhlas
        objectiveAr: "تجريد التوحيد لله",
        objectiveEn: "Purity of Monotheism for Allah",
        sections: [
            { id: 1, ar: "وحدانية الله وصفاته", en: "Uniqueness of Allah & Attributes", range: "1-4" }
        ]
    },
    113: { // Al-Falaq
        objectiveAr: "الاستعاذة من الشرور الخارجية",
        objectiveEn: "Seeking Refuge from External Evils",
        sections: [
            { id: 1, ar: "الاستعاذة برب الفلق", en: "Refuge in the Lord of Daybreak", range: "1-5" }
        ]
    },
    114: { // An-Nas
        objectiveAr: "الاستعاذة من الشرور الخفية",
        objectiveEn: "Seeking Refuge from Internal Evils",
        sections: [
            { id: 1, ar: "الاستعاذة بالملك الحق", en: "Refuge in the True King", range: "1-6" }
        ]
    }
};


/**
 * Helper to get theme by Surah number
 */
export const getSurahTheme = (number) => SURAH_THEMES[number] || null;

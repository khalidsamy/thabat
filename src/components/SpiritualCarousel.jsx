import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

const ITEMS = [
  {
    arabic: "«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»",
    reference: "صحيح البخاري",
    english: "\"The best of you are those who learn the Quran and teach it.\"",
  },
  {
    arabic: "«اقْرَأُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ»",
    reference: "صحيح مسلم",
    english: "\"Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection.\"",
  },
  {
    arabic: "﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ﴾",
    reference: "سورة القمر — الآية ١٧",
    english: "\"And We have certainly made the Quran easy for remembrance, so is there any who will remember?\"",
  },
  {
    arabic: "«الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ مَاهِرٌ بِهِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ»",
    reference: "متفق عليه",
    english: "\"One who is proficient in the Quran is with the noble, righteous, and honorable scribes.\"",
  },
  {
    arabic: "﴿إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ﴾",
    reference: "سورة الحجر — الآية ٩",
    english: "\"Indeed, it is We who sent down the message [i.e., the Quran], and indeed, We will be its guardian.\"",
  },
];

const SpiritualCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ITEMS.length);
    }, 8000); // 8 seconds per slide for peaceful reading
    return () => clearInterval(interval);
  }, []);

  const item = ITEMS[current];

  return (
    <div className="w-full relative overflow-hidden glass-card dark:glass-card rounded-2xl p-6 mb-8 min-h-[160px] flex flex-col justify-center transition-all duration-500 ease-in-out border border-emerald-500/10 dark:border-emerald-500/20">
      {/* Decorative Background Quote Icon */}
      <Quote className="absolute -top-4 -right-4 h-32 w-32 text-emerald-500/5 dark:text-emerald-500/5 rotate-12 -z-10" />
      
      <div className="text-center transition-opacity duration-1000">
        <p 
          className="text-xl md:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2 leading-relaxed" 
          dir="rtl"
        >
          {item.arabic}
        </p>
        
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-500/80 mb-3 tracking-wider" dir="rtl">
          — {item.reference}
        </p>
        
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic opacity-80 leading-snug">
          {item.english}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 mt-5">
        {ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-emerald-500' : 'w-1.5 bg-emerald-200 dark:bg-emerald-900/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SpiritualCarousel;

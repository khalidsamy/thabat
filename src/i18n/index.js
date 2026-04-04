import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en.json';
import arTranslation from './ar.json';

const savedLang = localStorage.getItem('thabat_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ar: { translation: arTranslation }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React effectively escapes everything natively!
    }
  });

// Set the physical DOM direction universally ensuring initial flip accuracy.
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLang;

// Rigorous interceptor explicitly mapping UI direction switches automatically
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('thabat_lang', lng);
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;

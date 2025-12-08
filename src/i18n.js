// This file configures the internationalization (i18n) settings for the application.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// These import the translation JSON files for Finnish and Swedish.
import fi from './locales/fi/translation.json';
import sv from './locales/sv/translation.json';
// This object holds all the translation files, organized by language code.
const resources = {
  fi: {
    translation: fi,
  },
  sv: {
    translation: sv,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources, // The translation resources.
    lng: localStorage.getItem('language') || 'fi', // Sets the initial language, prioritizing a saved language from local storage or defaulting to Finnish ('fi').
    fallbackLng: 'fi', // The language to use if a translation is missing for the current language.
    interpolation: {
      escapeValue: false, // React already safeguards against XSS attacks.
    },
  });
// The configured i18n instance is exported for use throughout the application.
export default i18n;

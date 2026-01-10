import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enMedical from './locales/en/medical.json';
import enYoga from './locales/en/yoga.json';
import enHealth from './locales/en/health.json';
import enPages from './locales/en/pages.json';

// Import Hindi translations
import hiCommon from './locales/hi/common.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiMedical from './locales/hi/medical.json';
import hiYoga from './locales/hi/yoga.json';
import hiHealth from './locales/hi/health.json';
import hiPages from './locales/hi/pages.json';

// Import Marathi translations
import mrCommon from './locales/mr/common.json';
import mrDashboard from './locales/mr/dashboard.json';
import mrMedical from './locales/mr/medical.json';
import mrYoga from './locales/mr/yoga.json';
import mrHealth from './locales/mr/health.json';
import mrPages from './locales/mr/pages.json';

// Import Tamil translations
import taCommon from './locales/ta/common.json';
import taDashboard from './locales/ta/dashboard.json';
import taMedical from './locales/ta/medical.json';
import taYoga from './locales/ta/yoga.json';
import taHealth from './locales/ta/health.json';
import taPages from './locales/ta/pages.json';

const resources = {
    en: {
        common: enCommon,
        dashboard: enDashboard,
        medical: enMedical,
        yoga: enYoga,
        health: enHealth,
        pages: enPages
    },
    hi: {
        common: hiCommon,
        dashboard: hiDashboard,
        medical: hiMedical,
        yoga: hiYoga,
        health: hiHealth,
        pages: hiPages
    },
    mr: {
        common: mrCommon,
        dashboard: mrDashboard,
        medical: mrMedical,
        yoga: mrYoga,
        health: mrHealth,
        pages: mrPages
    },
    ta: {
        common: taCommon,
        dashboard: taDashboard,
        medical: taMedical,
        yoga: taYoga,
        health: taHealth,
        pages: taPages
    }
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Fallback language
        defaultNS: 'common', // Default namespace
        ns: ['common', 'dashboard', 'medical', 'yoga', 'health', 'pages'],

        detection: {
            // Order of language detection
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        },

        interpolation: {
            escapeValue: false // React already escapes values
        },

        react: {
            useSuspense: false // Disable suspense for now
        }
    });

export default i18n;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(() => {
        // Use i18next predicted language or fallback to localStorage/Hindi
        return i18n.language || localStorage.getItem('i18nextLng') || 'hi';
    });

    useEffect(() => {
        // Get initial language from i18n
        if (i18n.language && i18n.language !== language) {
            setLanguage(i18n.language);
        }
    }, [i18n.language]);

    useEffect(() => {
        // Save language preference to localStorage (i18next does this too, but let's be safe)
        localStorage.setItem('i18nextLng', language);
        // Sync with i18next instance if needed
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }

        // Update HTML lang attribute
        const langMap = {
            'hi': 'hi-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'en': 'en-US'
        };
        document.documentElement.lang = langMap[language] || 'en-US';
    }, [language, i18n]);

    const toggleLanguage = () => {
        // Cycle through languages: en -> hi -> mr -> ta -> en
        const langs = ['en', 'hi', 'mr', 'ta'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        const nextLang = langs[nextIndex];
        setLanguage(nextLang);
        i18n.changeLanguage(nextLang);
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const value = {
        language,
        changeLanguage,
        toggleLanguage,
        isHindi: language === 'hi',
        isEnglish: language === 'en',
        isMarathi: language === 'mr',
        isTamil: language === 'ta'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

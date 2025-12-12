import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get language from localStorage or default to Hindi
        return localStorage.getItem('language') || 'hi';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('language', language);
        // Update HTML lang attribute
        const langMap = {
            'hi': 'hi-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'en': 'en-US'
        };
        document.documentElement.lang = langMap[language] || 'en-US';
    }, [language]);

    const toggleLanguage = () => {
        // Cycle through languages: en -> hi -> mr -> ta -> en
        const langs = ['en', 'hi', 'mr', 'ta'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        setLanguage(langs[nextIndex]);
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
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

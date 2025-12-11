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
        document.documentElement.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'hi' ? 'en' : 'hi');
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        isHindi: language === 'hi',
        isEnglish: language === 'en'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            className="language-switcher"
            onClick={toggleLanguage}
            aria-label="Toggle Language"
        >
            <div className="language-toggle">
                <span className={`lang-option ${language === 'hi' ? 'active' : ''}`}>
                    हिं
                </span>
                <span className="lang-divider">|</span>
                <span className={`lang-option ${language === 'en' ? 'active' : ''}`}>
                    EN
                </span>
            </div>
        </button>
    );
};

export default LanguageSwitcher;

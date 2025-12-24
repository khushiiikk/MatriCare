import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Home.css'; // Reusing Home.css for basic layout

const Health = () => {
    const { language } = useLanguage();
    const t = translations[language].navbar;

    return (
        <div className="home-container">
            <header className="home-header">
                <h1 className="hero-title">{t.health}</h1>
                <p className="hero-subtitle">Health monitoring and services coming soon.</p>
            </header>
        </div>
    );
};

export default Health;

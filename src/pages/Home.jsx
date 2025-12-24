import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language].home;

    return (
        <div className="home-container">
            <h1>{t.welcome}</h1>
            <p>{t.subtitle}</p>
        </div>
    );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import FloatingRobot from '../components/FloatingRobot';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // Rotate quotes every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) =>
                (prevIndex + 1) % t.hero.quotes.length
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [t.hero.quotes.length]);

    const handleTrimesterClick = (trimester) => {
        navigate(`/trimester${trimester}`);
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text animate-slide-left">
                            <h1 className="hero-title">
                                {t.hero.title}
                                <span className="gradient-text">{t.hero.titleHighlight}</span>
                            </h1>
                            <p className="hero-description">
                                {t.hero.description}
                            </p>
                            <div className="hero-quotes">
                                <p className="rotating-quote" key={currentQuoteIndex}>
                                    {t.hero.quotes[currentQuoteIndex]}
                                </p>
                            </div>
                        </div>

                        <div className="hero-image-container animate-slide-right">
                            <div className="hero-main-image">
                                <img
                                    src="/pregnancy-mother.jpg"
                                    alt="Happy pregnant mother"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="floating-elements">
                    <div className="float-circle circle-1"></div>
                    <div className="float-circle circle-2"></div>
                    <div className="float-circle circle-3"></div>
                </div>

                {/* Wave Divider */}
                <div className="wave-divider">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            className="shape-fill"></path>
                    </svg>
                </div>
            </section>

            {/* Yoga & Exercise Section */}
            <section id="yoga-section" className="yoga-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{t.yoga.sectionTitle}</h2>
                        <p className="section-subtitle">
                            {t.yoga.sectionSubtitle}
                        </p>
                    </div>

                    <div className="trimester-grid">
                        {/* First Trimester */}
                        <div
                            className="trimester-card card hover-lift clickable-card"
                            onClick={() => handleTrimesterClick(1)}
                        >
                            <div className="trimester-image-wrapper">
                                <img
                                    src="/trimester3.png"
                                    alt={t.yoga.trimester1.title}
                                    className="trimester-img"
                                />
                            </div>
                            <div className="trimester-info gradient-mauve">
                                <h3 className="trimester-title">{t.yoga.trimester1.title}</h3>
                                <p className="trimester-weeks">{t.yoga.trimester1.weeks}</p>
                                <div className="click-indicator">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Second Trimester */}
                        <div
                            className="trimester-card card hover-lift clickable-card"
                            onClick={() => handleTrimesterClick(2)}
                        >
                            <div className="trimester-image-wrapper">
                                <img
                                    src="/trimester2.png"
                                    alt={t.yoga.trimester2.title}
                                    className="trimester-img"
                                />
                            </div>
                            <div className="trimester-info gradient-peach">
                                <h3 className="trimester-title">{t.yoga.trimester2.title}</h3>
                                <p className="trimester-weeks">{t.yoga.trimester2.weeks}</p>
                                <div className="click-indicator">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Third Trimester */}
                        <div
                            className="trimester-card card hover-lift clickable-card"
                            onClick={() => handleTrimesterClick(3)}
                        >
                            <div className="trimester-image-wrapper">
                                <img
                                    src="/trimester1.png"
                                    alt={t.yoga.trimester3.title}
                                    className="trimester-img"
                                />
                            </div>
                            <div className="trimester-info gradient-mint">
                                <h3 className="trimester-title">{t.yoga.trimester3.title}</h3>
                                <p className="trimester-weeks">{t.yoga.trimester3.weeks}</p>
                                <div className="click-indicator">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="yoga-disclaimer">
                        <p>
                            ⚠️ <strong>{t.yoga.disclaimer}</strong> {t.yoga.disclaimerText}
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta section-sm">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">{t.cta.title}</h2>
                        <p className="cta-description">
                            {t.cta.description}
                        </p>
                        <button className="btn btn-primary btn-lg">{t.cta.button}</button>
                    </div>
                </div>
            </section>
            {/* Floating Elements */}
            <FloatingRobot />
        </div>
    );
};

export default Home;

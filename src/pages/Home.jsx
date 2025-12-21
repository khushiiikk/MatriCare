import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
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

            {/* Features Section */}
            <section className="features section">
                <div className="container">
                    <div className="section-header text-center animate-fade-in">
                        <h2 className="section-title">{t.features.title}</h2>
                        {t.features.description && <p className="section-subtitle">{t.features.description}</p>}
                    </div>
                    <div className="features-grid">
                        <div className="feature-card animate-fade-in" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/yoga')}>
                            <div className="feature-icon-wrapper" style={{ background: 'var(--color-mauve-light)' }}>
                                <span className="feature-icon">🧘‍♀️</span>
                            </div>
                            <h3 className="feature-card-title">{t.features.yoga.title}</h3>
                            <p className="feature-card-description">{t.features.yoga.desc}</p>
                            <span className="feature-link">{t.features.explore} →</span>
                        </div>

                        <div className="feature-card animate-fade-in" style={{ animationDelay: '0.2s' }} onClick={() => navigate('/chatbot')}>
                            <div className="feature-icon-wrapper" style={{ background: 'var(--color-peach-dark)' }}>
                                <span className="feature-icon">🤖</span>
                            </div>
                            <h3 className="feature-card-title">{t.features.chatbot.title}</h3>
                            <p className="feature-card-description">{t.features.chatbot.desc}</p>
                            <span className="feature-link">{t.features.explore} →</span>
                        </div>

                        <div className="feature-card animate-fade-in" style={{ animationDelay: '0.3s' }} onClick={() => navigate('/analytics')}>
                            <div className="feature-icon-wrapper" style={{ background: 'var(--color-mint-dark)' }}>
                                <span className="feature-icon">📊</span>
                            </div>
                            <h3 className="feature-card-title">{t.features.health.title}</h3>
                            <p className="feature-card-description">{t.features.health.desc}</p>
                            <span className="feature-link">{t.features.explore} →</span>
                        </div>

                        <div className="feature-card animate-fade-in" style={{ animationDelay: '0.4s' }} onClick={() => navigate('/find-care')}>
                            <div className="feature-icon-wrapper" style={{ background: 'var(--color-cream-dark)' }}>
                                <span className="feature-icon">🏥</span>
                            </div>
                            <h3 className="feature-card-title">{t.features.findCare.title}</h3>
                            <p className="feature-card-description">{t.features.findCare.desc}</p>
                            <span className="feature-link">{t.features.explore} →</span>
                        </div>
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
        </div>
    );
};

export default Home;

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language].home;

    return (
        <div className="home-container">
            {/* Section 1: Hero */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <div className="hero-text-wrapper">
                        <h1 className="hero-titleFadeIn">{t.welcome}</h1>
                        <p className="hero-subtitleFadeIn">{t.subtitle}</p>
                        <div className="hero-cta">
                            <button className="primary-btn">Get Started</button>
                            <button className="secondary-btn">Learn More</button>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <img src="/pregnancy-saree.png" alt="Maternal Care" className="hero-featured-img" />
                    </div>
                </div>
            </section>

            {/* Section 2: Introduction */}
            <section className="intro-section">
                <div className="container">
                    <div className="intro-card">
                        <div className="intro-badge">About Us</div>
                        <h2 className="section-title">{t.intro.title}</h2>
                        <p className="section-desc">{t.intro.description}</p>
                    </div>
                </div>
            </section>

            {/* Section 3: Features */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title centered">{t.features.title}</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon yoga-icon">🧘</div>
                            <h3>{t.features.yoga.title}</h3>
                            <p>{t.features.yoga.desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon tracking-icon">📊</div>
                            <h3>{t.features.tracking.title}</h3>
                            <p>{t.features.tracking.desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon care-icon">🏥</div>
                            <h3>{t.features.care.title}</h3>
                            <p>{t.features.care.desc}</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon ai-icon">🤖</div>
                            <h3>{t.features.assistant.title}</h3>
                            <p>{t.features.assistant.desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Mission & Vision */}
            <section className="mission-vision-section">
                <div className="container">
                    <div className="mv-grid">
                        <div className="mv-item">
                            <div className="mv-content">
                                <h2 className="section-title">{t.about.mission.title}</h2>
                                <p className="section-desc">{t.about.mission.desc}</p>
                            </div>
                        </div>
                        <div className="mv-item">
                            <div className="mv-content">
                                <h2 className="section-title">{t.about.vision.title}</h2>
                                <p className="section-desc">{t.about.vision.desc}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

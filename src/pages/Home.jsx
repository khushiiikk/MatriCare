import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import Particles from '../components/Particles';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language].home;

    return (
        <div className="home-container">
            {/* Section 1: Hero with Organic Curve */}
            <section className="hero-section">
                <Particles />
                <div className="container hero-content">
                    <div className="hero-text-wrapper">
                        <div className="hero-tagline">WE ARE</div>
                        <h1 className="hero-titleFadeIn">SUPPORTING<br />RURAL MOTHERS</h1>
                        <p className="hero-subtitleFadeIn">
                            Providing accessible healthcare and professional guidance to women in low-resource areas across India.
                        </p>
                        <div className="hero-cta">
                            <button className="primary-btn">GET STARTED</button>
                            <button className="secondary-btn-outline">LEARN MORE</button>
                        </div>
                    </div>
                    <div className="hero-image-wrapper">
                        <img src="/mother-illustration.png" alt="Maternal Care" className="hero-featured-img" />
                    </div>
                </div>

                {/* Organic Curve Divider */}
                <div className="curve-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                    </svg>
                </div>
            </section>

            {/* Section 2: Impact Stats */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">5.7k</span>
                            <span className="stat-label">Safe Deliveries<br />Supported</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">68+</span>
                            <span className="stat-label">ASHA Centers<br />Mapped</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">13</span>
                            <span className="stat-label">States<br />Active</span>
                        </div>
                        <div className="stat-social">
                            <i className="fab fa-facebook"></i>
                            <i className="fab fa-twitter"></i>
                        </div>
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

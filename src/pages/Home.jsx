import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import SOSButton from '../components/SOSButton';
import FloatingRobot from '../components/FloatingRobot';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    // Rotate quotes every 6 seconds for better readability
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prevIndex) =>
                (prevIndex + 1) % t.hero.quotes.length
            );
        }, 6000);

        return () => clearInterval(interval);
    }, [t.hero.quotes.length]);

    const features = [
        {
            title: t.features.yoga.title,
            desc: t.features.yoga.desc,
            icon: "🧘‍♀️",
            color: "#F8BBD0", // Pinkish
            link: "/yoga"
        },
        {
            title: t.features.chatbot.title,
            desc: t.features.chatbot.desc,
            icon: "🤖",
            color: "#FFCCBC", // Peach
            link: "/chatbot"
        },
        {
            title: t.features.health.title,
            desc: t.features.health.desc,
            icon: "📊",
            color: "#B2DFDB", // Mint
            link: "/analytics"
        },
        {
            title: t.features.findCare.title,
            desc: t.features.findCare.desc,
            icon: "🏥",
            color: "#FFF9C4", // Yellow/Cream
            link: "/find-care"
        }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Your Health,<br />
                                <span className="highlight-text">Our Responsibility</span>
                            </h1>
                            <p className="hero-description">
                                Support for your pregnancy journey. Health info, yoga, and expert care in your language.
                            </p>

                            <div className="quote-box">
                                <p className="quote-text">
                                    "{t.hero.quotes[currentQuoteIndex]}"
                                </p>
                            </div>
                        </div>

                        <div className="hero-image-wrapper">
                            <div className="hero-image-circle">
                                <img src="/pregnancy-mother.jpg" alt="Mother and Baby" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title text-center">{t.features.title}</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card"
                                onClick={() => navigate(feature.link)}
                            >
                                <div className="feature-icon-box" style={{ backgroundColor: feature.color }}>
                                    <span className="feature-icon-main">{feature.icon}</span>
                                </div>
                                <h3 className="feature-card-name">{feature.title}</h3>
                                <p className="feature-card-info">{feature.desc}</p>
                                <span className="explore-btn">
                                    {t.features.explore} <span className="arrow">→</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Wave Divider */}
            <div className="wave-container">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 50C840 60 960 60 1080 50C1200 40 1320 20 1380 10L1440 0V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V30Z" fill="var(--color-peach-light)" />
                </svg>
            </div>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-inner">
                        <h2 className="cta-title">{t.cta.title}</h2>
                        <p className="cta-subtitle">{t.cta.description}</p>
                        <button className="cta-button" onClick={() => navigate('/login')}>
                            {t.cta.button}
                        </button>
                    </div>
                </div>
            </section>

            <Footer />

            {/* Floating Components */}
            <SOSButton />
            <FloatingRobot />
        </div>
    );
};

export default Home;


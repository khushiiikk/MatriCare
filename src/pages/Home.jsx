import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import Particles from '../components/Particles';
import './Home.css';

const Home = () => {
    const { language } = useLanguage();
    const t = translations[language].home;
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isSosOpen, setIsSosOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    // Quote rotation every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % t.quotes.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [t.quotes.length]);

    return (
        <div className="home-container">
            {/* Background Decorative Bubbles */}
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>

            {/* Section 1: Hero with Organic Curve */}
            <section className="hero-section">
                <Particles />
                <div className="container hero-content">
                    <div className="hero-text-wrapper">
                        <h1 className="hero-titleFadeIn">
                            <span className="title-main">{t.welcomeMain}</span>
                            <br />
                            <span className="title-accent">{t.welcomeAccent}</span>
                        </h1>
                        <p className="hero-subtitleFadeIn">{t.subtitle}</p>

                        {/* Dynamic Quote Box */}
                        <div className="hero-quote-box">
                            <p className="hero-quote-text keyframe-fade">
                                {t.quotes[currentQuoteIndex]}
                            </p>
                        </div>

                        <div className="hero-cta">
                            <button className="primary-pill">GET STARTED</button>
                            <button className="secondary-pill-outline">LEARN MORE</button>
                        </div>
                    </div>

                    <div className="hero-image-wrapper">
                        <div className="hero-img-circle-frame">
                            <img src="/mother-illustration.png" alt="Maternal Care" className="hero-featured-img" />
                        </div>
                    </div>
                </div>

                {/* Floating SOS Button with Menu */}
                <div className={`sos-fab-wrapper ${isSosOpen ? 'active' : ''}`}>
                    <div className="sos-menu">
                        <a href="tel:100" className="sos-menu-item">{t.helplines.police}</a>
                        <a href="tel:102" className="sos-menu-item">{t.helplines.ambulance}</a>
                        <a href="tel:181" className="sos-menu-item">{t.helplines.women}</a>
                    </div>
                    <div className="sos-fab" onClick={() => setIsSosOpen(!isSosOpen)}>
                        <span>SOS</span>
                    </div>
                </div>

                {/* AI Assistant Bubble toggles Chatbot */}
                <div className="ai-assistant-fab" onClick={() => setIsChatbotOpen(!isChatbotOpen)}>
                    <img src="/chatbot-girl.jpg" alt="AI Assistant" className="ai-avatar circular-fill-img" />
                    <span className="ai-label">Matri AI Assistant</span>
                </div>

                {/* Simple Chatbot Overlay */}
                {isChatbotOpen && (
                    <div className="chatbot-overlay">
                        <div className="chatbot-window">
                            <div className="chatbot-header">
                                <h3>Matri AI Assistant</h3>
                                <button className="close-btn" onClick={() => setIsChatbotOpen(false)}>×</button>
                            </div>
                            <div className="chatbot-body">
                                <p className="ai-msg">Hello! I am Matri AI. How can I help you with your pregnancy journey today?</p>
                            </div>
                            <div className="chatbot-footer">
                                <input type="text" placeholder="Type your message..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* Organic Curve Divider */}
                <div className="curve-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5V0Z" opacity=".5" className="shape-fill"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41,78.2,34.1,161.45,28.33,240.42,4.89,68.91-20.46,135-50.64,212.58-30.84V0Z" className="shape-fill"></path>
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

            {/* Section 3: What We Offer (Leaf Style) */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title-centered">{t.featuresTitle}</h2>
                    <div className="features-grid">
                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/yoga-icon.png" alt="Yoga" className="feature-image" />
                            </div>
                            <h3>{t.features.yoga.title}</h3>
                            <p>{t.features.yoga.desc}</p>
                            <button className="read-more-btn" onClick={() => navigate('/yoga')}>Read More</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/tracking-icon.png" alt="Tracker" className="feature-image" />
                            </div>
                            <h3>{t.features.tracker.title}</h3>
                            <p>{t.features.tracker.desc}</p>
                            <button className="read-more-btn" onClick={() => navigate('/health')}>Read More</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/find-care-logo.png" alt="Care" className="feature-image" />
                            </div>
                            <h3>{t.features.care.title}</h3>
                            <p>{t.features.care.desc}</p>
                            <button className="read-more-btn" onClick={() => navigate('/find-care')}>Read More</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/chatbot-girl.jpg" alt="AI Support" className="feature-image" />
                            </div>
                            <h3>{t.features.support.title}</h3>
                            <p>{t.features.support.desc}</p>
                            <button className="read-more-btn" onClick={() => setIsChatbotOpen(true)}>Read More</button>
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

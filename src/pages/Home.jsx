import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations/translations';
import Particles from '../components/Particles';
import Dashboard from './Dashboard';
import './Home.css';
import './AshaVisuals.css';

const Home = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const langT = translations[language] || translations.en;
    const t = langT.home || {};
    const aboutT = langT.about || {};
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isSosOpen, setIsSosOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    // Quote rotation every 3 seconds
    useEffect(() => {
        if (!t.quotes || t.quotes.length === 0) return;
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % t.quotes.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [t.quotes?.length]);

    const { isAuthenticated } = useAuth();

    // If logged in, show Dashboard instead of Landing Page
    if (isAuthenticated) {
        return <Dashboard />;
    }

    return (
        <div className="home-container">


            {/* Section 1: Hero */}
            <section className="hero-section">
                {/* Background Decorative Circles */}
                <div className="home-bg-circles">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                </div>

                <div className="container hero-content-v2">
                    <div className="hero-text-side">
                        <h1 className="hero-main-title">
                            <span className="title-top">{t.welcomeMain}</span>
                            <br />
                            <span className="title-bottom">{t.welcomeAccent}</span>
                        </h1>
                        <p className="hero-description">{t.subtitle}</p>

                        {/* Rotating Quote Banner */}
                        {t.quotes && t.quotes.length > 0 && (
                            <div className="home-quote-banner">
                                <div className="quote-content">
                                    <p className="quote-text">{t.quotes[currentQuoteIndex]}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hero-image-side">
                        <div className="circular-frame-large pink-glow floating">
                            <img src="/mother-final.jpg" alt="Maternal Care" className="hero-main-img" />
                        </div>
                    </div>
                </div>

                {/* Floating SOS Button with Hover Menu */}
                <div className="sos-hover-wrapper">
                    <div className="sos-menu-v2">
                        <a href="tel:100" className="sos-menu-item-v2">Police (100)</a>
                        <a href="tel:102" className="sos-menu-item-v2">Ambulance (102)</a>
                        <a href="tel:181" className="sos-menu-item-v2">Women (181)</a>
                    </div>
                    <div className="sos-fab-circular">
                        <span>SOS</span>
                    </div>
                </div>

                <div className="ai-assistant-fab-v3" onClick={() => navigate('/chatbot')}>
                    <div className="ai-fab-circle">
                        <img src="/chatbot-new.jpg" alt="AI Assistant" className="ai-fab-img-new" />
                    </div>
                    <span className="ai-fab-label-v3">AI Assistant</span>
                </div>
            </section>

            {/* Section 2: What We Offer */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title-centered">{t.featuresTitle}</h2>
                    <div className="features-grid">
                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/yoga-home-icon-new.jpg" alt="Yoga" className="feature-image" />
                            </div>
                            <h3>{t.features?.yoga?.title || 'Yoga'}</h3>
                            <button className="read-more-btn" onClick={() => navigate('/yoga')}>Open</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/health-icon-new.jpg" alt="Tracker" className="feature-image" />
                            </div>
                            <h3>{t.features?.tracker?.title || 'Tracker'}</h3>
                            <button className="read-more-btn" onClick={() => navigate('/health')}>Open</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/care-icon-new.jpg" alt="Care" className="feature-image" />
                            </div>
                            <h3>{t.features?.care?.title || 'Care'}</h3>
                            <button className="read-more-btn" onClick={() => navigate('/find-care')}>Open</button>
                        </div>

                        <div className="feature-card-leaf">
                            <div className="feature-icon-wrapper circular-fill">
                                <img src="/chatbot-new.jpg" alt="AI Support" className="feature-image" />
                            </div>
                            <h3>AI Assistant</h3>
                            <button className="read-more-btn" onClick={() => navigate('/chatbot')}>Open</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Tips Section */}
            <section className="daily-tips-section">
                <div className="container">
                    <DailyTips user={useAuth().user} />
                </div>
            </section>


        </div>
    );
};

// Internal Daily Tips Component
const DailyTips = ({ user }) => {
    const [tip, setTip] = useState(null);

    // Mock tips data (can be moved to a separate file later)
    const tipsByWeek = {
        default: { week: 'General', text: "Stay hydrated and eat balanced meals for a healthy pregnancy!" },
        4: { week: 4, text: "Take your prenatal vitamins daily, especially folic acid." },
        8: { week: 8, text: "Morning sickness? Try eating small, frequent meals." },
        12: { week: 12, text: "Time for your 12-week scan! seeing your baby is magical." },
        16: { week: 16, text: "You might start feeling 'flutters' or baby movements soon." },
        20: { week: 20, text: "Halfway there! Keep active with gentle exercises like yoga." },
        24: { week: 24, text: "Screening for gestational diabetes usually happens around now." },
        28: { week: 28, text: "Start counting kicks! Track your baby's movements daily." },
        32: { week: 32, text: "Pack your hospital bag so you're ready to go!" },
        36: { week: 36, text: "Rest as much as you can. Your body is doing hard work." },
        40: { week: 40, text: "Your due date is here! Relax and wait for labor signs." }
    };

    useEffect(() => {
        if (user && user.lmpDate) {
            const lmp = new Date(user.lmpDate);
            const today = new Date();
            const diffTime = Math.abs(today - lmp);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const currentWeek = Math.floor(diffDays / 7);

            // Find closest tip or specific week tip
            // For demo, just showing a tip based on 4-week intervals or default
            let closeWeek = Object.keys(tipsByWeek)
                .filter(w => w !== 'default')
                .reduce((prev, curr) =>
                    Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev
                );

            setTip(tipsByWeek[closeWeek] || tipsByWeek.default);
        } else {
            setTip(tipsByWeek.default);
        }
    }, [user]);

    if (!tip) return null;

    const healthTips = [
        "Include mixed nuts and seeds in your diet for essential fats.",
        "Stay active by walking for 20 minutes every morning.",
        "Drink at least 3 liters of water to stay well-hydrated.",
        "Listen to calm music to help reduce any pregnancy anxiety."
    ];
    const generalTip = healthTips[new Date().getDay() % healthTips.length];

    if (!tip) return null;

    return (
        <div className="tips-grid-yoga-style">
            <div className="daily-tip-card-yoga fade-in-up">
                <div className="tip-content-v2">
                    <h3 className="tip-title-v2">
                        {user && user.lmpDate ? `Week ${tip.week} Tip` : 'Daily Tip'}
                    </h3>
                    <p className="tip-text-v2">"{tip.text}"</p>
                </div>
            </div>

            <div className="daily-tip-card-yoga fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="tip-content-v2">
                    <h3 className="tip-title-v2">Health Tip</h3>
                    <p className="tip-text-v2">{generalTip}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;

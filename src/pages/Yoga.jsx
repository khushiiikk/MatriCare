import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Yoga.css';

const Yoga = () => {
    const { language } = useLanguage();
    const t = translations[language];
    const navigate = useNavigate();

    const handleTrimesterClick = (trimester) => {
        navigate(`/trimester${trimester}`);
    };

    return (
        <div className="yoga-page">
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
                                    src="/trimester1.png"
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
                                    src="/trimester3.png"
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
        </div>
    );
};

export default Yoga;

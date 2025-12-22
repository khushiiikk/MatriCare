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

                    <div className="yoga-illustrative-grid">
                        {/* Pregnancy Care / Trimester 1 */}
                        <div className="yoga-card-illustrative" onClick={() => handleTrimesterClick(1)}>
                            <div className="card-icon-wrapper">
                                <img src="/yoga-icon-1.png" alt="Pregnancy Care" className="card-icon" />
                            </div>
                            <h3 className="card-title">Pregnancy Care</h3>
                            <ul className="card-bullets">
                                <li>Gentle Morning Yoga</li>
                                <li>Breathing Exercises</li>
                                <li>Safe Stretching</li>
                            </ul>
                            <div className="card-link">Learn More &rarr;</div>
                        </div>

                        {/* Delivery / Trimester 2 */}
                        <div className="yoga-card-illustrative" onClick={() => handleTrimesterClick(2)}>
                            <div className="card-icon-wrapper">
                                <img src="/yoga-icon-2.png" alt="Delivery" className="card-icon" />
                            </div>
                            <h3 className="card-title">Delivery Preparation</h3>
                            <ul className="card-bullets">
                                <li>Pelvic Strength</li>
                                <li>Labor Positions</li>
                                <li>Focus & Calm</li>
                            </ul>
                            <div className="card-link">Learn More &rarr;</div>
                        </div>

                        {/* Post Delivery / Trimester 3 */}
                        <div className="yoga-card-illustrative" onClick={() => handleTrimesterClick(3)}>
                            <div className="card-icon-wrapper">
                                <img src="/yoga-icon-3.png" alt="Post Delivery" className="card-icon" />
                            </div>
                            <h3 className="card-title">Third Trimester</h3>
                            <ul className="card-bullets">
                                <li>Back Pain Relief</li>
                                <li>Deep Relaxation</li>
                                <li>Final Stretch</li>
                            </ul>
                            <div className="card-link">Learn More &rarr;</div>
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

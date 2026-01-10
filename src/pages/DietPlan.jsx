import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { dietContent } from '../data/dietContent';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './DietPlan.css';

const DietPlan = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chart');
    const { language } = useLanguage();
    const [dynamicContent, setDynamicContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDietContent = async () => {
            try {
                const docRef = doc(db, "content", "diet");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDynamicContent(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching diet content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDietContent();
    }, []);

    const content = (dynamicContent?.[language] || dietContent[language] || dietContent.en);

    return (
        <div className="diet-page-wrapper">
            {/* Background Geometric Shapes */}
            <div className="geo-shape circle-1"></div>
            <div className="geo-shape circle-2"></div>
            <div className="geo-shape square-1"></div>
            <div className="geo-shape square-2"></div>

            <div className="diet-container">
                <header className="diet-header-premium">
                    <button className="back-pill" onClick={() => navigate(-1)}>← {content.backBtn}</button>
                    <h1>{content.pageTitle} <span className="highlight">{content.pageTitleHighlight}</span></h1>
                    <p className="subtitle">{content.pageSubtitle}</p>
                </header>

                <div className="diet-tabs-modern">
                    <button
                        className={activeTab === 'chart' ? 'active' : ''}
                        onClick={() => setActiveTab('chart')}
                    >
                        {content.tab1}
                    </button>
                    <button
                        className={activeTab === 'guidelines' ? 'active' : ''}
                        onClick={() => setActiveTab('guidelines')}
                    >
                        {content.tab2}
                    </button>
                </div>

                <div className="diet-main-content">
                    {activeTab === 'chart' && (
                        <div className="chart-section animate-slide-up">
                            <div className="chart-grid">
                                {content.sevenDayPlan.map((d) => (
                                    <div key={d.day} className="day-card">
                                        <div className="day-header">
                                            <span className="day-num">{content.dayLabel} 0{d.day}</span>
                                        </div>
                                        <div className="meal-segments">
                                            <div className="segment">
                                                <label>{content.preBfast}</label>
                                                <p>{d.early}</p>
                                            </div>
                                            <div className="segment">
                                                <label>{content.breakfast}</label>
                                                <p>{d.breakfast}</p>
                                            </div>
                                            <div className="segment">
                                                <label>{content.lunch}</label>
                                                <p>{d.lunch}</p>
                                            </div>
                                            <div className="segment">
                                                <label>{content.dinner}</label>
                                                <p>{d.dinner}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'guidelines' && (
                        <div className="guidelines-section animate-fade-in">
                            <div className="guidelines-grid">
                                <div className="guide-card recommendations">
                                    <h3>{content.foodsToEmbrace}</h3>
                                    <div className="icon-list">
                                        {content.recommendedFoods.map((f, i) => (
                                            <div key={i} className="icon-item">
                                                <span className="i-box">{f.icon}</span>
                                                <div className="i-text">
                                                    <h4>{f.title}</h4>
                                                    <p>{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="guide-card avoided">
                                    <h3>{content.foodsToAvoid}</h3>
                                    <ul className="danger-list">
                                        {content.avoidList.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                    <div className="hydration-badge">
                                        {content.hydrationBadge}
                                    </div>
                                    <div className="caution-box">
                                        {content.cautionBox}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="diet-footer">
                    <p>{content.sourceText} <a href="https://www.maxhealthcare.in/blogs/indian-diet-plan-pregnancy" target="_blank" rel="noopener noreferrer">{content.sourceLink}</a></p>
                </footer>
            </div>
        </div>
    );
};

export default DietPlan;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations, getTranslation } from '../translations/translations'; // Added getTranslation import for safety
import './Dashboard.css';
import fetusImage from '../assets/baby_illustration.jpg'; // Import the new illustration

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Fallback safely for translations
    const t = translations[language]?.dashboard || translations['en'].dashboard;
    const pregnancyWeeksData = translations[language]?.pregnancyWeeks || translations['en'].pregnancyWeeks;

    // Trackers
    const [waterIntake, setWaterIntake] = useState(0);
    const userWeight = user?.weight || 61;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.userType === 'asha' || user?.role === 'asha') {
            navigate('/asha-dashboard');
            return;
        }

        const storedWater = localStorage.getItem(`water_${new Date().toDateString()}`);
        if (storedWater) setWaterIntake(parseInt(storedWater));

        if (user?.lmpDate) {
            calculatePregnancyProgress(user.lmpDate);
        } else {
            calculatePregnancyProgress(new Date().setDate(new Date().getDate() - 105)); // Mock ~15 weeks
        }
    }, [user, isAuthenticated, navigate, language]);

    const [pregnancyData, setPregnancyData] = useState({
        weeks: 0,
        days: 0,
        daysLeft: 280,
        trimester: 1,
        progressPercent: 0,
        babySize: "Avocado",
        babyWeight: "100 g",
        babyLength: "11.6 cm",
        description: "",
        dateString: "",
        edd: ""
    });

    const calculatePregnancyProgress = (lmpDateStr) => {
        const lmp = new Date(lmpDateStr);
        const today = new Date();
        const diffTime = today - lmp; // Not absolute, we want actual time passed
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Cap weeks at 40
        let weeks = Math.floor(diffDays / 7);
        let days = diffDays % 7;

        let displayWeeks = weeks;
        let displayDays = days;
        let daysLeft = 280 - diffDays;

        if (weeks > 40) {
            displayWeeks = 40;
            displayDays = 0;
            daysLeft = 0;
        }

        const progressPercent = Math.min(100, (diffDays / 280) * 100);

        let trimester = 1;
        if (weeks >= 13 && weeks <= 26) trimester = 2;
        if (weeks >= 27) trimester = 3;

        // Use data from translations file based on week number, clamped to 40
        const searchWeek = Math.min(weeks, 40);
        const dataPoint = pregnancyWeeksData.find(d => d.week === searchWeek) || pregnancyWeeksData[pregnancyWeeksData.length - 1];
        const safeData = dataPoint || { size: "Pumpkin", weight: "3.5kg", length: "51cm", desc: "Your baby has arrived or is due any moment!" };

        setPregnancyData({
            weeks: displayWeeks,
            days: displayDays,
            daysLeft: Math.max(0, daysLeft),
            trimester,
            progressPercent,
            babySize: safeData.size,
            babyWeight: safeData.weight,
            babyLength: safeData.length,
            description: safeData.desc,
            dateString: today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            edd: new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB')
        });
    };

    const handleWaterClick = () => {
        const newIntake = waterIntake + 1;
        setWaterIntake(newIntake);
        localStorage.setItem(`water_${new Date().toDateString()}`, newIntake);
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">

                {/* 1. Header (Full Width) */}
                <div className="pregnancy-term-card slide-up">
                    <div className="date-header">
                        <span>📅</span> {pregnancyData.dateString}
                    </div>

                    <div className="term-info">
                        <h2>{t?.myPregnancyTerm || 'My Pregnancy Term'}</h2>
                        <h3>{t?.trimester || 'Trimester'} {pregnancyData.trimester}: {pregnancyData.weeks} {t?.weeks || 'weeks'}, {pregnancyData.days} {t?.days || 'days'}</h3>

                        <div className="progress-container">
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${pregnancyData.progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="days-left-text">
                            {pregnancyData.daysLeft} {t?.daysLeft || 'days left'} ({t?.edd || 'EDD'} {pregnancyData.edd})
                        </div>
                    </div>
                </div>

                {/* 2. Main Professional Grid */}
                <div className="dashboard-grid">

                    {/* Left Column: Baby Hero Card */}
                    <div className="baby-section-wrapper slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="baby-card-wrapper">
                            <div className="baby-card-header">
                                BABY DEVELOPMENT
                            </div>
                            <div className="baby-content">
                                <div className="approxim-text">{t?.babySize || "Baby's approximate size:"}</div>
                                <div className="fruit-name">{pregnancyData.babySize}</div>

                                <div className="baby-visual-section">
                                    <div className="baby-illustration">
                                        <img src={fetusImage} alt="Baby Development" />
                                    </div>

                                    <div className="stats-row">
                                        <div className="metric-box">
                                            <h4>{t?.weight || 'Weight'}</h4>
                                            <span>{pregnancyData.babyWeight}</span>
                                        </div>
                                        <div className="metric-box">
                                            <h4>{t?.length || 'Length'}</h4>
                                            <span>{pregnancyData.babyLength}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="dev-info">
                                    <h4 style={{ color: 'var(--color-mauve-deep)', marginBottom: '8px' }}>{t?.whatsGoingOn || "Description"}</h4>
                                    <p style={{ fontSize: '0.95rem', color: '#555' }}>{pregnancyData.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Vitals & Tools List */}
                    <div className="actions-section-wrapper slide-up" style={{ animationDelay: '0.2s' }}>

                        {/* 2x2 Vitals Grid */}
                        <div className="vitals-row">
                            <div className="vital-item" onClick={handleWaterClick}>
                                <div className="vital-icon">
                                    💧
                                </div>
                                <span className="vital-label">{t?.water || 'Water'}<br /><strong>{waterIntake} gls</strong></span>
                            </div>

                            <div className="vital-item">
                                <div className="vital-icon">
                                    ⚖️
                                </div>
                                <span className="vital-label">{t?.motherWeight || "Weight"}<br /><strong>{userWeight} kg</strong></span>
                            </div>

                            <div className="vital-item">
                                <div className="vital-icon">
                                    😊
                                </div>
                                <span className="vital-label">{t?.mood || 'Mood'}<br /><strong>Good</strong></span>
                            </div>

                            <div className="vital-item" onClick={() => navigate('/analytics')}>
                                <div className="vital-icon">
                                    ⚡
                                </div>
                                <span className="vital-label">{t?.symptoms || 'Symptoms'}<br /><strong>Check</strong></span>
                            </div>
                        </div>

                        {/* Vertical Tools List */}
                        <div className="tools-grid">
                            <div className="tool-card" onClick={() => navigate('/analytics')}>
                                <div className="tool-icon-wrapper">📊</div>
                                <span className="tool-name">{t?.healthHub || 'Health Reports'}</span>
                            </div>

                            <div className="tool-card" onClick={() => navigate('/chatbot')}>
                                <div className="tool-icon-wrapper">🤖</div>
                                <span className="tool-name">{t?.aiChat || 'AI Assistant'}</span>
                            </div>

                            <div className="tool-card" onClick={() => navigate('/find-care')}>
                                <div className="tool-icon-wrapper">🏥</div>
                                <span className="tool-name">{t?.hospitals || 'Find Healthcare'}</span>
                            </div>

                            <div className="tool-card" onClick={() => navigate('/yoga')}>
                                <div className="tool-icon-wrapper">🧘‍♀️</div>
                                <span className="tool-name">{t?.yoga || 'Yoga & Exercise'}</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();
    const t = translations[language].dashboard; // Access dashboard translations
    const pregnancyWeeksData = translations[language].pregnancyWeeks || translations['en'].pregnancyWeeks; // Fallback to English if data missing

    // Trackers
    const [waterIntake, setWaterIntake] = useState(0);
    // Mock Data for Weight (could be user input later)
    const [weight, setWeight] = useState(61);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
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
        const diffTime = Math.abs(today - lmp);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;
        const daysLeft = 280 - diffDays;
        const progressPercent = Math.min(100, (diffDays / 280) * 100);

        let trimester = 1;
        if (weeks >= 13 && weeks <= 26) trimester = 2;
        if (weeks >= 27) trimester = 3;

        // Use data from translations file based on week number
        const dataPoint = pregnancyWeeksData.find(d => d.week === weeks) || pregnancyWeeksData[pregnancyWeeksData.length - 1];
        const safeData = dataPoint || { size: "Seed", weight: "<1g", length: "0.1cm", desc: "Growing..." };

        setPregnancyData({
            weeks,
            days,
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

                {/* Section 1: Top Status Card */}
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

                {/* Section 2: Symptoms/Vitals Row */}
                <div className="vitals-card slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="vitals-row">
                        <div className="vital-item" onClick={() => navigate('/analytics')}>
                            <div className="vital-icon" style={{ background: '#E6E4E0', color: '#3F5B67' }}>
                                ⚡
                            </div>
                            <span className="vital-label">{t?.symptoms || 'Symptoms'}</span>
                        </div>

                        <div className="vital-item" onClick={handleWaterClick}>
                            <div className="vital-icon" style={{ background: '#e1f5fe', color: '#0288d1' }}>
                                💧
                            </div>
                            <span className="vital-label">{t?.water || 'Water'} ({waterIntake})</span>
                        </div>

                        <div className="vital-item">
                            <div className="vital-icon" style={{ background: '#F1D4C6', color: '#3F5B67' }}>
                                😊
                            </div>
                            <span className="vital-label">{t?.mood || 'Mood'}</span>
                        </div>
                    </div>

                    <div className="weight-display">
                        <div className="weight-label">{t?.motherWeight || "Mother's weight"}</div>
                        <div className="weight-value">{weight} kg</div>
                    </div>
                </div>

                {/* Section 3: Baby Card (Unified) */}
                <div className="tabs-container slide-up" style={{ animationDelay: '0.2s' }}>
                    {/* Header Bar */}
                    <div className="baby-card-header" style={{ background: 'var(--color-sage)', color: 'white' }}>
                        BABY
                    </div>

                    <div className="tab-content">
                        <div className="baby-content">
                            <div className="baby-info-header">
                                <div className="approxim-text">{t?.babySize || "Baby's approximate size:"}</div>
                                <div className="fruit-name" style={{ color: 'var(--color-slate)' }}>{pregnancyData.babySize}</div>
                            </div>

                            <div className="baby-visual-section">
                                <div className="metric-box">
                                    <h4>{t?.weight || 'Weight'}:</h4>
                                    <span>{pregnancyData.babyWeight}</span>
                                </div>

                                <div className="baby-illustration" style={{ borderColor: 'var(--color-blush)' }}>
                                    {/* Cleaner Icons/Emojis */}
                                    {pregnancyData.babySize === 'Avocado' ? '🥑'
                                        : pregnancyData.babySize === 'Lemon' ? '🍋'
                                            : pregnancyData.babySize === 'Apple' ? '🍎'
                                                : pregnancyData.babySize === 'Banana' ? '🍌'
                                                    : pregnancyData.babySize === 'Mango' ? '🥭'
                                                        : '👶'}
                                </div>

                                <div className="metric-box">
                                    <h4>{t?.length || 'Length'}:</h4>
                                    <span>{pregnancyData.babyLength}</span>
                                </div>
                            </div>

                            <div className="dev-info" style={{ background: 'var(--color-off-white)' }}>
                                <h4 style={{ color: 'var(--color-slate)' }}>{t?.whatsGoingOn || "What's going on?"}</h4>
                                <p>{pregnancyData.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Tools - Professional Grid */}
                <div className="tools-grid">
                    <div className="tool-card" onClick={() => navigate('/analytics')}>
                        <div className="tool-icon-wrapper" style={{ color: 'var(--color-slate)' }}>
                            📊
                        </div>
                        <span className="tool-name">{t?.healthHub || 'Health'}</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/chatbot')}>
                        <div className="tool-icon-wrapper" style={{ color: 'var(--color-slate)' }}>
                            🤖
                        </div>
                        <span className="tool-name">{t?.aiChat || 'AI Chat'}</span>
                    </div>
                    <div className="tool-card" onClick={() => navigate('/find-care')}>
                        <div className="tool-icon-wrapper" style={{ color: 'var(--color-slate)' }}>
                            🏥
                        </div>
                        <span className="tool-name">{t?.hospitals || 'Care'}</span>
                    </div>
                    <div className="tool-card" onClick={() => navigate('/yoga')}>
                        <div className="tool-icon-wrapper" style={{ color: 'var(--color-slate)' }}>
                            🧘‍♀️
                        </div>
                        <span className="tool-name">{t?.yoga || 'Yoga'}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

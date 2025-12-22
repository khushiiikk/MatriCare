import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Dashboard.css';
import babyIllustration from '../assets/baby_illustration.jpg';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const t = translations[language]?.dashboard || translations['en'].dashboard;
    const pregnancyWeeksData = translations[language]?.pregnancyWeeks || translations['en'].pregnancyWeeks;

    const [waterIntake, setWaterIntake] = useState(0);
    const userWeight = user?.weight || 60;

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
            // Default to 15 weeks if no LMP registered
            calculatePregnancyProgress(new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString());
        }
    }, [user, isAuthenticated, navigate, language]);

    const [pregnancyData, setPregnancyData] = useState({
        weeks: 0,
        days: 0,
        daysLeft: 280,
        trimester: 1,
        progressPercent: 0,
        babySize: "...",
        babyWeight: "...",
        babyLength: "...",
        description: "",
        dateString: "",
        edd: ""
    });

    const calculatePregnancyProgress = (lmpDateStr) => {
        const lmp = new Date(lmpDateStr);
        const today = new Date();
        const diffTime = today - lmp;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let weeks = Math.floor(diffDays / 7);
        let days = diffDays % 7;

        let displayWeeks = Math.max(0, weeks);
        let displayDays = Math.max(0, days);
        let daysLeft = 280 - diffDays;

        if (weeks > 40) {
            displayWeeks = 40;
            displayDays = 0;
            daysLeft = 0;
        }

        const progressPercent = Math.min(100, Math.max(0, (diffDays / 280) * 100));

        let trimester = 1;
        if (weeks >= 13 && weeks <= 26) trimester = 2;
        if (weeks >= 27) trimester = 3;

        const searchWeek = Math.min(Math.max(1, weeks), 40);
        const dataPoint = pregnancyWeeksData.find(d => d.week === searchWeek) || pregnancyWeeksData[0];

        const eddDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);

        setPregnancyData({
            weeks: displayWeeks,
            days: displayDays,
            daysLeft: Math.max(0, daysLeft),
            trimester,
            progressPercent,
            babySize: dataPoint?.size || "Pumpkin",
            babyWeight: dataPoint?.weight || "3.5kg",
            babyLength: dataPoint?.length || "50cm",
            description: dataPoint?.desc || "Keep monitoring your baby's growth!",
            dateString: today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            edd: eddDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-GB')
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
                {/* 1. Header (LMP Based Data) */}
                <div className="pregnancy-main-header">
                    <div className="header-glass-card">
                        <div className="date-display">
                            <span>📅</span> {pregnancyData.dateString}
                        </div>
                        <div className="term-info-row">
                            <div className="term-text">
                                <h1>{pregnancyData.weeks} {t.weeks || 'Weeks'} <span className="day-count">& {pregnancyData.days} {t.days || 'Days'}</span></h1>
                                <h3>Trimester {pregnancyData.trimester} • {pregnancyData.daysLeft} Days to go!</h3>
                            </div>
                            <div className="edd-badge">
                                <span>EDD</span>
                                <strong>{pregnancyData.edd}</strong>
                            </div>
                        </div>
                        <div className="progress-bar-wrapper">
                            <div className="bar-bg">
                                <div className="bar-fill" style={{ width: `${pregnancyData.progressPercent}%` }}></div>
                            </div>
                            <div className="bar-labels">
                                <span>Day 1</span>
                                <span>{Math.round(pregnancyData.progressPercent)}% Journey</span>
                                <span>Day 280</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content-grid">
                    {/* Baby Dev Card */}
                    <div className="dev-card">
                        <div className="card-header">
                            <span className="card-icon">👶</span>
                            <h4>{t.babySize || "Baby's Development"}</h4>
                        </div>
                        <div className="dev-body">
                            <p className="size-intro">This week, your baby is as big as a:</p>
                            <h2 className="fruit-name">{pregnancyData.babySize}</h2>
                            <div className="baby-visual">
                                <div className="baby-image-frame">
                                    <img src={babyIllustration} alt="Baby dev" />
                                </div>
                                <div className="mini-stats">
                                    <div className="stat-pill"><strong>{pregnancyData.babyWeight}</strong> Weight</div>
                                    <div className="stat-pill"><strong>{pregnancyData.babyLength}</strong> Length</div>
                                </div>
                            </div>
                            <p className="dev-desc">{pregnancyData.description}</p>
                        </div>
                    </div>

                    {/* Vitals & Tools */}
                    <div className="vitals-column">
                        <div className="vitals-grid">
                            <div className="vital-glass-card" onClick={handleWaterClick}>
                                <div className="vital-top">
                                    <span className="icon">💧</span>
                                    <span className="value">{waterIntake} gls</span>
                                </div>
                                <p>{t.water || 'Water Intake'}</p>
                            </div>
                            <div className="vital-glass-card">
                                <div className="vital-top">
                                    <span className="icon">⚖️</span>
                                    <span className="value">{userWeight} kg</span>
                                </div>
                                <p>{t.motherWeight || "Your Weight"}</p>
                            </div>
                            <div className="vital-glass-card" onClick={() => navigate('/analytics')}>
                                <div className="vital-top">
                                    <span className="icon">🏥</span>
                                    <span className="value">Check</span>
                                </div>
                                <p>{t.symptoms || 'Symptoms'}</p>
                            </div>
                            <div className="vital-glass-card">
                                <div className="vital-top">
                                    <span className="icon">😊</span>
                                    <span className="value">Today</span>
                                </div>
                                <p>{t.mood || 'Mood'}</p>
                            </div>
                        </div>

                        <div className="quick-nav-list">
                            <div className="nav-item" onClick={() => navigate('/yoga')}>
                                <div className="nav-icon mauve">🧘</div>
                                <div className="nav-text">
                                    <strong>{t.yoga || 'Yoga & Exercise'}</strong>
                                    <span>Trimester-wise exercises</span>
                                </div>
                                <div className="nav-arrow">→</div>
                            </div>
                            <div className="nav-item" onClick={() => navigate('/chatbot')}>
                                <div className="nav-icon peach">🤖</div>
                                <div className="nav-text">
                                    <strong>{t.aiChat || 'AI Assistant'}</strong>
                                    <span>Help for any question</span>
                                </div>
                                <div className="nav-arrow">→</div>
                            </div>
                            <div className="nav-item" onClick={() => navigate('/analytics')}>
                                <div className="nav-icon mint">📊</div>
                                <div className="nav-text">
                                    <strong>{t.healthHub || 'Health Reports'}</strong>
                                    <span>Scan & Analyze lab reports</span>
                                </div>
                                <div className="nav-arrow">→</div>
                            </div>
                            <div className="nav-item" onClick={() => navigate('/find-care')}>
                                <div className="nav-icon yellow">🏥</div>
                                <div className="nav-text">
                                    <strong>{t.hospitals || 'Nearby Facilities'}</strong>
                                    <span>Hospitals & Ambulances</span>
                                </div>
                                <div className="nav-arrow">→</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

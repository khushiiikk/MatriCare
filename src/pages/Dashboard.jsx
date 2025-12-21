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
    const t = translations[language];

    // Helper for translations if they don't exist yet
    const getT = (path, fallback) => {
        const keys = path.split('.');
        let val = translations[language];
        for (let k of keys) {
            val = val?.[k];
        }
        return val || fallback;
    };

    const [pregnancyData, setPregnancyData] = useState({
        weeks: 0,
        days: 0,
        daysLeft: 280,
        trimester: 1,
        progressPercent: 0,
        babySize: "Poppy Seed"
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.lmpDate) {
            calculatePregnancyProgress(user.lmpDate);
        } else {
            // Default mock if no LMP (or prompt user)
            calculatePregnancyProgress(new Date().setDate(new Date().getDate() - 90)); // Mock ~12 weeks
        }
    }, [user, isAuthenticated, navigate]);

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

        // Simple Baby Size Logic (Mock data)
        const sizes = [
            "Poppy Seed", "Sesame Seed", "Lentil", "Blueberry", "Kidney Bean",
            "Grape", "Kumquat", "Fig", "Lime", "Pea Pod",
            "Lemon", "Apple", "Avocado", "Turnip", "Bell Pepper",
            "Pomegranate", "Mango", "Sweet Potato", "Banana", "Cantaloupe",
            "Cauliflower", "Eggplant", "Papaya", "Grapefruit", "Cabbage",
            "Lettuce", "Coconut", "Pineapple", "Butternut Squash", "Melon",
            "Watermelon", "Pumpkin", "Jackfruit"
        ];
        // Index roughly maps to weeks 4 - 40. 
        // Array index 0 = Week 4. So index = weeks - 4.
        let sizeIndex = Math.max(0, weeks - 4);
        sizeIndex = Math.min(sizeIndex, sizes.length - 1);

        setPregnancyData({
            weeks,
            days,
            daysLeft: Math.max(0, daysLeft),
            trimester,
            progressPercent,
            babySize: sizes[sizeIndex] || "Watermelon"
        });
    };

    return (
        <div className="dashboard-page">
            {/* Top Progress Section */}
            <div className={`pregnancy-progress-container ${pregnancyData.trimester === 2 ? 'theme-peach' : pregnancyData.trimester === 3 ? 'theme-mint' : ''}`}>
                <div className="container">
                    <div className="progress-circle-wrapper">
                        {/* Circular Progress SVG */}
                        <svg className="progress-ring" width="220" height="220">
                            <circle
                                className="progress-ring__circle-bg"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="15"
                                fill="transparent"
                                r="100"
                                cx="110"
                                cy="110"
                            />
                            <circle
                                className="progress-ring__circle"
                                stroke="white"
                                strokeWidth="15"
                                strokeLinecap="round"
                                fill="transparent"
                                r="100"
                                cx="110"
                                cy="110"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 100}`,
                                    strokeDashoffset: `${2 * Math.PI * 100 * (1 - pregnancyData.progressPercent / 100)}`,
                                    transition: 'stroke-dashoffset 1s ease-in-out',
                                    transform: 'rotate(-90deg)',
                                    transformOrigin: '50% 50%'
                                }}
                            />
                        </svg>

                        <div className="progress-circle-inner text-center">
                            <span className="progress-text-label">Week</span>
                            <span className="progress-weeks-display">{pregnancyData.weeks}</span>
                            <span className="progress-days-display">
                                + {pregnancyData.days} days
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-header" style={{ marginTop: '20px', color: 'white' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
                            {t.login?.helloMom || "Hello Mom!"} {user?.name?.split(' ')[0]}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                            {pregnancyData.daysLeft} days to go
                        </p>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                {/* Baby Size Card */}
                <div className="baby-size-card slide-up">
                    <div className="baby-fruit-img" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🍋
                    </div>
                    <div className="baby-size-info">
                        <h4>Baby is the size of a {pregnancyData.babySize}</h4>
                        <p>Your baby is growing strong in Trimester {pregnancyData.trimester}</p>
                    </div>
                </div>

                {/* Main Action Cards */}
                <div className="dashboard-grid">
                    {/* Health Tracking Card */}
                    <div className="info-card pink-gradient hover-scale">
                        <div className="card-content">
                            <h3>Mother Health & Tracking</h3>
                            <p>Track symptoms, check risks, and analyze reports.</p>
                            <button className="card-btn" onClick={() => navigate('/analytics')}>Track Now</button>
                        </div>
                        {/* <img src="/assets/doctor-consult.png" className="card-image" alt="Health" /> */}
                    </div>

                    {/* Pregnancy Diary Card */}
                    <div className="info-card purple-gradient hover-scale">
                        <div className="card-content">
                            <h3>My Pregnancy Diary</h3>
                            <p>Record your beautiful journey and memories.</p>
                            <button className="card-btn">Write Now</button>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="section-title-wrapper">
                    <h2>Tracking Tools</h2>
                </div>

                <div className="tools-grid">
                    <div className="tool-card" onClick={() => navigate('/analytics')}>
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>📄</span>
                        </div>
                        <span className="tool-name">Reports</span>
                    </div>

                    <div className="tool-card">
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>⚖️</span>
                        </div>
                        <span className="tool-name">Weight</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/find-care')}>
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>🏥</span>
                        </div>
                        <span className="tool-name">Hospitals</span>
                    </div>

                    <div className="tool-card">
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>📅</span>
                        </div>
                        <span className="tool-name">Appointments</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/yoga')}>
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>🧘‍♀️</span>
                        </div>
                        <span className="tool-name">Yoga</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/chatbot')}>
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>🤖</span>
                        </div>
                        <span className="tool-name">AI Chat</span>
                    </div>

                    <div className="tool-card">
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>💧</span>
                        </div>
                        <span className="tool-name">Water</span>
                    </div>

                    <div className="tool-card">
                        <div className="tool-icon-wrapper">
                            <span style={{ fontSize: '2rem' }}>😊</span>
                        </div>
                        <span className="tool-name">Mood</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

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

    // Local State for Trackers
    const [waterIntake, setWaterIntake] = useState(0);
    const [moodHistory, setMoodHistory] = useState([]);
    const [showMoodSelector, setShowMoodSelector] = useState(false);

    // Initialize state from localStorage
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const storedWater = localStorage.getItem(`water_${new Date().toDateString()}`);
        if (storedWater) setWaterIntake(parseInt(storedWater));

        const storedMoods = localStorage.getItem('mood_history');
        if (storedMoods) setMoodHistory(JSON.parse(storedMoods));

        if (user?.lmpDate) {
            calculatePregnancyProgress(user.lmpDate);
        } else {
            calculatePregnancyProgress(new Date().setDate(new Date().getDate() - 90)); // Mock
        }
    }, [user, isAuthenticated, navigate]);

    const [pregnancyData, setPregnancyData] = useState({
        weeks: 0,
        days: 0,
        daysLeft: 280,
        trimester: 1,
        progressPercent: 0,
        babySize: "Poppy Seed"
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

        const sizes = [
            "Poppy Seed", "Sesame Seed", "Lentil", "Blueberry", "Kidney Bean",
            "Grape", "Kumquat", "Fig", "Lime", "Pea Pod",
            "Lemon", "Apple", "Avocado", "Turnip", "Bell Pepper",
            "Pomegranate", "Mango", "Sweet Potato", "Banana", "Cantaloupe",
            "Cauliflower", "Eggplant", "Papaya", "Grapefruit", "Cabbage",
            "Lettuce", "Coconut", "Pineapple", "Butternut Squash", "Melon",
            "Watermelon", "Pumpkin", "Jackfruit"
        ];
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

    const handleWaterClick = () => {
        const newIntake = waterIntake + 1;
        setWaterIntake(newIntake);
        localStorage.setItem(`water_${new Date().toDateString()}`, newIntake);
    };

    const handleMoodSelect = (mood) => {
        const newHistory = [{ mood, date: new Date().toISOString() }, ...moodHistory].slice(0, 5); // Keep last 5
        setMoodHistory(newHistory);
        localStorage.setItem('mood_history', JSON.stringify(newHistory));
        setShowMoodSelector(false);
    };

    const getLastMood = () => {
        if (moodHistory.length === 0) return null;
        return moodHistory[0].mood;
    };

    return (
        <div className="dashboard-page">
            {/* Top Progress Section */}
            <div className="pregnancy-progress-container">
                <div className="container">
                    <div className="progress-circle-wrapper">
                        {/* Circular Progress SVG */}
                        <svg className="progress-ring" width="200" height="200">
                            <circle
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                fill="transparent"
                                r="85"
                                cx="100"
                                cy="100"
                            />
                            <circle
                                stroke="white"
                                strokeWidth="12"
                                strokeLinecap="round"
                                fill="transparent"
                                r="85"
                                cx="100"
                                cy="100"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 85}`,
                                    strokeDashoffset: `${2 * Math.PI * 85 * (1 - pregnancyData.progressPercent / 100)}`,
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
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '5px', color: 'white' }}>
                            {t.login?.helloMom || "Hello Mom"} {user?.name?.split(' ')[0]}
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
                    <div className="baby-fruit-img">
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
                    <div className="info-card pink-gradient hover-scale" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-content">
                            <h3>Mother Health & Tracking</h3>
                            <p>Track symptoms, check risks, and analyze reports.</p>
                            <button className="card-btn" onClick={() => navigate('/analytics')}>Track Now</button>
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
                            📄
                        </div>
                        <span className="tool-name">Reports</span>
                    </div>

                    <div className="tool-card" onClick={handleWaterClick}>
                        <div className="tool-icon-wrapper">
                            💧
                        </div>
                        <span className="tool-name">Water</span>
                        <span className="tracker-status">{waterIntake} Glasses</span>
                    </div>

                    <div className="tool-card" onClick={() => setShowMoodSelector(!showMoodSelector)}>
                        <div className="tool-icon-wrapper">
                            {getLastMood() === 'Happy' ? '😊' : getLastMood() === 'Sad' ? '😔' : getLastMood() === 'Tired' ? '😴' : '😐'}
                        </div>
                        <span className="tool-name">Mood</span>
                        {showMoodSelector && (
                            <div style={{ position: 'absolute', background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', top: '100%', zIndex: 100, display: 'flex', gap: '5px' }}>
                                <span onClick={(e) => { e.stopPropagation(); handleMoodSelect('Happy'); }}>😊</span>
                                <span onClick={(e) => { e.stopPropagation(); handleMoodSelect('Sad'); }}>😔</span>
                                <span onClick={(e) => { e.stopPropagation(); handleMoodSelect('Tired'); }}>😴</span>
                            </div>
                        )}
                        <span className="tracker-status" style={{ fontSize: '0.7rem' }}>{getLastMood() || 'Log Now'}</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/find-care')}>
                        <div className="tool-icon-wrapper">
                            🏥
                        </div>
                        <span className="tool-name">Hospitals</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/yoga')}>
                        <div className="tool-icon-wrapper">
                            🧘‍♀️
                        </div>
                        <span className="tool-name">Yoga</span>
                    </div>

                    <div className="tool-card" onClick={() => navigate('/chatbot')}>
                        <div className="tool-icon-wrapper">
                            🤖
                        </div>
                        <span className="tool-name">AI Chat</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

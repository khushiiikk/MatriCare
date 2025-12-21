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

    // Local State
    const [activeTab, setActiveTab] = useState('baby');

    // Trackers
    const [waterIntake, setWaterIntake] = useState(0);
    const [moodHistory, setMoodHistory] = useState([]);

    // Mock Data for Weight (could be user input later)
    const [weight, setWeight] = useState(61);

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
            calculatePregnancyProgress(new Date().setDate(new Date().getDate() - 105)); // Mock ~15 weeks
        }
    }, [user, isAuthenticated, navigate]);

    const [pregnancyData, setPregnancyData] = useState({
        weeks: 0,
        days: 0,
        daysLeft: 280,
        trimester: 1,
        progressPercent: 0,
        babySize: "Avocado",
        babyWeight: "100 g",
        babyLength: "11.6 cm",
        description: "The baby is playing with the umbilical cord, grabbing and releasing it. Taste buds and bones are developing."
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

        // Enhanced Data Lookup
        const dataMap = [
            // 0-3 (Early)
            { size: "Poppy Seed", weight: "<1g", length: "0.1cm", desc: "Cells are dividing rapidly. The neural tube is forming." },
            { size: "Sesame Seed", weight: "<1g", length: "0.2cm", desc: "The heart begins to beat. Major organs start to form." },
            { size: "Lentil", weight: "<1g", length: "0.5cm", desc: "Facial features are becoming defined. Arm and leg buds appear." },
            { size: "Blueberry", weight: "1g", length: "1.3cm", desc: "Hands and feet are developing fingers and toes." },
            // 8-11
            { size: "Kidney Bean", weight: "2g", length: "1.6cm", desc: "The baby is constantly moving, though you can't feel it yet." },
            { size: "Grape", weight: "2g", length: "2.3cm", desc: "Eyelids fuse shut. The heart is fully formed." },
            { size: "Kumquat", weight: "4g", length: "3.1cm", desc: "Vital organs are functioning. Tooth buds are forming." },
            { size: "Fig", weight: "7g", length: "4.1cm", desc: "Bones are hardening. Skin is transparent." },
            // 12-15
            { size: "Lime", weight: "14g", length: "5.4cm", desc: "Fingerprints have formed. The baby reflexes are starting." },
            { size: "Pea Pod", weight: "23g", length: "7.4cm", desc: "The baby makes facial expressions and can suck their thumb." },
            { size: "Lemon", weight: "43g", length: "8.7cm", desc: "Lanugo (fine hair) covers the body. The liver produces bile." },
            { size: "Apple", weight: "70g", length: "10.1cm", desc: "The baby can sense light. Legs are growing longer than arms." },
            // 16-19
            { size: "Avocado", weight: "100g", length: "11.6cm", desc: "The baby is playing with the umbilical cord. Taste buds are developing." },
            { size: "Turnip", weight: "140g", length: "13cm", desc: "Skeleton is hardening from cartilage to bone. Sweat glands dev." },
            { size: "Bell Pepper", weight: "190g", length: "14.2cm", desc: "Ears are in position. The baby can hear your heartbeat." },
            { size: "Mango", weight: "240g", length: "15.3cm", desc: "Vernix caseosa coats the skin. Sensory development explodes." },
            // 20-30+ (Placeholder logic for rest)
            { size: "Banana", weight: "300g", length: "16.4cm", desc: "You can feel movements stronger now. Sleep cycles begin." },
            // ... and so on. Just using modulo for safety if week > array
        ];

        // Offset by 4 weeks to match array index 0 = Week 4
        let index = Math.max(0, weeks - 4);
        if (index >= dataMap.length) index = dataMap.length - 1; // Cap it
        if (weeks > 20) index = dataMap.length - 1; // Just cap to Mango/Banana for demo if undefined

        const currentData = dataMap[index] || dataMap[0];

        setPregnancyData({
            weeks,
            days,
            daysLeft: Math.max(0, daysLeft),
            trimester,
            progressPercent,
            babySize: currentData.size,
            babyWeight: currentData.weight,
            babyLength: currentData.length,
            description: currentData.desc,
            dateString: today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            edd: new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')
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
                        <h2>My pregnancy term:</h2>
                        <h3>Trimester {pregnancyData.trimester}: {pregnancyData.weeks} weeks, {pregnancyData.days} days</h3>

                        <div className="progress-container">
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${pregnancyData.progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="days-left-text">
                            {pregnancyData.daysLeft} days left (EDD {pregnancyData.edd})
                        </div>
                    </div>
                </div>

                {/* Section 2: Symptoms/Vitals Row */}
                <div className="vitals-card slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="vitals-row">
                        <div className="vital-item" onClick={() => navigate('/analytics')}> {/* Quick link to symptoms */}
                            <div className="vital-icon" style={{ background: '#e1bee7', color: '#8e24aa' }}>
                                😫
                            </div>
                            <span className="vital-label">Symptoms</span>
                        </div>

                        <div className="vital-item" onClick={handleWaterClick}>
                            <div className="vital-icon" style={{ background: '#b3e5fc', color: '#0288d1' }}>
                                💧
                            </div>
                            <span className="vital-label">Water ({waterIntake})</span>
                        </div>

                        <div className="vital-item">
                            <div className="vital-icon" style={{ background: '#c8e6c9', color: '#388e3c' }}>
                                😊
                            </div>
                            <span className="vital-label">Mood</span>
                        </div>
                    </div>

                    <div className="weight-display">
                        <div className="weight-label">Mother's weight</div>
                        <div className="weight-value">{weight} kg</div>
                    </div>
                </div>

                {/* Section 3: Baby/Mom Tabs */}
                <div className="tabs-container slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'baby' ? 'active' : ''}`}
                            onClick={() => setActiveTab('baby')}
                        >
                            BABY
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'mom' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mom')}
                        >
                            MOM
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'baby' ? (
                            <div className="baby-content">
                                <div className="share-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                                </div>

                                <div className="baby-info-header">
                                    <div className="approxim-text">Baby's approximate size:</div>
                                    <div className="fruit-name">{pregnancyData.babySize}</div>
                                </div>

                                <div className="baby-visual-section">
                                    <div className="metric-box">
                                        <h4>Weight:</h4>
                                        <span>{pregnancyData.babyWeight}</span>
                                    </div>

                                    <div className="baby-illustration">
                                        {/* Dynamic Fruit Emoji/Icon */}
                                        {pregnancyData.babySize === 'Avocado' ? '🥑'
                                            : pregnancyData.babySize === 'Lemon' ? '🍋'
                                                : pregnancyData.babySize === 'Apple' ? '🍎'
                                                    : pregnancyData.babySize === 'Banana' ? '🍌'
                                                        : pregnancyData.babySize === 'Mango' ? '🥭'
                                                            : '👶'}
                                    </div>

                                    <div className="metric-box">
                                        <h4>Length:</h4>
                                        <span>{pregnancyData.babyLength}</span>
                                    </div>
                                </div>

                                <div className="dev-info">
                                    <h4>What's going on?</h4>
                                    <p>{pregnancyData.description}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="mom-content">
                                <p style={{ marginBottom: '20px' }}>Keep track of your health and appointments.</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button className="card-btn" onClick={() => navigate('/analytics')}>Health Hub</button>
                                    <button className="card-btn" onClick={() => navigate('/yoga')}>Yoga</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Tools (Quick Access - retaining some icons/features) */}
                <div className="tools-grid">
                    <div className="tool-card" onClick={() => navigate('/chatbot')}>
                        <div className="tool-icon-wrapper">
                            🤖
                        </div>
                        <span className="tool-name">AI Chat</span>
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
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

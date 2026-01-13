import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Dashboard.css';
import './AshaPatients.css';
import './AshaMap.css';

const Dashboard = () => {
    const { user, updateProfile, logout } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.dashboard || translations['en'].dashboard;
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [pregnancyData, setPregnancyData] = useState({
        currentWeek: 0,
        currentDay: 0,
        daysPregnant: 0,
        daysRemaining: 0,
        weeksRemaining: 0,
        trimester: 1,
        dueDate: null,
        progressPercent: 0
    });
    const [healthData, setHealthData] = useState({
        hemoglobin: null,
        bloodGroup: null,
        weight: null,
        lastReport: null
    });
    const [dailyTip, setDailyTip] = useState({
        title: "Kesar Milk (Saffron)",
        content: "Traditionally believed to improve baby's health. Add 2-3 strands to warm milk at night.",
        icon: "🥛"
    });

    const indianTips = [
        { title: "Kesar Milk (Saffron)", content: "Traditionally believed to improve baby's health. Add 2-3 strands to warm milk at night.", icon: "🥛" },
        { title: "Coconut Water", content: "Stay hydrated and prevent UTIs with fresh coconut water daily.", icon: "🥥" },
        { title: "Garbh Sanskar", content: "Communicate with your baby through music and positive thoughts.", icon: "✨" },
        { title: "Soaked Almonds", icon: "🥜", content: "Soak 5-7 almonds overnight for brain development power." },
        { title: "Morning Walk", icon: "🚶‍♀️", content: "A gentle 20-min walk in fresh air helps circulation and mood." }
    ];

    useEffect(() => {
        const randomTip = indianTips[Math.floor(Math.random() * indianTips.length)];
        setDailyTip(randomTip);
    }, []);

    useEffect(() => {
        if (user?.role === 'patient' && user?.lmpDate) {
            calculatePregnancy(user.lmpDate);
        }
        if (user?.role === 'patient') {
            loadHealthData();
        }
    }, [user]);

    const [ashaWorker, setAshaWorker] = useState(null);
    const [loadingAsha, setLoadingAsha] = useState(false);

    useEffect(() => {
        if (user?.role === 'patient' && user?.district && user?.village) {
            findNearestAsha();
        }
    }, [user?.district, user?.village]);

    const findNearestAsha = async () => {
        setLoadingAsha(true);
        try {
            // "Real-time" based on location match
            const q = query(
                collection(db, "asha_workers"),
                where("district", "==", user.district),
                where("village", "==", user.village),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setAshaWorker(snapshot.docs[0].data());
            } else {
                setAshaWorker(null);
            }
        } catch (error) {
            console.error("Error finding ASHA:", error);
        } finally {
            setLoadingAsha(false);
        }
    };

    const calculatePregnancy = (lmpDate) => {
        const lmp = new Date(lmpDate);
        const today = new Date();

        const diffTime = today - lmp;
        const daysPregnant = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const currentWeek = Math.floor(daysPregnant / 7);
        const currentDay = daysPregnant % 7;

        const dueDate = new Date(lmp);
        dueDate.setDate(dueDate.getDate() + 280);

        const daysRemaining = Math.max(0, 280 - daysPregnant);
        const weeksRemaining = Math.floor(daysRemaining / 7);

        let trimester = 1;
        if (currentWeek >= 27) trimester = 3;
        else if (currentWeek >= 13) trimester = 2;

        const progressPercent = Math.min(100, Math.round((daysPregnant / 280) * 100));

        setPregnancyData({
            currentWeek,
            currentDay,
            daysPregnant,
            daysRemaining,
            weeksRemaining,
            trimester,
            dueDate,
            progressPercent
        });
    };

    const loadHealthData = async () => {
        if (!user?.uid) return;

        try {
            const q = query(
                collection(db, "health_reports"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const latest = querySnapshot.docs[0].data();
                console.log("📊 Latest Report Found:", latest);
                setHealthData({
                    hemoglobin: latest.vitals?.hemoglobin || user?.hemoglobin || null,
                    bloodGroup: user?.bloodGroup || null,
                    weight: latest.vitals?.weight || user?.weight || null,
                    lastReport: latest.date || null
                });
            } else {
                // Check local storage for backward compatibility during migration
                const reports = JSON.parse(localStorage.getItem('health_reports') || '[]');
                if (reports.length > 0) {
                    const latest = reports[0]; // local storage reports are usually unshifted
                    setHealthData({
                        hemoglobin: latest.hemoglobin || latest.vitals?.hemoglobin || user?.hemoglobin || null,
                        bloodGroup: user?.bloodGroup || null,
                        weight: latest.weight || latest.vitals?.weight || user?.weight || null,
                        lastReport: latest.date || null
                    });
                } else {
                    console.log("ℹ️ No reports found. Using profile data:", { weight: user?.weight, hb: user?.hemoglobin });
                    setHealthData({
                        hemoglobin: user?.hemoglobin || null,
                        bloodGroup: user?.bloodGroup || null,
                        weight: user?.weight || null,
                        lastReport: null
                    });
                }
            }
        } catch (error) {
            console.error("Error loading health data from Firestore:", error);
        }
    };

    const saveHealthData = async (field, value) => {
        setEditingField(null);
        const updates = {};
        updates[field] = value;
        await updateProfile(updates);
    };



    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTrimesterName = () => {
        const names = [t.trimester1, t.trimester2, t.trimester3];
        return names[pregnancyData.trimester - 1] || t.trimester1;
    };

    const getTrimesterColor = () => {
        const colors = ['#fce4ec', '#f8bbd0', '#f48fb1'];
        return colors[pregnancyData.trimester - 1] || '#fce4ec';
    };

    const getHealthStatus = (type, value) => {
        if (!value) return { status: t.status.notTested, color: '#E0E0E0', icon: '' };

        if (type === 'hemoglobin') {
            if (value < 11) return { status: t.status.low, color: '#FF6B6B', icon: '' };
            if (value < 12) return { status: t.status.monitor, color: '#FFB74D', icon: '' };
            return { status: t.status.normal, color: '#E91E63', icon: '' };
        }

        if (type === 'weight') {
            const w = parseFloat(value);
            if (isNaN(w) || w <= 0) return { status: t.status.notTested, color: '#E0E0E0', icon: '' };
            if (w < 45) return { status: t.status.low, color: '#FF6B6B', icon: '' };
            if (w > 90) return { status: t.status.high, color: '#FFB74D', icon: '' };
            return { status: t.status.normal, color: '#E91E63', icon: '' };
        }

        return { status: t.status.normal, color: '#E91E63', icon: '' };
    };

    return (
        <div className="pregnancy-dashboard">
            <div className="dashboard-content">
                {/* Refined Header */}
                <div className="dash-premium-header">
                    <div className="profile-pill">
                        <div className="welcome-text">
                            <h3>{t.hello}, {user?.name || user?.fullName || 'User'}!</h3>
                            <p>{t.week} {pregnancyData.currentWeek} • {getTrimesterName()}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-main-columns">
                    {/* Left Column: Pregnancy Progress */}
                    <div className="dash-left-col">
                        <div className="main-pregnancy-card">
                            <div className="pregnancy-circle-section">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <defs>
                                        <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#E91E63" />
                                            <stop offset="100%" stopColor="#C2185B" />
                                        </linearGradient>
                                    </defs>
                                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="circle"
                                        strokeDasharray={`${(pregnancyData.currentWeek / 40) * 100}, 100`}
                                        stroke="url(#pinkGradient)"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="circle-content">
                                    <div className="week-display">
                                        <span className="week-number">{pregnancyData.currentWeek}</span>
                                        <span className="week-label">{t.weeks}</span>
                                        <span className="day-label">& {pregnancyData.currentDay} {t.day}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="trimester-progress">
                                <p className="trimester-label">{getTrimesterName()}</p>
                            </div>

                            <div className="due-date-section">
                                <div className="due-date-info">
                                    <span className="due-label">{t.edd}</span>
                                    <span className="due-date">{formatDate(pregnancyData.dueDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Health Vitals & Quick Actions */}
                    <div className="dash-right-col">
                        <div className="health-cards-grid">
                            {/* Weight Card */}
                            <div className="health-card-modern weight" onClick={() => setEditingField('weight')}>
                                <span className="h-label">{t.weight}</span>
                                {editingField === 'weight' ? (
                                    <div className="h-edit-row" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="number"
                                            className="h-input"
                                            value={healthData.weight || ''}
                                            onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                                            autoFocus
                                        />
                                        <span className="h-save" onClick={(e) => { e.stopPropagation(); saveHealthData('weight', healthData.weight); }}>💾</span>
                                    </div>
                                ) : (
                                    <div className="h-value-row">
                                        <span className="h-val">{healthData.weight ? `${healthData.weight} kg` : '--'}</span>
                                        <span className="h-status" style={{ color: getHealthStatus('weight', healthData.weight).color }}>
                                            {getHealthStatus('weight', healthData.weight).status}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Hemoglobin Card */}
                            <div className="health-card-modern hemoglobin" onClick={() => setEditingField('hemoglobin')}>
                                <span className="h-label">{t.hemoglobin}</span>
                                {editingField === 'hemoglobin' ? (
                                    <div className="h-edit-row" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="h-input"
                                            value={healthData.hemoglobin || ''}
                                            onChange={(e) => setHealthData({ ...healthData, hemoglobin: e.target.value })}
                                            autoFocus
                                        />
                                        <span className="h-save" onClick={(e) => { e.stopPropagation(); saveHealthData('hemoglobin', healthData.hemoglobin); }}>💾</span>
                                    </div>
                                ) : (
                                    <div className="h-value-row">
                                        <span className="h-val">{healthData.hemoglobin ? `${healthData.hemoglobin} g/dL` : '--'}</span>
                                        <span className="h-status" style={{ color: getHealthStatus('hemoglobin', healthData.hemoglobin).color }}>
                                            {getHealthStatus('hemoglobin', healthData.hemoglobin).status}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Blood Group Card */}
                            <div className="health-card-modern bgroup" onClick={() => setEditingField('bloodGroup')}>
                                <span className="h-label">{t.bloodGroup}</span>
                                {editingField === 'bloodGroup' ? (
                                    <div className="h-edit-row" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            className="h-input"
                                            value={healthData.bloodGroup || ''}
                                            onChange={(e) => setHealthData({ ...healthData, bloodGroup: e.target.value })}
                                            autoFocus
                                        >
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                        <span className="h-save" onClick={(e) => { e.stopPropagation(); saveHealthData('bloodGroup', healthData.bloodGroup); }}>💾</span>
                                    </div>
                                ) : (
                                    <div className="h-value-row">
                                        <span className="h-val">{healthData.bloodGroup || '--'}</span>
                                        <span className="h-status">{t.status.verified}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="action-row-grid">
                            <div className="premium-compact-card guide" onClick={() => navigate('/maternal-guide')}>
                                <div className="c-icon image-mode">
                                    <img src="/masi-logo.jpg" alt="Advice" className="masi-icon" />
                                </div>
                                <span>{t.cards.indianTips}</span>
                            </div>
                            <div className="premium-compact-card report" onClick={() => navigate('/report-history')}>
                                <div className="c-icon image-mode">
                                    <img src="/report-icon-new.jpg" alt="Report" className="masi-icon" />
                                </div>
                                <span>{t.cards.reportHistory}</span>
                            </div>
                            <div className="premium-compact-card diet" onClick={() => navigate('/diet-plan')}>
                                <div className="c-icon image-mode">
                                    <img src="/diet-icon-new.jpg" alt="Diet" className="masi-icon" />
                                </div>
                                <span>{t.cards.dietPlan}</span>
                            </div>
                            <div className="premium-compact-card yoga" onClick={() => navigate('/yoga')}>
                                <div className="c-icon image-mode">
                                    <img src="/yoga-icon-new.jpg" alt="Yoga" className="masi-icon" />
                                </div>
                                <span>{t.cards.yoga}</span>
                            </div>
                            <div className="premium-compact-card chat" onClick={() => navigate('/chatbot')}>
                                <div className="c-icon">🤖</div>
                                <span>{t.cards.aiAssistant}</span>
                            </div>
                            <div className="premium-compact-card health" onClick={() => navigate('/health', { state: { view: 'analysis' } })}>
                                <div className="c-icon image-mode">
                                    <img src="/analytics-icon-new.jpg" alt="Analytics" className="masi-icon" />
                                </div>
                                <span>{t.cards.analytics}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-dashboard-grid">
                    <div className="asha-worker-card-premium">
                        <div className="asha-header">
                            <h3>{t.asha.title}</h3>
                            {ashaWorker?.phoneNumber ? (
                                <a href={`tel:${ashaWorker.phoneNumber}`} className="asha-call-btn">{t.asha.call}</a>
                            ) : ashaWorker ? (
                                <span className="asha-call-btn disabled">No Phone</span>
                            ) : null}
                        </div>
                        <div className="asha-body">
                            <div className="asha-pfp">
                                {ashaWorker?.profilePicture ? (
                                    <img src={ashaWorker.profilePicture} alt="ASHA" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : "👩‍⚕️"}
                            </div>
                            <div>
                                {loadingAsha ? (
                                    <h4>Finding your ASHA...</h4>
                                ) : ashaWorker ? (
                                    <>
                                        <h4>{ashaWorker.name || ashaWorker.fullName || "ASHA User"}</h4>
                                        <p>{ashaWorker.village || user?.village}, {ashaWorker.district || user?.district}</p>
                                    </>
                                ) : (
                                    <>
                                        <h4>No ASHA Assigned</h4>
                                        <p>No worker found for {user?.village || 'your area'} yet.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Interactive Tip of The Day */}
                    <div className="tip-of-day-interactive" onClick={() => navigate('/maternal-guide')}>
                        <div className="tip-card-inner">
                            <div className="tip-front">
                                <div className="tip-badge">{t.tip.badge}</div>
                                <div className="tip-icon-large">{dailyTip.icon}</div>
                                <h4>{dailyTip.title}</h4>
                                <p>{t.tip.reveal}</p>
                            </div>
                            <div className="tip-back">
                                <p>{dailyTip.content}</p>
                                <span className="read-more">{t.tip.more} →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Section */}
                <div className="emergency-minimal-bar">
                    <p>{t.emergency.prompt}</p>
                    <div className="em-links">
                        <a href="tel:102">{t.emergency.ambulance} 102</a>
                        <a href="tel:108">{t.emergency.ambulance} 108</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

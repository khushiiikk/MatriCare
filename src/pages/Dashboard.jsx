import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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

    const getTimeTheme = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 9) return 'theme-sunrise';
        if (hour >= 9 && hour < 17) return 'theme-day';
        if (hour >= 17 && hour < 20) return 'theme-sunset';
        return 'theme-night';
    };

    const themeClass = getTimeTheme();

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

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

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
        if (!user?.district) return;
        setLoadingAsha(true);
        try {
            const patientDistrict = (user?.district || "").toLowerCase().trim();
            const patientVillage = (user?.village || "").toLowerCase().trim();

            console.log("🔍 Discovery - Searching for nearest ASHA in:", { patientDistrict, patientVillage });

            // 1. Try modern search fields first (Fast & Case-Insensitive)
            let qVillage = query(
                collection(db, "asha_workers"),
                where("districtSearch", "==", patientDistrict),
                where("villageSearch", "==", patientVillage),
                limit(10)
            );

            let snapshot = await getDocs(qVillage);

            // 2. FALLBACK 1: Try legacy fields without 'Search' suffix (Original Case)
            if (snapshot.empty) {
                console.log("⚠️ No match via Search fields. Trying legacy village match...");
                const originalDistrict = (user?.district || "").trim();
                const originalVillage = (user?.village || "").trim();

                const qLegacy = query(
                    collection(db, "asha_workers"),
                    where("district", "==", originalDistrict),
                    where("village", "==", originalVillage),
                    limit(10)
                );
                snapshot = await getDocs(qLegacy);
            }

            // 3. FALLBACK 2: Try mixed fields or district-wide Search fallback
            if (snapshot.empty) {
                console.log("⚠️ No match in village. Trying district-wide modern fallback...");
                const qDistrict = query(
                    collection(db, "asha_workers"),
                    where("districtSearch", "==", patientDistrict),
                    limit(10)
                );
                snapshot = await getDocs(qDistrict);
            }

            // 4. FALLBACK 3: Final District Legacy Match
            if (snapshot.empty) {
                console.log("⚠️ Still nothing. Trying final legacy district-wide match...");
                const originalDistrict = (user?.district || "").trim();
                const qDistLegacy = query(
                    collection(db, "asha_workers"),
                    where("district", "==", originalDistrict),
                    limit(10)
                );
                snapshot = await getDocs(qDistLegacy);
            }

            if (!snapshot.empty) {
                const candidates = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                // If patient and candidates have locations, find the true nearest
                if (user?.location?.lat && user?.location?.lng) {
                    candidates.forEach(asha => {
                        if (asha.location?.lat && asha.location?.lng) {
                            asha.computedDistance = calculateDistance(
                                user.location.lat,
                                user.location.lng,
                                asha.location.lat,
                                asha.location.lng
                            );
                        } else {
                            asha.computedDistance = 99999; // Far away if no location
                        }
                    });

                    candidates.sort((a, b) => a.computedDistance - b.computedDistance);
                }

                const bestAsha = candidates[0];
                setAshaWorker(bestAsha);
                console.log("✅ Success - Found ASHA:", bestAsha.name);
            } else {
                setAshaWorker(null);
                console.log("❌ No matches found for area:", patientDistrict);
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
            const mobileStr = user.mobile ? String(user.mobile) : null;
            const mobileNum = user.mobile ? Number(user.mobile) : null;
            const normalized = user.mobile ? String(user.mobile).replace(/\D/g, '').slice(-10) : null;
            const appId = String(user.uid);

            // 1. Fetch by App ID (Primary Identity)
            const qApp = query(
                collection(db, "health_reports"),
                where("appUserId", "==", appId)
            );

            // 2. Fetch by Security ID (Current session)
            const qSecurity = (auth.currentUser?.uid) ? query(
                collection(db, "health_reports"),
                where("userId", "==", auth.currentUser.uid)
            ) : null;

            // 3. Fetch by Mobile variants
            const qMobileS = mobileStr ? query(collection(db, "health_reports"), where("userMobile", "==", mobileStr)) : null;
            const qMobileN = normalized ? query(collection(db, "health_reports"), where("userMobile", "==", normalized)) : null;

            const [snapApp, snapSec, snapMS, snapMN] = await Promise.all([
                getDocs(qApp).catch(() => ({ docs: [] })),
                qSecurity ? getDocs(qSecurity).catch(() => ({ docs: [] })) : { docs: [] },
                qMobileS ? getDocs(qMobileS).catch(() => ({ docs: [] })) : { docs: [] },
                qMobileN ? getDocs(qMobileN).catch(() => ({ docs: [] })) : { docs: [] }
            ]);

            const allResults = [
                ...snapApp.docs.map(d => ({ ...d.data(), id: d.id })),
                ...snapSec.docs.map(d => ({ ...d.data(), id: d.id })),
                ...snapMS.docs.map(d => ({ ...d.data(), id: d.id })),
                ...snapMN.docs.map(d => ({ ...d.data(), id: d.id }))
            ];

            // Sort by createdAt desc manually to avoid needing composite indexes
            allResults.sort((a, b) => {
                const timeA = a.createdAt?.seconds || new Date(a.date || 0).getTime() / 1000;
                const timeB = b.createdAt?.seconds || new Date(b.date || 0).getTime() / 1000;
                return timeB - timeA;
            });
            const latest = allResults[0];

            if (latest) {
                console.log("📊 Latest Health Report Unified Sync:", latest);
                setHealthData({
                    hemoglobin: latest.vitals?.hemoglobin || latest.vitals?.HB || user?.hemoglobin || null,
                    bloodGroup: user?.bloodGroup || null,
                    weight: latest.vitals?.weight || user?.weight || null,
                    lastReport: latest.date || null
                });
            } else {
                console.log("ℹ️ No health reports found. Using basic profile data.");
                setHealthData({
                    hemoglobin: user?.hemoglobin || null,
                    bloodGroup: user?.bloodGroup || null,
                    weight: user?.weight || null,
                    lastReport: null
                });
            }
        } catch (error) {
            console.error("Error loading unified health data:", error);
        }
    };

    const saveHealthData = async (field, value) => {
        setEditingField(null);

        // 1. Update Profile (Backup)
        const updates = {};
        updates[field] = value;
        await updateProfile(updates);

        // 2. Create "Manual Log" Entry in Health Reports (Primary Source of Truth)
        try {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return;

            const newReport = {
                appUserId: user.uid,
                userId: user.uid, // Redundant for querying safety
                userMobile: user.mobile ? String(user.mobile) : null,
                userName: user.name || user.fullName || 'User',
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                type: 'Manual Log',
                vitals: {
                    [field]: numValue
                },
                notes: `Manual update of ${field} from Dashboard`
            };

            await addDoc(collection(db, "health_reports"), newReport);
            console.log(`✅ Saved manual ${field} log.`);

            // Force reload to reflect changes
            loadHealthData();

        } catch (e) {
            console.error("Error saving manual log:", e);
        }
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
        <div className={`pregnancy-dashboard ${themeClass}`}>
            <div className="aura-container">
                <div className="aura-blob aura-1"></div>
                <div className="aura-blob aura-2"></div>
                <div className="aura-blob aura-3"></div>
            </div>

            <div className="dashboard-content">
                {/* Refined Header */}
                <div className="dash-premium-header">
                    <div className="centered-welcome">
                        <h3>{language === 'hi' ? 'नमस्ते माता!' : 'Hello Mother'}</h3>
                    </div>
                </div>




                <div className="dashboard-main-columns">
                    {/* Left Column: Pregnancy Progress */}
                    <div className="dash-left-col stagger-1">

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
                                <div className="baby-size-simple">
                                    👶 {t.tip.growing || 'Your baby is growing!'}
                                </div>
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
                    <div className="dash-right-col stagger-2">
                        <div className="health-cards-grid">

                            {/* Weight Card */}
                            <div 
                                className="health-card-modern weight" 
                                onClick={() => setEditingField('weight')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingField('weight')}
                            >
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
                            <div 
                                className="health-card-modern hemoglobin" 
                                onClick={() => setEditingField('hemoglobin')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingField('hemoglobin')}
                            >
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
                            <div 
                                className="health-card-modern bgroup" 
                                onClick={() => setEditingField('bloodGroup')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingField('bloodGroup')}
                            >
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
                            <div className="premium-compact-card guide" onClick={() => navigate('/maternal-guide')} role="button" tabIndex={0}>
                                <div className="c-icon image-mode">
                                    <img src="/masi-logo.jpg" alt="Advice" className="masi-icon" />
                                </div>
                                <span>{t.cards.indianTips}</span>
                            </div>
                            <div className="premium-compact-card report" onClick={() => navigate('/report-history')} role="button" tabIndex={0}>
                                <div className="c-icon image-mode">
                                    <img src="/report-icon-new.jpg" alt="Report" className="masi-icon" />
                                </div>
                                <span>{t.cards.reportHistory}</span>
                            </div>
                            <div className="premium-compact-card diet" onClick={() => navigate('/diet-plan')} role="button" tabIndex={0}>
                                <div className="c-icon image-mode">
                                    <img src="/diet-icon-new.jpg" alt="Diet" className="masi-icon" />
                                </div>
                                <span>{t.cards.dietPlan}</span>
                            </div>
                            <div className="premium-compact-card yoga" onClick={() => navigate('/yoga')} role="button" tabIndex={0}>
                                <div className="c-icon image-mode">
                                    <img src="/yoga-icon-new.jpg" alt="Yoga" className="masi-icon" />
                                </div>
                                <span>{t.cards.yoga}</span>
                            </div>
                            <div className="premium-compact-card chat" onClick={() => navigate('/chatbot')} role="button" tabIndex={0}>
                                <div className="c-icon">🤖</div>
                                <span>{t.cards.aiAssistant}</span>
                            </div>
                            <div className="premium-compact-card health" onClick={() => navigate('/health', { state: { view: 'analysis' } })} role="button" tabIndex={0}>
                                <div className="c-icon image-mode">
                                    <img src="/analytics-icon-new.jpg" alt="Analytics" className="masi-icon" />
                                </div>
                                <span>{t.cards.analytics}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-dashboard-grid">
                    <div className="asha-worker-card-premium stagger-3">
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
                                ) : (
                                    <img src="/default-avatar.jpg" alt="ASHA" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                )}
                            </div>
                            <div>
                                {loadingAsha ? (
                                    <h4>Finding your ASHA...</h4>
                                ) : ashaWorker ? (
                                    <>
                                        <h4>{ashaWorker.name || ashaWorker.fullName || "ASHA User"}</h4>
                                        <p>
                                            {ashaWorker.village || user?.village}, {ashaWorker.district || user?.district}
                                            {ashaWorker.computedDistance < 9999 ? ` • ${ashaWorker.computedDistance.toFixed(1)} km ${t.asha.away || 'away'}` : ''}
                                        </p>
                                    </>
                                ) : (
                                    <div className="no-asha-found">
                                        <h4>No ASHA Assigned</h4>
                                        <p>Searching in {user?.village || 'your area'}...</p>
                                        <button className="asha-retry-btn" onClick={() => findNearestAsha(true)}>
                                            🔄 Retry Discovery
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Interactive Tip of The Day */}
                    <div 
                        className="tip-of-day-interactive stagger-4" 
                        onClick={() => navigate('/maternal-guide')}
                        role="button"
                        tabIndex={0}
                    >
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


            </div>
        </div>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import './AshaPatients.css';
import './AshaMap.css';

const Dashboard = () => {
    const { user, updateProfile, logout } = useAuth();
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

    const loadHealthData = () => {
        const reports = JSON.parse(localStorage.getItem('health_reports') || '[]');
        if (reports.length > 0) {
            const latest = reports[reports.length - 1];
            setHealthData({
                hemoglobin: latest.hemoglobin || user?.hemoglobin || null,
                bloodGroup: user?.bloodGroup || null,
                weight: latest.weight || user?.weight || null,
                lastReport: latest.date || null
            });
        } else {
            setHealthData({
                hemoglobin: user?.hemoglobin || null,
                bloodGroup: user?.bloodGroup || null,
                weight: user?.weight || null,
                lastReport: null
            });
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
        const names = ['1ST TRIMESTER', '2ND TRIMESTER', '3RD TRIMESTER'];
        return names[pregnancyData.trimester - 1] || '1ST TRIMESTER';
    };

    const getTrimesterColor = () => {
        const colors = ['#fce4ec', '#f8bbd0', '#f48fb1'];
        return colors[pregnancyData.trimester - 1] || '#fce4ec';
    };

    const getHealthStatus = (type, value) => {
        if (!value) return { status: 'Not tested', color: '#E0E0E0', icon: '' };

        if (type === 'hemoglobin') {
            if (value < 11) return { status: 'Low', color: '#FF6B6B', icon: '' };
            if (value < 12) return { status: 'Monitor', color: '#FFB74D', icon: '' };
            return { status: 'Normal', color: '#E91E63', icon: '' };
        }

        if (type === 'weight') {
            if (value < 45) return { status: 'Low', color: '#FF6B6B', icon: '' };
            if (value > 80) return { status: 'High', color: '#FFB74D', icon: '' };
            return { status: 'Normal', color: '#E91E63', icon: '' };
        }

        return { status: 'Normal', color: '#E91E63', icon: '' };
    };

    return (
        <div className="pregnancy-dashboard">
            <div className="dashboard-content">
                {/* Refined Header */}
                <div className="dash-premium-header">
                    <div className="profile-pill">
                        <div className="profile-icon">👤</div>
                        <div className="welcome-text">
                            <h3>Hello, {user?.name || user?.fullName || 'User'}!</h3>
                            <p>Week {pregnancyData.currentWeek} • {getTrimesterName()}</p>
                        </div>
                    </div>
                    <div className="header-actions">
                    </div>
                </div>

                <div className="dashboard-main-columns">
                    {/* Left Column: Pregnancy Progress (Restored) */}
                    <div className="dash-left-col">
                        {user?.role === 'patient' ? (
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
                                            <span className="week-label">WEEKS</span>
                                            <span className="day-label">& {pregnancyData.currentDay} DAY</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="trimester-progress">
                                    <p className="trimester-label">{getTrimesterName()}</p>
                                </div>

                                <div className="due-date-section">
                                    <div className="due-date-info">
                                        <span className="due-label">Expected Due Date</span>
                                        <span className="due-date">{formatDate(pregnancyData.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AshaInteractiveMap />
                        )}
                    </div>

                    {/* Right Column: Health Vitals (Restored) & New Features */}
                    <div className="dash-right-col">
                        {user?.role === 'patient' && (
                            <>
                                <div className="health-cards-grid">
                                    {/* Weight Card */}
                                    <div className="health-card-modern weight" onClick={() => setEditingField('weight')}>
                                        <span className="h-label">Weight</span>
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
                                        <span className="h-label">Hemoglobin</span>
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
                                        <span className="h-label">Blood Group</span>
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
                                                <span className="h-status">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* New Quick Actions (Premium Style) */}
                                <div className="action-row-grid">
                                    <div className="premium-compact-card guide" onClick={() => navigate('/maternal-guide')}>
                                        <div className="c-icon">🏮</div>
                                        <span>Indian Tips</span>
                                    </div>
                                    <div className="premium-compact-card report" onClick={() => navigate('/report-history')}>
                                        <div className="c-icon">📊</div>
                                        <span>Report History</span>
                                    </div>
                                    <div className="premium-compact-card diet" onClick={() => navigate('/diet-plan')}>
                                        <div className="c-icon">🍴</div>
                                        <span>Diet Plan</span>
                                    </div>
                                    <div className="premium-compact-card yoga" onClick={() => navigate('/yoga')}>
                                        <div className="c-icon">🧘</div>
                                        <span>Yoga</span>
                                    </div>
                                    <div className="premium-compact-card chat" onClick={() => navigate('/chatbot')}>
                                        <div className="c-icon">🤖</div>
                                        <span>AI Assistant</span>
                                    </div>
                                    <div className="premium-compact-card health" onClick={() => navigate('/health', { state: { view: 'analysis' } })}>
                                        <div className="c-icon">🏥</div>
                                        <span>Analytics</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {user?.role === 'asha' && <AshaWorkerPatientList />}
                    </div>
                </div>

                {/* Patient-only additional info */}
                {user?.role === 'patient' && (
                    <div className="bottom-dashboard-grid">
                        <div className="asha-worker-card-premium">
                            <div className="asha-header">
                                <h3>Your ASHA Worker</h3>
                                <a href="tel:+919876543210" className="asha-call-btn">Call</a>
                            </div>
                            <div className="asha-body">
                                <div className="asha-pfp">RD</div>
                                <div>
                                    <h4>Smt. Radha Devi</h4>
                                    <p>Village Rampur • 2.3 km away</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Tip of The Day */}
                        <div className="tip-of-day-interactive" onClick={() => navigate('/maternal-guide')}>
                            <div className="tip-card-inner">
                                <div className="tip-front">
                                    <div className="tip-badge">TIP OF THE DAY</div>
                                    <div className="tip-icon-large">{dailyTip.icon}</div>
                                    <h4>{dailyTip.title}</h4>
                                    <p>Click to reveal wisdom</p>
                                </div>
                                <div className="tip-back">
                                    <p>{dailyTip.content}</p>
                                    <span className="read-more">Learn more in Indian Tips →</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Emergency Section */}
                <div className="emergency-minimal-bar">
                    <p>Emergency? Quick access to help</p>
                    <div className="em-links">
                        <a href="tel:102">Ambulance 102</a>
                        <a href="tel:108">Ambulance 108</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ASHA Interactive Map Component
const AshaInteractiveMap = () => {
    const [selectedPatientId, setSelectedPatientId] = useState(null);

    // ASHA worker's current location (mock data)
    const ashaLocation = { lat: 28.6129, lng: 77.2085 };

    // Mock patient data with locations
    const patients = [
        { id: 1, name: 'Priya Sharma', location: { lat: 28.6139, lng: 77.2090 }, distance: 0.8 },
        { id: 2, name: 'Anjali Verma', location: { lat: 28.6150, lng: 77.2100 }, distance: 1.2 },
        { id: 3, name: 'Sunita Devi', location: { lat: 28.6120, lng: 77.2080 }, distance: 1.5 },
        { id: 4, name: 'Kavita Singh', location: { lat: 28.6160, lng: 77.2110 }, distance: 2.0 }
    ];

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    // Calculate estimated time (rough estimate: 3 km/hr walking speed)
    const getEstimatedTime = (distance) => {
        const timeInMinutes = Math.round((distance / 3) * 60);
        return timeInMinutes;
    };

    const openDirections = (patient) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ashaLocation.lat},${ashaLocation.lng}&destination=${patient.location.lat},${patient.location.lng}&travelmode=walking`;
        window.open(directionsUrl, '_blank');
    };

    return (
        <div className="asha-map-container">
            <div className="map-header">
                <h3>Patient Locations</h3>
                <span className="your-location">Your Location: Village Rampur</span>
            </div>

            {/* Map Preview */}
            <div className="map-preview">
                <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${ashaLocation.lat},${ashaLocation.lng}&zoom=14`}
                    title="ASHA Worker Location Map"
                ></iframe>
            </div>

            {/* Patient Selection */}
            <div className="patient-selection">
                <h4>Select Patient for Route</h4>
                <div className="patient-chips">
                    {patients.map((patient) => (
                        <button
                            key={patient.id}
                            className={`patient-chip ${selectedPatientId === patient.id ? 'selected' : ''}`}
                            onClick={() => setSelectedPatientId(patient.id)}
                        >
                            {patient.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Route Info */}
            {selectedPatient && (
                <div className="route-info">
                    <div className="route-details">
                        <div className="route-stat">
                            <div>
                                <span className="stat-label">Distance</span>
                                <span className="stat-value">{selectedPatient.distance} km</span>
                            </div>
                        </div>
                        <div className="route-stat">
                            <div>
                                <span className="stat-label">Est. Time</span>
                                <span className="stat-value">{getEstimatedTime(selectedPatient.distance)} min</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="get-directions-btn"
                        onClick={() => openDirections(selectedPatient)}
                    >
                        Get Directions →
                    </button>
                </div>
            )}
        </div>
    );
};

// ASHA Quote Banner Component


// ASHA Worker Patient List Component
const AshaWorkerPatientList = () => {
    const navigate = useNavigate();
    const [sortOption, setSortOption] = useState('dueDate'); // 'dueDate' or 'risk'

    // Mock patient data - in production this would come from Firebase
    const patients = [
        {
            id: 1,
            name: 'Priya Sharma',
            age: 26,
            currentWeek: 24,
            hemoglobin: 10.5,
            weight: 58,
            riskLevel: 'High',
            dueDate: '2026-04-15',
            address: 'House 42, Sector 12, Village Rampur',
            location: { lat: 28.6139, lng: 77.2090 },
            phone: '+919876543210',
            distance: 0.8
        },
        {
            id: 2,
            name: 'Anjali Verma',
            age: 29,
            currentWeek: 32,
            hemoglobin: 11.8,
            weight: 62,
            riskLevel: 'Low',
            dueDate: '2026-03-20',
            address: 'House 15, Main Road, Village Rampur',
            location: { lat: 28.6150, lng: 77.2100 },
            phone: '+919876543211',
            distance: 1.2
        },
        {
            id: 3,
            name: 'Sunita Devi',
            age: 23,
            currentWeek: 16,
            hemoglobin: 9.8,
            weight: 52,
            riskLevel: 'High',
            dueDate: '2026-06-10',
            address: 'House 8, Near Temple, Village Rampur',
            location: { lat: 28.6120, lng: 77.2080 },
            phone: '+919876543212',
            distance: 1.5
        },
        {
            id: 4,
            name: 'Kavita Singh',
            age: 31,
            currentWeek: 28,
            hemoglobin: 12.2,
            weight: 65,
            riskLevel: 'Low',
            dueDate: '2026-04-05',
            address: 'House 23, School Road, Village Rampur',
            location: { lat: 28.6160, lng: 77.2110 },
            phone: '+919876543213',
            distance: 2.0
        }
    ];

    const getRiskColor = (risk) => {
        return risk === 'High' ? '#FF6B6B' : '#E91E63';
    };

    const getHemoglobinStatus = (hb) => {
        if (hb < 11) return { status: 'Low', color: '#FF6B6B' };
        if (hb < 12) return { status: 'Monitor', color: '#FFB74D' };
        return { status: 'Normal', color: '#E91E63' };
    };

    const openMaps = (location, address) => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
        window.open(mapsUrl, '_blank');
    };

    const sortedPatients = [...patients].sort((a, b) => {
        if (sortOption === 'dueDate') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortOption === 'risk') {
            const riskOrder = { 'High': 1, 'Low': 2 };
            return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        return 0;
    });

    return (
        <div className="asha-patients-container">
            <div className="asha-patients-header">
                <h3>Nearest Patients</h3>
                <select
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="dueDate">Sort by: Due Date</option>
                    <option value="risk">Sort by: Risk Level</option>
                </select>
            </div>

            <div className="patients-list">
                {sortedPatients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                        <div className="patient-card-header">
                            <div className="patient-basic-info">
                                <h4>{patient.name}</h4>
                                <span className="patient-age-week">{patient.age} yrs • Week {patient.currentWeek}</span>
                            </div>
                            <span
                                className="risk-badge"
                                style={{ backgroundColor: getRiskColor(patient.riskLevel) }}
                            >
                                {patient.riskLevel} Risk
                            </span>
                        </div>

                        <div className="patient-health-metrics">
                            <div className="metric-item">
                                <span className="metric-label">Hemoglobin</span>
                                <span className="metric-value">{patient.hemoglobin} g/dL</span>
                                <span
                                    className="metric-status"
                                    style={{ color: getHemoglobinStatus(patient.hemoglobin).color }}
                                >
                                    {getHemoglobinStatus(patient.hemoglobin).status}
                                </span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Weight</span>
                                <span className="metric-value">{patient.weight} kg</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Due Date</span>
                                <span className="metric-value">{new Date(patient.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="patient-location-info">
                            <div className="location-text">
                                <span className="address-text">{patient.address}</span>
                                <span className="distance-text">{patient.distance} km away</span>
                            </div>
                        </div>

                        <div className="patient-actions">
                            <a href={`tel:${patient.phone}`} className="action-btn call-btn">
                                Call
                            </a>
                            <button
                                className="action-btn map-btn"
                                onClick={() => openMaps(patient.location, patient.address)}
                            >
                                Map
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

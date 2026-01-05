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
        const colors = ['#FFB6C1', '#FFA07A', '#FF8C94'];
        return colors[pregnancyData.trimester - 1] || '#FFB6C1';
    };

    const getHealthStatus = (type, value) => {
        if (!value) return { status: 'Not tested', color: '#E0E0E0', icon: '' };

        if (type === 'hemoglobin') {
            if (value < 11) return { status: 'Low', color: '#FF6B6B', icon: '' };
            if (value < 12) return { status: 'Monitor', color: '#FFB74D', icon: '' };
            return { status: 'Normal', color: '#81C784', icon: '' };
        }

        if (type === 'weight') {
            if (value < 45) return { status: 'Low', color: '#FF6B6B', icon: '' };
            if (value > 80) return { status: 'High', color: '#FFB74D', icon: '' };
            return { status: 'Normal', color: '#81C784', icon: '' };
        }

        return { status: 'Normal', color: '#81C784', icon: '' };
    };

    return (
        <div className="pregnancy-dashboard">
            <div className="dashboard-content">
                {/* Header */}
                <div className="dash-header">
                    <div className="user-greeting">
                        <h2>Hello, {user?.name || user?.fullName || 'User'}!</h2>
                        <p>{user?.role === 'asha' ? 'ASHA Worker' : 'Location'}: {user?.village || 'Unknown Village'}, {user?.district || 'Unknown District'}</p>
                    </div>
                    <div className="user-details-summary">
                        <span className="detail-item"><strong>Phone:</strong> {user?.mobile || user?.phoneNumber || user?.phone || 'N/A'}</span>
                        {user?.role === 'patient' && user?.dob && <span className="detail-item"><strong>Age:</strong> {new Date().getFullYear() - new Date(user.dob).getFullYear()} yrs</span>}
                        <span className="detail-item"><strong>Role:</strong> {user?.role === 'asha' ? 'Health Worker' : 'Expectant Mother'}</span>
                    </div>
                </div>

                <div className="dashboard-main-columns">
                    {/* Left Column: Metrics for Patient / Worker Overview for ASHA */}
                    <div className="dash-left-col">
                        {user?.role === 'patient' ? (
                            <div className="main-pregnancy-card">
                                <div className="pregnancy-circle-section">
                                    <svg viewBox="0 0 36 36" className="circular-chart">
                                        <defs>
                                            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#81C784" />
                                                <stop offset="100%" stopColor="#4CAF50" />
                                            </linearGradient>
                                        </defs>
                                        <path className="circle-bg"
                                            d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path className="circle"
                                            strokeDasharray={`${(pregnancyData.currentWeek / 36) * 100}, 100`}
                                            stroke={pregnancyData.currentWeek > 36 ? "#FF5252" : "url(#greenGradient)"}
                                            d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="circle-content">
                                        <div className="week-display">
                                            <span className="week-number">{pregnancyData.currentWeek}</span>
                                            <span className="week-label">WEEKS</span>
                                            <span className="day-label">& {pregnancyData.currentDay} DAY</span>
                                            <span className="pregnant-label">PREGNANT</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="trimester-progress">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${pregnancyData.progressPercent}%`,
                                                background: getTrimesterColor()
                                            }}
                                        ></div>
                                    </div>
                                    <p className="trimester-label">{getTrimesterName()}</p>
                                </div>

                                <div className="weeks-remaining">
                                    <span className="remaining-number">{pregnancyData.weeksRemaining} weeks remaining</span>
                                </div>

                                <div className="due-date-section">
                                    <div className="due-date-icon"></div>
                                    <div className="due-date-info">
                                        <span className="due-date">Due: {formatDate(pregnancyData.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AshaInteractiveMap />
                        )}
                    </div>

                    {/* Right Column: Metrics & Actions */}
                    <div className="dash-right-col">
                        {user?.role === 'patient' && (
                            <>
                                <div className="health-cards-grid">
                                    {/* Weight Card */}
                                    <div className="health-card weight-card" onClick={() => setEditingField('weight')}>
                                        <div className="health-info">
                                            <span className="health-label">Weight</span>
                                            {editingField === 'weight' ? (
                                                <div className="health-value" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        className="health-input"
                                                        value={healthData.weight || ''}
                                                        onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                                                        autoFocus
                                                    />
                                                    <span className="save-icon" onClick={(e) => { e.stopPropagation(); saveHealthData('weight', healthData.weight); }}>💾</span>
                                                </div>
                                            ) : (
                                                <span className="health-value">
                                                    {healthData.weight ? `${healthData.weight} kg` : '--'}
                                                    <span className="edit-icon">✎</span>
                                                </span>
                                            )}
                                            <span className={`health-badge badge-${getHealthStatus('weight', healthData.weight).color}`}>
                                                {getHealthStatus('weight', healthData.weight).icon} {getHealthStatus('weight', healthData.weight).status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hemoglobin Card */}
                                    <div className="health-card hemoglobin-card" onClick={() => setEditingField('hemoglobin')}>
                                        <div className="health-info">
                                            <span className="health-label">Hemoglobin</span>
                                            {editingField === 'hemoglobin' ? (
                                                <div className="health-value" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="health-input"
                                                        value={healthData.hemoglobin || ''}
                                                        onChange={(e) => setHealthData({ ...healthData, hemoglobin: e.target.value })}
                                                        autoFocus
                                                    />
                                                    <span className="save-icon" onClick={(e) => { e.stopPropagation(); saveHealthData('hemoglobin', healthData.hemoglobin); }}>💾</span>
                                                </div>
                                            ) : (
                                                <span className="health-value">
                                                    {healthData.hemoglobin ? `${healthData.hemoglobin} g/dL` : '--'}
                                                    <span className="edit-icon">✎</span>
                                                </span>
                                            )}
                                            <span className={`health-badge badge-${getHealthStatus('hemoglobin', healthData.hemoglobin).color}`}>
                                                {getHealthStatus('hemoglobin', healthData.hemoglobin).icon} {getHealthStatus('hemoglobin', healthData.hemoglobin).status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Blood Group Card */}
                                    <div className="health-card bp-card" onClick={() => setEditingField('bloodGroup')}>
                                        <div className="health-info">
                                            <span className="health-label">Blood Group</span>
                                            {editingField === 'bloodGroup' ? (
                                                <div className="health-value" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        className="health-input"
                                                        value={healthData.bloodGroup || ''}
                                                        onChange={(e) => setHealthData({ ...healthData, bloodGroup: e.target.value })}
                                                        autoFocus
                                                        style={{ width: '100px' }}
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
                                                    <span className="save-icon" onClick={(e) => { e.stopPropagation(); saveHealthData('bloodGroup', healthData.bloodGroup); }}>💾</span>
                                                </div>
                                            ) : (
                                                <span className="health-value">
                                                    {healthData.bloodGroup || '--'}
                                                    <span className="edit-icon">✎</span>
                                                </span>
                                            )}
                                            <span className="health-badge badge-#E0E0E0">
                                                Click to edit
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="upload-health-btn" onClick={() => navigate('/health')}>
                                    Upload Health Report
                                </button>
                            </>
                        )}

                        {/* Quick Actions - Only for patients */}
                        {user?.role === 'patient' && (
                            <div className="quick-actions-section">
                                <h3>Quick Actions</h3>
                                <div className="action-cards">
                                    <div className="action-card" onClick={() => navigate('/yoga')}>
                                        <div className="action-icon-img">
                                            <img src="/yoga-home-icon-new.jpg" alt="Yoga" />
                                        </div>
                                        <span>Yoga</span>
                                    </div>
                                    <div className="action-card" onClick={() => navigate('/chatbot')}>
                                        <div className="action-icon-img">
                                            <img src="/chatbot-new.jpg" alt="AI Assistant" />
                                        </div>
                                        <span>AI Assistant</span>
                                    </div>
                                    <div className="action-card" onClick={() => navigate('/find-care')}>
                                        <div className="action-icon-img">
                                            <img src="/care-icon-new.jpg" alt="Find Care" />
                                        </div>
                                        <span>Find Care</span>
                                    </div>
                                    <div className="action-card" onClick={() => navigate('/health')}>
                                        <div className="action-icon-img">
                                            <img src="/health-icon-new.jpg" alt="Analytics" />
                                        </div>
                                        <span>Analytics</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ASHA Worker - Patient List in Right Column */}
                        {user?.role === 'asha' && (
                            <AshaWorkerPatientList />
                        )}

                        {/* ASHA Worker - Only show for patients */}
                        {user?.role === 'patient' && (
                            <div className="asha-worker-card">
                                <h3>Your ASHA Worker</h3>
                                <div className="asha-content">
                                    <div className="asha-avatar">PHC</div>
                                    <div className="asha-details">
                                        <h4>Smt. Radha Devi</h4>
                                        <p>Location: 2.3 km away</p>
                                    </div>
                                    <div className="asha-actions">
                                        <a href="tel:+919876543210" className="asha-call-btn">Call Worker</a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips & Info - Only for patients */}
                {user?.role === 'patient' && (
                    <div className="info-cards-grid">
                        <div className="info-card tip-card-yoga-style">
                            <h4>Nutrition Tip</h4>
                            <p>Eat iron-rich foods like spinach and pomegranate for energy.</p>
                        </div>
                        <div className="info-card tip-card-yoga-style">
                            <h4>Wellness Tip</h4>
                            <p>Practice deep breathing for 5 minutes daily to stay calm.</p>
                        </div>
                    </div>
                )}

                {/* Emergency */}
                <div className="emergency-bar">
                    <span>Emergency?</span>
                    <div className="emergency-btns">
                        <a href="tel:102" className="em-btn">Ambulance 102</a>
                        <a href="tel:108" className="em-btn">Ambulance 108</a>
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
        return risk === 'High' ? '#FF6B6B' : '#81C784';
    };

    const getHemoglobinStatus = (hb) => {
        if (hb < 11) return { status: 'Low', color: '#FF6B6B' };
        if (hb < 12) return { status: 'Monitor', color: '#FFB74D' };
        return { status: 'Normal', color: '#81C784' };
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

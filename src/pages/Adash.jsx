import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { translations } from '../translations/translations';
import './Adash.css';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Create custom icon for ASHA worker (green)
const ashaIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to update map view
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], 14);
        }
    }, [center, map]);
    return null;
};

// Haversine formula to calculate distance between two lat/lng points in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
};

const deg2rad = (deg) => deg * (Math.PI / 180);

const Adash = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const t = translations[language]?.asha || translations['en'].asha;
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
    const [selectedMapPatientId, setSelectedMapPatientId] = useState(null);
    const [workerLocation, setWorkerLocation] = useState(null); // Initialize as null to wait for GPS
    const [locationError, setLocationError] = useState(null);

    // Demo patients fallback with simulated coordinates
    const demoPatients = [
        { id: 1, name: 'Priya Sharma', age: 26, currentWeek: 24, hemoglobin: 10.5, weight: 58, riskLevel: 'High', dueDate: '2026-04-15', address: 'House 42, Sector 12, Village Rampur', location: { lat: 28.6139, lng: 77.2090 }, phone: '+919876543210' },
        { id: 2, name: 'Anjali Verma', age: 29, currentWeek: 32, hemoglobin: 11.8, weight: 62, riskLevel: 'Low', dueDate: '2026-03-20', address: 'House 15, Main Road, Village Rampur', location: { lat: 28.6150, lng: 77.2100 }, phone: '+919876543211' },
        { id: 3, name: 'Sunita Devi', age: 23, currentWeek: 16, hemoglobin: 9.8, weight: 52, riskLevel: 'High', dueDate: '2026-06-10', address: 'House 8, Near Temple, Village Rampur', location: { lat: 28.6120, lng: 77.2080 }, phone: '+919876543212' },
        { id: 4, name: 'Kavita Singh', age: 31, currentWeek: 28, hemoglobin: 12.2, weight: 65, riskLevel: 'Low', dueDate: '2026-04-05', address: 'House 23, School Road, Village Rampur', location: { lat: 28.6160, lng: 77.2110 }, phone: '+919876543213' }
    ];

    // Get real-time geolocation of the ASHA worker and sync to Firestore
    useEffect(() => {
        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const newLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setWorkerLocation(newLoc);

                    // Sync ASHA location to Firestore every time it changes
                    if (user?.uid) {
                        try {
                            const userRef = doc(db, "users", user.uid);
                            await setDoc(userRef, { location: newLoc }, { merge: true });
                        } catch (err) {
                            console.error("Error syncing ASHA location:", err);
                        }
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Please enable location for distance tracking");
                    // Fallback to demo location after error
                    if (!workerLocation) {
                        setWorkerLocation({ lat: 28.6129, lng: 77.2085 });
                    }
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [user?.uid]);

    useEffect(() => {
        const fetchPatients = async () => {
            if (!user?.uid) return;

            try {
                // Fetch patients in the same district as the ASHA worker
                const q = query(
                    collection(db, "users"),
                    where("role", "==", "patient"),
                    where("district", "==", user?.district || "")
                );

                const querySnapshot = await getDocs(q);
                let fetchedPatients = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (fetchedPatients.length === 0) {
                    fetchedPatients = demoPatients;
                }

                // Calculate distance for all patients based on current worker location
                const patientsWithDistance = fetchedPatients.map(p => {
                    // Use stored location or fallback to demo coordinates if missing
                    const patientLat = p.location?.lat || 28.6130;
                    const patientLng = p.location?.lng || 77.2090;
                    const dist = calculateDistance(
                        workerLocation.lat,
                        workerLocation.lng,
                        patientLat,
                        patientLng
                    );
                    return { ...p, distance: dist };
                });

                // Sort by distance (nearest first)
                patientsWithDistance.sort((a, b) => a.distance - b.distance);

                setPatients(patientsWithDistance);
                if (patientsWithDistance.length > 0) {
                    setSelectedMapPatientId(patientsWithDistance[0].id);
                }
            } catch (error) {
                console.error("Error fetching patients from Firestore:", error);
                const withDist = demoPatients.map(p => ({
                    ...p,
                    distance: calculateDistance(workerLocation.lat, workerLocation.lng, p.location.lat, p.location.lng)
                })).sort((a, b) => a.distance - b.distance);
                setPatients(withDist);
                setSelectedMapPatientId(withDist[0].id);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, [user, workerLocation]); // Refresh when location changes

    const selectedMapPatient = patients.find(p => p.id === selectedMapPatientId) || patients[0];

    return (
        <div className="asha-dashboard-premium">
            <div className="dashboard-content">
                <div className="dash-premium-header">
                    <div className="profile-pill">
                        <div className="profile-icon">👩‍⚕️</div>
                        <div className="welcome-text">
                            <h3>{t.hello}, {user?.name || 'ASHA Worker'}!</h3>
                            <p className="asha-header-meta">
                                <span>📞 {user?.mobile || '9876543210'}</span>
                                <span className="meta-sep">•</span>
                                <span>📍 {user?.village || 'Village Rampur'}{user?.district ? `, ${user.district}` : ''}</span>
                                <span className="meta-sep">•</span>
                                {workerLocation ? 'Live Tracking Active' : 'Initializing GPS...'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-main-columns">
                    {selectedPatientForDetail ? (
                        <div className="dash-full-col">
                            <PatientDetailView
                                patient={selectedPatientForDetail}
                                onBack={() => setSelectedPatientForDetail(null)}
                                t={t}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="dash-left-col">
                                <AshaInteractiveMap
                                    selectedPatient={selectedMapPatient}
                                    ashaLocation={workerLocation}
                                    onSelectPatient={setSelectedMapPatientId}
                                    allPatients={patients}
                                    t={t}
                                />
                            </div>
                            <div className="dash-right-col">
                                <AshaWorkerPatientList
                                    onSelectPatientDetail={setSelectedPatientForDetail}
                                    onSelectMapPatient={setSelectedMapPatientId}
                                    patients={patients}
                                    t={t}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ASHA Interactive Map Component
const AshaInteractiveMap = ({ selectedPatient, ashaLocation, onSelectPatient, allPatients, t }) => {
    const getEstimatedTime = (distance) => Math.round((distance / 3) * 60);

    const openDirections = (patient) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ashaLocation.lat},${ashaLocation.lng}&destination=${patient.location.lat},${patient.location.lng}&travelmode=walking`;
        window.open(directionsUrl, '_blank');
    };

    if (!selectedPatient) return null;

    return (
        <div className="asha-map-container">
            <div className="map-header">
                <h3>{t.mapTitle}</h3>
                <span className="your-location">
                    <span className="village-badge">Village Context</span>
                    Nearest: {selectedPatient.name}
                </span>
            </div>
            <div className="map-preview">
                {ashaLocation && (
                    <MapContainer
                        center={[ashaLocation.lat, ashaLocation.lng]}
                        zoom={14}
                        style={{ height: '300px', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {/* ASHA Worker Marker */}
                        <Marker position={[ashaLocation.lat, ashaLocation.lng]} icon={ashaIcon}>
                            <Popup>{t.hello}, <b>ASHA Worker</b><br />Your current location</Popup>
                        </Marker>

                        {/* Patient Markers */}
                        {allPatients.map(p => (
                            <Marker
                                key={p.id}
                                position={[p.location?.lat || 28.6139, p.location?.lng || 77.2090]}
                                eventHandlers={{
                                    click: () => onSelectPatient(p.id),
                                }}
                            >
                                <Popup>
                                    <b>{p.name}</b><br />
                                    {p.village || 'Local Village'}<br />
                                    {p.distance} km away
                                </Popup>
                            </Marker>
                        ))}

                        <RecenterMap center={selectedPatient.location || ashaLocation} />
                    </MapContainer>
                )}
            </div>
            <div className="patient-selection">
                <h4>{t.selectPatient}</h4>
                <div className="patient-chips">
                    {allPatients.map((patient) => (
                        <button
                            key={patient.id}
                            className={`patient-chip ${selectedPatient.id === patient.id ? 'selected' : ''}`}
                            onClick={() => onSelectPatient(patient.id)}
                        >
                            {patient.name} ({patient.distance}km)
                        </button>
                    ))}
                </div>
            </div>
            <div className="route-info">
                <div className="route-details">
                    <div className="route-stat">
                        <div>
                            <span className="stat-label">{t.distance}</span>
                            <span className="stat-value">{selectedPatient.distance} km</span>
                        </div>
                    </div>
                    <div className="route-stat">
                        <div>
                            <span className="stat-label">{t.estTime}</span>
                            <span className="stat-value">{getEstimatedTime(selectedPatient.distance)} min</span>
                        </div>
                    </div>
                </div>
                <button className="get-directions-btn" onClick={() => openDirections(selectedPatient)}>
                    {t.getDirections} →
                </button>
            </div>
        </div>
    );
};

// Patient Detail View Component
const PatientDetailView = ({ patient, onBack, t }) => {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showVisitForm, setShowVisitForm] = useState(false);
    const [visitData, setVisitData] = useState({
        weight: '',
        hemoglobin: '',
        bp: '',
        notes: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(
                    collection(db, "visits"),
                    where("patientId", "==", patient.id),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedHistory = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setHistory(fetchedHistory);
            } catch (error) {
                console.error("Error fetching visit history:", error);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [patient.id]);

    const handleLogVisit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newVisit = {
                patientId: patient.id,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                ...visitData,
                weight: parseFloat(visitData.weight),
                hemoglobin: parseFloat(visitData.hemoglobin)
            };
            const docRef = await addDoc(collection(db, "visits"), newVisit);
            setHistory([{ id: docRef.id, ...newVisit, createdAt: new Date() }, ...history]);
            setShowVisitForm(false);
            setVisitData({ weight: '', hemoglobin: '', bp: '', notes: '' });
        } catch (error) {
            console.error("Error logging visit:", error);
        } finally {
            setSaving(false);
        }
    };

    const mockReports = [
        { id: 101, title: 'Anatomy Scan', date: '2025-11-20', type: 'PDF', status: 'Normal' },
        { id: 102, title: 'Blood Panel', date: '2025-11-05', type: 'Lab', status: 'Attention: Low Iron' },
        { id: 103, title: 'Urine Analysis', date: '2025-10-12', type: 'Lab', status: 'Clear' }
    ];

    return (
        <div className="patient-detail-view-container">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>← {t.back}</button>
                <h2>{patient.name}'s {t.medicalHistory}</h2>
            </div>

            <div className="detail-grid">
                <div className="detail-sidebar">
                    <div className="patient-summary-card">
                        <div className="summary-row">
                            <span className="summary-label">Age</span>
                            <span className="summary-value">{patient.age} Yrs</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Current Week</span>
                            <span className="summary-value">Week {patient.currentWeek}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Due Date</span>
                            <span className="summary-value">{new Date(patient.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Contact</span>
                            <span className="summary-value">{patient.phone}</span>
                        </div>
                    </div>
                </div>

                <div className="detail-main">
                    <section className="history-section">
                        <div className="section-header-row">
                            <h3>{t.visitHistory}</h3>
                            <button className="log-visit-toggle" onClick={() => setShowVisitForm(!showVisitForm)}>
                                {showVisitForm ? 'Cancel' : '+ Log Visit'}
                            </button>
                        </div>

                        {showVisitForm && (
                            <form className="log-visit-form fade-in" onSubmit={handleLogVisit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input
                                            type="number" step="0.1" required
                                            value={visitData.weight}
                                            onChange={(e) => setVisitData({ ...visitData, weight: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hemoglobin (g/dL)</label>
                                        <input
                                            type="number" step="0.1" required
                                            value={visitData.hemoglobin}
                                            onChange={(e) => setVisitData({ ...visitData, hemoglobin: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Pressure</label>
                                        <input
                                            type="text" placeholder="120/80" required
                                            value={visitData.bp}
                                            onChange={(e) => setVisitData({ ...visitData, bp: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Visit Notes</label>
                                    <textarea
                                        rows="2" required
                                        value={visitData.notes}
                                        onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={saving} className="submit-visit-btn">
                                    {saving ? 'Saving...' : 'Save Visit Record'}
                                </button>
                            </form>
                        )}

                        <div className="history-timeline">
                            {loadingHistory ? (
                                <div className="mini-loader">Fetching history...</div>
                            ) : history.length > 0 ? (
                                history.map((visit, idx) => (
                                    <div key={visit.id || idx} className="history-item">
                                        <div className="visit-date">{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        <div className="visit-metrics">
                                            <span>Weight: {visit.weight}kg</span>
                                            <span>Hb: {visit.hemoglobin}g/dL</span>
                                            <span>BP: {visit.bp}</span>
                                        </div>
                                        <p className="visit-notes">{visit.notes}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-history">No visits recorded yet.</p>
                            )}
                        </div>
                    </section>

                    <section className="reports-section">
                        <h3>{t.recentReports}</h3>
                        <div className="reports-list">
                            {mockReports.map(report => (
                                <div key={report.id} className="report-item">
                                    <div className="report-info">
                                        <span className="report-title">{report.title}</span>
                                        <span className="report-meta">{report.date} • {report.type}</span>
                                    </div>
                                    <div className="report-status-badge" data-status={report.status.toLowerCase().includes('attention') ? 'warning' : 'normal'}>
                                        {report.status}
                                    </div>
                                    <button className="view-report-btn">View</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// ASHA Worker Patient List Component
const AshaWorkerPatientList = ({ onSelectPatientDetail, onSelectMapPatient, patients, t }) => {
    const [sortOption, setSortOption] = useState('distance'); // Default to distance now!

    const getRiskColor = (risk) => risk === 'High' ? '#FF6B6B' : '#E91E63';
    const getHemoglobinStatus = (hb) => {
        if (hb < 11) return { status: 'Low', color: '#FF6B6B' };
        if (hb < 12) return { status: 'Monitor', color: '#FFB74D' };
        return { status: 'Normal', color: '#E91E63' };
    };

    const sortedPatients = [...patients].sort((a, b) => {
        if (sortOption === 'distance') return a.distance - b.distance;
        if (sortOption === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortOption === 'risk') return (a.riskLevel === 'High' ? 0 : 1) - (b.riskLevel === 'High' ? 0 : 1);
        return 0;
    });

    return (
        <div className="asha-patients-container">
            <div className="asha-patients-header">
                <h3>{t.nearestPatients}</h3>
                <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="distance">Nearest First</option>
                    <option value="dueDate">Due Date</option>
                    <option value="risk">Risk Level</option>
                </select>
            </div>
            <div className="patients-list">
                {sortedPatients.map((patient) => (
                    <div key={patient.id} className="patient-card clickable" onClick={() => onSelectPatientDetail(patient)}>
                        <div className="patient-card-header">
                            <div className="patient-basic-info">
                                <h4>{patient.name}</h4>
                                <div className="patient-meta-row">
                                    <span className="village-badge">{patient.village || 'Local Village'}</span>
                                    <span className="patient-distance-tag">
                                        <span className="distance-highlight">{patient.distance}</span> km away
                                    </span>
                                </div>
                            </div>
                            <span className="risk-badge" style={{ backgroundColor: getRiskColor(patient.riskLevel) }}>
                                {patient.riskLevel} Risk
                            </span>
                        </div>
                        <div className="patient-health-metrics">
                            <div className="metric-item">
                                <span className="metric-label">Hemoglobin</span>
                                <span className="metric-value">{patient.hemoglobin}</span>
                                <span className="metric-status" style={{ color: getHemoglobinStatus(patient.hemoglobin).color }}>
                                    {getHemoglobinStatus(patient.hemoglobin).status}
                                </span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Weight</span>
                                <span className="metric-value">{patient.weight} kg</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Due Date</span>
                                <span className="metric-value">{new Date(patient.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        </div>
                        <div className="patient-actions" onClick={(e) => e.stopPropagation()}>
                            <a href={`tel:${patient.phone}`} className="action-btn call-btn">{t.call}</a>
                            <button className="action-btn map-btn" onClick={() => onSelectMapPatient(patient.id)}>{t.map}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Adash;

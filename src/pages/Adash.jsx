import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // UPDATED
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, orderBy, serverTimestamp, limit } from 'firebase/firestore'; // Added limit
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Adash.css';

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ashaIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng]);
        }
    }, [center, map]);
    return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
};


const deg2rad = (deg) => deg * (Math.PI / 180);

const Adash = () => {
    const { user } = useAuth();
    const { t } = useTranslation('pages'); // UPDATED: Load 'pages' namespace
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
    const [selectedMapPatientId, setSelectedMapPatientId] = useState(null);
    const [workerLocation, setWorkerLocation] = useState(null); // Initialize as null to wait for GPS
    const [locationError, setLocationError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({
        patientsCount: 0,
        usersCount: 0,
        filteredCount: 0,
        workerVillage: '',
        workerDistrict: '',
        allPotentialPatients: []
    });



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
                            const userRef = doc(db, "asha_workers", user.uid);
                            await setDoc(userRef, {
                                location: newLoc,
                                lastActive: serverTimestamp()
                            }, { merge: true });
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
            if (!user?.uid || !workerLocation) {
                console.log("⏳ Waiting for GPS location...");
                return;
            }

            try {
                // FETCH STRATEGY - BROAD SEARCH
                const patientsRef = collection(db, "patients");
                const patientsSnap = await getDocs(query(patientsRef));
                let allPatients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // CASE-INSENSITIVE FILTERING
                const workerVillage = (user?.village || "").toLowerCase().trim();
                const workerDistrict = (user?.district || "").toLowerCase().trim();

                let fetchedPatients = allPatients.filter(p => {
                    const pVillage = (p.village || "").toLowerCase().trim();
                    const pDistrict = (p.district || "").toLowerCase().trim();
                    return pVillage === workerVillage && pDistrict === workerDistrict;
                });

                // FALLBACK: District wide if village is empty
                if (fetchedPatients.length === 0) {
                    fetchedPatients = allPatients.filter(p =>
                        (p.district || "").toLowerCase().trim() === workerDistrict
                    );
                }

                // FETCH LATEST REPORTS FOR EACH PATIENT
                const patientsWithReports = await Promise.all(fetchedPatients.map(async (p) => {
                    try {
                        // Query for latest report
                        const q = query(
                            collection(db, "health_reports"),
                            where("appUserId", "==", p.id),
                            orderBy("createdAt", "desc"),
                            limit(1)
                        );
                        const reportSnap = await getDocs(q);

                        let latestReport = null;
                        if (!reportSnap.empty) {
                            latestReport = reportSnap.docs[0].data();
                        }

                        // Use stored location or fallback
                        const patientLat = p.location?.lat || 28.6130;
                        const patientLng = p.location?.lng || 77.2090;
                        const dist = calculateDistance(
                            workerLocation.lat,
                            workerLocation.lng,
                            patientLat,
                            patientLng
                        );

                        return {
                            ...p,
                            distance: dist,
                            latestReport: latestReport,
                            // Derived fields for easy display
                            riskLevel: latestReport?.risk?.level || 'Unknown',
                            hemoglobin: latestReport?.vitals?.hemoglobin || p.hemoglobin || '--',
                            weight: latestReport?.vitals?.weight || p.weight || '--'
                        };
                    } catch (err) {
                        console.error(`Error fetching report for ${p.id}:`, err);
                        return { ...p, distance: 0, riskLevel: 'Unknown' };
                    }
                }));

                // Sort by distance
                patientsWithReports.sort((a, b) => a.distance - b.distance);

                setPatients(patientsWithReports);
                if (patientsWithReports.length > 0) {
                    setSelectedMapPatientId(patientsWithReports[0].id);
                }
            } catch (error) {
                console.error("❌ Error fetching patients:", error);
                setPatients([]);
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
                            <h3>{t('asha.hello')}, {user?.name || 'ASHA Worker'}!</h3>
                            <div className="asha-header-meta">
                                <span>📞 {user?.mobile || '9876543210'}</span>
                                <span className="meta-sep">•</span>
                                <span>📍 {user?.village || 'Village Rampur'}{user?.district ? `, ${user.district}` : ''}</span>
                                <span className="meta-sep">•</span>
                                {workerLocation ? (
                                    <div className="live-location-tag">
                                        <div className="pulse-dot"></div>
                                        Live Tracking Active
                                    </div>
                                ) : (
                                    <span style={{ color: '#888' }}>Initializing GPS...</span>
                                )}
                            </div>
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


                {/* DEBUG PANEL - Hidden if patients found, but useful for troubleshooting */}
                {patients.length === 0 && (
                    <div style={{
                        background: '#fff3cd',
                        padding: '20px',
                        borderRadius: '12px',
                        marginTop: '20px',
                        border: '1px solid #ffeeba',
                        fontSize: '0.9rem',
                        color: '#856404'
                    }}>
                        <h4>🔍 Diagnostic Info (No patients found)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                            <div>
                                <p><strong>ASHA Location:</strong> {debugInfo.workerVillage}, {debugInfo.workerDistrict}</p>
                                <p><strong>Collections:</strong> patients({debugInfo.patientsCount}), users({debugInfo.usersCount})</p>
                            </div>
                            <div>
                                <p><strong>All Patients in DB:</strong></p>
                                <ul style={{ paddingLeft: '20px' }}>
                                    {debugInfo.allPotentialPatients.length > 0 ? (
                                        debugInfo.allPotentialPatients.slice(0, 5).map((p, i) => (
                                            <li key={i}>{p.name} ({p.village}, {p.district})</li>
                                        ))
                                    ) : (
                                        <li>No patients found in DB at all</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                            Ensure patients are registered in <strong>{debugInfo.workerDistrict}</strong> district to see them.
                        </p>
                    </div>
                )}
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
                <h3>{t('asha.mapTitle')}</h3>
                <span className="your-location">
                    <span className="village-badge">Village Context</span>
                    {allPatients.length > 0 && (
                        <>Closest Patient: <strong>{allPatients[0].name}</strong> ({allPatients[0].distance} km)</>
                    )}
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
                            <Popup>{t('asha.hello')}, <b>ASHA Worker</b><br />Your current location</Popup>
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
                <h4>{t('asha.selectPatient')}</h4>
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
                            <span className="stat-label">{t('asha.distance')}</span>
                            <span className="stat-value">{selectedPatient.distance} km</span>
                        </div>
                    </div>
                    <div className="route-stat">
                        <div>
                            <span className="stat-label">{t('asha.estTime')}</span>
                            <span className="stat-value">{getEstimatedTime(selectedPatient.distance)} min</span>
                        </div>
                    </div>
                </div>
                <button className="get-directions-btn" onClick={() => openDirections(selectedPatient)}>
                    {t('asha.getDirections')} →
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
                // Fetch using BOTH userId and appUserId to be 100% sure
                const qApp = query(
                    collection(db, "health_reports"),
                    where("appUserId", "==", patient.id)
                );
                const qSys = query(
                    collection(db, "health_reports"),
                    where("userId", "==", patient.id)
                );

                const [snapApp, snapSys] = await Promise.all([
                    getDocs(qApp).catch(() => ({ docs: [] })),
                    getDocs(qSys).catch(() => ({ docs: [] }))
                ]);

                const fetchedHistory = [
                    ...snapApp.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                    ...snapSys.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                ];

                // Remove duplicates
                const seen = new Set();
                const uniqueHistory = fetchedHistory.filter(h => {
                    if (seen.has(h.id)) return false;
                    seen.add(h.id);
                    return true;
                });

                // Memory sort to avoid needing custom indexes
                uniqueHistory.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || new Date(a.date || 0).getTime() / 1000;
                    const timeB = b.createdAt?.seconds || new Date(b.date || 0).getTime() / 1000;
                    return timeB - timeA;
                });

                setHistory(uniqueHistory);
            } catch (error) {
                console.error("Error fetching health reports:", error);
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
                appUserId: patient.id, // Primary identification
                userId: auth.currentUser?.uid || 'anon', // Security session ID
                userMobile: patient.mobile || patient.phone || null,
                userName: patient.name || patient.fullName || 'Patient',
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                notes: visitData.notes,
                vitals: {
                    weight: parseFloat(visitData.weight),
                    hemoglobin: parseFloat(visitData.hemoglobin),
                    bloodPressure: visitData.bp,
                    // Map common fields for history dashboard
                    systolicBP: visitData.bp.split('/')[0] || null,
                    diastolicBP: visitData.bp.split('/')[1] || null
                },
                risk: {
                    level: 'Manual Log',
                    color: 'blue',
                    advice: visitData.notes || 'Routine checkup logged by ASHA worker.'
                }
            };
            const docRef = await addDoc(collection(db, "health_reports"), newVisit);
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
                <button className="back-btn" onClick={onBack}>← {t('asha.back')}</button>
                <h2>{patient.name}'s {t('asha.medicalHistory')}</h2>
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

                        <div className="location-update-box" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                            <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: '#666' }}>
                                Location: {patient.location ? '✅ Set' : '⚠️ Not Set'}
                            </p>
                            <button
                                className="action-btn-secondary"
                                style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
                                onClick={async () => {
                                    if (!navigator.geolocation) {
                                        alert("Geolocation is not supported by this browser.");
                                        return;
                                    }
                                    const confirmUpdate = window.confirm("Update this patient's location to your CURRENT location?");
                                    if (!confirmUpdate) return;

                                    navigator.geolocation.getCurrentPosition(async (position) => {
                                        const newLoc = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        };
                                        try {
                                            // Update patient document
                                            const patientRef = doc(db, "patients", patient.id);
                                            await setDoc(patientRef, { location: newLoc }, { merge: true });
                                            alert("✅ Patient location updated successfully!");
                                            // Optional: trigger refresh
                                            window.location.reload();
                                        } catch (err) {
                                            console.error("Error updating location:", err);
                                            alert("Failed to update location.");
                                        }
                                    }, (err) => {
                                        console.error("GPS Error:", err);
                                        alert("Could not get your current location. Please enable GPS.");
                                    });
                                }}
                            >
                                📍 Pin Location Here
                            </button>
                        </div>
                    </div>
                </div>

                <div className="detail-main">
                    <section className="history-section">
                        <div className="section-header-row">
                            <h3>{t('asha.visitHistory')}</h3>
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
                                <div className="mini-loader">Fetching analysis history...</div>
                            ) : history.length > 0 ? (
                                history.map((report, idx) => (
                                    <div key={report.id || idx} className="history-item">
                                        <div className="visit-date">
                                            {report.createdAt?.seconds
                                                ? new Date(report.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            }
                                        </div>
                                        <div className="visit-metrics">
                                            <span style={{
                                                color: report.risk?.color === 'red' ? '#FF5252' : '#4CAF50',
                                                fontWeight: '700'
                                            }}>
                                                Risk Level: {report.risk?.level || 'N/A'}
                                            </span>
                                            {report.vitals && (
                                                <>
                                                    <span>Hb: {report.vitals.hemoglobin} g/dL</span>
                                                    <span>BP: {report.vitals.systolicBP}/{report.vitals.diastolicBP}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="visit-notes">
                                            {report.risk?.factors && report.risk.factors.length > 0 && (
                                                <div className="risk-factors-mini">
                                                    {report.risk.factors.map((f, i) => (
                                                        <span key={i} className="mini-factor-tag">{f}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {report.notes && <p>{report.notes}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-history">No medical analysis reports found for this patient.</p>
                            )}
                        </div>
                    </section>

                    <section className="reports-section">
                        <h3>{t('asha.recentReports')}</h3>
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
                <h3>{t('asha.nearestPatients')} ({patients.length})</h3>
                <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="distance">🎯 Nearest First</option>
                    <option value="dueDate">📅 Due Date</option>
                    <option value="risk">⚠️ Risk Level</option>
                </select>
            </div>
            <div className="patients-list">
                {sortedPatients.map((patient) => (
                    <div key={patient.id} className="patient-card clickable" onClick={() => onSelectPatientDetail(patient)}>
                        <div className="patient-card-header">
                            <div className="patient-basic-info">
                                <h4>{patient.name}</h4>
                                <div className="patient-meta-row">
                                    <span className="village-badge">
                                        {patient.isDistrictWide && ' (District)'}
                                        {patient.isEmergencyMatch && ' (🚨 EMERGENCY - NO MATCH)'}
                                    </span>
                                    <span className="patient-distance-tag">
                                        <span className="distance-highlight">{patient.distance}</span> km away
                                    </span>
                                </div>
                            </div>
                            <span className="risk-badge" style={{ backgroundColor: getRiskColor(patient.riskLevel) }}>
                                {patient.riskLevel} Risk
                            </span>
                        </div>
                        {patient.latestReport && (
                            <div className="patient-last-update">
                                🕒 {t('before') || 'Last Update'}: {new Date(patient.latestReport.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </div>
                        )}
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
                            <a href={`tel:${patient.phone}`} className="action-btn call-btn">{t('asha.call')}</a>
                            <button className="action-btn map-btn" onClick={() => onSelectMapPatient(patient.id)}>{t('asha.map')}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Adash;

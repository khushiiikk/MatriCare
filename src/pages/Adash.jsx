import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // UPDATED
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, setDoc, doc, orderBy, serverTimestamp, limit } from 'firebase/firestore'; // Added limit
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
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

                if (fetchedPatients.length === 0) {
                    fetchedPatients = allPatients.filter(p =>
                        (p.district || "").toLowerCase().trim() === workerDistrict
                    );
                }

                // Check for SOS status
                fetchedPatients = fetchedPatients.map(p => ({
                    ...p,
                    isUrgent: p.status === 'SOS' || p.status === 'emergency'
                }));

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
        <>
            <Navbar />
            <div className="asha-dashboard-premium">
                <div className="dashboard-content">
                    <div className="clinical-dashboard-greeting">
                        <h2>{t('asha.hello')}, {user?.name || 'ASHA Worker'}!</h2>
                        <div className="asha-header-meta">
                            <span>{user?.village || 'Village'}{user?.district ? `, ${user.district}` : ''}</span>
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
                                        selectedId={selectedMapPatientId}
                                        t={t}
                                    />
                                </div>
                            </>
                        )}
                    </div>


                    {/* EMPTY STATE */}
                    {patients.length === 0 && !loading && (
                        <div className="asha-empty-state fade-in">
                            <div className="empty-state-icon">No Patients</div>
                            <h3>No Patients Assigned Yet</h3>
                            <p>When mothers in <b>{user?.village || 'your village'} ({user?.district})</b> register on MatriCare, they will automatically appear here.</p>
                            <div className="diagnostic-help">
                                <h4>Troubleshooting</h4>
                                <ul>
                                    <li>Ensure GPS is enabled and permissions are granted</li>
                                    <li>Check if your Village & District match the patient's profile</li>
                                    <li>Patients must have completed their initial profile setup</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
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
                            {patient.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="route-info">
                <button className="get-directions-btn" onClick={() => openDirections(selectedPatient)}>
                    {t('asha.getDirections')} →
                </button>
            </div>
        </div>
    );
};

// Patient Detail View Component
const PatientDetailView = ({ patient, onBack, t }) => {
    const { t: tMedical } = useTranslation('medical'); // Add medical translations for field definitions
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

    // Unified reports history (merging visit history and reports)
    const combinedHistory = [...history]; // In a real app, this might merge different collections

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
                                Location: {patient.location ? 'Set' : 'Not Set'}
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
                                Pin Location Here
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
                                        <div
                                            className="visit-date clickable-date"
                                            onClick={() => {
                                                const element = document.getElementById(`report-${report.id || idx}`);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    element.classList.add('highlight-report');
                                                    setTimeout(() => element.classList.remove('highlight-report'), 2000);
                                                }
                                            }}
                                        >
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

                    <section className="comprehensive-reports-section">
                        <h3>Complete Medical Analysis</h3>

                        {history.length > 0 ? (
                            history.map((report, idx) => (
                                <div
                                    key={report.id || idx}
                                    id={`report-${report.id || idx}`}
                                    className="comprehensive-report-card"
                                >
                                    <div className="report-header-row">
                                        <div className="report-date-badge">
                                            {report.createdAt?.seconds
                                                ? new Date(report.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className={`risk-level-badge risk-${report.risk?.color || 'gray'}`}>
                                            {report.risk?.level || 'Unknown Risk'}
                                        </div>
                                    </div>

                                    {/* Vitals Section */}
                                    <div className="medical-section">
                                        <h4 className="section-title">Vital Signs</h4>
                                        <div className="medical-fields-grid">
                                            {report.vitals && (
                                                <>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Age</span>
                                                        <span className="field-value">{report.vitals.age || 'N/A'} years</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.age.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Weight</span>
                                                        <span className="field-value">{report.vitals.weight || 'N/A'} kg</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.weight.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Hemoglobin</span>
                                                        <span className="field-value">{report.vitals.hemoglobin || 'N/A'} g/dL</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.hemoglobin.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Systolic BP</span>
                                                        <span className="field-value">{report.vitals.systolicBP || 'N/A'} mmHg</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.systolicBP.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Diastolic BP</span>
                                                        <span className="field-value">{report.vitals.diastolicBP || 'N/A'} mmHg</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.diastolicBP.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Blood Glucose</span>
                                                        <span className="field-value">{report.vitals.bloodGlucose || 'N/A'} mg/dL</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.bloodGlucose.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Body Temp</span>
                                                        <span className="field-value">{report.vitals.bodyTemp || 'N/A'} °F</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.bodyTemp.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Heart Rate</span>
                                                        <span className="field-value">{report.vitals.heartRate || 'N/A'} BPM</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.heartRate.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">HbA1c</span>
                                                        <span className="field-value">{report.vitals.hba1c || 'N/A'} %</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.hba1c.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Respiration Rate</span>
                                                        <span className="field-value">{report.vitals.respirationRate || 'N/A'} /min</span>
                                                        <div className="medical-tooltip">{tMedical('vitals.respirationRate.desc')}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pregnancy History Section */}
                                    <div className="medical-section">
                                        <h4 className="section-title">Pregnancy History</h4>
                                        <div className="medical-fields-grid">
                                            {report.vitals && (
                                                <>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Gravida (G)</span>
                                                        <span className="field-value">{report.vitals.gravida || '0'}</span>
                                                        <div className="medical-tooltip">{tMedical('history.gravida.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Para (P)</span>
                                                        <span className="field-value">{report.vitals.para || '0'}</span>
                                                        <div className="medical-tooltip">{tMedical('history.para.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Live Births</span>
                                                        <span className="field-value">{report.vitals.liveBirths || '0'}</span>
                                                        <div className="medical-tooltip">{tMedical('history.liveBirths.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Abortions</span>
                                                        <span className="field-value">{report.vitals.abortions || '0'}</span>
                                                        <div className="medical-tooltip">{tMedical('history.abortions.desc')}</div>
                                                    </div>
                                                    <div className="medical-field-with-tooltip">
                                                        <span className="field-label">Child Deaths</span>
                                                        <span className="field-value">{report.vitals.childDeaths || '0'}</span>
                                                        <div className="medical-tooltip">{tMedical('history.childDeaths.desc')}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Risk Assessment Section */}
                                    <div className="medical-section">
                                        <h4 className="section-title">Risk Assessment</h4>
                                        <div className="risk-assessment-content">
                                            <div className="risk-factors-display">
                                                {report.risk?.factors && report.risk.factors.length > 0 ? (
                                                    report.risk.factors.map((factor, i) => (
                                                        <span key={i} className="risk-factor-chip">{factor}</span>
                                                    ))
                                                ) : (
                                                    <p className="no-risk-factors">No specific risk factors identified</p>
                                                )}
                                            </div>
                                            {report.risk?.advice && (
                                                <div className="advice-box">
                                                    <strong>Medical Advice:</strong>
                                                    <p>{report.risk.advice}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ML Prediction if available */}
                                    {report.mlPrediction && (
                                        <div className="medical-section">
                                            <h4 className="section-title">AI Prediction</h4>
                                            <div className="ml-prediction-box">
                                                <p><strong>Prediction:</strong> {report.mlPrediction.prediction === 0 ? 'Low Risk' : 'High Risk'}</p>
                                                {report.mlPrediction.probabilities && (
                                                    <p><strong>Confidence:</strong> {(Math.max(...report.mlPrediction.probabilities) * 100).toFixed(1)}%</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-reports-state">
                                <p>No medical analysis reports found for this patient.</p>
                                <p className="hint-text">Reports will appear here once the patient completes a medical analysis.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

// ASHA Worker Patient List Component (Dense Clinical View)
const AshaWorkerPatientList = ({ onSelectPatientDetail, onSelectMapPatient, patients, selectedId, t }) => {
    return (
        <div className="asha-patients-container">
            <div className="asha-patients-header">
                <h3>{t('asha.clinicalRecords') === 'asha.clinicalRecords' ? 'Clinical Records' : t('asha.clinicalRecords')}</h3>
                <span className="patient-count-badge">{patients.length} Total</span>
            </div>

            <div className="patients-list">
                {patients.map((p) => (
                    <div
                        key={p.id}
                        className={`patient-card ${selectedId === p.id ? 'active' : ''}`}
                        onClick={() => onSelectPatientDetail(p)}
                    >
                        <div className="patient-card-header">
                            <div className="patient-basic-info">
                                <h4>{p.name}</h4>
                                <span className="patient-age-week">{p.age}y • wk {p.currentWeek}</span>
                            </div>
                            <span
                                className={`risk-badge risk-${p.riskLevel?.toLowerCase() || 'unknown'}`}
                                onClick={(e) => { e.stopPropagation(); onSelectPatientDetail(p); }}
                                style={{ cursor: 'pointer' }}
                            >
                                {p.riskLevel && p.riskLevel !== 'Unknown' ? p.riskLevel : 'View Reports'}
                            </span>
                        </div>



                        <div className="patient-actions" onClick={e => e.stopPropagation()}>
                            <a href={`tel:${p.phone || p.mobile}`} className="action-btn call-btn" title="Call Patient">
                                📞
                            </a>
                            <button
                                className="action-btn map-btn"
                                onClick={() => onSelectMapPatient(p.id)}
                                title="Show on Map"
                            >
                                🗺️
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Adash;

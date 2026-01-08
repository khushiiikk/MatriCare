import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Adash.css';

const Adash = () => {
    const { user } = useAuth();
    const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
    const [selectedMapPatientId, setSelectedMapPatientId] = useState(1); // Default to first patient

    const patients = [
        { id: 1, name: 'Priya Sharma', age: 26, currentWeek: 24, hemoglobin: 10.5, weight: 58, riskLevel: 'High', dueDate: '2026-04-15', address: 'House 42, Sector 12, Village Rampur', location: { lat: 28.6139, lng: 77.2090 }, phone: '+919876543210', distance: 0.8 },
        { id: 2, name: 'Anjali Verma', age: 29, currentWeek: 32, hemoglobin: 11.8, weight: 62, riskLevel: 'Low', dueDate: '2026-03-20', address: 'House 15, Main Road, Village Rampur', location: { lat: 28.6150, lng: 77.2100 }, phone: '+919876543211', distance: 1.2 },
        { id: 3, name: 'Sunita Devi', age: 23, currentWeek: 16, hemoglobin: 9.8, weight: 52, riskLevel: 'High', dueDate: '2026-06-10', address: 'House 8, Near Temple, Village Rampur', location: { lat: 28.6120, lng: 77.2080 }, phone: '+919876543212', distance: 1.5 },
        { id: 4, name: 'Kavita Singh', age: 31, currentWeek: 28, hemoglobin: 12.2, weight: 65, riskLevel: 'Low', dueDate: '2026-04-05', address: 'House 23, School Road, Village Rampur', location: { lat: 28.6160, lng: 77.2110 }, phone: '+919876543213', distance: 2.0 }
    ];

    const selectedMapPatient = patients.find(p => p.id === selectedMapPatientId);

    return (
        <div className="asha-dashboard-premium">
            <div className="dashboard-content">
                <div className="dash-premium-header">
                    <div className="profile-pill">
                        <div className="profile-icon">👩‍⚕️</div>
                        <div className="welcome-text">
                            <h3>Hello, {user?.name || 'ASHA Worker'}!</h3>
                            <p className="asha-header-meta">
                                <span>📞 {user?.mobile || '9876543210'}</span>
                                <span className="meta-sep">•</span>
                                <span>📍 {user?.village || 'Village Rampur'}</span>
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
                            />
                        </div>
                    ) : (
                        <>
                            <div className="dash-left-col">
                                <AshaInteractiveMap
                                    selectedPatient={selectedMapPatient}
                                    onSelectPatient={setSelectedMapPatientId}
                                    allPatients={patients}
                                />
                            </div>
                            <div className="dash-right-col">
                                <AshaWorkerPatientList
                                    onSelectPatientDetail={setSelectedPatientForDetail}
                                    onSelectMapPatient={setSelectedMapPatientId}
                                    patients={patients}
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
const AshaInteractiveMap = ({ selectedPatient, onSelectPatient, allPatients }) => {
    const ashaLocation = { lat: 28.6129, lng: 77.2085 };
    const getEstimatedTime = (distance) => Math.round((distance / 3) * 60);

    const openDirections = (patient) => {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${ashaLocation.lat},${ashaLocation.lng}&destination=${patient.location.lat},${patient.location.lng}&travelmode=walking`;
        window.open(directionsUrl, '_blank');
    };

    return (
        <div className="asha-map-container">
            <div className="map-header">
                <h3>Patient Locations</h3>
                <span className="your-location">Village Rampur</span>
            </div>
            <div className="map-preview">
                <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedPatient.location.lat},${selectedPatient.location.lng}&zoom=15`}
                    title="ASHA Worker Location Map"
                ></iframe>
            </div>
            <div className="patient-selection">
                <h4>Select Patient for Route</h4>
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
                    <button className="get-directions-btn" onClick={() => openDirections(selectedPatient)}>
                        Get Directions →
                    </button>
                </div>
            )}
        </div>
    );
};

// Patient Detail View Component
const PatientDetailView = ({ patient, onBack }) => {
    const mockHistory = [
        { date: '2025-12-01', weight: 58.5, hemoglobin: 11.2, bg: '120/80', notes: 'Routine checkup. Fetal heartbeat normal.' },
        { date: '2025-11-05', weight: 57.0, hemoglobin: 10.8, bg: '118/78', notes: 'Reporting mild morning sickness.' },
        { date: '2025-10-10', weight: 55.5, hemoglobin: 10.5, bg: '115/75', notes: 'First trimester screening completed.' }
    ];

    const mockReports = [
        { id: 101, title: 'Anatomy Scan', date: '2025-11-20', type: 'PDF', status: 'Normal' },
        { id: 102, title: 'Blood Panel', date: '2025-11-05', type: 'Lab', status: 'Attention: Low Iron' },
        { id: 103, title: 'Urine Analysis', date: '2025-10-12', type: 'Lab', status: 'Clear' }
    ];

    return (
        <div className="patient-detail-view-container">
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>← Back to Dashboard</button>
                <h2>{patient.name}'s Medical History</h2>
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
                        <h3>Visit History</h3>
                        <div className="history-timeline">
                            {mockHistory.map((visit, idx) => (
                                <div key={idx} className="history-item">
                                    <div className="visit-date">{new Date(visit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div className="visit-metrics">
                                        <span>Weight: {visit.weight}kg</span>
                                        <span>Hb: {visit.hemoglobin}g/dL</span>
                                        <span>BP: {visit.bg}</span>
                                    </div>
                                    <p className="visit-notes">{visit.notes}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="reports-section">
                        <h3>Recent Reports</h3>
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
const AshaWorkerPatientList = ({ onSelectPatientDetail, onSelectMapPatient, patients }) => {
    const [sortOption, setSortOption] = useState('dueDate');

    const getRiskColor = (risk) => risk === 'High' ? '#FF6B6B' : '#E91E63';
    const getHemoglobinStatus = (hb) => {
        if (hb < 11) return { status: 'Low', color: '#FF6B6B' };
        if (hb < 12) return { status: 'Monitor', color: '#FFB74D' };
        return { status: 'Normal', color: '#E91E63' };
    };

    const sortedPatients = [...patients].sort((a, b) => {
        if (sortOption === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortOption === 'risk') return (a.riskLevel === 'High' ? 0 : 1) - (b.riskLevel === 'High' ? 0 : 1);
        return 0;
    });

    return (
        <div className="asha-patients-container">
            <div className="asha-patients-header">
                <h3>Nearest Patients</h3>
                <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
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
                                <span className="patient-age-week">{patient.age} yrs • Week {patient.currentWeek}</span>
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
                            <a href={`tel:${patient.phone}`} className="action-btn call-btn">Call</a>
                            <button className="action-btn map-btn" onClick={() => onSelectMapPatient(patient.id)}>Map</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Adash;

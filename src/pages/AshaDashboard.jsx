import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AshaDashboard.css';

const AshaDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Security Check
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.userType !== 'asha' && user.role !== 'asha') {
            navigate('/dashboard');
            return;
        }

        const fetchPatients = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    where("district", "==", user.district),
                    where("userType", "==", "patient")
                );

                const querySnapshot = await getDocs(q);
                const patientList = [];
                querySnapshot.forEach((doc) => {
                    patientList.push({ id: doc.id, ...doc.data() });
                });
                setPatients(patientList);
            } catch (error) {
                console.error("Error fetching patients:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user.district) {
            fetchPatients();
        } else {
            setLoading(false);
        }

    }, [user, navigate]);

    return (
        <div className="asha-dashboard-page">
            <div className="asha-container">
                <div className="asha-header-card">
                    <h2>ASHA WORKER PORTAL</h2>
                </div>

                <div className="asha-content-card">
                    <div className="asha-welcome-section">
                        <h3>Welcome, {user?.name}</h3>
                        <div className="worker-details">
                            District: <strong>{user?.district}</strong> | Village: {user?.village}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '15px' }}>Assigned Patients</h4>

                        {loading ? (
                            <p>Loading records...</p>
                        ) : patients.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', background: '#f9f9f9', borderRadius: '12px', color: '#888' }}>
                                No patients found in your district yet.
                            </div>
                        ) : (
                            <div className="patient-table-container">
                                <table className="patient-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Village</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map(p => (
                                            <tr key={p.id} className="patient-row">
                                                <td>
                                                    <span className="patient-name">{p.name}</span>
                                                    <span className="patient-mobile">{p.mobile}</span>
                                                </td>
                                                <td>
                                                    <span className="status-badge">Active</span>
                                                </td>
                                                <td>{p.village || 'N/A'}</td>
                                                <td>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => alert(`Viewing details for ${p.name}`)}
                                                    >
                                                        View Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="logout-container">
                    <button onClick={logout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AshaDashboard;

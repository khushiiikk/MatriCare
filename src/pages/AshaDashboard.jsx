import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing dashboard styles for now

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

        if (user.userType !== 'asha' && user.role !== 'asha') { // Handle both naming conventions just in case
            navigate('/dashboard'); // Kick non-asha users back to normal dashboard
            return;
        }

        const fetchPatients = async () => {
            // Query patients in the same district
            // Note: Firestore requires an index for compound queries or filtering. 
            // We do simple filtering here.
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
            console.log("No district found for ASHA worker");
            setLoading(false);
        }

    }, [user, navigate]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container" style={{ maxWidth: '800px' }}>
                <div className="baby-card-header" style={{ background: 'var(--color-mauve)', borderRadius: '12px' }}>
                    ASHA WORKER PORTAL
                </div>

                <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                    <h3>Welcome, {user?.name}</h3>
                    <p style={{ color: '#666' }}>District: <strong>{user?.district}</strong> | Village: {user?.village}</p>

                    <div style={{ marginTop: '30px' }}>
                        <h4>Assigned Patients</h4>

                        {loading ? (
                            <p>Loading records...</p>
                        ) : patients.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                                No patients found in your district yet.
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ marginTop: '15px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                                            <th style={{ padding: '10px', borderRadius: '8px 0 0 8px' }}>Name</th>
                                            <th style={{ padding: '10px' }}>Status</th>
                                            <th style={{ padding: '10px' }}>Village</th>
                                            <th style={{ padding: '10px', borderRadius: '0 8px 8px 0' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <strong>{p.name}</strong><br />
                                                    <span style={{ fontSize: '0.8em', color: '#888' }}>{p.mobile}</span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        background: '#e0f2f1',
                                                        color: '#00695c',
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem'
                                                    }}>Active</span>
                                                </td>
                                                <td style={{ padding: '12px' }}>{p.village || 'N/A'}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
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

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={logout} className="btn-secondary" style={{ background: '#666', color: 'white' }}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AshaDashboard;

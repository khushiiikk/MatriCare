import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './ReportHistory.css';

const ReportHistory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [loading, setLoading] = useState(true);

    const featureLabels = {
        age: "Age",
        gravida: "Total Pregnancies (G)",
        para: "Births > 20 Weeks (P)",
        liveBirths: "Live Births (L)",
        abortions: "Abortions (A)",
        childDeaths: "Child Deaths (D)",
        systolicBP: "Systolic BP",
        diastolicBP: "Diastolic BP",
        bloodGlucose: "Blood Sugar (RBS)",
        bodyTemp: "Body Temp",
        heartRate: "Heart Rate",
        hemoglobin: "Hemoglobin",
        hba1c: "HbA1c",
        respirationRate: "Respiration Rate"
    };

    useEffect(() => {
        const fetchReports = async (showLoader = true) => {
            if (showLoader) setLoading(true);
            console.log("🔄 History: Sync started...");

            try {
                if (!user?.uid) {
                    setReports([]);
                    setLoading(false);
                    return;
                }

                const mobileStr = user.mobile ? String(user.mobile) : null;
                const mobileNum = user.mobile ? Number(user.mobile) : null;
                const normalized = user.mobile ? String(user.mobile).replace(/\D/g, '').slice(-10) : null;
                const appId = String(user.uid);

                console.log("🔍 BROAD SYNC START:", { appId, mobileStr, normalized });

                // Define queries WITHOUT orderBy to avoid index requirements
                const refs = collection(db, "health_reports");
                const queryList = [
                    query(refs, where("appUserId", "==", appId)),
                    query(refs, where("userId", "==", appId)),
                    mobileStr ? query(refs, where("userMobile", "==", mobileStr)) : null,
                    normalized ? query(refs, where("userMobile", "==", normalized)) : null,
                    (mobileNum && !isNaN(mobileNum)) ? query(refs, where("userMobile", "==", mobileNum)) : null,
                    (auth.currentUser?.uid) ? query(refs, where("userId", "==", auth.currentUser.uid)) : null
                ].filter(Boolean);

                const snapshots = await Promise.all(
                    queryList.map(q => getDocs(q).catch(err => {
                        console.warn("⚠️ Sub-query failed (likely permissions):", err.message);
                        return { docs: [] };
                    }))
                );

                let allReports = [];
                snapshots.forEach(snap => {
                    snap.docs.forEach(doc => {
                        allReports.push({ id: doc.id, ...doc.data() });
                    });
                });

                // Deduplicate by Doc ID
                const seen = new Set();
                allReports = allReports.filter(r => {
                    if (seen.has(r.id)) return false;
                    seen.add(r.id);
                    return true;
                });

                // Sort in memory by date (stable even without indexes)
                allReports.sort((a, b) => {
                    const timeA = a.createdAt?.seconds || new Date(a.date || 0).getTime() / 1000;
                    const timeB = b.createdAt?.seconds || new Date(b.date || 0).getTime() / 1000;
                    return timeB - timeA;
                });

                console.log(`✅ SYNC COMPLETE: Found ${allReports.length} unique reports`);
                if (allReports.length > 0) {
                    console.log("📄 Latest Doc IDs:", allReports.slice(0, 3).map(r => r.id));
                }

                setReports(allReports);

                // 2. Update Chart Data
                const chartDataRaw = [...allReports].reverse().map(report => {
                    const dateObj = new Date(report.date || Date.now());
                    const v = report.vitals || {};

                    // Helper to get number from various keys
                    const getNum = (val) => {
                        const parsed = parseFloat(val);
                        return isNaN(parsed) ? null : parsed;
                    };

                    return {
                        name: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                        fullDate: `${dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                        hemoglobin: getNum(v.hemoglobin || v.HB),
                        bloodSugar: getNum(v.bloodGlucose || v.RBS),
                        hba1c: getNum(v.hba1c),
                        systolicBP: getNum(v.systolicBP),
                        diastolicBP: getNum(v.diastolicBP),
                        heartRate: getNum(v.heartRate),
                    };
                });
                setChartData(chartDataRaw);

            } catch (err) {
                console.error("❌ History Error:", err);
            } finally {
                setLoading(false);
            }
        };

        window.manualHistoryFetch = fetchReports; // Expose for force sync
        fetchReports();

        // Listen for storage changes in other tabs
        const handleStorage = () => fetchReports(false);
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [user?.uid]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="report-history-container fade-in">
            <header className="history-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <div className="header-title-group">
                    <h1>Analysis History</h1>
                    <button
                        className="sync-btn"
                        onClick={() => window.location.reload()}
                        title="Force sync data"
                    >
                        Sync Now
                    </button>
                </div>
            </header>

            {reports.length === 0 ? (
                <div className="no-reports animate-fade-in">
                    <img src="/empty-reports.png" alt="No reports" onError={(e) => e.target.style.display = 'none'} />
                    <h3>No analysis records found</h3>
                    <p>Start your first medical analysis to see your health trends here.</p>

                    <div className="diagnostic-box" style={{
                        marginTop: '2rem',
                        padding: '1.2rem',
                        fontSize: '0.85rem',
                        color: '#666',
                        border: '1px dashed #ff4d8d33',
                        background: '#fff9fb',
                        borderRadius: '16px',
                        maxWidth: '420px',
                        margin: '2rem auto',
                        textAlign: 'left',
                        boxShadow: '0 4px 12px rgba(255, 77, 141, 0.05)'
                    }}>
                        <p style={{ fontWeight: 'bold', color: '#ff4d8d', marginBottom: '8px' }}>🔍 Sync Troubleshooting</p>
                        <div style={{ display: 'grid', gap: '4px' }}>
                            <p><strong>App ID:</strong> {user?.uid ? `${user.uid.substring(0, 8)}...` : 'NONE'}</p>
                            <p><strong>Security ID:</strong> {auth.currentUser?.uid ? `${auth.currentUser.uid.substring(0, 8)}...` : 'NONE'}</p>
                            <p><strong>Linked Mobile:</strong> {user?.mobile || 'No Phone Link'}</p>
                            <p><strong>Normalized:</strong> {user?.mobile ? user.mobile.replace(/\D/g, '').slice(-10) : 'N/A'}</p>
                            <p><strong>Database:</strong> {loading ? 'Checking...' : `${reports.length} records found`}</p>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    if (!auth.currentUser) {
                                        setLoading(true);
                                        await signInAnonymously(auth);
                                    }
                                    if (window.manualHistoryFetch) {
                                        setLoading(true);
                                        window.manualHistoryFetch();
                                    }
                                } catch (e) {
                                    alert("Security Fix Failed: " + e.message);
                                    setLoading(false);
                                }
                            }}
                            style={{
                                width: '100%',
                                background: '#ff4d8d',
                                border: 'none',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                marginTop: '12px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(255, 77, 141, 0.2)'
                            }}
                        >
                            🔄 Fix Security & Sync Data
                        </button>
                    </div>
                </div>
            ) : (
                <div className="history-content">
                    {/* Comparison Chart */}
                    {/* Multi-Chart Grid */}
                    <div className="metrics-charts-grid">
                        <MetricChart
                            title="Blood Sugar Trend"
                            data={chartData}
                            dataKey="bloodSugar"
                            color="#81C784"
                            unit="mg/dL"
                        />
                        <MetricChart
                            title="Blood Pressure (Systolic)"
                            data={chartData}
                            dataKey="systolicBP"
                            color="#64B5F6"
                            unit="mmHg"
                        />
                        <MetricChart
                            title="Heart Rate"
                            data={chartData}
                            dataKey="heartRate"
                            color="#FFB74D"
                            unit="bpm"
                        />
                        <MetricChart
                            title="Hemoglobin Level"
                            data={chartData}
                            dataKey="hemoglobin"
                            color="#FF8C94"
                            unit="g/dL"
                        />
                    </div>

                    {/* History List */}
                    <div className="reports-list">
                        <h3>Recent Analyses</h3>
                        {reports.map((report) => (
                            <div className={`report-item-card ${expandedId === report.id ? 'expanded' : ''}`}
                                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
                                <div className="report-item-header">
                                    <div className="date-group">
                                        <span className="report-date">{formatDate(report.date)}</span>
                                        <span className="expand-indicator">{expandedId === report.id ? '−' : '+'}</span>
                                    </div>
                                    <span className={`risk-badge-mini ${report.risk?.color || 'orange'}`}>
                                        {report.risk?.level || 'Assessing...'}
                                    </span>
                                </div>

                                <div className="report-metrics-summary">
                                    <div className="mini-metric">
                                        <label>Blood Sugar</label>
                                        <span>{report.vitals?.bloodGlucose || report.vitals?.RBS || '-'}</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>BP (S/D)</label>
                                        <span>{report.vitals?.systolicBP || '-'}/{report.vitals?.diastolicBP || '-'}</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>Heart Rate</label>
                                        <span>{report.vitals?.heartRate || '-'}</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>Hemoglobin</label>
                                        <span>{report.vitals?.hemoglobin || report.vitals?.HB || '-'}</span>
                                    </div>
                                </div>

                                {expandedId === report.id && (
                                    <div className="report-expanded-details animate-fade-in">
                                        <h4>Full Analysis Parameters</h4>
                                        <div className="details-grid">
                                            {Object.entries(featureLabels).map(([key, label]) => (
                                                <div key={key} className="detail-item">
                                                    <span className="detail-label">{label}</span>
                                                    <span className="detail-value">{report.vitals?.[key] || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="report-advice-footer">
                                            <strong>Doctor's Advice:</strong>
                                            <p>{report.risk?.advice || 'No advice recorded.'}</p>
                                        </div>
                                    </div>
                                )}

                                {expandedId !== report.id && (
                                    <div className="report-advice-preview">
                                        <p>{report.risk?.advice || 'No advice recorded.'}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Component for Individual Metric Charts
const MetricChart = ({ title, data, dataKey, color, unit }) => (
    <div className="history-chart-card mini">
        <div className="chart-header-mini">
            <h4>{title}</h4>
            <span className="unit-label">{unit}</span>
        </div>
        <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis
                        tick={{ fontSize: 9, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        domain={['auto', 'auto']}
                        padding={{ top: 10, bottom: 10 }}
                    />
                    <Tooltip
                        labelFormatter={(value, payload) => payload?.[0]?.payload?.fullDate || value}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                            fontSize: '11px',
                            padding: '10px'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={title}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: color, strokeWidth: 1, stroke: '#fff' }}
                        activeDot={{ r: 6, stroke: color, strokeWidth: 1, fill: '#fff' }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default ReportHistory;

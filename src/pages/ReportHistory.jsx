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
                        respirationRate: getNum(v.respirationRate || v.RR),
                        bodyTemp: getNum(v.bodyTemp || v.TEMP),
                        weight: getNum(v.weight),
                        systolicBP: getNum(v.systolicBP),
                        diastolicBP: getNum(v.diastolicBP),
                        heartRate: getNum(v.heartRate),
                        hba1c: getNum(v.hba1c),
                        hemoglobin: getNum(v.hemoglobin || v.HB),
                        bloodSugar: getNum(v.bloodGlucose || v.RBS),
                        gravida: getNum(v.gravida),
                        para: getNum(v.para),
                        liveBirths: getNum(v.liveBirths),
                        abortions: getNum(v.abortions),
                        childDeaths: getNum(v.childDeaths)
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
                    {/* Unified Comparison Chart */}
                    <UnifiedHealthChart data={chartData} />


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

// --- Unified Chart Components ---

const UnifiedHealthChart = ({ data }) => {
    const metricsSet = [
        { key: 'bloodSugar', title: 'Blood Sugar', color: '#4CAF50', unit: 'mg/dL' },
        { key: 'systolicBP', title: 'Systolic BP', color: '#2196F3', unit: 'mmHg' },
        { key: 'diastolicBP', title: 'Diastolic BP', color: '#1976D2', unit: 'mmHg' },
        { key: 'heartRate', title: 'Heart Rate', color: '#FF9800', unit: 'bpm' },
        { key: 'hemoglobin', title: 'Hemoglobin', color: '#E91E63', unit: 'g/dL' },
        { key: 'bodyTemp', title: 'Body Temp', color: '#00BCD4', unit: '°F' },
        { key: 'respirationRate', title: 'Resp. Rate', color: '#9575CD', unit: 'bpm' },
        { key: 'hba1c', title: 'HbA1c', color: '#A1887F', unit: '%' },
        { key: 'weight', title: 'Weight', color: '#78909C', unit: 'kg' },
        { key: 'gravida', title: 'Gravida (G)', color: '#F06292', unit: '' },
        { key: 'para', title: 'Para (P)', color: '#BA68C8', unit: '' },
        { key: 'abortions', title: 'Abortions (A)', color: '#FF7043', unit: '' }
    ];

    const [activeMetrics, setActiveMetrics] = useState(['bloodSugar', 'systolicBP', 'diastolicBP', 'heartRate', 'hemoglobin']);

    const toggleMetric = (key) => {
        setActiveMetrics(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Medical Risk Logic for Dots
    const getDotColor = (value, key) => {
        if (value === null || value === undefined) return '#ccc';

        const ranges = {
            bloodSugar: { min: 70, max: 140 },
            systolicBP: { min: 90, max: 120 },
            diastolicBP: { min: 60, max: 80 },
            heartRate: { min: 60, max: 100 },
            hemoglobin: { min: 11, max: 16 },
            bodyTemp: { min: 97, max: 99 },
            hba1c: { min: 4, max: 6 },
            respirationRate: { min: 12, max: 20 },
            weight: { min: 40, max: 150 },
            gravida: { max: 5 },
            abortions: { max: 1 }
        };

        const range = ranges[key];
        if (!range) return '#4CAF50'; // Default normal for others

        // High or Low check
        if (range.min !== undefined && value < range.min) return '#FF5252'; // Red for Alert
        if (range.max !== undefined && value > range.max) return '#FF5252'; // Red for Alert

        return '#4CAF50'; // Green for Normal
    };

    const CustomDot = (props) => {
        const { cx, cy, value, dataKey } = props;
        const dotColor = getDotColor(value, dataKey);
        return (
            <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={dotColor}
                stroke="#fff"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
        );
    };

    return (
        <div className="unified-chart-card animate-fade-in">
            <div className="chart-header-premium">
                <div className="title-area">
                    <h3>Health Analytics Overview</h3>
                    <p>Select metrics below. Points turn <span style={{ color: '#FF5252', fontWeight: 700 }}>Red</span> for risks and <span style={{ color: '#4CAF50', fontWeight: 700 }}>Green</span> for normal ranges.</p>
                </div>
            </div>

            <div className="chart-controls-wrapper">
                {metricsSet.map(m => (
                    <button
                        key={m.key}
                        className={`metric-toggle-chip ${activeMetrics.includes(m.key) ? 'active' : ''}`}
                        onClick={() => toggleMetric(m.key)}
                        style={{ '--chip-color': m.color }}
                    >
                        <span className="chip-dot"></span>
                        {m.title}
                    </button>
                ))}
            </div>

            <div className="main-chart-container">
                <ResponsiveContainer width="100%" height={450}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#999', fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomHealthTooltip />} />
                        {metricsSet.map(m => activeMetrics.includes(m.key) && (
                            <Line
                                key={m.key}
                                type="monotone"
                                dataKey={m.key}
                                name={m.title}
                                stroke={m.color}
                                strokeWidth={3}
                                unit={m.unit}
                                dot={<CustomDot />}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                                animationDuration={1000}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const CustomHealthTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-health-tooltip">
                <div className="tooltip-header">
                    <h4>{payload[0].payload.fullDate}</h4>
                    <p>Report Readings</p>
                </div>
                <div className="tooltip-metrics-list">
                    {payload.map((entry, index) => (
                        <div key={index} className="tooltip-entry">
                            <div className="entry-label">
                                <span className="entry-dot" style={{ backgroundColor: entry.color }}></span>
                                <strong>{entry.name}</strong>
                            </div>
                            <div className="entry-value">
                                {entry.value} <small>{entry.unit}</small>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="tooltip-footer">
                    * Click any metric in the legend above to show/hide it.
                </div>
            </div>
        );
    }
    return null;
};

export default ReportHistory;


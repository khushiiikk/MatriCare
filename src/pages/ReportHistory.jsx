import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
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
                // 1. Load Local Storage (Instant)
                const localData = JSON.parse(localStorage.getItem('health_reports') || '[]');

                // Show local data immediately if cloud is slow
                const simpleMap = new Map();
                localData.forEach(r => simpleMap.set(r.date || r.id, r));
                const sortedLocal = Array.from(simpleMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                setReports(sortedLocal);

                // 2. Fetch from Cloud (Background)
                let cloudReports = [];
                const searchIds = user?.uid ? [user.uid, 'anonymous'] : ['anonymous'];

                const q = query(
                    collection(db, "health_reports"),
                    where("userId", "in", searchIds)
                );

                const querySnapshot = await getDocs(q);
                cloudReports = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 3. Merge Cloud + Local
                const finalMap = new Map();

                // Add Local
                localData.forEach(r => {
                    const key = r.date || r.id;
                    if (key) finalMap.set(key, r);
                });

                // Overwrite with Cloud (source of truth)
                cloudReports.forEach(r => {
                    const key = r.date || r.id;
                    if (key) finalMap.set(key, r);
                });

                let merged = Array.from(finalMap.values());
                merged.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

                console.log(`✅ History: Merged ${merged.length} total reports.`);
                setReports(merged);

                // 4. Update Chart Data
                const chartDataRaw = [...merged].reverse().map(report => {
                    const dateObj = new Date(report.date || Date.now());
                    const v = report.vitals || {};
                    return {
                        name: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                        fullDate: `${dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
                        hemoglobin: parseFloat(v.hemoglobin || 0),
                        bloodSugar: parseFloat(v.bloodGlucose || 0),
                        hba1c: parseFloat(v.hba1c || 0),
                        systolicBP: parseFloat(v.systolicBP || 0),
                        diastolicBP: parseFloat(v.diastolicBP || 0),
                        heartRate: parseFloat(v.heartRate || 0),
                    };
                });
                setChartData(chartDataRaw);

            } catch (err) {
                console.error("❌ History Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();

        // Listen for storage changes in other tabs
        const handleStorage = () => fetchReports(false);
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [user]);

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
                <div className="no-reports">
                    <img src="/empty-reports.png" alt="No reports" />
                    <h3>No analysis records found</h3>
                    <p>Start your first medical analysis to see your health trends here.</p>
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
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis tick={{ fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} />
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

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            if (!user?.uid) return;

            try {
                const q = query(
                    collection(db, "health_reports"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedReports = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setReports(fetchedReports);

                // Prepare chart data (chronological)
                const sortedForChart = [...fetchedReports].sort((a, b) => new Date(a.date) - new Date(b.date));
                const formattedData = sortedForChart.map(report => ({
                    date: new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    hemoglobin: parseFloat(report.vitals.hemoglobin),
                    bloodSugar: parseFloat(report.vitals.bloodGlucose),
                    hba1c: parseFloat(report.vitals.hba1c),
                    riskScore: report.risk.level === 'High Risk' ? 3 : report.risk.level === 'Moderate Risk' ? 2 : 1
                }));
                setChartData(formattedData);
            } catch (error) {
                console.error("Error fetching reports from Firestore:", error);
                // Fallback to local storage for demo/compatibility
                const savedReports = JSON.parse(localStorage.getItem('health_reports') || '[]');
                setReports(savedReports.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
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
                <h1>Medical Report History</h1>
                <p>Track your health journey and AI insights</p>
            </header>

            {reports.length === 0 ? (
                <div className="no-reports">
                    <img src="/empty-reports.png" alt="No reports" />
                    <h3>No analysis records found</h3>
                    <p>Start your first medical analysis to see your health trends here.</p>
                    <button className="analyze-now-btn" onClick={() => navigate('/health')}>
                        Analyze Now
                    </button>
                </div>
            ) : (
                <div className="history-content">
                    {/* Comparison Chart */}
                    <div className="history-chart-card">
                        <h3>Vitals Comparison Trend</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="hemoglobin"
                                        stroke="#FF8C94"
                                        strokeWidth={3}
                                        dot={{ r: 6 }}
                                        activeDot={{ r: 8 }}
                                        name="Hemoglobin (g/dL)"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bloodSugar"
                                        stroke="#81C784"
                                        strokeWidth={3}
                                        dot={{ r: 6 }}
                                        activeDot={{ r: 8 }}
                                        name="Blood Sugar (mg/dL)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="reports-list">
                        <h3>Recent Analyses</h3>
                        {reports.map((report) => (
                            <div key={report.id} className="report-item-card">
                                <div className="report-item-header">
                                    <span className="report-date">{formatDate(report.date)}</span>
                                    <span className={`risk-badge-mini ${report.risk.color}`}>
                                        {report.risk.level}
                                    </span>
                                </div>
                                <div className="report-metrics-summary">
                                    <div className="mini-metric">
                                        <label>Hb</label>
                                        <span>{report.vitals.hemoglobin}</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>RBS</label>
                                        <span>{report.vitals.bloodGlucose}</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>HbA1c</label>
                                        <span>{report.vitals.hba1c}%</span>
                                    </div>
                                    <div className="mini-metric">
                                        <label>G/P/L</label>
                                        <span>{report.vitals.gravida}/{report.vitals.para}/{report.vitals.liveBirths}</span>
                                    </div>
                                </div>
                                <div className="report-advice-preview">
                                    <p>{report.risk.advice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportHistory;

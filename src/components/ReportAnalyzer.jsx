import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
    extractHcgValue,
    detectClinicalWarnings,
    calculateRiskScore,
    explainResult,
    generateAdvice
} from '../utils/riskAnalyzer';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ReportAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Please upload a valid PDF file.');
        }
    };

    const analyzePDF = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            const hcg = extractHcgValue(fullText);
            const warnings = detectClinicalWarnings(fullText);
            const analysis = calculateRiskScore(hcg, warnings);
            const explanation = explainResult(hcg, analysis.level, analysis.reasons);
            const advice = generateAdvice(analysis.level);

            setResult({
                hcg,
                level: analysis.level,
                score: analysis.score,
                explanation,
                advice,
                reasons: analysis.reasons
            });
        } catch (err) {
            console.error('Error analyzing PDF:', err);
            setError('Failed to process the PDF. Please try again or ensure the file is not corrupted.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'Low': return '#4CAF50';
            case 'Medium': return '#FF9800';
            case 'High': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const chartData = result ? [
        { name: 'Risk Score', value: result.score }
    ] : [];

    return (
        <div className="report-analyzer-section">
            <div className="analyzer-card">
                <h2>Medical Report Analyzer</h2>
                <p>Upload your Beta-HCG report (PDF) for an instant risk assessment.</p>

                <div className="upload-controls">
                    <input
                        type="file"
                        id="report-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    <label htmlFor="report-upload" className={`upload-btn ${file ? 'file-selected' : ''}`}>
                        {file ? file.name : 'Choose PDF Report'}
                    </label>
                    <button
                        onClick={analyzePDF}
                        disabled={!file || loading}
                        className="analyze-btn"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Report'}
                    </button>
                </div>

                {error && <div className="analyzer-error">{error}</div>}

                {result && (
                    <div className="analysis-results">
                        <div className="result-header">
                            <div className="result-metric">
                                <span className="label">Beta-HCG Value:</span>
                                <span className="value">{result.hcg !== null ? `${result.hcg} mIU/mL` : 'Not Detected'}</span>
                            </div>
                            <div className="result-metric">
                                <span className="label">Risk Level:</span>
                                <span className="value" style={{ color: getRiskColor(result.level), fontWeight: 'bold' }}>
                                    {result.level}
                                </span>
                            </div>
                        </div>

                        <div className="risk-visualization">
                            <h4>Risk Score Visualization</h4>
                            <div style={{ width: '100%', height: 100 }}>
                                <ResponsiveContainer>
                                    <BarChart
                                        layout="vertical"
                                        data={chartData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis type="number" domain={[0, 10]} hide />
                                        <YAxis dataKey="name" type="category" hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                            <Cell fill={getRiskColor(result.level)} />
                                        </Bar>
                                        <ReferenceLine x={2} stroke="#666" strokeDasharray="3 3" label="Low" />
                                        <ReferenceLine x={5} stroke="#666" strokeDasharray="3 3" label="Med" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="explanation-box">
                            <h4>Assessment Detail</h4>
                            <ul>
                                {result.explanation.map((line, i) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="advice-box" style={{ borderLeft: `4px solid ${getRiskColor(result.level)}` }}>
                            <h4>AI Health Advice</h4>
                            <ul>
                                {result.advice.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportAnalyzer;

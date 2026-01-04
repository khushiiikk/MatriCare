import React, { useState } from 'react';
import './MedicalAnalysis.css';

const MedicalAnalysis = () => {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/'))) {
            setFile(selectedFile);
        } else {
            alert('Please select a valid PDF or Image file.');
        }
    };

    const runAnalysis = () => {
        setAnalyzing(true);
        // Simulate analysis delay
        setTimeout(() => {
            setResults({
                metrics: [
                    { name: 'Hemoglobin', value: '11.5 g/dL', status: 'Normal', range: '11.0 - 15.0', risk: 'Low' },
                    { name: 'Blood Sugar (F)', value: '92 mg/dL', status: 'Normal', range: '70 - 95', risk: 'Low' },
                    { name: 'Blood Pressure', value: '110/75 mmHg', status: 'Normal', range: '100-120 / 60-80', risk: 'Low' }
                ],
                summary: 'Your current health parameters are within the recommended range for this trimester of pregnancy.',
                risks: [
                    { title: 'Anemia Risk', level: 'Low', detail: 'Hemoglobin is stable. Continue iron-rich diet.' }
                ],
                tips: [
                    'Include vitamin C with iron supplements for better absorption.',
                    'Keep staying hydrated (2-3 liters of water daily).',
                    'Regular light walking for 20 minutes is recommended.'
                ]
            });
            setAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="medical-analysis-tool">
            <div className="analysis-header">
                <h3>Medical Report Analysis</h3>
                <p>Upload your report (PDF/JPG) for professional AI-powered insights.</p>
            </div>

            <div className="compact-upload-zone">
                <input
                    type="file"
                    id="medical-file-upload"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    hidden
                />
                <label htmlFor="medical-file-upload" className="mini-upload-btn">
                    {file ? file.name : 'Choose File (PDF/JPG)'}
                </label>
                {file && (
                    <button
                        className="mini-analyze-btn"
                        onClick={runAnalysis}
                        disabled={analyzing}
                    >
                        {analyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                )}
            </div>

            {results && (
                <div className="analysis-output fade-in">
                    <div className="metrics-summary-grid">
                        {results.metrics.map((m, i) => (
                            <div key={i} className="mini-metric-card">
                                <span className="m-name">{m.name}</span>
                                <span className="m-value">{m.value}</span>
                                <span className={`m-badge ${m.status.toLowerCase()}`}>{m.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="insight-section">
                        <h4>Professional Insights</h4>
                        <p className="insight-text">{results.summary}</p>
                    </div>

                    <div className="analysis-grid-two">
                        <div className="risk-box">
                            <h4>Identified Risks</h4>
                            {results.risks.map((r, i) => (
                                <div key={i} className="risk-item">
                                    <span className={`risk-level ${r.level.toLowerCase()}`}>{r.level} Risk</span>
                                    <span className="risk-title">{r.title}</span>
                                    <p className="risk-detail">{r.detail}</p>
                                </div>
                            ))}
                        </div>

                        <div className="tips-box">
                            <h4>Professional Health Tips</h4>
                            <ul>
                                {results.tips.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalAnalysis;

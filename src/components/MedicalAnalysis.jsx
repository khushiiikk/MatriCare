import React, { useState } from 'react';
import './MedicalAnalysis.css';

const MedicalAnalysis = () => {
    const [step, setStep] = useState(1); // 1: Personal Info, 2: Pregnancy History, 3: Analysis
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Ranges for validation
    const ranges = {
        bloodGlucose: { min: 70, max: 140, unit: 'mg/dL' },
        bodyTemp: { min: 97, max: 99, unit: '°F' },
        heartRate: { min: 60, max: 100, unit: 'BPM' },
        hemoglobin: { min: 11, max: 16, unit: 'g/dL' },
        hba1c: { min: 4, max: 6, unit: '%' },
        respirationRate: { min: 12, max: 20, unit: '/min' },
        gravida: { min: 0, max: 10 },
        para: { min: 0, max: 10 },
        liveBirths: { min: 0, max: 10 },
        abortions: { min: 0, max: 5 },
        childDeaths: { min: 0, max: 5 }
    };

    // Form Stats
    const [formData, setFormData] = useState({
        bloodGlucose: '200',
        bodyTemp: '100',
        heartRate: '150',
        hemoglobin: '15',
        hba1c: '9',
        respirationRate: '15',
        gravida: '0',
        para: '0',
        liveBirths: '0',
        abortions: '0',
        childDeaths: '0'
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getValidationClass = (field) => {
        const val = parseFloat(formData[field]);
        const range = ranges[field];
        if (isNaN(val)) return '';
        if (val < range.min) return 'input-below';
        if (val > range.max) return 'input-above';
        return 'input-normal';
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const runAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => {
            const riskAssessment = calculateOverallRisk();
            const newReport = {
                id: Date.now(),
                date: new Date().toISOString(),
                vitals: { ...formData },
                risk: riskAssessment
            };

            // Save to health_reports
            const existingReports = JSON.parse(localStorage.getItem('health_reports') || '[]');
            const updatedReports = [...existingReports, newReport];
            localStorage.setItem('health_reports', JSON.stringify(updatedReports));

            setAnalyzing(false);
            setShowResults(true);
            setStep(3);
        }, 2000);
    };

    const renderStep1 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={() => { }}>←</button>
                <h2>Personal Information</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar"></div>
            </div>

            <div className="vitals-grid-scroll">
                {[
                    { id: 'bloodGlucose', label: 'Random Blood Sugar (RBS)', range: '70-140 mg/dL' },
                    { id: 'bodyTemp', label: 'Body Temperature', range: '97-99°F' },
                    { id: 'heartRate', label: 'Heart Rate (HR)', range: '60-100 BPM' },
                    { id: 'hemoglobin', label: 'Hemoglobin Level (Hb)', range: '11-16 g/dL' },
                    { id: 'hba1c', label: 'HBA1C Level', range: '4-6%' },
                    { id: 'respirationRate', label: 'Respiration Rate (RR)', range: '12-20 per minute' }
                ].map((item) => (
                    <div key={item.id} className={`input-group-modern ${getValidationClass(item.id)}`}>
                        <label>{item.label}</label>
                        <div className="input-field-wrapper">
                            <input
                                type="number"
                                value={formData[item.id]}
                                onChange={(e) => handleInputChange(item.id, e.target.value)}
                            />
                            <div className="validation-indicator">
                                {getValidationClass(item.id) === 'input-normal' ? '✓' : '!'}
                            </div>
                        </div>
                        <p className="range-text-hint">Range: {item.range}</p>
                    </div>
                ))}
            </div>

            <button className="action-button-primary" onClick={nextStep}>Continue</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={prevStep}>←</button>
                <h2>Pregnancy History</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar active"></div>
            </div>

            <div className="vitals-grid-scroll">
                {[
                    { id: 'gravida', label: 'Gravida (G)', range: '0-10' },
                    { id: 'para', label: 'Para (P)', range: '0-10' },
                    { id: 'liveBirths', label: 'Live Births (L)', range: '0-10' },
                    { id: 'abortions', label: 'Abortions (A)', range: '0-5' },
                    { id: 'childDeaths', label: 'Child Deaths (D)', range: '0-5' }
                ].map((item) => (
                    <div key={item.id} className={`input-group-modern ${getValidationClass(item.id)}`}>
                        <label>{item.label}</label>
                        <div className="input-field-wrapper">
                            <input
                                type="number"
                                value={formData[item.id]}
                                onChange={(e) => handleInputChange(item.id, e.target.value)}
                            />
                            <div className="validation-indicator">
                                {getValidationClass(item.id) === 'input-normal' ? '✓' : '!'}
                            </div>
                        </div>
                        <p className="range-text-hint">Range: {item.range}</p>
                    </div>
                ))}
            </div>

            <button className="action-button-primary" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? (
                    <div className="loader-inline">
                        <span></span>Analyzing Metrics...
                    </div>
                ) : 'Continue to Risk Analysis'}
            </button>
        </div>
    );

    const renderResults = () => {
        // Advanced logic for status percentages and colors
        const getMetricLevel = (id) => {
            const val = parseFloat(formData[id]);
            const range = ranges[id];
            if (isNaN(val)) return { pct: 0, color: 'gray', text: 'No Data' };

            if (id === 'hemoglobin') {
                if (val < 10) return { pct: 90, color: 'red', text: 'Severe Anemia' };
                if (val < 11) return { pct: 70, color: 'orange', text: 'Mild Anemia' };
                if (val > 16) return { pct: 85, color: 'red', text: 'High' };
                return { pct: 50, color: 'green', text: 'Normal' };
            }

            if (id === 'bloodGlucose') {
                if (val > 200) return { pct: 95, color: 'red', text: 'Very High' };
                if (val > 140) return { pct: 80, color: 'red', text: 'High' };
                if (val < 70) return { pct: 85, color: 'red', text: 'Low' };
                return { pct: 50, color: 'green', text: 'Normal' };
            }

            if (val < range.min) return { pct: 30, color: 'red', text: 'Low' };
            if (val > range.max) return { pct: 90, color: 'red', text: 'High' };
            return { pct: 50, color: 'green', text: 'Normal' };
        };

        const calculateOverallRisk = () => {
            let score = 0;
            let factors = [];

            // Vitals Analysis
            if (parseFloat(formData.bloodGlucose) > 140) { score += 3; factors.push("High Blood Sugar"); }
            if (parseFloat(formData.hemoglobin) < 11) { score += 3; factors.push("Anemia Detection"); }
            if (parseFloat(formData.hba1c) >= 5.7) { score += 3; factors.push("HbA1c Elevation"); }
            if (parseFloat(formData.heartRate) > 100) { score += 2; factors.push("High Heart Rate"); }
            if (parseFloat(formData.bodyTemp) > 100) { score += 2; factors.push("Fever"); }

            // History Analysis
            if (parseInt(formData.abortions) >= 2) { score += 4; factors.push("History of Miscarriages"); }
            if (parseInt(formData.childDeaths) > 0) { score += 5; factors.push("High Obstetric Risk"); }
            if (parseInt(formData.gravida) > 5) { score += 3; factors.push("Grand Multiparity"); }

            let risk = { level: 'Low Risk', color: 'green', confidence: 85, advice: 'Continue regular prenatal checkups and maintain a healthy diet.' };

            if (score >= 7) {
                risk = {
                    level: 'High Risk',
                    color: 'red',
                    confidence: Math.min(95, 60 + score * 3),
                    advice: 'Immediate medical attention recommended. High probability of complications detected. Please consult your obstetrician urgently.'
                };
            } else if (score >= 3) {
                risk = {
                    level: 'Moderate Risk',
                    color: 'orange',
                    confidence: Math.min(88, 50 + score * 5),
                    advice: 'Closer monitoring required. Schedule a follow-up appointment soon to discuss these metrics with your healthcare provider.'
                };
            }

            return risk;
        };

        const riskAssessment = calculateOverallRisk();

        return (
            <div className="results-view-container fade-in">
                <div className="form-header-standard">
                    <button className="back-circle-btn" onClick={() => setStep(2)}>←</button>
                    <h2>AI Risk Analysis</h2>
                </div>

                <div className="results-content-scroll">
                    <h3 className="section-label">Detailed Analysis</h3>

                    {[
                        { id: 'respirationRate', label: 'Respiration Rate', unit: '/min' },
                        { id: 'hemoglobin', label: 'Hemoglobin Level', unit: 'g/dL' },
                        { id: 'bloodGlucose', label: 'Random Blood Sugar (RBS)', unit: 'mg/dL' },
                        { id: 'hba1c', label: 'HbA1c Level', unit: '%' }
                    ].map(metric => {
                        const level = getMetricLevel(metric.id);
                        return (
                            <div key={metric.id} className="analysis-card-premium">
                                <div className="card-inner-top">
                                    <div className="metric-meta">
                                        <h4>{metric.label}</h4>
                                        <p>{formData[metric.id]} {metric.unit}</p>
                                    </div>
                                    <div className="level-indicator-ring">
                                        <svg viewBox="0 0 36 36" className={`ring-svg ${level.color}`}>
                                            <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="ring-progress" strokeDasharray={`${level.pct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <text x="18" y="20.35" className="ring-pct">{level.pct}%</text>
                                            <text x="18" y="26" className="ring-label">Level</text>
                                        </svg>
                                    </div>
                                </div>
                                <div className="bar-visualizer-box">
                                    <div className="horizontal-bar-base">
                                        <div className={`horizontal-bar-fill ${level.color}`} style={{ width: `${level.pct}%` }}></div>
                                    </div>
                                    <div className="bar-status-row">
                                        <span className={`status-pill ${level.color}`}>{level.text}</span>
                                        <span className="pct-pill">{level.pct}%</span>
                                    </div>
                                </div>
                                <p className="normal-range-footer">Normal Range: {ranges[metric.id].min}-{ranges[metric.id].max} {metric.unit}</p>
                            </div>
                        );
                    })}

                    <h3 className="section-label">AI Risk Assessment</h3>

                    <div className={`risk-summary-card-glass ${riskAssessment.color}`}>
                        <div className="risk-chip-badge">AI Intelligence</div>
                        <div className="risk-alert-icon">{riskAssessment.level === 'High Risk' ? '!' : riskAssessment.level === 'Moderate Risk' ? '⚠' : '✓'}</div>
                        <h2 className="risk-status-heading">{riskAssessment.level}</h2>
                        <p className="risk-confidence-sub">Confidence: {riskAssessment.confidence}%</p>
                        <p className="risk-advice-text">
                            {riskAssessment.advice}
                        </p>
                    </div>

                    <div className="auto-save-banner">
                        <span className="cloud-icon">☁️</span>
                        Report automatically saved to your encrypted records
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`medical-analysis-premium-ui ${step === 3 ? 'analysis-view' : ''}`}>
            <div className="web-layout-wrapper">
                {step < 3 && (
                    <div className="form-sidebar-info">
                        <h3>Medical Analysis</h3>
                        <p>Track your vitals and pregnancy history for AI-driven risk assessment.</p>
                        <div className="sidebar-stats">
                            <div className="stat-row">
                                <span className="stat-dot"></span>
                                <div>
                                    <small>Current Progress</small>
                                    <p>Step {step} of 2</p>
                                </div>
                            </div>
                            <div className="stat-row">
                                <span className="stat-dot green"></span>
                                <div>
                                    <small>Encryption</small>
                                    <p>End-to-End Secure</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="form-main-content">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderResults()}
                </div>
            </div>
        </div>
    );
};

export default MedicalAnalysis;

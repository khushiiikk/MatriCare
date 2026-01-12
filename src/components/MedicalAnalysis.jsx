import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { medicalAnalysisContent } from '../data/medicalAnalysisContent';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './MedicalAnalysis.css';

const MedicalAnalysis = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const content = medicalAnalysisContent[language] || medicalAnalysisContent.en;

    const [step, setStep] = useState(1); // 1: Personal Info, 2: Pregnancy History, 3: Analysis
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Ranges for validation
    const ranges = {
        age: { min: 18, max: 45, unit: 'years' },
        systolicBP: { min: 90, max: 120, unit: 'mmHg' },
        diastolicBP: { min: 60, max: 80, unit: 'mmHg' },
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
        age: '25',
        systolicBP: '110',
        diastolicBP: '70',
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

    const [mlPrediction, setMlPrediction] = useState(null);

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

    const getMetricLevel = (id) => {
        const val = parseFloat(formData[id]);
        const range = ranges[id];
        if (isNaN(val)) return { pct: 0, color: 'gray', text: content.noData };

        if (id === 'hemoglobin') {
            if (val < 10) return { pct: 90, color: 'red', text: content.severeAnemia };
            if (val < 11) return { pct: 70, color: 'orange', text: content.mildAnemia };
            if (val > 16) return { pct: 85, color: 'red', text: content.high };
            return { pct: 50, color: 'green', text: content.normal };
        }

        if (id === 'bloodGlucose') {
            if (val > 200) return { pct: 95, color: 'red', text: content.veryHigh };
            if (val > 140) return { pct: 80, color: 'red', text: content.high };
            if (val < 70) return { pct: 85, color: 'red', text: content.low };
            return { pct: 50, color: 'green', text: content.normal };
        }

        if (val < range.min) return { pct: 30, color: 'red', text: content.low };
        if (val > range.max) return { pct: 90, color: 'red', text: content.high };
        return { pct: 50, color: 'green', text: content.normal };
    };

    const calculateOverallRisk = () => {
        let score = 0;
        let factors = [];

        // Vitals Analysis
        if (parseFloat(formData.bloodGlucose) > 140) { score += 3; factors.push(content.highBloodSugar); }
        if (parseFloat(formData.hemoglobin) < 11) { score += 3; factors.push(content.anemiaDetection); }
        if (parseFloat(formData.hba1c) >= 5.7) { score += 3; factors.push(content.hba1cElevation); }
        if (parseFloat(formData.heartRate) > 100) { score += 2; factors.push(content.highHeartRate); }
        if (parseFloat(formData.bodyTemp) > 100) { score += 2; factors.push(content.fever); }

        // History Analysis
        if (parseInt(formData.abortions) >= 2) { score += 4; factors.push(content.historyMiscarriages); }
        if (parseInt(formData.childDeaths) > 0) { score += 5; factors.push(content.highObstetricRisk); }
        if (parseInt(formData.gravida) > 5) { score += 3; factors.push(content.grandMultiparity); }

        let risk = { level: content.lowRisk, color: 'green', confidence: 85, advice: content.lowRiskAdvice, factors };

        if (score >= 7) {
            risk = {
                level: content.highRisk,
                color: 'red',
                confidence: Math.min(95, 60 + score * 3),
                advice: content.highRiskAdvice,
                factors
            };
        } else if (score >= 3) {
            risk = {
                level: content.moderateRisk,
                color: 'orange',
                confidence: Math.min(88, 50 + score * 5),
                advice: content.moderateRiskAdvice,
                factors
            };
        }

        return risk;
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            // 1. Rule-based Analysis (Existing)
            const riskAssessment = calculateOverallRisk();

            // 2. ML Model Prediction (New)
            // Preparing features in specific order: 
            // [Age, BloodGlucose, BodyTemp, HeartRate, Hemoglobin, HbA1c, RespirationRate, Gravida, Para, LiveBirths, Abortions, ChildDeaths]
            // 1. Age, 2. G, 3. P, 4. L, 5. A, 6. D, 7. SystolicBP, 8. DiastolicBP, 9. RBS, 10. BodyTemp, 11. HeartRate, 12. HB, 13. HBA1C, 14. RR
            const featureArray = [
                parseFloat(formData.age),
                parseInt(formData.gravida),
                parseInt(formData.para),
                parseInt(formData.liveBirths),
                parseInt(formData.abortions),
                parseInt(formData.childDeaths),
                parseFloat(formData.systolicBP),
                parseFloat(formData.diastolicBP),
                parseFloat(formData.bloodGlucose),
                parseFloat(formData.bodyTemp),
                parseFloat(formData.heartRate),
                parseFloat(formData.hemoglobin),
                parseFloat(formData.hba1c),
                parseFloat(formData.respirationRate)
            ];

            let mlData = null;
            try {
                console.log("Attempting ML prediction with features:", featureArray);
                const response = await fetch("https://matricare-backend-y4lk.onrender.com/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ features: featureArray })
                });

                if (response.ok) {
                    mlData = await response.json();
                    console.log("ML Prediction received:", mlData);
                    setMlPrediction(mlData);
                } else {
                    console.error("ML Backend responded with error:", response.status);
                }
            } catch (err) {
                console.error("Failed to connect to ML backend:", err);
            }

            const reportData = {
                vitals: { ...formData },
                mlPrediction: mlData,
                risk: mlData ? {
                    level: mlData.prediction === 0 ? content.lowRisk : content.highRisk,
                    color: mlData.prediction === 0 ? 'green' : 'red',
                    advice: mlData.prediction === 0 ? content.lowRiskAdvice : content.highRiskAdvice
                } : riskAssessment,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                userId: user?.uid || 'anonymous'
            };

            // 1. Save to Local Storage IMMEDIATELY (Safety Net)
            const localReport = {
                ...reportData,
                id: `local-${Date.now()}`,
                createdAt: { seconds: Math.floor(Date.now() / 1000) }
            };
            try {
                const existingReports = JSON.parse(localStorage.getItem('health_reports') || '[]');
                localStorage.setItem('health_reports', JSON.stringify([localReport, ...existingReports]));
                console.log("✅ Saved to local storage successfully");
            } catch (e) {
                console.error("Local storage save failed:", e);
            }

            // 2. Save to Firestore (Cloud)
            try {
                await addDoc(collection(db, "health_reports"), reportData);
                console.log("✅ Saved to Firestore successfully");
            } catch (dbError) {
                console.error("⚠️ Firestore save failed (offline?):", dbError);
                // We don't throw here, so the user still sees the result/history from local
            }

        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setAnalyzing(false);
            setShowResults(true);
            setStep(3);
        }
    };

    const renderStep1 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={() => { }}>{content.backBtn}</button>
                <h2>{content.step1Title}</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar"></div>
            </div>

            <div className="vitals-grid-scroll">
                {Object.keys(content.vitals).map((key) => {
                    const item = content.vitals[key];
                    return (
                        <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                            <label>{item.label}</label>
                            <div className="input-field-wrapper">
                                <input
                                    type="number"
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                />
                                <div className="validation-indicator">
                                    {getValidationClass(key) === 'input-normal' ? '✓' : '!'}
                                </div>
                            </div>
                            <p className="range-text-hint">{content.normalRange}: {item.range}</p>
                        </div>
                    );
                })}
            </div>

            <button className="action-button-primary" onClick={nextStep}>{content.continueBtn}</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={prevStep}>{content.backBtn}</button>
                <h2>{content.step2Title}</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar active"></div>
            </div>

            <div className="vitals-grid-scroll">
                {Object.keys(content.history).map((key) => {
                    const item = content.history[key];
                    return (
                        <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                            <label>{item.label}</label>
                            <div className="input-field-wrapper">
                                <input
                                    type="number"
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                />
                                <div className="validation-indicator">
                                    {getValidationClass(key) === 'input-normal' ? '✓' : '!'}
                                </div>
                            </div>
                            <p className="range-text-hint">{content.normalRange}: {item.range}</p>
                        </div>
                    );
                })}
            </div>

            <button className="action-button-primary" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? (
                    <div className="loader-inline">
                        <span></span>{content.analyzingText}
                    </div>
                ) : content.analyzeBtn}
            </button>
        </div>
    );

    const renderResults = () => {
        return (
            <div className="results-view-container fade-in">
                <div className="form-header-standard">
                    <button className="back-circle-btn" onClick={() => setStep(2)}>{content.backBtn}</button>
                    <h2>{content.step3Title}</h2>
                </div>

                <div className="results-content-scroll">
                    <h3 className="section-label">{content.detailedAnalysis}</h3>

                    {[
                        { id: 'respirationRate', label: content.vitals.respirationRate.label, unit: '/min' },
                        { id: 'hemoglobin', label: content.vitals.hemoglobin.label, unit: 'g/dL' },
                        { id: 'bloodGlucose', label: content.vitals.bloodGlucose.label, unit: 'mg/dL' },
                        { id: 'hba1c', label: content.vitals.hba1c.label, unit: '%' }
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
                                <p className="normal-range-footer">{content.normalRange}: {ranges[metric.id].min}-{ranges[metric.id].max} {metric.unit}</p>
                            </div>
                        );
                    })}

                    <h3 className="section-label">{content.aiRiskAssessment}</h3>

                    {mlPrediction ? (
                        <div className={`risk-summary-card-glass ${mlPrediction.prediction === 0 ? 'green' : 'red'}`}>
                            <div className="risk-alert-icon">
                                {mlPrediction.prediction === 0 ? '✓' : '!'}
                            </div>
                            <h2 className="risk-status-heading" style={{ fontSize: '2.5rem', marginBottom: '0' }}>
                                {mlPrediction.prediction === 0 ? content.lowRisk : content.highRisk}
                            </h2>
                        </div>
                    ) : (
                        <div className="risk-summary-card-glass orange">
                            <div className="risk-alert-icon">!</div>
                            <h2 className="risk-status-heading">Awaiting Model</h2>
                            <p className="risk-advice-text">Please ensure the ML Backend is running to see predictions.</p>
                        </div>
                    )}

                    <div className="auto-save-banner">
                        {content.autoSave}
                    </div>

                    <Link to="/report-history" className="view-history-link-btn">
                        {content.viewHistory} →
                    </Link>
                </div>
            </div >
        );
    };

    return (
        <div className={`medical-analysis-premium-ui ${step === 3 ? 'analysis-view' : ''}`}>
            <div className="web-layout-wrapper">
                {step < 3 && (
                    <div className="form-sidebar-info">
                        <h3>{content.sidebarTitle}</h3>
                        <p>{content.sidebarDesc}</p>
                        <div className="sidebar-stats">
                            <div className="stat-row">
                                <span className="stat-dot"></span>
                                <div>
                                    <small>{content.currentProgress}</small>
                                    <p>{content.stepOf} {step} of 2</p>
                                </div>
                            </div>
                            <div className="stat-row">
                                <span className="stat-dot green"></span>
                                <div>
                                    <small>{content.encryption}</small>
                                    <p>{content.endToEnd}</p>
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

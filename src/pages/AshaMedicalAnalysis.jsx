import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import '../components/MedicalAnalysis.css'; // Reuse existing styles

const AshaMedicalAnalysis = () => {
    const { user } = useAuth();
    const { t } = useTranslation('medical');

    const [step, setStep] = useState(1);
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [mlPrediction, setMlPrediction] = useState(null);

    // Ranges for validation
    const ranges = {
        age: { min: 18, max: 45, unit: 'years' },
        currentWeek: { min: 1, max: 42, unit: 'weeks' },
        systolicBP: { min: 90, max: 120, unit: 'mmHg' },
        diastolicBP: { min: 60, max: 80, unit: 'mmHg' },
        bloodGlucose: { min: 70, max: 140, unit: 'mg/dL' },
        bodyTemp: { min: 97, max: 99, unit: '°F' },
        heartRate: { min: 60, max: 100, unit: 'BPM' },
        hemoglobin: { min: 11, max: 16, unit: 'g/dL' },
        hba1c: { min: 4, max: 6, unit: '%' },
        respirationRate: { min: 12, max: 20, unit: '/min' },
        weight: { min: 40, max: 150, unit: 'kg' },
        gravida: { min: 0, max: 10 },
        para: { min: 0, max: 10 },
        liveBirths: { min: 0, max: 10 },
        abortions: { min: 0, max: 5 },
        childDeaths: { min: 0, max: 5 }
    };

    // Form Stats
    const [formData, setFormData] = useState({
        userName: '',
        age: '',
        currentWeek: '',
        systolicBP: '',
        diastolicBP: '',
        bloodGlucose: '',
        bodyTemp: '',
        heartRate: '',
        hemoglobin: '',
        hba1c: '',
        respirationRate: '',
        weight: '',
        gravida: '',
        para: '',
        liveBirths: '',
        abortions: '',
        childDeaths: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getValidationClass = (field) => {
        const val = parseFloat(formData[field]);
        const range = ranges[field];
        if (!range || isNaN(val)) return '';
        if (val < range.min) return 'input-below';
        if (val > range.max) return 'input-above';
        return 'input-normal';
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const getMetricLevel = (id) => {
        const val = parseFloat(formData[id]);
        const range = ranges[id];
        if (!range || isNaN(val)) return { pct: 0, color: 'gray', text: t('riskLevels.noData') };

        if (id === 'hemoglobin') {
            if (val < 10) return { pct: 90, color: 'red', text: t('riskLevels.severeAnemia') };
            if (val < 11) return { pct: 70, color: 'orange', text: t('riskLevels.mildAnemia') };
            if (val > 16) return { pct: 85, color: 'red', text: t('riskLevels.high') };
            return { pct: 50, color: 'green', text: t('riskLevels.normal') };
        }

        if (id === 'bloodGlucose') {
            if (val > 200) return { pct: 95, color: 'red', text: t('riskLevels.veryHigh') };
            if (val > 140) return { pct: 80, color: 'red', text: t('riskLevels.high') };
            if (val < 70) return { pct: 85, color: 'red', text: t('riskLevels.low') };
            return { pct: 50, color: 'green', text: t('riskLevels.normal') };
        }

        if (val < range.min) return { pct: 30, color: 'red', text: t('riskLevels.low') };
        if (val > range.max) return { pct: 90, color: 'red', text: t('riskLevels.high') };
        return { pct: 50, color: 'green', text: t('riskLevels.normal') };
    };

    const calculateOverallRisk = () => {
        let score = 0;
        let factors = [];

        if (parseFloat(formData.bloodGlucose) > 140) { score += 3; factors.push(t('riskFactors.highBloodSugar')); }
        if (parseFloat(formData.hemoglobin) < 11) { score += 3; factors.push(t('riskFactors.anemiaDetection')); }
        if (parseFloat(formData.hba1c) >= 5.7) { score += 3; factors.push(t('riskFactors.hba1cElevation')); }
        if (parseFloat(formData.heartRate) > 100) { score += 2; factors.push(t('riskFactors.highHeartRate')); }
        if (parseFloat(formData.bodyTemp) > 100) { score += 2; factors.push(t('riskFactors.fever')); }

        if (parseInt(formData.abortions) >= 2) { score += 4; factors.push(t('riskFactors.historyMiscarriages')); }
        if (parseInt(formData.childDeaths) > 0) { score += 5; factors.push(t('riskFactors.highObstetricRisk')); }
        if (parseInt(formData.gravida) > 5) { score += 3; factors.push(t('riskFactors.grandMultiparity')); }

        let risk = { level: t('riskLevels.lowRisk'), color: 'green', confidence: 85, advice: t('advice.lowRisk'), factors };

        if (score >= 7) {
            risk = {
                level: t('riskLevels.highRisk'),
                color: 'red',
                confidence: Math.min(95, 60 + score * 3),
                advice: t('advice.highRisk'),
                factors
            };
        } else if (score >= 3) {
            risk = {
                level: t('riskLevels.moderateRisk'),
                color: 'orange',
                confidence: Math.min(88, 50 + score * 5),
                advice: t('advice.moderateRisk'),
                factors
            };
        }

        return risk;
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const riskAssessment = calculateOverallRisk();

            // ML Model Prediction Order:
            // [Age, G, P, L, A, D, SBP, DBP, RBS, Temp, HR, HB, HBA1C, RR]
            const featureArray = [
                parseFloat(formData.age) || 0,
                parseInt(formData.gravida) || 0,
                parseInt(formData.para) || 0,
                parseInt(formData.liveBirths) || 0,
                parseInt(formData.abortions) || 0,
                parseInt(formData.childDeaths) || 0,
                parseFloat(formData.systolicBP) || 0,
                parseFloat(formData.diastolicBP) || 0,
                parseFloat(formData.bloodGlucose) || 0,
                parseFloat(formData.bodyTemp) || 0,
                parseFloat(formData.heartRate) || 0,
                parseFloat(formData.hemoglobin) || 0,
                parseFloat(formData.hba1c) || 0,
                parseFloat(formData.respirationRate) || 0
            ];

            let mlData = null;
            try {
                const API_URL = import.meta.env.VITE_API_URL || "https://matricare-backend-y4lk.onrender.com";
                const response = await fetch(`${API_URL}/predict`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ features: featureArray })
                });

                if (response.ok) {
                    mlData = await response.json();
                    setMlPrediction(mlData);
                }
            } catch (err) {
                console.error("ML Prediction failed:", err);
            }

            // Save to Firestore
            let currentUid = auth.currentUser?.uid;
            if (!currentUid) {
                const anonUser = await signInAnonymously(auth);
                currentUid = anonUser.user.uid;
            }

            const reportData = {
                vitals: {
                    ...formData,
                    bloodPressure: `${formData.systolicBP}/${formData.diastolicBP}`
                },
                mlPrediction: mlData,
                risk: mlData ? {
                    level: mlData.prediction === 0 ? t('riskLevels.lowRisk') : t('riskLevels.highRisk'),
                    color: mlData.prediction === 0 ? 'green' : 'red',
                    advice: mlData.prediction === 0 ? t('advice.lowRisk') : t('advice.highRisk')
                } : riskAssessment,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                userId: currentUid,
                ashaId: user?.uid || null, // Track which ASHA worker made this record
                userName: formData.userName || 'Unknown Patient',
                currentWeek: formData.currentWeek || null,
                source: 'asha_analysis'
            };

            await addDoc(collection(db, "health_reports"), reportData);
            alert("✅ Clinical Analysis Saved Successfully!");

            setShowResults(true);
            setStep(3);
        } catch (error) {
            console.error("Analysis error:", error);
            alert("Failed to save analysis. Please check your connection.");
        } finally {
            setAnalyzing(false);
        }
    };

    const renderStep1 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <Link to="/Adash" className="back-circle-btn">←</Link>
                <h2>Patient Identity & Vitals</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar"></div>
            </div>

            <div className="vitals-grid-scroll">
                <div className="input-group-modern">
                    <label>Patient Full Name</label>
                    <input
                        type="text"
                        placeholder="Enter Patient Name"
                        value={formData.userName}
                        onChange={(e) => handleInputChange('userName', e.target.value)}
                        style={{ border: formData.userName ? '2px solid #800000' : '1px solid #ddd' }}
                    />
                </div>
                <div className="input-group-modern">
                    <label>Pregnancy Week</label>
                    <input
                        type="number"
                        placeholder="Week (e.g. 24)"
                        value={formData.currentWeek}
                        onChange={(e) => handleInputChange('currentWeek', e.target.value)}
                        className={getValidationClass('currentWeek')}
                    />
                </div>

                {['age', 'systolicBP', 'diastolicBP', 'bloodGlucose', 'bodyTemp', 'heartRate', 'hemoglobin', 'hba1c', 'respirationRate', 'weight'].map((key) => (
                    <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                        <div className="label-info-wrapper">
                            <label>{t(`vitals.${key}.label`)}</label>
                        </div>
                        <div className="input-field-wrapper">
                            <input
                                type="number"
                                value={formData[key]}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                            />
                        </div>
                        <p className="range-text-hint">{t('results.normalRange')}: {t(`vitals.${key}.range`)}</p>
                    </div>
                ))}
            </div>

            <button
                className="action-button-primary"
                onClick={nextStep}
                disabled={!formData.userName}
                style={{ background: !formData.userName ? '#ccc' : '#800000' }}
            >
                {formData.userName ? 'Continue to History' : 'Enter Patient Name'}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={prevStep}>←</button>
                <h2>Obstetric History</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar active"></div>
            </div>

            <div className="vitals-grid-scroll">
                {['gravida', 'para', 'liveBirths', 'abortions', 'childDeaths'].map((key) => (
                    <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                        <div className="label-info-wrapper">
                            <label>{t(`history.${key}.label`)}</label>
                        </div>
                        <div className="input-field-wrapper">
                            <input
                                type="number"
                                value={formData[key]}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                            />
                        </div>
                        <p className="range-text-hint">{t('results.normalRange')}: {t(`history.${key}.range`)}</p>
                    </div>
                ))}
            </div>

            <button className="action-button-primary" onClick={runAnalysis} disabled={analyzing} style={{ background: '#800000' }}>
                {analyzing ? 'Analyzing Clinical Data...' : 'Run Comprehensive Analysis'}
            </button>
        </div>
    );

    const renderResults = () => (
        <div className="results-view-container fade-in">
            <div className="form-header-standard">
                <button className="back-circle-btn" onClick={() => setStep(2)}>←</button>
                <h2>Analysis Results: {formData.userName}</h2>
            </div>

            <div className="results-content-scroll">
                <h3 className="section-label">Vitals Assessment</h3>
                <div className="analysis-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[
                        { id: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
                        { id: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL' },
                        { id: 'heartRate', label: 'Heart Rate', unit: 'BPM' },
                        { id: 'systolicBP', label: 'Systolic BP', unit: 'mmHg' }
                    ].map(metric => {
                        const level = getMetricLevel(metric.id);
                        return (
                            <div key={metric.id} className="analysis-card-premium" style={{ marginBottom: '0' }}>
                                <h4>{metric.label}</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: '5px 0' }}>{formData[metric.id]} {metric.unit}</p>
                                <span className={`status-pill ${level.color}`} style={{ fontSize: '0.7rem' }}>{level.text}</span>
                            </div>
                        );
                    })}
                </div>

                <h3 className="section-label">AI Risk Prediction</h3>
                {mlPrediction ? (
                    <div className={`risk-summary-card-glass ${mlPrediction.prediction === 0 ? 'green' : 'red'}`} style={{ textAlign: 'center', padding: '30px' }}>
                        <h2 style={{ fontSize: '2rem', margin: '0' }}>
                            {mlPrediction.prediction === 0 ? 'LOW RISK' : 'HIGH RISK'}
                        </h2>
                        <p>Confidence: {Math.round(mlPrediction.confidence * 100)}%</p>
                    </div>
                ) : (
                    <div className="risk-summary-card-glass orange">
                        <p>Detailed analysis saved. Backend prediction pending.</p>
                    </div>
                )}

                <Link to="/Adash" className="view-history-link-btn" style={{ background: '#800000', color: 'white', marginTop: '20px' }}>
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );

    return (
        <div className={`medical-analysis-premium-ui ${step === 3 ? 'analysis-view' : ''}`} style={{ paddingTop: '100px', background: '#fffcfc' }}>
            <div className="web-layout-wrapper">
                <div className="form-main-content">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderResults()}
                </div>
            </div>
        </div>
    );
};

export default AshaMedicalAnalysis;

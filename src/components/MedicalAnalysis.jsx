import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // UPDATED: Use standard hook
import { db, auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './MedicalAnalysis.css';

const MedicalAnalysis = () => {
    const { user, updateProfile } = useAuth();
    // UPDATED: Use i18next standard translation
    const { t } = useTranslation('medical');

    const [step, setStep] = useState(1); // 1: Personal Info, 2: Pregnancy History, 3: Analysis
    const [analyzing, setAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [lastError, setLastError] = useState(null); // Diagnostic

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
        weight: { min: 40, max: 150, unit: 'kg' },
        gravida: { min: 0, max: 10 },
        para: { min: 0, max: 10 },
        liveBirths: { min: 0, max: 10 },
        abortions: { min: 0, max: 5 },
        childDeaths: { min: 0, max: 5 }
    };

    // Helper: Calculate Age from DOB
    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    // Form Stats
    const [formData, setFormData] = useState({
        age: user?.dob ? calculateAge(user.dob) : (user?.age || ''),
        systolicBP: '',
        diastolicBP: '',
        bloodGlucose: '',
        bodyTemp: '',
        heartRate: '',
        hemoglobin: '',
        hba1c: '',
        respirationRate: '',
        weight: user?.weight || '',
        gravida: '',
        para: '',
        liveBirths: '',
        abortions: '',
        childDeaths: ''
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
        if (isNaN(val)) return { pct: 0, color: 'gray', text: t('riskLevels.noData') };

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

        // Vitals Analysis
        if (parseFloat(formData.bloodGlucose) > 140) { score += 3; factors.push(t('riskFactors.highBloodSugar')); }
        if (parseFloat(formData.hemoglobin) < 11) { score += 3; factors.push(t('riskFactors.anemiaDetection')); }
        if (parseFloat(formData.hba1c) >= 5.7) { score += 3; factors.push(t('riskFactors.hba1cElevation')); }
        if (parseFloat(formData.heartRate) > 100) { score += 2; factors.push(t('riskFactors.highHeartRate')); }
        if (parseFloat(formData.bodyTemp) > 100) { score += 2; factors.push(t('riskFactors.fever')); }

        // History Analysis
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
                // Use environment variable for API URL, fallback to production if not set
                const API_URL = import.meta.env.VITE_API_URL || "https://matricare-backend-y4lk.onrender.com";
                const response = await fetch(`${API_URL}/predict`, {
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

            // Clean vitals data (no undefined/NaN)
            const cleanedVitals = {};
            Object.entries(formData).forEach(([k, v]) => {
                const num = parseFloat(v);
                cleanedVitals[k] = isNaN(num) ? (v || '0') : num.toString();
            });

            // 1. MANDATORY SECURITY CHECK: We MUST have a Firebase session for cloud storage rules
            let currentUid = auth.currentUser?.uid;

            if (!currentUid) {
                console.log("🔐 Security ID Missing. Performing emergency auto-bootstrap...");
                try {
                    const anonUser = await signInAnonymously(auth);
                    currentUid = anonUser.user.uid;
                    console.log("✅ Bootstrap Success! Security ID:", currentUid);
                } catch (bootstrapErr) {
                    console.error("❌ Critical: Could not bootstrap cloud security session:", bootstrapErr);
                    alert("⚠️ Cloud Security Error\n\nYour analysis can't be saved to the cloud because the security session failed to start.\n\nPlease check your internet and try again.");
                    setAnalyzing(false);
                    return;
                }
            }

            const reportData = {
                vitals: cleanedVitals,
                mlPrediction: mlData,
                risk: mlData ? {
                    level: mlData.prediction === 0 ? t('riskLevels.lowRisk') : t('riskLevels.highRisk'),
                    color: mlData.prediction === 0 ? 'green' : 'red',
                    advice: mlData.prediction === 0 ? t('advice.lowRisk') : t('advice.highRisk')
                } : riskAssessment,
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                // SECURITY: Must use the real Firebase session UID for rules to pass
                userId: currentUid,
                // IDENTITY: Keep custom and mobile links for data matching
                appUserId: user?.uid || null,
                userMobile: user?.mobile || null,
                userName: user?.name || 'Patient'
            };

            // Save to Firestore (Cloud)
            try {
                setLastError(null);
                console.log("💾 CLOUD SAVE START");
                console.log("-> Security ID (userId):", reportData.userId);
                console.log("-> App ID (appUserId):", reportData.appUserId);
                console.log("-> Mobile Link (userMobile):", reportData.userMobile);

                // Update profile with latest weight too (Non-blocking)
                try {
                    if (formData.weight !== '0') {
                        updateProfile({ weight: formData.weight }).catch(e => console.warn("Profile sync skipped:", e));
                    }
                } catch (pErr) {
                    console.warn("Profile update failed, continuing with report save...");
                }

                // ID FALLBACKS: If user object is glitchy, try to extract from local storage
                // ID FALLBACKS: If user object is glitchy, try to extract from local storage
                let finalAppId = user?.uid || reportData.appUserId;
                let finalMobile = user?.mobile || reportData.userMobile;

                if (!finalAppId || !finalMobile) {
                    const stored = localStorage.getItem('matricare_user');
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            finalAppId = finalAppId || parsed.uid;
                            finalMobile = finalMobile || parsed.mobile;
                        } catch (e) {
                            console.error("Local storage parse fail:", e);
                        }
                    }
                }

                reportData.appUserId = finalAppId;
                // FORCE CLEAN MOBILE (10 Digits)
                reportData.userMobile = finalMobile ? String(finalMobile).replace(/\D/g, '').slice(-10) : null;

                // Robust deepClean that handles arrays and Firestore objects
                const deepClean = (obj) => {
                    if (obj === null || obj === undefined) return obj;

                    // Handle Firestore objects (timestamps/fieldvalues)
                    if (obj.constructor?.name?.includes('FieldValue') || (obj._methodName && obj._methodName.includes('serverTimestamp'))) {
                        return obj;
                    }

                    // Handle Arrays properly
                    if (Array.isArray(obj)) {
                        return obj.map(item => deepClean(item)).filter(item => item !== undefined);
                    }

                    // Handle Objects
                    if (typeof obj === 'object') {
                        const cleaned = {};
                        Object.keys(obj).forEach(key => {
                            const val = obj[key];
                            const cleanedVal = deepClean(val);
                            if (cleanedVal !== undefined) {
                                cleaned[key] = cleanedVal;
                            }
                        });
                        return cleaned;
                    }

                    return obj;
                };

                const finalData = deepClean(reportData);
                console.log("🚀 CLOUD SAVE START - Payload:", finalData);

                // Final warning if Identity is missing
                if (!finalData.userMobile && !finalData.appUserId) {
                    console.error("⚠️ CRITICAL: Saving report with ZERO identity keys!");
                }
                alert("Attempting Cloud Save...");

                const docRef = await addDoc(collection(db, "health_reports"), finalData);
                console.log("✅ CLOUD SAVE SUCCESS! Document ID:", docRef.id);

                // Show a very clear success message with IDs for troubleshooting
                const successMsg = `✅ Analysis Saved to Cloud!\n\n` +
                    `Document ID: ${docRef.id}\n` +
                    `Owner ID: ${reportData.appUserId}\n` +
                    `Mobile Link: ${reportData.userMobile}\n\n` +
                    `You can now see this in your 'Report History' page.`;
                alert(successMsg);

                setShowResults(true);
                setStep(3); // Result step
            } catch (dbError) {
                console.error("❌ Firestore Save Error:", dbError);
                setLastError(dbError.message || "Unknown Database Error");
                const currentSecurityId = auth.currentUser?.uid || 'NONE';
                const currentAppId = user?.uid || 'NONE';
                alert(`⚠️ Cloud Save Failed!\n\nReason: ${dbError.message}\n\nSecurity ID: ${currentSecurityId}\nApp ID: ${currentAppId}\nMobile: ${user?.mobile}\n\nHint: If you see 'Missing Permissions', please try one more time.`);
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
                <button type="button" className="back-circle-btn" onClick={() => {}}>{t('buttons.back')}</button>
                <h2>{t('steps.step1Title')}</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar"></div>
            </div>

            <div className="vitals-grid-scroll">
                {['age', 'systolicBP', 'diastolicBP', 'bloodGlucose', 'bodyTemp', 'heartRate', 'hemoglobin', 'hba1c', 'respirationRate', 'weight'].map((key) => {
                    return (
                        <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                            <div className="label-info-wrapper">
                                <label>{t(`vitals.${key}.label`)}</label>
                                <div className="info-icon">
                                    i
                                    <span className="tooltip-text">{t(`vitals.${key}.desc`)}</span>
                                </div>
                            </div>
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
                            <p className="range-text-hint">{t('results.normalRange')}: {t(`vitals.${key}.range`)}</p>
                        </div>
                    );
                })}
            </div>

            <button 
                type="button" 
                className="action-button-primary" 
                onClick={nextStep}
                onTouchEnd={(e) => {
                    // Fallback for Safari/Mobile bugs where onClick is dropped
                    e.preventDefault(); // Prevent double firing if onClick does happen
                    nextStep();
                }}
            >
                {t('buttons.continue')}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="vitals-form-container fade-in">
            <div className="form-header-standard">
                <button 
                    type="button" 
                    className="back-circle-btn" 
                    onClick={prevStep}
                    onTouchEnd={(e) => { e.preventDefault(); prevStep(); }}
                >
                    {t('buttons.back')}
                </button>
                <h2>{t('steps.step2Title')}</h2>
            </div>

            <div className="progress-bar-stepper">
                <div className="step-bar active"></div>
                <div className="step-bar active"></div>
            </div>

            <div className="vitals-grid-scroll">
                {['gravida', 'para', 'liveBirths', 'abortions', 'childDeaths'].map((key) => {
                    return (
                        <div key={key} className={`input-group-modern ${getValidationClass(key)}`}>
                            <div className="label-info-wrapper">
                                <label>{t(`history.${key}.label`)}</label>
                                <div className="info-icon">
                                    i
                                    <span className="tooltip-text">{t(`history.${key}.desc`)}</span>
                                </div>
                            </div>
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
                            <p className="range-text-hint">{t('results.normalRange')}: {t(`history.${key}.range`)}</p>
                        </div>
                    );
                })}
            </div>

            <button 
                type="button" 
                className="action-button-primary" 
                onClick={runAnalysis}
                onTouchEnd={(e) => { 
                    if(!analyzing) {
                        e.preventDefault(); 
                        runAnalysis(); 
                    }
                }}
                disabled={analyzing}
            >
                {analyzing ? (
                    <div className="loader-inline">
                        <span></span>{t('buttons.analyzing')}
                    </div>
                ) : t('buttons.analyze')}
            </button>
        </div>
    );

    const renderResults = () => {
        return (
            <div className="results-view-container fade-in">
                <div className="form-header-standard">
                    <button type="button" className="back-circle-btn" onClick={(e) => { e.preventDefault(); setStep(2); }}>{t('buttons.back')}</button>
                    <h2>{t('steps.step3Title')}</h2>
                </div>

                <div className="results-content-scroll">
                    <h3 className="section-label">{t('results.detailedAnalysis')}</h3>

                    {[
                        { id: 'respirationRate', label: t('vitals.respirationRate.label'), unit: '/min' },
                        { id: 'hemoglobin', label: t('vitals.hemoglobin.label'), unit: 'g/dL' },
                        { id: 'bloodGlucose', label: t('vitals.bloodGlucose.label'), unit: 'mg/dL' },
                        { id: 'hba1c', label: t('vitals.hba1c.label'), unit: '%' }
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
                                <p className="normal-range-footer">{t('results.normalRange')}: {ranges[metric.id].min}-{ranges[metric.id].max} {metric.unit}</p>
                            </div>
                        );
                    })}

                    <h3 className="section-label">{t('results.aiRiskAssessment')}</h3>

                    {mlPrediction ? (
                        <div className={`risk-summary-card-glass ${mlPrediction.prediction === 0 ? 'green' : 'red'}`}>
                            <div className="risk-alert-icon">
                                {mlPrediction.prediction === 0 ? '✓' : '!'}
                            </div>
                            <h2 className="risk-status-heading" style={{ fontSize: '2.5rem', marginBottom: '0' }}>
                                {mlPrediction.prediction === 0 ? t('riskLevels.lowRisk') : t('riskLevels.highRisk')}
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
                        {t('results.autoSave')}
                    </div>

                    <Link to="/report-history" className="view-history-link-btn">
                        {t('results.viewHistory')} →
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
                        <h3>{t('sidebar.title')}</h3>
                        <p>{t('sidebar.description')}</p>

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

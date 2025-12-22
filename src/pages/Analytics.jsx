import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Analytics.css';

const Analytics = () => {
    const { language } = useLanguage();
    // Helper to safely get nested translation keys
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const [view, setView] = useState('hub'); // hub, analysis, risk, symptoms
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            startAnalysis();
        }
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setShowResults(false);
        // Ensure we are in analysis view
        if (view !== 'analysis') setView('analysis');

        // Simulate ML Model Analysis Delay
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
        }, 3000);
    };

    const resetAnalysis = () => {
        setFile(null);
        setShowResults(false);
    };

    const goBack = () => setView('hub');

    return (
        <div className="analytics-page">
            <div className="container">
                <div className="health-header">
                    <h1>{t('analytics.title')}</h1>
                    <p className="health-subtitle">Comprehensive Maternal Health Assistant</p>
                </div>

                {view !== 'hub' && (
                    <button onClick={goBack} className="back-btn">
                        ← Back to Hub
                    </button>
                )}

                {/* Health Hub Desktop View using Grid */}
                {view === 'hub' && (
                    <div className="health-hub-grid">
                        {/* Card 1: Analyze */}
                        <div className="hub-card">
                            <div className="hub-card-header gradient-mauve">
                                <span className="hub-card-icon">📄</span>
                                <h2>{t('analytics.analyzeCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <p className="hub-card-desc">{t('analytics.analyzeCard.desc')}</p>
                                <div className="hub-action-area">
                                    <button className="hub-btn-primary" onClick={() => setView('analysis')}>
                                        {t('analytics.analyzeCard.btn')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Risk Guide */}
                        <div className="hub-card">
                            <div className="hub-card-header gradient-peach">
                                <span className="hub-card-icon">⚠️</span>
                                <h2>{t('analytics.riskCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <p className="hub-card-desc">Identify potential pregnancy complications and learn prevention.</p>
                                <div className="hub-action-area">
                                    <button className="hub-btn-outline" onClick={() => setView('risk')}>
                                        {t('analytics.riskCard.btn')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Symptom Dictionary */}
                        <div className="hub-card">
                            <div className="hub-card-header gradient-mint">
                                <span className="hub-card-icon">🩺</span>
                                <h2>{t('analytics.symptomCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <p className="hub-card-desc">Recognize warning signs that need immediate medical attention.</p>
                                <div className="hub-action-area">
                                    <button className="hub-btn-outline" onClick={() => setView('symptoms')}>
                                        {t('analytics.symptomCard.btn')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis View */}
                {view === 'analysis' && (
                    <div className="tab-view fade-in">
                        {!isAnalyzing && !showResults && (
                            <div className="upload-container">
                                <div className="upload-box">
                                    <div className="upload-icon-large">📂</div>
                                    <h3>{t('analytics.uploadTitle')}</h3>
                                    <p>{t('analytics.uploadDesc')}</p>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="file-input-hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="file-upload" className="upload-btn">
                                        Choose File
                                    </label>
                                    <small>{t('analytics.supportedFormats')}</small>
                                </div>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="analyzing-state">
                                <div className="scanner-animation"></div>
                                <h3>{t('analytics.analyzing')}</h3>
                                <p>{t('analytics.pleaseWait')}</p>
                            </div>
                        )}

                        {showResults && (
                            <div className="results-container">
                                <div className="results-header">
                                    <h2>{t('analytics.resultsTitle')}</h2>
                                    <p>{t('analytics.resultsSubtitle')}: <strong>{file?.name}</strong></p>
                                </div>

                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <h4>{t('analytics.hemoglobin')}</h4>
                                        <div className="metric-value-row">
                                            <span className="value">11.2</span>
                                            <span className="unit">g/dL</span>
                                        </div>
                                        <div className="status-badge status-warning">{t('analytics.attention')}</div>
                                    </div>

                                    <div className="metric-card">
                                        <h4>{t('analytics.bloodPressure')}</h4>
                                        <div className="metric-value-row">
                                            <span className="value">110/70</span>
                                            <span className="unit">mmHg</span>
                                        </div>
                                        <div className="status-badge status-success">{t('analytics.normal')}</div>
                                    </div>

                                    <div className="metric-card">
                                        <h4>{t('analytics.glucose')}</h4>
                                        <div className="metric-value-row">
                                            <span className="value">95</span>
                                            <span className="unit">mg/dL</span>
                                        </div>
                                        <div className="status-badge status-success">{t('analytics.normal')}</div>
                                    </div>

                                    <div className="metric-card">
                                        <h4>{t('analytics.riskAssessment')}</h4>
                                        <div className="metric-value-row">
                                            <span className="value success-text">Low</span>
                                        </div>
                                        <div className="status-badge status-success">{t('analytics.normal')}</div>
                                    </div>
                                </div>

                                <div className="recommendations-container">
                                    <h3>{t('analytics.recommendations')}</h3>
                                    <div className="rec-list">
                                        <div className="rec-item">
                                            <span className="rec-bullet">🥗</span>
                                            <div>
                                                <strong>Iron-Rich Diet:</strong> Increase intake of spinach, lentils, and fortified cereals to boost Hemoglobin.
                                            </div>
                                        </div>
                                        <div className="rec-item">
                                            <span className="rec-bullet">💧</span>
                                            <div>
                                                <strong>Stay Hydrated:</strong> Drink 8-10 glasses of water daily to maintain amniotic fluid levels.
                                            </div>
                                        </div>
                                        <div className="rec-item">
                                            <span className="rec-bullet">🧘‍♀️</span>
                                            <div>
                                                <strong>Daily Yoga:</strong> Continue with Trimester 2 yoga exercises to manage back pain.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="disclaimer-note">
                                    {t('analytics.consultDoctor')}
                                </div>

                                <button className="reset-btn" onClick={resetAnalysis}>
                                    Analyze Another Report
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Risk View */}
                {view === 'risk' && (
                    <div className="tab-view fade-in">
                        <section className="info-section">
                            <div className="section-intro">
                                <h2>High-Risk Pregnancy Factors</h2>
                                <p>A high-risk pregnancy involves higher-than-average risks. Understanding these factors can help in early management. <br /><small>Source: Cleveland Clinic</small></p>
                            </div>

                            <div className="risk-grid">
                                <div className="risk-card">
                                    <div className="risk-card-header">
                                        <h3>Preexisting Conditions</h3>
                                    </div>
                                    <ul>
                                        <li>High blood pressure (Hypertension)</li>
                                        <li>Diabetes (Type 1 or 2)</li>
                                        <li>Polycystic ovary syndrome (PCOS)</li>
                                        <li>Autoimmune diseases (Lupus, MS)</li>
                                        <li>Thyroid disease</li>
                                        <li>Obesity (BMI &gt; 30)</li>
                                        <li>HIV/AIDS</li>
                                    </ul>
                                </div>
                                <div className="risk-card">
                                    <div className="risk-card-header">
                                        <h3>Pregnancy Conditions</h3>
                                    </div>
                                    <ul>
                                        <li>Gestational Diabetes</li>
                                        <li>Preeclampsia & Eclampsia</li>
                                        <li>Multiple Gestation (Twins/Triplets)</li>
                                        <li>Placenta Previa or Abruption</li>
                                        <li>Previous Preterm Birth</li>
                                        <li>Low Birth Weight</li>
                                    </ul>
                                </div>
                                <div className="risk-card">
                                    <div className="risk-card-header">
                                        <h3>Lifestyle Factors</h3>
                                    </div>
                                    <ul>
                                        <li>Smoking or Vaping</li>
                                        <li>Alcohol consumption</li>
                                        <li>Substance use</li>
                                        <li>Exposure to environmental toxins</li>
                                        <li>High stress levels</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="prevention-box">
                                <h3>How to Reduce Risks</h3>
                                <ul className="prevention-list">
                                    <li>Pre-conception checkup to identify health risks early.</li>
                                    <li>Maintain a healthy weight before and during pregnancy.</li>
                                    <li>Manage preexisting conditions like diabetes or hypertension.</li>
                                    <li>Avoid alcohol, tobacco, and non-prescribed drugs.</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                )}

                {/* Symptoms View */}
                {view === 'symptoms' && (
                    <div className="tab-view fade-in">
                        <section className="info-section">
                            <div className="section-intro">
                                <h2>Warning Signs</h2>
                                <p>Contact your healthcare provider <strong>immediately</strong> if you experience any of these symptoms. <br /><small>Source: Cleveland Clinic</small></p>
                            </div>

                            <div className="symptoms-grid">
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">⚡</div>
                                    <h3>Severe Pain</h3>
                                    <p>Abdominal pain that doesn’t go away, severe headaches that get worse, or chest pain.</p>
                                </div>
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">💧</div>
                                    <h3>Fluid & Discharge</h3>
                                    <p>Vaginal bleeding, increased discharge, or sudden swelling in face or limbs.</p>
                                </div>
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">😵</div>
                                    <h3>Systemic Issues</h3>
                                    <p>Dizziness, fainting, extreme fatigue, trouble breathing, or high fever.</p>
                                </div>
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">🤢</div>
                                    <h3>Digestive Issues</h3>
                                    <p>Nausea and vomiting that is much worse than typical morning sickness.</p>
                                </div>
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">👶</div>
                                    <h3>Fetal Movement</h3>
                                    <p>The baby's movement stopping or slowing down significantly.</p>
                                </div>
                                <div className="symptom-card warning">
                                    <div className="symptom-icon">🧠</div>
                                    <h3>Mental Health</h3>
                                    <p>Severe anxiety or thoughts about harming yourself.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;

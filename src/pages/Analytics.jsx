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
                <div className="trimester-header">
                    <h1>{t('analytics.title')}</h1>
                </div>

                {view !== 'hub' && (
                    <button onClick={goBack} className="back-btn" style={{ marginBottom: '20px' }}>
                        ← Back to Hub
                    </button>
                )}

                {/* Health Hub Desktop View using Grid */}
                {view === 'hub' && (
                    <div className="health-hub-grid">
                        {/* Card 1: Analyze */}
                        <div className="hub-card">
                            <div className="hub-card-header">
                                <span className="hub-card-header-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                </span>
                                <h2>{t('analytics.analyzeCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <div className="hub-upload-container" onClick={() => setView('analysis')}>
                                    <div className="hub-upload-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                    </div>
                                    <p className="hub-upload-text">{t('analytics.uploadDesc')}</p>
                                    <button className="hub-btn-primary">{t('analytics.analyzeCard.btn')}</button>
                                </div>
                                <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                                    {t('analytics.analyzeCard.desc')}
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Risk Guide */}
                        <div className="hub-card">
                            <div className="hub-card-header">
                                <span className="hub-card-header-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                </span>
                                <h2>{t('analytics.riskCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <ul className="hub-list">
                                    {t('analytics.riskCard.items').map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                                <button className="hub-btn-outline" onClick={() => setView('risk')}>
                                    {t('analytics.riskCard.btn')}
                                </button>
                            </div>
                        </div>

                        {/* Card 3: Symptom Dictionary */}
                        <div className="hub-card">
                            <div className="hub-card-header">
                                <span className="hub-card-header-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                </span>
                                <h2>{t('analytics.symptomCard.title')}</h2>
                            </div>
                            <div className="hub-card-body">
                                <ul className="hub-list">
                                    {t('analytics.symptomCard.items').map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                                <button className="hub-btn-outline" onClick={() => setView('symptoms')}>
                                    {t('analytics.symptomCard.btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analysis View */}
                {view === 'analysis' && (
                    <div className="tab-view fade-in">
                        {!isAnalyzing && !showResults && (
                            <div className="upload-section">
                                <input
                                    type="file"
                                    className="file-input"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                />
                                <div className="upload-content">
                                    <div className="upload-icon">📄</div>
                                    <h3 className="upload-title">{t('analytics.uploadTitle')}</h3>
                                    <p className="upload-desc">{t('analytics.uploadDesc')}</p>
                                    <small style={{ color: '#999', marginTop: '10px' }}>{t('analytics.supportedFormats')}</small>
                                </div>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="analyzing-container">
                                <div className="loader"></div>
                                <h3>{t('analytics.analyzing')}</h3>
                                <p>{t('analytics.pleaseWait')}</p>
                            </div>
                        )}

                        {showResults && (
                            <div className="results-section">
                                <div className="results-header">
                                    <h2>{t('analytics.resultsTitle')}</h2>
                                    <p>{t('analytics.resultsSubtitle')}: <strong>{file?.name}</strong></p>
                                    <button className="back-btn" onClick={resetAnalysis} style={{ marginTop: '10px' }}>
                                        ↺ Upload New Report
                                    </button>
                                </div>

                                <div className="results-grid">
                                    <div className="result-card">
                                        <h4>{t('analytics.hemoglobin')}</h4>
                                        <span className="metric-value">11.2 <small>g/dL</small></span>
                                        <span className="metric-status status-attention">{t('analytics.attention')}</span>
                                    </div>

                                    <div className="result-card">
                                        <h4>{t('analytics.bloodPressure')}</h4>
                                        <span className="metric-value">110/70</span>
                                        <span className="metric-status status-normal">{t('analytics.normal')}</span>
                                    </div>

                                    <div className="result-card">
                                        <h4>{t('analytics.glucose')}</h4>
                                        <span className="metric-value">95 <small>mg/dL</small></span>
                                        <span className="metric-status status-normal">{t('analytics.normal')}</span>
                                    </div>

                                    <div className="result-card">
                                        <h4>{t('analytics.riskAssessment')}</h4>
                                        <span className="metric-value" style={{ color: '#2e7d32' }}>Low</span>
                                        <span className="metric-status status-normal">{t('analytics.normal')}</span>
                                    </div>
                                </div>

                                <div className="recommendations-box">
                                    <h3>{t('analytics.recommendations')}</h3>
                                    <ul className="rec-list">
                                        <li>
                                            <span className="rec-icon">•</span>
                                            <div>
                                                <strong>Iron-Rich Diet:</strong> Increase intake of spinach, lentils, and fortified cereals to boost Hemoglobin.
                                            </div>
                                        </li>
                                        <li>
                                            <span className="rec-icon">•</span>
                                            <div>
                                                <strong>Stay Hydrated:</strong> Drink 8-10 glasses of water daily to maintain amniotic fluid levels.
                                            </div>
                                        </li>
                                        <li>
                                            <span className="rec-icon">•</span>
                                            <div>
                                                <strong>Daily Yoga:</strong> Continue with Trimester 2 yoga exercises to manage back pain.
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div className="disclaimer-box">
                                    {t('analytics.consultDoctor')}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Risk View */}
                {view === 'risk' && (
                    <div className="tab-view fade-in">
                        <section className="health-info-section prevention-tips" style={{ marginTop: 0 }}>
                            <div className="section-header">
                                <h2 className="health-section-title">
                                    <span className="icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    </span>
                                    High-Risk Pregnancy Factors
                                </h2>
                                <p className="health-section-subtitle">
                                    A high-risk pregnancy involves higher-than-average risks. Understanding these factors can help in early management.
                                    <br /><em>Source: Cleveland Clinic</em>
                                </p>
                            </div>

                            <div className="risk-categories-grid">
                                <div className="risk-category-card">
                                    <h3>Preexisting Conditions</h3>
                                    <ul>
                                        <li>High blood pressure (Hypertension)</li>
                                        <li>Diabetes</li>
                                        <li>Polycystic ovary syndrome (PCOS)</li>
                                        <li>Autoimmune diseases (Lupus, MS)</li>
                                        <li>Thyroid disease</li>
                                        <li>Obesity</li>
                                        <li>HIV/AIDS</li>
                                    </ul>
                                </div>
                                <div className="risk-category-card">
                                    <h3>Pregnancy-Related Conditions</h3>
                                    <ul>
                                        <li>Gestational Diabetes</li>
                                        <li>Preeclampsia & Eclampsia</li>
                                        <li>Multiple Gestation (Twins/Triplets)</li>
                                        <li>Placenta Previa or Abruption</li>
                                        <li>Previous Preterm Birth</li>
                                        <li>Low Birth Weight</li>
                                    </ul>
                                </div>
                                <div className="risk-category-card">
                                    <h3>Lifestyle Factors</h3>
                                    <ul>
                                        <li>Smoking</li>
                                        <li>Alcohol use</li>
                                        <li>Substance use</li>
                                        <li>Exposure to toxins</li>
                                        <li>High stress</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Symptoms View */}
                {view === 'symptoms' && (
                    <div className="tab-view fade-in">
                        <section className="health-info-section warning-signs" style={{ marginTop: 0 }}>
                            <div className="section-header">
                                <h2 className="health-section-title">
                                    <span className="icon">⚠️</span>
                                    Warning Signs & Symptoms
                                </h2>
                                <p className="health-section-subtitle">
                                    Contact your healthcare provider <strong>immediately</strong> if you experience any of these symptoms.
                                    <br /><em>Source: Cleveland Clinic</em>
                                </p>
                            </div>
                            <div className="health-info-list">
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Severe Physical Pain</h3>
                                        <p>Abdominal pain that doesn’t go away, severe headaches that get worse, or chest pain.</p>
                                    </div>
                                </div>
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Fluid & Discharge Issues</h3>
                                        <p>Vaginal bleeding, increased discharge, or swelling/redness/pain in face or limbs.</p>
                                    </div>
                                </div>
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Systemic Symptoms</h3>
                                        <p>Dizziness, fainting, extreme fatigue, trouble breathing, or high fever.</p>
                                    </div>
                                </div>
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Stomach & Digestion</h3>
                                        <p>Nausea and vomiting that is worse than typical morning sickness.</p>
                                    </div>
                                </div>
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Fetal Movement</h3>
                                        <p>The fetus’s movement stopping or slowing significantly.</p>
                                    </div>
                                </div>
                                <div className="info-row warning-row">
                                    <div className="info-row-marker"></div>
                                    <div className="info-row-content">
                                        <h3>Mental Health</h3>
                                        <p>Thoughts about harming yourself or extreme anxiety.</p>
                                    </div>
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

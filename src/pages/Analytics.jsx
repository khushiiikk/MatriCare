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

    return (
        <div className="analytics-page">
            <div className="container">
                <div className="trimester-header">
                    <h1>{t('analytics.title')}</h1>
                    <p className="subtitle">{t('analytics.subtitle')}</p>
                </div>

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
                                    <span className="rec-icon">🥗</span>
                                    <div>
                                        <strong>Iron-Rich Diet:</strong> Increase intake of spinach, lentils, and fortified cereals to boost Hemoglobin.
                                    </div>
                                </li>
                                <li>
                                    <span className="rec-icon">💧</span>
                                    <div>
                                        <strong>Stay Hydrated:</strong> Drink 8-10 glasses of water daily to maintain amniotic fluid levels.
                                    </div>
                                </li>
                                <li>
                                    <span className="rec-icon">🧘‍♀️</span>
                                    <div>
                                        <strong>Daily Yoga:</strong> Continue with Trimester 2 yoga exercises to manage back pain.
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="disclaimer-box">
                            ⚠️ {t('analytics.consultDoctor')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // UPDATED
import MedicalAnalysis from '../components/MedicalAnalysis';
import PregnancyRisks from './PregnancyRisks';
import PregnancySymptoms from './PregnancySymptoms';
import BackButton from '../components/BackButton';
import './Health.css';

const Health = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('health'); // UPDATED: Use health namespace
    const location = useLocation();
    const [activeView, setActiveView] = useState('menu'); // 'menu', 'analysis', 'risks', 'symptoms'

    useEffect(() => {
        if (location.state?.view) {
            setActiveView(location.state.view);
            // Clear state to avoid reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const renderMenu = () => (
        <div className="health-menu-grid fade-in-up">
            {/* Medical Analytics Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/analysis.jpg" alt="Medical Analytics" />
                </div>
                <h2>{t('page.uploadReport')}</h2>
                <p>{t('page.uploadReportDesc')}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('analysis')}>
                    {t('page.analyzeBtn')} →
                </button>
            </div>

            {/* Pregnancy Risks Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/risks.jpg" alt="Pregnancy Risks" />
                </div>
                <h2>{t('page.pregnancyRisks')}</h2>
                <p>{t('page.pregnancyRisksDesc')}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('risks')}>
                    {t('page.viewRisks')} →
                </button>
            </div>

            {/* Risk Symptoms Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/symptoms.jpg" alt="Risk Symptoms" />
                </div>
                <h2>{t('page.riskSymptoms')}</h2>
                <p>{t('page.riskSymptomsDesc')}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('symptoms')}>
                    {t('page.viewSymptoms')} →
                </button>
            </div>
        </div>
    );

    return (
        <div className="health-container">
            <div className="container">
                {activeView === 'menu' && <BackButton label="To Dashboard" customPath="/dashboard" />}
                {activeView === 'menu' && (
                    <div className="page-header-standard fade-in-up">
                        <h1>{t('page.title')}</h1>
                        <p>{t('page.subtitle')}</p>
                    </div>
                )}

                {/* Sub-header for views EXCEPT risks (which has its own) */}
                {activeView !== 'menu' && activeView !== 'risks' && (
                    <div className="sub-page-header fade-in-up">
                        <button className="back-to-menu-btn" onClick={() => setActiveView('menu')}>
                            ← {t('page.backToMenu')}
                        </button>
                        <h2>
                            {activeView === 'analysis' && t('page.medicalAnalytics')}
                            {activeView === 'symptoms' && t('page.riskSymptoms')}
                        </h2>
                    </div>
                )}

                {/* Content Render */}
                <div className="health-content-area">
                    {activeView === 'menu' && renderMenu()}

                    {activeView === 'analysis' && (
                        <div className="fade-in-up">
                            <MedicalAnalysis />
                        </div>
                    )}

                    {activeView === 'risks' && (
                        <div className="fade-in-up">
                            <PregnancyRisks onBack={() => setActiveView('menu')} />
                        </div>
                    )}

                    {activeView === 'symptoms' && (
                        <div className="fade-in-up">
                            <PregnancySymptoms onBack={() => setActiveView('menu')} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Health;

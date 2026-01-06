import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import MedicalAnalysis from '../components/MedicalAnalysis';
import PregnancyRisks from './PregnancyRisks';
import PregnancySymptoms from './PregnancySymptoms';
import './Health.css';

const Health = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
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
                <h2>Medical Analytics</h2>
                <p>Instant AI report analysis.</p>
                <button className="menu-card-btn" onClick={() => setActiveView('analysis')}>
                    Analyze Report →
                </button>
            </div>

            {/* Pregnancy Risks Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/risks.jpg" alt="Pregnancy Risks" />
                </div>
                <h2>Pregnancy Risks</h2>
                <p>Stay safe & avoid risks.</p>
                <button className="menu-card-btn" onClick={() => setActiveView('risks')}>
                    View Risks →
                </button>
            </div>

            {/* Risk Symptoms Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/symptoms.jpg" alt="Risk Symptoms" />
                </div>
                <h2>Risk Symptoms</h2>
                <p>Critical signs to watch.</p>
                <button className="menu-card-btn" onClick={() => setActiveView('symptoms')}>
                    Check Symptoms →
                </button>
            </div>
        </div>
    );

    return (
        <div className="health-container">
            <div className="container">
                {/* Header (Only show in Menu view or as smaller header in sub-views) */}
                {activeView === 'menu' && (
                    <div className="page-header-standard fade-in-up">
                        <h1>Maternal Health Hub</h1>
                        <p>Comprehensive tools and guide for your pregnancy journey.</p>
                    </div>
                )}

                {/* Sub-header for views EXCEPT risks (which has its own) */}
                {activeView !== 'menu' && activeView !== 'risks' && (
                    <div className="sub-page-header fade-in-up">
                        <button className="back-to-menu-btn" onClick={() => setActiveView('menu')}>
                            ← Back to Health Menu
                        </button>
                        <h2>
                            {activeView === 'analysis' && 'Medical Analytics'}
                            {activeView === 'symptoms' && 'Risk Symptoms'}
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

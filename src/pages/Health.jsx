import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { pagesContent } from '../data/pagesContent';
import MedicalAnalysis from '../components/MedicalAnalysis';
import PregnancyRisks from './PregnancyRisks';
import PregnancySymptoms from './PregnancySymptoms';
import './Health.css';

const Health = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const content = pagesContent[language]?.health || pagesContent.en.health;
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
                <h2>{content.uploadReport}</h2>
                <p>{language === 'hi' ? 'तत्काल एआई रिपोर्ट विश्लेषण।' : 'Instant AI report analysis.'}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('analysis')}>
                    {content.analyzeBtn} →
                </button>
            </div>

            {/* Pregnancy Risks Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/risks.jpg" alt="Pregnancy Risks" />
                </div>
                <h2>{language === 'hi' ? 'गर्भावस्था जोखिम' : 'Pregnancy Risks'}</h2>
                <p>{language === 'hi' ? 'सुरक्षित रहें और जोखिमों से बचें।' : 'Stay safe & avoid risks.'}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('risks')}>
                    {content.viewRisks} →
                </button>
            </div>

            {/* Risk Symptoms Card */}
            <div className="health-menu-card">
                <div className="card-illustration-placeholder">
                    <img src="/symptoms.jpg" alt="Risk Symptoms" />
                </div>
                <h2>{language === 'hi' ? 'जोखिम लक्षण' : 'Risk Symptoms'}</h2>
                <p>{language === 'hi' ? 'देखने के लिए महत्वपूर्ण संकेत।' : 'Critical signs to watch.'}</p>
                <button className="menu-card-btn" onClick={() => setActiveView('symptoms')}>
                    {content.viewSymptoms} →
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
                        <h1>{content.pageTitle}</h1>
                        <p>{language === 'hi' ? 'आपकी गर्भावस्था यात्रा के लिए व्यापक उपकरण और मार्गदर्शिका।' : 'Comprehensive tools and guide for your pregnancy journey.'}</p>
                    </div>
                )}

                {/* Sub-header for views EXCEPT risks (which has its own) */}
                {activeView !== 'menu' && activeView !== 'risks' && (
                    <div className="sub-page-header fade-in-up">
                        <button className="back-to-menu-btn" onClick={() => setActiveView('menu')}>
                            ← {language === 'hi' ? 'स्वास्थ्य मेनू पर वापस जाएं' : 'Back to Health Menu'}
                        </button>
                        <h2>
                            {activeView === 'analysis' && (language === 'hi' ? 'मेडिकल एनालिटिक्स' : 'Medical Analytics')}
                            {activeView === 'symptoms' && (language === 'hi' ? 'जोखिम लक्षण' : 'Risk Symptoms')}
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

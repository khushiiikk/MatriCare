import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { medicalContent } from '../data/medicalContent';
import './PregnancySymptoms.css';

const PregnancySymptoms = ({ onBack }) => {
    const { language } = useLanguage();
    const content = medicalContent[language]?.pregnancySymptoms || medicalContent.en.pregnancySymptoms;

    return (
        <div className="pregnancy-symptoms-page-container">
            {onBack ? (
                <button
                    onClick={onBack}
                    className="back-btn-absolute"
                >
                    ← {content.back}
                </button>
            ) : (
                <Link to="/health" className="back-btn-absolute">
                    ← {content.back}
                </Link>
            )}

            <div className="page-header-standard">
                <h1>{content.pageTitle}</h1>
                <p>{content.pageSubtitle}</p>
            </div>

            <div className="symptoms-main-content">
                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> {content.emergencyTitle}
                    </h3>
                    <p className="alert-text">
                        <strong>{content.emergencyText}</strong>
                    </p>
                    <div className="alert-list-grid">
                        {content.emergencySymptoms.map((symptom, index) => (
                            <div
                                key={index}
                                className="alert-item link-hover"
                            >
                                {symptom}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{content.ageRiskTitle}</h2>
                    <p className="section-text-clean">
                        {content.ageRiskQuestion}
                    </p>
                    <div className="info-box-highlight">
                        <p>
                            <strong>{content.ageRiskAnswer}</strong>
                        </p>
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{content.complicationsTitle}</h2>
                    <p className="section-text-clean">
                        {content.complicationsText}
                    </p>
                    <div className="risk-link-grid">
                        {content.complications.map((comp, index) => (
                            <div
                                key={index}
                                className="risk-link-item"
                            >
                                {comp}
                            </div>
                        ))}
                    </div>

                    <div className="management-note">
                        <p>
                            {content.managementNote}
                        </p>
                    </div>

                    <p className="source-citation">
                        {content.sourceText} <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">{content.sourceLink}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancySymptoms;

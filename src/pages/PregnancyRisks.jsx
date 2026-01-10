import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { medicalContent } from '../data/medicalContent';
import './PregnancyRisks.css';

const PregnancyRisks = ({ onBack }) => {
    const { language } = useLanguage();
    const content = medicalContent[language]?.pregnancyRisks || medicalContent.en.pregnancyRisks;

    return (
        <div className="pregnancy-risks-page-container">
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

            <div className="risks-main-content">
                <div className="risk-content-card">
                    <h2 className="section-title-clean">{content.definitionTitle}</h2>
                    <p className="section-text-clean">
                        {content.definitionText}
                    </p>
                    <h3 className="subsection-title">{content.qualifiesTitle}</h3>
                    <ul className="risk-list-styled">
                        {content.qualifiesList.map((item, idx) => (
                            <li key={idx}>
                                <strong>{item.bold}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{content.riskFactorsTitle}</h2>
                    <p className="section-text-clean">
                        {content.riskFactorsText}
                    </p>
                    <div className="risk-link-grid">
                        {content.preexistingConditions.map((condition, idx) => (
                            <div key={idx} className="risk-link-item">{condition}</div>
                        ))}
                    </div>

                    <h3 className="subsection-title">{content.pregnancyConditionsTitle}</h3>
                    <p className="section-text-clean">{content.pregnancyConditionsText}</p>
                    <div className="risk-link-grid">
                        {content.pregnancyConditions.map((condition, idx) => (
                            <div key={idx} className="risk-link-item">{condition}</div>
                        ))}
                    </div>
                </div>

                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> {content.emergencyTitle}
                    </h3>
                    <p className="alert-text">
                        <strong>{content.emergencyText}</strong>
                    </p>
                    <div className="alert-list-grid">
                        {content.emergencySigns.map((sign, idx) => (
                            <div key={idx} className="alert-item">{sign}</div>
                        ))}
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{content.managementTitle}</h2>
                    <p className="section-text-clean">
                        {content.managementText}
                    </p>
                    <ul className="management-list">
                        {content.managementList.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                    <p className="source-citation">
                        {content.sourceText} <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">{content.sourceLink}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancyRisks;

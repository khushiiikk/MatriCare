import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // UPDATED
import './PregnancySymptoms.css';

const PregnancySymptoms = ({ onBack }) => {
    const { t } = useTranslation('medical'); // UPDATED: Use medical namespace

    return (
        <div className="pregnancy-symptoms-page-container">
            {onBack ? (
                <button
                    onClick={onBack}
                    className="back-btn-absolute"
                >
                    ← {t('pregnancySymptoms.back')}
                </button>
            ) : (
                <Link to="/health" className="back-btn-absolute">
                    ← {t('pregnancySymptoms.back')}
                </Link>
            )}

            <div className="page-header-standard">
                <h1>{t('pregnancySymptoms.pageTitle')}</h1>
                <p>{t('pregnancySymptoms.pageSubtitle')}</p>
            </div>

            <div className="symptoms-main-content">
                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> {t('pregnancySymptoms.emergencyTitle')}
                    </h3>
                    <p className="alert-text">
                        <strong>{t('pregnancySymptoms.emergencyText')}</strong>
                    </p>
                    <div className="alert-list-grid">
                        {t('pregnancySymptoms.emergencySymptoms', { returnObjects: true }).map((symptom, index) => (
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
                    <h2 className="section-title-clean">{t('pregnancySymptoms.ageRiskTitle')}</h2>
                    <p className="section-text-clean">
                        {t('pregnancySymptoms.ageRiskQuestion')}
                    </p>
                    <div className="info-box-highlight">
                        <p>
                            <strong>{t('pregnancySymptoms.ageRiskAnswer')}</strong>
                        </p>
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{t('pregnancySymptoms.complicationsTitle')}</h2>
                    <p className="section-text-clean">
                        {t('pregnancySymptoms.complicationsText')}
                    </p>
                    <div className="risk-link-grid">
                        {t('pregnancySymptoms.complications', { returnObjects: true }).map((comp, index) => (
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
                            {t('pregnancySymptoms.managementNote')}
                        </p>
                    </div>

                    <p className="source-citation">
                        {t('pregnancySymptoms.sourceText')} <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">{t('pregnancySymptoms.sourceLink')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancySymptoms;

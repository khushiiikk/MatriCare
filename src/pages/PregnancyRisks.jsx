import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // UPDATED
import './PregnancyRisks.css';

const PregnancyRisks = ({ onBack }) => {
    const { t } = useTranslation('medical'); // UPDATED: Use medical namespace

    return (
        <div className="pregnancy-risks-page-container">
            {onBack ? (
                <button
                    onClick={onBack}
                    className="back-btn-absolute"
                >
                    ← {t('pregnancyRisks.back')}
                </button>
            ) : (
                <Link to="/health" className="back-btn-absolute">
                    ← {t('pregnancyRisks.back')}
                </Link>
            )}

            <div className="page-header-standard">
                <h1>{t('pregnancyRisks.pageTitle')}</h1>
                <p>{t('pregnancyRisks.pageSubtitle')}</p>
            </div>

            <div className="risks-main-content">
                <div className="risk-content-card">
                    <h2 className="section-title-clean">{t('pregnancyRisks.definitionTitle')}</h2>
                    <p className="section-text-clean">
                        {t('pregnancyRisks.definitionText')}
                    </p>
                    <h3 className="subsection-title">{t('pregnancyRisks.qualifiesTitle')}</h3>
                    <ul className="risk-list-styled">
                        {t('pregnancyRisks.qualifiesList', { returnObjects: true }).map((item, idx) => (
                            <li key={idx}>
                                <strong>{item.bold}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{t('pregnancyRisks.riskFactorsTitle')}</h2>
                    <p className="section-text-clean">
                        {t('pregnancyRisks.riskFactorsText')}
                    </p>
                    <div className="risk-link-grid">
                        {t('pregnancyRisks.preexistingConditions', { returnObjects: true }).map((condition, idx) => (
                            <div key={idx} className="risk-link-item">{condition}</div>
                        ))}
                    </div>

                    <h3 className="subsection-title">{t('pregnancyRisks.pregnancyConditionsTitle')}</h3>
                    <p className="section-text-clean">{t('pregnancyRisks.pregnancyConditionsText')}</p>
                    <div className="risk-link-grid">
                        {t('pregnancyRisks.pregnancyConditions', { returnObjects: true }).map((condition, idx) => (
                            <div key={idx} className="risk-link-item">{condition}</div>
                        ))}
                    </div>
                </div>

                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> {t('pregnancyRisks.emergencyTitle')}
                    </h3>
                    <p className="alert-text">
                        <strong>{t('pregnancyRisks.emergencyText')}</strong>
                    </p>
                    <div className="alert-list-grid">
                        {t('pregnancyRisks.emergencySigns', { returnObjects: true }).map((sign, idx) => (
                            <div key={idx} className="alert-item">{sign}</div>
                        ))}
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">{t('pregnancyRisks.managementTitle')}</h2>
                    <p className="section-text-clean">
                        {t('pregnancyRisks.managementText')}
                    </p>
                    <ul className="management-list">
                        {t('pregnancyRisks.managementList', { returnObjects: true }).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                    <p className="source-citation">
                        {t('pregnancyRisks.sourceText')} <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">{t('pregnancyRisks.sourceLink')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancyRisks;

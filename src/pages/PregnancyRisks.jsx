import React from 'react';
import { Link } from 'react-router-dom';
import './PregnancyRisks.css';

const PregnancyRisks = () => {
    return (
        <div className="pregnancy-risks-page-container">
            <div className="page-header-standard">
                <Link to="/health" className="back-btn" style={{ marginBottom: '20px', display: 'inline-block' }}>
                    ← Back
                </Link>
                <h1>High-Risk Pregnancy</h1>
                <p>Personalized insights and safety guidelines for your health.</p>
            </div>

            <div className="risks-main-content">
                <div className="risk-section">
                    <h2 className="section-title-clean">What is high-risk pregnancy?</h2>
                    <p className="section-text-clean">
                        A high-risk pregnancy carries increased health risks for you, the fetus, or both.
                        Proper care and monitoring ensure a safe journey.
                    </p>
                </div>

                <div className="risk-section">
                    <h2 className="section-title-clean">Risk Factors</h2>
                    <p className="section-text-clean">Preexisting health conditions, pregnancy-related issues, or lifestyle factors.</p>

                    <h3 className="subsection-title">Preexisting Conditions</h3>
                    <div className="risk-pill-grid">
                        <span className="risk-pill">Diabetes & High Blood Pressure</span>
                        <span className="risk-pill">Autoimmune diseases (Lupus, MS)</span>
                        <span className="risk-pill">Kidney or Thyroid disease</span>
                        <span className="risk-pill">Obesity or Mental health</span>
                        <span className="risk-pill">PCOS or Fibroids</span>
                    </div>

                    <h3 className="subsection-title">Pregnancy-related Conditions</h3>
                    <div className="risk-pill-grid">
                        <span className="risk-pill">Gestational diabetes</span>
                        <span className="risk-pill">Preeclampsia or Eclampsia</span>
                        <span className="risk-pill">Multiple gestation (Twins)</span>
                        <span className="risk-pill">Placental conditions</span>
                    </div>
                </div>

                <div className="emergency-alert-card">
                    <h3 className="alert-title">Signs to Watch For</h3>
                    <p className="alert-text">Contact your healthcare provider immediately if you experience:</p>
                    <div className="alert-list-grid">
                        <div className="alert-item">Persistent abdominal pain</div>
                        <div className="alert-item">Vaginal bleeding</div>
                        <div className="alert-item">Severe headache / blurred vision</div>
                        <div className="alert-item">Decrease in fetal movement</div>
                        <div className="alert-item">Severe swelling in face/limbs</div>
                        <div className="alert-item">Trouble breathing</div>
                    </div>
                </div>

                <div className="risk-section">
                    <h2 className="section-title-clean">Complications & Management</h2>
                    <p className="section-text-clean">
                        Management depends on your specific risk profile and may include closer monitoring from your obstetric team.
                    </p>
                </div>

                <div className="risk-section">
                    <h2 className="section-title-clean">How to stay safe</h2>
                    <p className="section-text-clean">
                        Early prenatal care is critical. Build a support system and focus on healthy habits.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancyRisks;

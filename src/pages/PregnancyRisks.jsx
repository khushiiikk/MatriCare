import React from 'react';
import { Link } from 'react-router-dom';
import './PregnancyRisks.css';

const PregnancyRisks = ({ onBack }) => {
    return (
        <div className="pregnancy-risks-page-container">
            {onBack ? (
                <button
                    onClick={onBack}
                    className="back-btn-absolute"
                >
                    ← Back
                </button>
            ) : (
                <Link to="/health" className="back-btn-absolute">
                    ← Back
                </Link>
            )}

            <div className="page-header-standard">
                <h1>High-Risk Pregnancy</h1>
                <p>Personalized insights and safety guidelines for your health.</p>
            </div>

            <div className="risks-main-content">
                <div className="risk-content-card">
                    <h2 className="section-title-clean">Definition & Overview</h2>
                    <p className="section-text-clean">
                        A high-risk pregnancy means you have a higher-than-average risk of experiencing a pregnancy complication. Some pregnancies begin as high risk, while others become high risk at some point during the pregnancy.
                    </p>
                    <h3 className="subsection-title">What qualifies a pregnancy as high risk?</h3>
                    <ul className="risk-list-styled">
                        <li><strong>Preexisting health conditions.</strong> These are health conditions you have before pregnancy.</li>
                        <li><strong>Pregnancy-related health conditions.</strong> These are conditions you develop once pregnancy begins.</li>
                        <li><strong>Lifestyle factors</strong> (including <a href="https://health.clevelandclinic.org/smoking-while-pregnant/" target="_blank" rel="noopener noreferrer">smoking</a>, <a href="https://my.clevelandclinic.org/health/diseases/16652-drug-addiction-substance-use-disorder-sud" target="_blank" rel="noopener noreferrer">substance use disorder</a>, <a href="https://my.clevelandclinic.org/health/diseases/3909-alcoholism" target="_blank" rel="noopener noreferrer">alcohol use disorder</a>).</li>
                    </ul>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">Common Risk Factors</h2>
                    <p className="section-text-clean">
                        People with preexisting conditions have increased health risks during pregnancy. Explore these conditions below:
                    </p>
                    <div className="risk-link-grid">
                        <a href="https://my.clevelandclinic.org/health/diseases/21624-autoimmune-diseases" target="_blank" rel="noopener noreferrer" className="risk-link-item">Autoimmune diseases</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/7104-diabetes" target="_blank" rel="noopener noreferrer" className="risk-link-item">Diabetes</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/4497-gestational-hypertension" target="_blank" rel="noopener noreferrer" className="risk-link-item">High blood pressure</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/9130-uterine-fibroids" target="_blank" rel="noopener noreferrer" className="risk-link-item">Fibroids</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/4251-hiv-aids" target="_blank" rel="noopener noreferrer" className="risk-link-item">HIV/AIDS</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/15096-chronic-kidney-disease" target="_blank" rel="noopener noreferrer" className="risk-link-item">Kidney disease</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/11209-weight-control-and-obesity" target="_blank" rel="noopener noreferrer" className="risk-link-item">Obesity</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/22295-mental-health-disorders" target="_blank" rel="noopener noreferrer" className="risk-link-item">Depression (Mental Health)</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/8316-polycystic-ovary-syndrome-pcos" target="_blank" rel="noopener noreferrer" className="risk-link-item">PCOS</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/8541-thyroid-disease" target="_blank" rel="noopener noreferrer" className="risk-link-item">Thyroid disease</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/16788-blood-clotting-disorders-hypercoagulable-states" target="_blank" rel="noopener noreferrer" className="risk-link-item">Blood clotting disorders</a>
                    </div>

                    <h3 className="subsection-title">Pregnancy-related conditions</h3>
                    <p className="section-text-clean">Conditions that can develop specifically during pregnancy:</p>
                    <div className="risk-link-grid">
                        <a href="https://my.clevelandclinic.org/health/diseases/9012-gestational-diabetes" target="_blank" rel="noopener noreferrer" className="risk-link-item">Gestational diabetes</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/24980-low-birth-weight" target="_blank" rel="noopener noreferrer" className="risk-link-item">Low birth weight</a>
                        <a href="https://my.clevelandclinic.org/health/articles/9710-expecting-twins-or-triplets" target="_blank" rel="noopener noreferrer" className="risk-link-item">Twins or Triplets</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/17952-preeclampsia" target="_blank" rel="noopener noreferrer" className="risk-link-item">Preeclampsia</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/24211-placenta-previa" target="_blank" rel="noopener noreferrer" className="risk-link-item">Placenta previa</a>
                        <a href="https://my.clevelandclinic.org/health/diseases/22179-oligohydramnios" target="_blank" rel="noopener noreferrer" className="risk-link-item">Amniotic fluid issues</a>
                    </div>
                </div>

                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> Emergency Warning Signs
                    </h3>
                    <p className="alert-text">
                        <strong>Contact your healthcare provider immediately</strong> if you experience any of the following symptoms:
                    </p>
                    <div className="alert-list-grid">
                        <div className="alert-item">Persistent abdominal/pelvic pain</div>
                        <div className="alert-item">Vaginal bleeding or spotting</div>
                        <div className="alert-item">Severe, non-stop headache</div>
                        <div className="alert-item">Blurred vision or spots</div>
                        <div className="alert-item">Sudden swelling (face/hands)</div>
                        <div className="alert-item">Reduced fetal movement</div>
                        <div className="alert-item">Leaking amniotic fluid</div>
                        <div className="alert-item">Fever > 100.4°F (38°C)</div>
                        <div className="alert-item">Trouble breathing</div>
                        <div className="alert-item">Severe nausea/vomiting</div>
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">Management & Safety</h2>
                    <p className="section-text-clean">
                        Your provider labels a pregnancy "high risk" to prioritize safety, not to scare you. Management involves:
                    </p>
                    <ul className="management-list">
                        <li>More frequent prenatal visits & ultrasounds</li>
                        <li>Regular blood pressure & blood sugar monitoring</li>
                        <li>Consultation with specialists (Maternal-Fetal Medicine)</li>
                    </ul>
                    <p className="source-citation">
                        Data Source: <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">Cleveland Clinic</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancyRisks;

import React from 'react';
import { Link } from 'react-router-dom';
import './PregnancySymptoms.css';

const PregnancySymptoms = ({ onBack }) => {
    const emergencySymptoms = [
        { name: "Abdominal pain that doesn’t go away", link: "https://my.clevelandclinic.org/health/symptoms/12107-abdominal-pain" },
        { name: "Chest pain", link: "https://my.clevelandclinic.org/health/symptoms/21209-chest-pain" },
        { name: "Dizziness or fainting", link: "https://my.clevelandclinic.org/health/symptoms/23018-dizziness-and-fainting" },
        { name: "Extreme fatigue", link: "https://my.clevelandclinic.org/health/symptoms/24944-fatigue" },
        { name: "Fetus’s movement stopping or slowing", link: "https://my.clevelandclinic.org/health/articles/21036-fetal-movement" },
        { name: "Heart palpitations", link: "https://my.clevelandclinic.org/health/symptoms/17173-heart-palpitations" },
        { name: "Severe nausea and vomiting", link: "https://my.clevelandclinic.org/health/diseases/11912-hyperemesis-gravidarum-severe-nausea-vomiting-pregnancy" },
        { name: "Severe headache", link: "https://my.clevelandclinic.org/health/symptoms/21317-headache" },
        { name: "Swelling, redness or pain in face/limbs", link: "https://my.clevelandclinic.org/health/symptoms/14764-swelling-edema" },
        { name: "Thoughts about harming yourself", link: "https://my.clevelandclinic.org/health/articles/23157-suicide-and-suicidal-behavior" },
        { name: "Trouble breathing", link: "https://my.clevelandclinic.org/health/symptoms/16942-shortness-of-breath-dyspnea" },
        { name: "Vaginal bleeding or increased discharge", link: "https://my.clevelandclinic.org/health/symptoms/14611-vaginal-bleeding" }
    ];

    const complications = [
        { name: "Preeclampsia-spectrum disorders", link: "https://my.clevelandclinic.org/health/diseases/17952-preeclampsia" },
        { name: "Preterm delivery", link: "https://my.clevelandclinic.org/health/diseases/21071-preterm-labor" },
        { name: "Cesarean delivery", link: "https://my.clevelandclinic.org/health/treatments/7201-c-section-cesarean-birth" },
        { name: "Postpartum hemorrhage", link: "https://my.clevelandclinic.org/health/diseases/24869-postpartum-hemorrhage" },
        { name: "Low birth weight", link: "https://my.clevelandclinic.org/health/diseases/24980-low-birth-weight" },
        { name: "Birth defects", link: "https://my.clevelandclinic.org/health/diseases/12230-birth-defects" },
        { name: "NICU admission", link: "https://my.clevelandclinic.org/health/articles/21081-neonatal-intensive-care-unit-nicu" },
        { name: "ICU admission", link: "https://my.clevelandclinic.org/health/articles/21147-intensive-care-unit-icu" },
        { name: "Miscarriage", link: "https://my.clevelandclinic.org/health/diseases/9688-miscarriage" },
        { name: "Stillbirth", link: "https://my.clevelandclinic.org/health/diseases/9689-stillbirth" }
    ];

    return (
        <div className="pregnancy-symptoms-page-container">
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
                <h1>Pregnancy Symptoms & Complications</h1>
                <p>Understanding when to seek care and what to watch for.</p>
            </div>

            <div className="symptoms-main-content">
                <div className="emergency-alert-card">
                    <h3 className="alert-title">
                        <span>⚠️</span> Immediate Warning Signs
                    </h3>
                    <p className="alert-text">
                        <strong>Talk to your pregnancy care provider right away</strong> if you experience any of the following symptoms, regardless of if your pregnancy is high risk or low risk:
                    </p>
                    <div className="alert-list-grid">
                        {emergencySymptoms.map((symptom, index) => (
                            <a
                                key={index}
                                href={symptom.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="alert-item link-hover"
                            >
                                {symptom.name}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">Age & Risk Factors</h2>
                    <p className="section-text-clean">
                        At what age is a pregnancy considered high risk?
                    </p>
                    <div className="info-box-highlight">
                        <p>
                            <strong>Age alone isn’t a determining factor</strong> in a high-risk pregnancy. Your pregnancy care provider determines if your pregnancy is likely to have complications based on several other factors.
                        </p>
                    </div>
                </div>

                <div className="risk-content-card">
                    <h2 className="section-title-clean">Possible Complications</h2>
                    <p className="section-text-clean">
                        A high-risk pregnancy can be life-threatening for you or the fetus. Some of the most common complications can include:
                    </p>
                    <div className="risk-link-grid">
                        {complications.map((comp, index) => (
                            <a
                                key={index}
                                href={comp.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="risk-link-item"
                            >
                                {comp.name}
                            </a>
                        ))}
                    </div>

                    <div className="management-note">
                        <p>
                            It’s important to talk to your pregnancy care provider about your risks for these complications. Ask them any questions you have. With proper monitoring and care, you and your providers may be able to reduce your risk of having these or other complications.
                        </p>
                    </div>

                    <p className="source-citation">
                        Data Source: <a href="https://my.clevelandclinic.org/health/diseases/22190-high-risk-pregnancy" target="_blank" rel="noopener noreferrer">Cleveland Clinic</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PregnancySymptoms;

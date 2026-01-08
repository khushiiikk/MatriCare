import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AHOME.css';

const AHOME = () => {
    const navigate = useNavigate();

    return (
        <div className="ahome-container">
            <section className="ahome-hero">
                <div className="ahome-hero-content">
                    <h1>Empowering ASHA Workers<br /><span>Ensuring Every Mother Matters</span></h1>
                    <p>Your dedication saves lives. Manage your community health tasks with precision and care.</p>
                    <div className="ahome-cta-group">
                        <button className="ahome-primary-btn" onClick={() => navigate('/Adash')}>Go to My Dashboard</button>
                        <button className="ahome-secondary-btn" onClick={() => navigate('/Ayoga')}>Wellness Guide</button>
                    </div>
                </div>
            </section>

            <section className="ahome-stats">
                <div className="stat-box">
                    <span className="stat-num">24</span>
                    <span className="stat-label">Patients Active</span>
                </div>
                <div className="stat-box">
                    <span className="stat-num">5</span>
                    <span className="stat-label">High Risk Alerts</span>
                </div>
                <div className="stat-box">
                    <span className="stat-num">12</span>
                    <span className="stat-label">Visits Today</span>
                </div>
            </section>

            <section className="ahome-features">
                <h2>Health Mission Tools</h2>
                <div className="feature-grid">
                    <div className="feature-item">
                        <div className="feat-icon">📍</div>
                        <h3>Smart Mapping</h3>
                        <p>Optimized routes to reach your patients faster and more efficiently.</p>
                    </div>
                    <div className="feature-item">
                        <div className="feat-icon">📊</div>
                        <h3>Risk Analytics</h3>
                        <p>Real-time monitoring of hemoglobin and vitals to flag emergencies early.</p>
                    </div>
                    <div className="feature-item">
                        <div className="feat-icon">🧘</div>
                        <h3>Community Yoga</h3>
                        <p>Guides specifically curated for community health and prenatal wellness.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AHOME;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './FloatingActions.css';

const FloatingActions = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showSOSOptions, setShowSOSOptions] = useState(false);

    if (!isAuthenticated) return null;

    return (
        <div className="floating-actions-container">
            {/* SOS Actions */}
            <div className={`sos-options ${showSOSOptions ? 'active' : ''}`}>
                <a href="tel:102" className="sos-sub-button ambulance">
                    A-102
                </a>
                <a href="tel:108" className="sos-sub-button ambulance">
                    A-108
                </a>
                <a href="tel:100" className="sos-sub-button police">
                    P-100
                </a>
            </div>

            <div className="main-floating-buttons">
                {/* SOS Main Button */}
                <button
                    className={`floating-btn sos-btn ${showSOSOptions ? 'active' : ''}`}
                    onClick={() => setShowSOSOptions(!showSOSOptions)}
                    title="Emergency SOS"
                >
                    <span className="btn-text">SOS</span>
                </button>

                {/* Chatbot Button */}
                <button
                    className="floating-btn chatbot-btn"
                    onClick={() => navigate('/chatbot')}
                    title="Chat with AI"
                >
                    <div className="robot-icon-wrapper">
                        <img src="/chatbot-new.jpg" alt="Robot" />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default FloatingActions;

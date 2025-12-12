import React, { useState } from 'react';
import './SOSButton.css';

const SOSButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleCall = (number) => {
        window.location.href = `tel:${number}`;
    };

    return (
        <div className={`sos-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Expanded Options */}
            <div className={`sos-options ${isOpen ? 'show' : ''}`}>
                <button
                    className="sos-option-btn ambulance"
                    onClick={() => handleCall('102')}
                    title="Call Ambulance"
                >
                    <span className="sos-icon">🚑</span>
                    <span className="sos-label">102</span>
                </button>
                <button
                    className="sos-option-btn police"
                    onClick={() => handleCall('100')}
                    title="Call Police"
                >
                    <span className="sos-icon">🚓</span>
                    <span className="sos-label">100</span>
                </button>
                <button
                    className="sos-option-btn emergency"
                    onClick={() => handleCall('108')}
                    title="Emergency"
                >
                    <span className="sos-icon">🆘</span>
                    <span className="sos-label">108</span>
                </button>
            </div>

            {/* Main Trigger Button */}
            <button className="sos-main-btn" onClick={toggleOpen}>
                {isOpen ? (
                    <span className="close-icon">×</span>
                ) : (
                    <div className="sos-content">
                        <strong>SOS</strong>
                    </div>
                )}
            </button>
        </div>
    );
};

export default SOSButton;

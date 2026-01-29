import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ customPath, label }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (customPath) {
            navigate(customPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <button className="back-btn-global" onClick={handleBack} aria-label="Go Back">
            <span className="back-icon">←</span>
            {label || "Back"}
        </button>
    );
};

export default BackButton;

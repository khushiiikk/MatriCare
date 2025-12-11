import React from 'react';
import './Robot.css';

const Robot = ({ mood = 'happy', scale = 1, className = '' }) => {
    return (
        <div
            className={`robot-container image-mode ${mood} ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <img src="/chatbot-logo.jpg" alt="Chatbot" className="robot-img" />
        </div>
    );
};

export default Robot;

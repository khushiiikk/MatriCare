import React from 'react';
import './Robot.css';
import chatbotLogo from '../assets/chatbot-logo-new.png';

const Robot = ({ mood = 'happy', scale = 1, className = '', imageSrc }) => {
    return (
        <div
            className={`robot-container image-mode ${mood} ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <img src={imageSrc || chatbotLogo} alt="Assistant" className="robot-img" />
        </div>
    );
};

export default Robot;

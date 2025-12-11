import React from 'react';
import './Robot.css';
import chatbotLogo from '../assets/chatbot-logo.jpg';

const Robot = ({ mood = 'happy', scale = 1, className = '' }) => {
    return (
        <div
            className={`robot-container image-mode ${mood} ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <img src={chatbotLogo} alt="Chatbot" className="robot-img" />
        </div>
    );
};

export default Robot;

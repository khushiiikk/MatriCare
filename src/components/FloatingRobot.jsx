import React from 'react';
import { useNavigate } from 'react-router-dom';
import Robot from './Robot';
import './FloatingRobot.css';

const FloatingRobot = () => {
    const navigate = useNavigate();

    return (
        <div className="floating-robot-container" onClick={() => navigate('/chatbot')}>
            <div className="robot-wrapper">
                {/* Use the new Chatbot Logo Image */}
                <img
                    src="/src/assets/chatbot-logo.png"
                    alt="Chatbot View"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className="robot-tooltip">
                Chat with me!
            </div>
        </div>
    );
};

export default FloatingRobot;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import cuteMotherImg from '../assets/cute-mother.jpg';
import './FloatingRobot.css';

const FloatingRobot = () => {
    const navigate = useNavigate();

    return (
        <div className="floating-robot-container" onClick={() => navigate('/chatbot')}>
            <div className="robot-wrapper" style={{ width: '100%', height: '100%' }}>
                <img
                    src={cuteMotherImg}
                    alt="Chatbot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            <div className="robot-tooltip">
                Chat with me!
            </div>
        </div >
    );
};

export default FloatingRobot;

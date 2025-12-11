import React from 'react';
import { useNavigate } from 'react-router-dom';
import Robot from './Robot';
import './FloatingRobot.css';

const FloatingRobot = () => {
    const navigate = useNavigate();

    return (
        <div className="floating-robot-container" onClick={() => navigate('/chatbot')}>
            <div className="robot-wrapper">
                {/* Scale down the robot to fit nicely */}
                <Robot mood="happy" scale={0.4} />
            </div>
            <div className="robot-tooltip">
                Chat with me!
            </div>
        </div>
    );
};

export default FloatingRobot;

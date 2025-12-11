import React from 'react';
import './Robot.css';

const Robot = ({ mood = 'happy', scale = 1, className = '' }) => {
    return (
        <div
            className={`robot-container ${mood} ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <div className="robot-head">
                <div className="robot-eyes">
                    <div className="eye left"></div>
                    <div className="eye right"></div>
                </div>
                <div className="robot-antenna">
                    <div className="antenna-ball"></div>
                </div>
            </div>
            <div className="robot-body">
                <div className="robot-logo">
                    <div className="logo-circle">
                        <span className="logo-text">M</span>
                    </div>
                </div>
            </div>
            <div className="robot-arms">
                <div className="arm left"></div>
                <div className="arm right"></div>
            </div>
            <div className="robot-shadow"></div>
        </div>
    );
};

export default Robot;

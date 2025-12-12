import React from 'react';
import './Robot.css';
import defaultAvatar from '../assets/cute-mother.jpg';

const Robot = ({ mood = 'happy', scale = 1, className = '', imageSrc }) => {
    return (
        <div
            className={`robot-container image-mode ${mood} ${className}`}
            style={{ transform: `scale(${scale})` }}
        >
            <img src={imageSrc || defaultAvatar} alt="Assistant" className="robot-img" />
        </div>
    );
};

export default Robot;

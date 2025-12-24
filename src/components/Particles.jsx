import React from 'react';
import './Particles.css';

const Particles = () => {
    // Generate 15 fireflies/particles
    const particles = Array.from({ length: 15 });

    return (
        <div className="particles-container">
            {particles.map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        opacity: Math.random() * 0.5 + 0.1
                    }}
                />
            ))}
        </div>
    );
};

export default Particles;

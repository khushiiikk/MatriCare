import React from 'react';
import './Ayoga.css';

const Ayoga = () => {
    const ashaYogaPositions = [
        { title: "Back Stability", icon: "🧘‍♀️", desc: "Strengthens the lower back for long walking hours." },
        { title: "Neck Release", icon: "💆‍♀️", desc: "Relieves tension from mobile usage and paperwork." },
        { title: "Energy Breath", icon: "✨", desc: "Pranayama techniques to stay energized throughout the day." },
        { title: "Leg Relief", icon: "🦵", desc: "Simple stretches to prevent fatigue from field visits." }
    ];

    return (
        <div className="ayoga-container">
            <div className="ayoga-header">
                <h1>Health Warrior Wellness</h1>
                <p>Curated wellness practices for our dedicated ASHA workers.</p>
            </div>

            <div className="ayoga-grid">
                {ashaYogaPositions.map((pos, idx) => (
                    <div key={idx} className="ayoga-card">
                        <div className="ayoga-icon">{pos.icon}</div>
                        <h3>{pos.title}</h3>
                        <p>{pos.desc}</p>
                    </div>
                ))}
            </div>

            <div className="ayoga-resource-box">
                <h2>Teaching Your Patients</h2>
                <p>Guidelines on how to encourage gentle prenatal yoga during your visits.</p>
                <ul className="ayoga-tips">
                    <li>Always recommend consulting a doctor first.</li>
                    <li>Focus on breathing, not complex stretches.</li>
                    <li>Ensure the environment is safe and stable.</li>
                </ul>
            </div>
        </div>
    );
};

export default Ayoga;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MaternalGuide.css';

const MaternalGuide = () => {
    const navigate = useNavigate();

    const guideSections = [
        {
            title: "Safe Exercise",
            icon: "🧘",
            content: "Stay active with prenatal yoga, walking, and light stretching. Always listen to your body and avoid high-impact activities.",
            link: "/yoga"
        },
        {
            title: "Understanding Symptoms",
            icon: "🌡️",
            content: "Learn to distinguish between normal pregnancy changes and signs that require medical attention.",
            link: "/pregnancy-symptoms"
        },
        {
            title: "Risk Awareness",
            icon: "⚠️",
            content: "Be aware of high-risk factors and how to manage them through regular checkups and healthy habits.",
            link: "/pregnancy-risks"
        },
        {
            title: "Expert Tips",
            icon: "💡",
            content: "Daily tips on sleep, stress management, and preparing for your baby's arrival.",
            link: "/chatbot"
        }
    ];

    return (
        <div className="maternal-guide-container fade-in">
            <header className="guide-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1>Maternal Guide</h1>
                <p>Your comprehensive resource for a healthy pregnancy</p>
            </header>

            <div className="guide-grid">
                {guideSections.map((section, index) => (
                    <div key={index} className="guide-card" onClick={() => navigate(section.link)}>
                        <div className="guide-icon-box">{section.icon}</div>
                        <h3>{section.title}</h3>
                        <p>{section.content}</p>
                        <button className="guide-link-btn">Learn More →</button>
                    </div>
                ))}
            </div>

            <section className="guide-featured">
                <div className="featured-content">
                    <h2>Weekly Development</h2>
                    <p>Track how your baby is growing week by week with our interactive tracker.</p>
                    <button className="featured-btn" onClick={() => navigate('/')}>Go to Tracker</button>
                </div>
                <div className="featured-illustration">🤱</div>
            </section>
        </div>
    );
};

export default MaternalGuide;

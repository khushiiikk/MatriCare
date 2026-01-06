import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IndianTips.css';

const IndianTips = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Traditional Dietary Wisdom",
            category: "Nourishment",
            icon: "🥛",
            tips: [
                {
                    title: "Kesar Milk (Saffron)",
                    content: "A timeless tradition for vitality. Add 2 strands of pure saffron to warm milk at night for better sleep and digestion.",
                    benefit: "Relaxation & Digestion"
                },
                {
                    title: "Tender Coconut Water",
                    content: "Nature's electrolyte. Perfect for staying cool and hydrated throughout the day while providing essential minerals.",
                    benefit: "PH Balance"
                },
                {
                    title: "Ahladaka (Soaked Almonds)",
                    content: "Pre-soaked almonds are easier to digest and provide concentrated DHA for the baby's cognitive growth.",
                    benefit: "Brain Power"
                }
            ]
        },
        {
            title: "Mind & Spirit",
            category: "Wellness",
            icon: "✨",
            tips: [
                {
                    title: "Garbh Sanskar",
                    content: "The art of educating the baby in the womb. Engage in positive reading, calming chants, and soft music daily.",
                    benefit: "Deep Bonding"
                },
                {
                    title: "Suryadarshan (Sun Gazing)",
                    content: "Spend time in the gentle morning sun (7 AM - 8 AM) to absorb natural Vitamin D and regulate your circadian rhythm.",
                    benefit: "Bone Health"
                },
                {
                    title: "A2 Ghee Wisdom",
                    content: "A spoonful of pure Desi Ghee helps maintain joint flexibility and supports the nervous system during development.",
                    benefit: "Strength"
                }
            ]
        },
        {
            title: "Prakritik Upchar (Home Remedies)",
            category: "Home Care",
            icon: "🌿",
            tips: [
                {
                    title: "Adrak-Nimbu Paani",
                    content: "Fresh ginger juice with a dash of honey and lemon is the most effective natural cure for morning nausea.",
                    benefit: "Nausea Relief"
                },
                {
                    title: "Saunf (Fennel Seeds)",
                    content: "Chewing roasted fennel seeds after main meals helps in better nutrient absorption and prevents bloating.",
                    benefit: "Metabolism"
                }
            ]
        }
    ];

    return (
        <div className="indian-tips-container fade-in">
            <div className="mandala-bg-pattern"></div>

            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <header className="tips-header">
                <h1>Traditional Wellness</h1>
                <p>Authentic Indian wisdom for your pregnancy journey</p>
            </header>

            <div className="tips-content">
                {sections.map((section, sIdx) => (
                    <section key={sIdx} className="tips-section">
                        <div className="section-title">
                            <span className="section-icon">{section.icon}</span>
                            <h2>{section.title}</h2>
                        </div>
                        <div className="tips-grid">
                            {section.tips.map((tip, tIdx) => (
                                <div key={tIdx} className="tip-premium-card">
                                    <div className="tip-category">{section.category}</div>
                                    <h3>{tip.title}</h3>
                                    <p>{tip.content}</p>
                                    <div className="tip-benefit-tag">
                                        <span>Focus:</span> {tip.benefit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className="tips-disclaimer">
                <p>Note: These traditional insights are for general well-being. Always consult your obstetrician before starting any new dietary ritual.</p>
            </footer>
        </div>
    );
};

export default IndianTips;

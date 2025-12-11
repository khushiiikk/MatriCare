import React from 'react';
import './Home.css'; // Reusing Home css for basic layout

const Analytics = () => {
    return (
        <div className="home-container">
            <div className="hero-section" style={{ minHeight: '60vh' }}>
                <div className="hero-content">
                    <h1>Maternal Health Analytics</h1>
                    <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>
                        Track your health trends and insights here.
                        <br />
                        (Coming Soon)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

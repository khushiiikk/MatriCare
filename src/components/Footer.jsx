import React from 'react';
import './Footer.css';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { language } = useLanguage();

    // Simple translations for footer content
    const t = {
        en: {
            links: 'Quick Links',
            contact: 'Contact Us',
            reviews: 'Reviews',
            feedback: 'Feedback',
            connect: 'Connect with Us',
            created: 'Created with ❤️ by:',
            home: 'Home',
            about: 'About',
            yoga: 'Yoga Guide'
        },
        hi: {
            links: 'त्वरित लिंक',
            contact: 'संपर्क करें',
            reviews: 'समीक्षाएं',
            feedback: 'प्रतिक्रिया',
            connect: 'हमसे जुड़ें',
            created: '❤️ के साथ बनाया गया:',
            home: 'होम',
            about: 'हमारे बारे में',
            yoga: 'योग गाइड'
        }
    };

    const content = t[language] || t.en;

    const team = [
        "Kapil Tomar",
        "Khushi Kumari",
        "Pratishtha Gupta",
        "Divyansh Arora",
        "Ayush Kadian"
    ];

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-section">
                        <div className="navbar-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                            <span className="logo-text" style={{ fontSize: '1.5rem', color: 'white' }}>
                                <span>Matri</span>
                                <span style={{ color: 'var(--color-peach)' }}>Care</span>
                            </span>
                        </div>
                        <p style={{ opacity: 0.8 }}>
                            Empowering mothers with care, knowledge, and support.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3>{content.links}</h3>
                        <ul className="footer-links">
                            <li><a href="/">{content.home}</a></li>
                            <li><a href="/about">{content.about}</a></li>
                            <li><a href="/#yoga-section">{content.yoga}</a></li>
                            <li><a href="#contact">{content.contact}</a></li>
                            <li><a href="#reviews">{content.reviews}</a></li>
                            <li><a href="#feedback">{content.feedback}</a></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="footer-section">
                        <h3>{content.connect}</h3>
                        <div className="social-links">
                            {/* Instagram */}
                            <a href="#" className="social-icon" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            {/* Facebook */}
                            <a href="#" className="social-icon" aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                            {/* Twitter/X */}
                            <a href="#" className="social-icon" aria-label="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="social-icon" aria-label="YouTube">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="footer-credits">
                    <span className="credits-title">{content.created}</span>
                    <div className="credits-list">
                        {team.map((member, index) => (
                            <span key={index}>{member}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

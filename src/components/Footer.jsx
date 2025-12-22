import React from 'react';
import './Footer.css';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { language } = useLanguage();

    const t = {
        en: {
            links: 'Quick Links',
            contact: 'Contact Us',
            reviews: 'Reviews',
            feedback: 'Feedback',
            connect: 'Connect with Us',
            home: 'Home',
            about: 'About',
            yoga: 'Yoga Guide',
            desc: 'Empowering mothers with care, knowledge, and support.',
            madeBy: 'Made by Kapil Tomar and Team'
        }
    };

    const content = t[language] || t.en;

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="logo-hindi">मातृ</span>
                            <span className="logo-english">Care</span>
                        </div>
                        <p className="footer-desc">{content.desc}</p>
                    </div>

                    <div className="footer-nav">
                        <h3>{content.links}</h3>
                        <ul className="footer-links-grid">
                            <li><a href="/">{content.home}</a></li>
                            <li><a href="/about">{content.about}</a></li>
                            <li><a href="/yoga">{content.yoga}</a></li>
                            <li><a href="#reviews">{content.reviews}</a></li>
                            <li><a href="#contact">{content.contact}</a></li>
                            <li><a href="#feedback">{content.feedback}</a></li>
                        </ul>
                    </div>

                    <div className="footer-social">
                        <h3>{content.connect}</h3>
                        <div className="social-icons">
                            <a href="#" className="social-icon">In</a>
                            <a href="#" className="social-icon">Fb</a>
                            <a href="#" className="social-icon">Tw</a>
                            <a href="#" className="social-icon">Yt</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>{content.madeBy}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


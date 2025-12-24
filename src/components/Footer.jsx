import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './Footer.css';

const Footer = () => {
    const { language } = useLanguage();
    const t = translations[language]?.footer || { links: {} };

    return (
        <footer className="footer-slim">
            <div className="container">
                <div className="footer-content">
                    <p className="copyright">{t.copyright}</p>
                    <ul className="footer-links">
                        <li><a href="#privacy">{t.links.privacy}</a></li>
                        <li><a href="#terms">{t.links.terms}</a></li>
                        <li><a href="#contact">{t.links.contact}</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

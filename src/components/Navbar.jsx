import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { language } = useLanguage();
    const t = translations[language].navbar;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    {/* Left Logos Group */}
                    <div className="logos-group">
                        <div className="college-logo-container">
                            <img src="/iit-delhi-logo.png" alt="IIT Delhi" className="college-logo iit-logo circle-logo" />
                        </div>
                        <div className="college-logo-container">
                            <img src="/thapar-university-logo.jpg" alt="Thapar University" className="college-logo thapar-logo circle-logo" />
                        </div>
                        <div className="brand-logo-container">
                            <img src="/matricare-logo.png" alt="MatriCare Logo" className="brand-logo" />
                        </div>
                        <Link to="/" className="navbar-logo-text">
                            <span className="logo-hindi">मातृ</span>
                            <span className="logo-english">Care</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <ul className="navbar-menu">
                        <li>
                            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
                                {t.home}
                            </Link>
                        </li>
                        <li className="nav-divider"></li>
                        <li>
                            <LanguageSwitcher />
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                    </button>
                </div>

                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-list">
                        <li>
                            <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.home}
                            </Link>
                        </li>
                        <li className="mobile-lang-switcher">
                            <LanguageSwitcher />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

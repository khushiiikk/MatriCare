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
    const t = translations[language]?.navbar || {};

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

    const navLinks = [
        { name: t.home, path: '/' },
        { name: t.health, path: '/health' },
        { name: t.yoga, path: '/yoga' },
        { name: t.findCare, path: '/find-care' },
        { name: t.settings, path: '/settings' },
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    {/* Left: Logos Group */}
                    <div className="logos-group">
                        <div className="college-logo-container">
                            <img src="/iit-delhi-logo.png" alt="IIT Delhi" className="college-logo circle-logo" />
                        </div>
                        <div className="college-logo-container">
                            <img src="/thapar-university-logo.jpg" alt="Thapar University" className="college-logo circle-logo" />
                        </div>
                        <div className="brand-logo-container">
                            <img src="/matricare-logo.png" alt="MatriCare Logo" className="brand-logo" />
                        </div>
                        <Link to="/" className="navbar-logo-text">
                            <span className="logo-hindi">मातृ</span>
                            <span className="logo-english">Care</span>
                        </Link>
                    </div>

                    {/* Center: Navigation Pill */}
                    <div className="nav-pill-container">
                        <ul className="nav-pill">
                            {navLinks.slice(0, 4).map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`nav-pill-link ${isActive(link.path) ? 'active' : ''}`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li className="nav-pill-item">
                                <LanguageSwitcher />
                            </li>
                            <li>
                                <Link
                                    to="/settings"
                                    className={`nav-pill-link ${isActive('/settings') ? 'active' : ''}`}
                                >
                                    {t.settings}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Right: Actions */}
                    <div className="nav-actions">
                        <Link to="/login" className="nav-action-link login-btn">
                            {t.login}
                        </Link>

                        {/* Mobile Menu Button - inside actions for simplified mobile view */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-menu-list">
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link to={link.path} className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                        <li className="mobile-actions">
                            <Link to="/login" className="mobile-action-link login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.login}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

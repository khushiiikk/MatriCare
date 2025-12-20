import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../translations/translations';
import LanguageSwitcher from './LanguageSwitcher';

import ProfileMenu from './ProfileMenu';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth(); // Get auth state
    const t = translations[language].navbar;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filter nav items based on auth state if needed
    // Currently all items visible, but login link logic will change
    const navItems = [
        { name: t.home, path: '/' },
        { name: t.yoga, path: '/yoga' },
    ];

    // Add Login link only if NOT authenticated
    if (!isAuthenticated) {
        navItems.push({ name: t.login, path: '/login' });
    }

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
                            <img src="/iit-delhi-logo.jpg" alt="IIT Delhi" className="college-logo iit-logo circle-logo" />
                        </div>

                        {/* MatriCare Logo */}
                        <Link to="/" className="navbar-logo">
                            <img src="/matricare-logo.png" alt="MatriCare Logo" className="logo-image" />
                            <span className="logo-text">
                                <span className="logo-hindi">मातृ</span>
                                <span className="logo-english">Care</span>
                            </span>
                        </Link>
                    </div>



                    {/* Desktop Navigation */}
                    <ul className="navbar-menu">
                        {/* Static Links + Chatbot */}
                        <li>
                            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
                                {t.home}
                            </Link>
                        </li>
                        <li>
                            <Link to="/yoga" className={`navbar-link ${isActive('/yoga') ? 'active' : ''}`}>
                                {t.yoga}
                            </Link>
                        </li>

                        {/* Chatbot Link */}
                        <li>
                            <Link to="/chatbot" className={`navbar-link ${isActive('/chatbot') ? 'active' : ''}`}>
                                {t.chatbot}
                            </Link>
                        </li>

                        {/* Find Care Link */}
                        <li>
                            <Link to="/find-care" className={`navbar-link ${isActive('/find-care') ? 'active' : ''}`}>
                                {t.findCare}

                            </Link>
                        </li>

                        <li>
                            <Link to="/analytics" className={`navbar-link ${isActive('/analytics') ? 'active' : ''}`}>
                                {t.analytics}
                            </Link>
                        </li>

                        <li>
                            <Link to="/about" className={`navbar-link ${isActive('/about') ? 'active' : ''}`}>
                                {t.about}
                            </Link>
                        </li>



                        {!isAuthenticated && (
                            <li>
                                <Link to="/login" className={`navbar-link ${isActive('/login') ? 'active' : ''}`}>
                                    {t.login}
                                </Link>
                            </li>
                        )}


                        <li>
                            <LanguageSwitcher />
                        </li>
                        {/* Profile Menu for Desktop */}
                        {isAuthenticated && (
                            <li>
                                <ProfileMenu />
                            </li>
                        )}
                    </ul>

                    {/* Thapar University Logo */}
                    <div className="college-logo-container right">
                        <img src="/thapar-university-logo.jpg" alt="Thapar University" className="college-logo thapar-logo circle-logo" />
                    </div>


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
                        {/* Mobile Profile Menu at top if logged in */}
                        {isAuthenticated && (
                            <li className="mobile-profile-section" style={{ padding: '0 10px 10px' }}>
                                <ProfileMenu />
                            </li>
                        )}

                        {/* Mobile Links */}
                        <li>
                            <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.home}
                            </Link>
                        </li>
                        <li>
                            <Link to="/yoga" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.yoga}
                            </Link>
                        </li>

                        <li>
                            <Link to="/chatbot" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.chatbot}
                            </Link>
                        </li>

                        <li>
                            <Link to="/find-care" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.findCare}
                            </Link>

                        </li>


                        <li>
                            <Link to="/analytics" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.analytics}
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {t.about}
                            </Link>
                        </li>



                        {!isAuthenticated && (
                            <li>
                                <Link to="/login" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                    {t.login}
                                </Link>
                            </li>
                        )}

                        <li className="mobile-lang-switcher" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <LanguageSwitcher />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
